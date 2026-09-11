# Migration notes: monolith → backend/frontend split

This documents every place this split introduces a *new* failure mode
or a (deliberate, small) behavior difference from the original
monolith, plus what to test before you trust this in production.

## Architecture summary

- **backend/** — NestJS. Feature modules: `auth`, `providers`,
  `products`, `orders`, `internal` (admin), `tracking` (shared
  simulation logic). Same Prisma schema, same Postgres DB.
- **backend/worker/** — the standalone order-tracking simulator,
  still its own container/process, now importing
  `backend/src/tracking/simulate-tracking.ts` directly instead of a
  duplicated copy.
- **frontend/** — Next.js App Router, UI only. No Prisma, no DB
  access, no server-side auth logic. All data comes from the backend
  over HTTP.
- **New:** MinIO (self-hosted S3-compatible storage), provisioned for
  upcoming upload features. Nothing in the ported v1 routes uses it
  yet — see "MinIO" section below.

## New failure mode #1: cross-origin cookies (test this carefully)

The session cookie is now `Secure; SameSite=None` because the
frontend (`app.yourdomain.com`) and backend (`api.yourdomain.com`) are
separate origins. Concretely, this means:

- **HTTPS is mandatory everywhere**, including local dev if you want
  to test login/checkout against a "prod-like" cookie. The backend
  auto-relaxes to a non-secure, `SameSite=Lax` cookie when
  `NODE_ENV !== "production"` specifically so local dev over plain
  `http://localhost` still works — but that means local dev is *not*
  exercising the same cookie path as production. Test login/checkout
  against a real HTTPS deployment (or an mkcert-based local HTTPS
  setup) before shipping, not just `next dev` + `nest start --watch`.
- **Safari ITP and some privacy browser extensions block third-party
  cookies** by default, which can silently drop this cookie even over
  HTTPS. If login "succeeds" (200 response, user object comes back)
  but the very next authenticated request 401s, this is the first
  thing to check — inspect the response's `Set-Cookie` header and the
  browser's cookie jar directly.
- **CORS_ALLOWED_ORIGINS must exactly match the frontend's origin**
  (scheme + host, e.g. `https://app.yourdomain.com`, no trailing
  slash, no wildcard). A mismatch here doesn't error loudly — the
  browser just silently blocks the response from reaching your JS,
  which looks like "the site is broken" with no useful backend log.
- Mobile (React Native) sidesteps all of this via the `Authorization:
  Bearer <token>` path instead of cookies — test that path
  independently, since it exercises a completely different code path
  through the same `JwtAuthGuard`.

## New failure mode #2: extra network hop on server-rendered pages

The home, provider, and product pages used to query Prisma in-process.
They now do a `fetch()` to the backend on every request
(`cache: "no-store"`, matching the original's uncached, request-time
behavior). This means:

- Backend downtime now takes the frontend's SSR pages down too, where
  before a DB blip would have surfaced the same way but one fewer
  network hop away.
- Latency for these pages is now bounded by backend response time +
  network, not just DB query time. In Docker Compose this uses the
  internal network (`INTERNAL_API_URL=http://backend:3001`), which
  should be fast, but it's a new dependency to monitor.

## Deliberate behavior differences (small, but real)

1. **Product page review count.** The original product page fetched
   *all* reviews directly via Prisma with no limit. The ported
   `GET /v1/products/:id` endpoint (unchanged from the original route
   handler) caps reviews at the latest 20, newest-first. Since the
   frontend can no longer bypass the API, it now also sees at most 20.
   If any product ever accumulates more than 20 reviews, this is a
   user-visible change. Decide if that's fine or if the endpoint
   should be widened/paginated.
2. **Validation error response shape.** The original used zod's
   `error.flatten()` (`{ fieldErrors, formErrors }`) for 400s. The
   backend uses `class-validator` via Nest's `ValidationPipe`, whose
   messages are plain strings. Both are normalized to the same
   `{ error: ... }` envelope as the original for consistency, but the
   *contents* of that field differ in shape for validation errors
   specifically (not for 401/404/409, which are byte-identical
   messages). If the frontend or mobile app ever parsed
   `fieldErrors`/`formErrors` structurally, it needs updating — a
   search of this codebase found no such usage today.

## Pre-existing gap, preserved as-is, now higher-stakes

`GET /v1/orders/:id` and `GET /v1/orders/:id/tracking` have **no
ownership check** — any caller who knows or guesses an order ID can
read it, logged in or not. This was already true in the monolith and
was out of scope for a "port as-is, no behavior changes" split, so it
was kept exactly as it was. It's called out here because it's about to
be reachable by a public mobile client too, which raises the stakes
meaningfully. Recommend a follow-up ticket to add an ownership check
(`order.userId === session.user.id`) before the mobile app ships
broadly.

## Security: rotate leaked secrets

The uploaded monolith's `.env.prod` had **real, plaintext secrets
committed to the repo**: a Supabase Postgres connection string with
password, `NEXTAUTH_SECRET`, and `CRON_SECRET`. That file was not
carried into this split. If it was ever pushed to any remote
(including a private one), treat those three values as compromised
and rotate them now, independent of this refactor.

## MinIO

Added per your request: a `minio` service + a `minio-init` one-shot
container that creates the bucket and sets it to public-read (objects
are downloadable by anyone with the URL, but not listable or
uploadable anonymously — uploads go through the backend using the
server-side MinIO credentials). Nothing in the ported `v1` routes
uses it yet, since today's `imageUrl`/`logoUrl`/`bannerUrl` fields are
all static seeded URLs under `/public/parody-assets`. Existing seed
data was **not** migrated into MinIO — that's a separate task if/when
you want dynamic uploads (e.g. user avatars, new provider onboarding)
to actually write there.

## Testing checklist before deploy

- [ ] Register → login → place a fake order → watch tracking poll →
      confirm the payoff screen, all against the real HTTPS domains
      (not `localhost`).
- [ ] Confirm the session cookie survives a page reload and a new tab.
- [ ] Test in Safari specifically (ITP is the most likely
      cookie-blocking culprit).
- [ ] Hit the backend directly with `Authorization: Bearer <token>`
      (no cookie) and confirm `POST /v1/orders` still works — this is
      the mobile app's path.
- [ ] Confirm CORS rejects an origin *not* in
      `CORS_ALLOWED_ORIGINS` (e.g. curl with a bogus `Origin` header —
      note curl won't show you the browser-side block, so test with an
      actual second web origin or a CORS-testing tool).
- [ ] Run `docker compose up`, confirm `minio-init` exits 0 and the
      bucket exists (`mc ls local/dopamine-site-media` from inside the
      network, or check the container logs).
- [ ] `prisma migrate deploy` against the fresh Postgres container
      before first boot of `backend`/`worker`.
