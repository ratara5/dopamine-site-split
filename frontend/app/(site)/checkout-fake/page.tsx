// app/(site)/checkout-fake/page.tsx
"use client";

import { useCartStore } from "@/lib/cartStore";
import { apiUrl } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutFakePage() {
  const { providerId, items, totalCents, clear } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setLoading(true);
    setError("");

    // credentials: "include" is required now that the backend is a
    // separate origin — otherwise the session cookie never gets sent
    // and every order comes back 401.
    const res = await fetch(apiUrl("/v1/orders"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      }),
    });

    if (!res.ok) {
      setError(
        res.status === 401
          ? "Debes iniciar sesión para simular un pedido."
          : "Algo salió mal. Intenta de nuevo."
      );
      setLoading(false);
      return;
    }

    const { order } = await res.json();
    clear();
    router.push(`/orders/${order.id}`);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md p-8 text-center text-neutral-500">
        Tu carrito está vacío.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="mb-4 text-xl font-bold">Confirmar pedido (simulado)</h1>

      <div className="mb-4 flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm">
            <span>
              {item.quantity}x {item.name}
            </span>
            <span>${((item.priceCents * item.quantity).toLocaleString('es-CO', { minimumFractionDigits: 2 }))   }</span>
          </div>
        ))}
      </div>

      <div className="mb-6 flex justify-between border-t pt-2 font-semibold">
        <span>Total</span>
        <span>${totalCents().toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full rounded-full bg-brand py-3 font-medium text-white disabled:opacity-50"
      >
        {loading ? "Simulando..." : "Confirmar pedido"}
      </button>

      <p className="mt-3 text-center text-xs text-neutral-400">
        Al confirmar, no se realizará ningún cobro real. Es una simulación.
      </p>
    </div>
  );
}
