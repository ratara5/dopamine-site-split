// components/CartDrawer.tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cartStore";
import { ShoppingCart, Minus, Plus, X } from "lucide-react";
import Link from "next/link";

export function CartDrawer() {
  const { items, removeItem, totalCents } = useCartStore();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs text-white">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Tu carrito (simulado)</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <p className="mt-6 text-sm text-neutral-500">
            Aún no has agregado nada. Todo lo que veas aquí es una simulación
            — no se cobra nada real.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between border-b border-neutral-100 pb-2"
              >
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-neutral-500">
                    x{item.quantity} · $
                    {((item.priceCents * item.quantity).toLocaleString('es-CO', { minimumFractionDigits: 2 }))}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  aria-label={`Quitar ${item.name}`}
                >
                  <X className="h-4 w-4 text-neutral-400" />
                </button>
              </div>
            ))}

            <div className="mt-4 flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>${totalCents().toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
            </div>

            <Link href="/checkout-fake">
              <Button className="mt-2 w-full bg-brand hover:bg-brand-dark">
                Confirmar pedido
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}