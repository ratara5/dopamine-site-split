// Generates a fake courier route and advances in-flight fake orders.
// There is no real courier, no real GPS device, and no real address
// lookup involved anywhere in this file — everything here is theater
// in service of the "watching the map" dopamine payoff described in
// the product brief.
//
// PORTING NOTE: this is a byte-for-byte port of the original
// lib/simulate-tracking.ts from the monolith. It intentionally takes
// a plain PrismaClient (not a Nest-injected PrismaService) so this
// exact module can be imported both by the Nest internal admin
// endpoint (backend/src/internal) and by the standalone worker
// process (backend/worker/index.ts) without any framework coupling
// or duplicated logic. Do not add Nest decorators to this file.

import { PrismaClient, OrderStatus } from "@prisma/client";

const STATUS_SEQUENCE: OrderStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "ON_THE_WAY",
  "ON_THE_WAY",
  "ON_THE_WAY",
  "DELIVERED",
];

const TOTAL_STEPS = STATUS_SEQUENCE.length;

// A fixed fake "restaurant district" origin and a fixed fake "home"
// destination, both arbitrary points — swap these for a per-user fake
// address later if desired. Coordinates are illustrative, not real
// storefront locations.
const ORIGIN = { lat: 4.65, lng: -74.06 };
const DESTINATION = { lat: 4.71, lng: -74.03 };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Advances every order that isn't finished yet by exactly one simulated
 * step. Called on a schedule by the standalone `worker` container
 * (primary mechanism, roughly once a minute) and additionally
 * reachable via the Nest internal admin endpoint
 * (POST /internal/simulate-tracking, CRON_SECRET-protected) for manual
 * nudging during demos.
 */
export async function advanceAllActiveOrders(prisma: PrismaClient) {
  const activeOrders = await prisma.order.findMany({
    where: { status: { notIn: ["DELIVERED", "CANCELLED"] } },
    include: { tracking: { orderBy: { sequence: "desc" }, take: 1 } },
  });

  for (const order of activeOrders) {
    const currentSequence = order.tracking[0]?.sequence ?? 0;
    const nextSequence = Math.min(currentSequence + 1, TOTAL_STEPS - 1);
    const t = nextSequence / (TOTAL_STEPS - 1);

    const nextStatus = STATUS_SEQUENCE[nextSequence];
    const point = {
      lat: lerp(ORIGIN.lat, DESTINATION.lat, t),
      lng: lerp(ORIGIN.lng, DESTINATION.lng, t),
    };

    await prisma.$transaction(async (tx) => {
      await tx.trackingPoint.create({
        data: {
          orderId: order.id,
          lat: point.lat,
          lng: point.lng,
          sequence: nextSequence,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: nextStatus },
      });

      if (nextStatus === "DELIVERED") {
        await recordSavings(order.id, tx as PrismaClient);
      }
    });
  }
}

/**
 * Writes the "reward for not spending" record once a fake order
 * completes. This is the emotional payoff screen's data source.
 */
async function recordSavings(orderId: string, tx: PrismaClient) {
  const order = await tx.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  const kcalSaved = order.items.reduce(
    (sum, item) => sum + (item.product.kcal ?? 0) * item.quantity,
    0
  );

  await tx.savingsEntry.create({
    data: {
      orderId: order.id,
      userId: order.userId,
      moneySavedCents: order.totalCents,
      kcalSaved,
    },
  });
}
