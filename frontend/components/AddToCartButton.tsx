// components/AddToCartButton.tsx
"use client";

import { useCartStore } from "@/lib/cartStore";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  providerId,
  productId,
  name,
  priceCents,
}: {
  providerId: string;
  productId: string;
  name: string;
  priceCents: number;
}) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <Button
      size="sm"
      className="bg-brand hover:bg-brand-dark w-full rounded-md"
      onClick={(e) => {
        e.preventDefault(); // stop the parent <Link> from navigating
        addItem(providerId, { productId, name, priceCents });
      }}
    >
      Agregar
    </Button>
  );
}