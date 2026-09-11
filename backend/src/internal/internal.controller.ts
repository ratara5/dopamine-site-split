import {
  Controller,
  Headers,
  HttpCode,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { TrackingService } from "../tracking/tracking.service";

// POST /internal/simulate-tracking
// The actual scheduled advancing of orders is handled by the
// standalone `worker` container (see backend/worker/index.ts) running
// its own in-process loop — that's the primary mechanism, unchanged
// from the monolith. This route is kept as a manual/admin trigger
// (e.g. to nudge a demo order forward on the spot without waiting for
// the next tick) and is still protected by CRON_SECRET, since it's
// reachable through Caddy if you choose to expose it.
//
// Deliberately mounted outside /v1 (matching the original, which put
// it at /api/internal/* rather than /api/v1/internal/*) — this is an
// operator/admin surface, not a versioned public API contract.
@Controller("internal")
export class InternalController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post("simulate-tracking")
  @HttpCode(200)
  async simulateTracking(@Headers("authorization") authHeader?: string) {
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      throw new UnauthorizedException("Unauthorized");
    }

    await this.trackingService.advanceAllActiveOrders();
    return { ok: true };
  }
}
