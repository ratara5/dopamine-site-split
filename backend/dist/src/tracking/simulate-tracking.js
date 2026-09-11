"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advanceAllActiveOrders = advanceAllActiveOrders;
const STATUS_SEQUENCE = [
    "PLACED",
    "CONFIRMED",
    "PREPARING",
    "ON_THE_WAY",
    "ON_THE_WAY",
    "ON_THE_WAY",
    "DELIVERED",
];
const TOTAL_STEPS = STATUS_SEQUENCE.length;
const ORIGIN = { lat: 4.65, lng: -74.06 };
const DESTINATION = { lat: 4.71, lng: -74.03 };
function lerp(a, b, t) {
    return a + (b - a) * t;
}
async function advanceAllActiveOrders(prisma) {
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
                await recordSavings(order.id, tx);
            }
        });
    }
}
async function recordSavings(orderId, tx) {
    const order = await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: { items: { include: { product: true } } },
    });
    const kcalSaved = order.items.reduce((sum, item) => sum + (item.product.kcal ?? 0) * item.quantity, 0);
    await tx.savingsEntry.create({
        data: {
            orderId: order.id,
            userId: order.userId,
            moneySavedCents: order.totalCents,
            kcalSaved,
        },
    });
}
//# sourceMappingURL=simulate-tracking.js.map