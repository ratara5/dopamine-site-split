// Client-side cart state. Nothing here touches a payment API — the
// cart only ever feeds into POST /api/v1/orders, which creates a
// fake order.
import { create } from "zustand";

export type CartItem = {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
};

type CartState = {
  providerId: string | null;
  items: CartItem[];
  addItem: (providerId: string, item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  totalCents: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  providerId: null,
  items: [],
  addItem: (providerId, item) =>
    set((state) => {
      // A cart can only contain items from one provider at a time,
      // mirroring the real-app UX this is parodying.
      if (state.providerId && state.providerId !== providerId) {
        return {
          providerId,
          items: [{ ...item, quantity: 1 }],
        };
      }
      const existing = state.items.find((i) => i.productId === item.productId);
      if (existing) {
        return {
          providerId,
          items: state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return {
        providerId,
        items: [...state.items, { ...item, quantity: 1 }],
      };
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    })),
  clear: () => set({ providerId: null, items: [] }),
  totalCents: () =>
    get().items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
}));
