FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY . .

# Dummy envs)
ENV SUPABASE_URL="https://dummy.supabase.co"
ENV SUPABASE_KEY="dummy-key"
ENV JWT_SECRET="dummy-secret"
ENV MAIL_USER="dummy@mail.com"
ENV MAIL_PASS="dummy-pass"
ENV API_STATE="production"

RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

RUN pnpm -r --filter "@repo/utils" run build || true

RUN pnpm -r --filter "auth..." run build

RUN pnpm -r --filter "gateway..." run build


FROM node:20-alpine AS auth
WORKDIR /app
COPY --from=builder /app/apps/auth/dist ./apps/auth/dist
CMD ["node", "apps/auth/dist/index.js"]


FROM node:20-alpine AS gateway
WORKDIR /app
COPY --from=builder /app/apps/gateway/dist ./apps/gateway/dist
CMD ["node", "apps/gateway/dist/index.js"]
