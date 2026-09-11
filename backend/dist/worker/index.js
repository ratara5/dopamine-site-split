"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const simulate_tracking_1 = require("../src/tracking/simulate-tracking");
const prisma = new client_1.PrismaClient();
const INTERVAL_MS = Number(process.env.TRACKING_INTERVAL_MS ?? 60_000);
async function tick() {
    try {
        await (0, simulate_tracking_1.advanceAllActiveOrders)(prisma);
        console.log(`[worker] advanced active orders at ${new Date().toISOString()}`);
    }
    catch (err) {
        console.error("[worker] tick failed:", err);
    }
}
async function loop() {
    await tick();
    setTimeout(loop, INTERVAL_MS);
}
console.log(`[worker] starting, interval=${INTERVAL_MS}ms`);
loop();
//# sourceMappingURL=index.js.map