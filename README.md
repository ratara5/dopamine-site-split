# dopamine-site — split monorepo

Parody food-delivery simulator. No real payments, no real couriers —
simulation only. Split into `backend/` (NestJS API, serves web +
mobile identically) and `frontend/` (Next.js, UI only).

Read **MIGRATION_NOTES.md** before deploying — it documents every new
failure mode this split introduces and what to test.

## Local development (without Docker)

```bash
# 1. Postgres — point DATABASE_URL at any local/remote Postgres 16 instance

# 2. Backend
cd backend
npm install
npm audit fix
npm audit fix --force # DANGER! Could break the project: If vulnerabilities are detected (execute as time as necessary)
docker run -d --name dopamine-dev-db \
  -e POSTGRES_USER=dev -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=dopamine_site \
  -p 5432:5432 postgres:16-alpine
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, CORS_ALLOWED_ORIGINS
npm run db:generate
npm run db:migrate
npm run db:seed
npm run start:dev       # http://localhost:3001

npx prisma migrate reset # clears the DB but won't auto-reseed — you'd run npm run db:seed manually right after.
npx prisma db push --force-reset # Just wipe data, keep schema/tables (no migration replay)

# 3. Worker (separate terminal)
cd backend
npm run worker

# 4. Frontend (separate terminal)
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3001
npm install
npm audit fix
npm run dev              # http://localhost:3000
```

## Production (single VPS, Docker Compose)

```bash
cp .env.example .env   # fill in real values — see MIGRATION_NOTES.md
                        # for the CORS_ALLOWED_ORIGINS / cookie caveats
docker compose build
docker compose run --rm backend npx prisma migrate deploy
docker compose run --rm backend npx tsx prisma/seed.ts   # optional, first boot only
docker compose up -d
```

Point three DNS records at the VPS: `app.yourdomain.com`,
`api.yourdomain.com`, `media.yourdomain.com`. Caddy issues and renews
TLS certs for all three automatically.
