# Lightweight image for the background worker — just Node + Prisma
# client + tsx to run the TS source directly. No Nest/Express runtime
# needed here, matching the original design intent.
#
# Build context is the `backend/` directory (see docker-compose.yml),
# so paths below are relative to backend/, not backend/worker/.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
CMD ["npx", "tsx", "worker/index.ts"]
