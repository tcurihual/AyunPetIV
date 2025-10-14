# ===== STAGE 1: Base =====
FROM node:20-alpine AS base
WORKDIR /app

RUN npm install -g pnpm

# 1) Manifiestos necesarios para que pnpm entienda el workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 2) Copiar los package.json de los paquetes que ejecutaremos
#    (ajusta esta lista si consumes otros workspaces)
COPY apps/auth/package.json ./apps/auth/package.json
COPY apps/gateway/package.json ./apps/gateway/package.json
COPY packages/utils/package.json ./packages/utils/package.json

# 3) Instalar dependencias de producción RECURSIVAMENTE y filtradas
#    (solo para auth, gateway y utils)
RUN pnpm -r --filter "./packages/utils" \
           --filter "./apps/auth" \
           --filter "./apps/gateway" \
           install --prod --frozen-lockfile

# 4) Copiar los dist ya compilados (hechos fuera del contenedor)
#    ¡IMPORTANTE! También el dist de @repo/utils porque es un workspace enlazado.
COPY packages/utils/dist ./packages/utils/dist
COPY apps/auth/dist        ./apps/auth/dist
COPY apps/gateway/dist     ./apps/gateway/dist

# (Opcional) dummys si algún módulo inicializa algo en runtime
ENV SUPABASE_URL="https://dummy.supabase.co"
ENV SUPABASE_KEY="dummy-key"
ENV JWT_SECRET="dummy-secret"
ENV MAIL_USER="dummy@mail.com"
ENV MAIL_PASS="dummy-pass"
ENV API_STATE="production"

# ===== STAGE 2: Auth =====
FROM node:20-alpine AS auth
WORKDIR /app
COPY --from=base /app /app
CMD ["node", "apps/auth/dist/index.js"]

# ===== STAGE 3: Gateway =====
FROM node:20-alpine AS gateway
WORKDIR /app
COPY --from=base /app /app
CMD ["node", "apps/gateway/dist/index.js"]
