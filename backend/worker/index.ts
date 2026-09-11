// Standalone worker process. Runs as its own container (see
// docker-compose.yml) so it stays a single instance even if the
// `backend` API service is ever scaled to multiple replicas — you
// never want two workers double-advancing the same fake orders.
//
// This is a byte-for-byte port of the original worker/index.ts. The
// only change is where it lives (inside backend/ now, so it can
// import the shared tracking-simulation module directly instead of
// duplicating it) and that it constructs its own plain PrismaClient
// instead of relying on Next.js's module-singleton pattern, since
// there's no Next.js dev hot-reload to guard against here.

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { advanceAllActiveOrders } from "../src/tracking/simulate-tracking";

const prisma = new PrismaClient();
const INTERVAL_MS = Number(process.env.TRACKING_INTERVAL_MS ?? 60_000);

async function tick() {
  try {
    await advanceAllActiveOrders(prisma);
    console.log(`[worker] advanced active orders at ${new Date().toISOString()}`);
  } catch (err) {
    console.error("[worker] tick failed:", err);
  }
}

async function loop() {
  await tick();
  setTimeout(loop, INTERVAL_MS);
}

console.log(`[worker] starting, interval=${INTERVAL_MS}ms`);
loop();
