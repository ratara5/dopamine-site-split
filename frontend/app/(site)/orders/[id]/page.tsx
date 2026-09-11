"use client";

// Polls /v1/orders/:id/tracking every 2.5s while an order is in
// flight to animate the fake courier's position. Once status flips to
// DELIVERED, swaps to the payoff screen — the emotional core of the
// whole product. Give this screen real design attention.
import { useEffect, useState, use } from "react";
import { apiUrl } from "@/lib/api";

type TrackingResponse = {
  status: string;
  points: { lat: number; lng: number; sequence: number }[];
};

type OrderResponse = {
  order: {
    savings: { moneySavedCents: number; kcalSaved: number } | null;
  };
};

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [tracking, setTracking] = useState<TrackingResponse | null>(null);
  const [savings, setSavings] = useState<
    { moneySavedCents: number; kcalSaved: number } | null
  >(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(apiUrl(`/v1/orders/${id}/tracking`), {
        credentials: "include",
      });
      const data: TrackingResponse = await res.json();
      setTracking(data);

      if (data.status === "DELIVERED") {
        clearInterval(interval);
        const orderRes = await fetch(apiUrl(`/v1/orders/${id}`), {
          credentials: "include",
        });
        const orderData: OrderResponse = await orderRes.json();
        setSavings(orderData.order.savings);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [id]);

  if (savings) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-brand-dark">
          ¡Pedido "entregado"! 🎉
        </h1>
        <p className="mb-6 text-neutral-600">
          Y lo mejor: no gastaste nada de verdad.
        </p>
        <div className="rounded-xl bg-brand-light p-6">
          <p className="text-lg">
            Te ahorraste{" "}
            <span className="font-bold">
              ${(savings.moneySavedCents).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
            </span>
          </p>
          <p className="text-lg">
            Evitaste{" "}
            <span className="font-bold">{savings.kcalSaved} kcal</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-8 text-center">
      <h1 className="mb-2 text-xl font-semibold">
        Tu pedido va en camino (simulado) 🛵
      </h1>
      <p className="text-neutral-500">
        Estado actual: {tracking?.status ?? "cargando..."}
      </p>
      <div className="mt-6 aspect-square rounded-xl bg-brand-light" />
    </div>
  );
}
