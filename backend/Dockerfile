# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm config set fetch-retry-maxtimeout 120000 && npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
# Seed compilado p/ JS: o runner não tem tsx (devDependency)
RUN npx tsc prisma/seed.ts --outDir dist-seed --module commonjs --target ES2022 \
      --esModuleInterop --skipLibCheck --moduleResolution node

FROM node:22-alpine AS prod-deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm config set fetch-retry-maxtimeout 120000 && npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine AS runner
WORKDIR /app
# postgresql16-client: pg_dump p/ backup automático antes de migrations
RUN apk add --no-cache openssl postgresql16-client
ENV NODE_ENV=production
ENV PORT=3006

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder   /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder   /app/dist ./dist
COPY --from=builder   /app/package.json ./package.json
COPY --from=builder   /app/prisma ./prisma
COPY --from=builder   /app/dist-seed ./dist-seed
COPY scripts ./scripts

RUN mkdir -p /app/uploads/images /app/uploads/audio /app/backups

EXPOSE 3006
# Migrations versionadas + backup; nunca db push / --accept-data-loss
CMD ["sh", "scripts/docker-entrypoint.sh"]
