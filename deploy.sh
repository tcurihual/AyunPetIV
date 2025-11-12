#!/bin/bash
set -e

# Cargar constantes del .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

usage() {
  echo "Uso: $0 [--api] [--mobile] [--all]"
  echo ""
  echo "  --api        Ejecuta solo el update + build del API"
  echo "  --mobile     Copia carpeta mobile y genera APK"
  exit 1
}

# API BUILD
update_api() {
  echo "🚀 Actualizando API de AyunPet..."

  cd "$REMOTE_PROJECT_PATH" || {
    echo "❌ No se pudo acceder a REMOTE_PROJECT_PATH: $REMOTE_PROJECT_PATH"
    exit 1
  }
  git pull
  pnpm install
}

build_api() {
  echo "🏗️ Compilando API..."
  cd "$REMOTE_PROJECT_PATH" || exit 1
  pnpm run build:api

  pm2 startOrRestart ecosystem.config.cjs
  pm2 save
}

# APK BULD
prepare_mobile() {
  echo "📱 Preparando carpeta mobile (LOCAL)..."

  if [ ! -d "$LOCAL_PROJECT_PATH/apps/mobile" ]; then
    echo "No existe carpeta mobile en: $LOCAL_PROJECT_PATH/mobile"
    exit 1
  fi

  rm -rf "$LOCAL_PROJECT_PATH/../mobile-temp"
  cp -r "$LOCAL_PROJECT_PATH/apps/mobile" "$LOCAL_PROJECT_PATH/../mobile-temp"

  cd "$LOCAL_PROJECT_PATH/../mobile-temp" || exit 1
  pnpm install

  git init >/dev/null 2>&1
  git add . >/dev/null 2>&1
  git commit -m "temp: initial mobile build" >/dev/null 2>&1
  echo "✅ Repo Git temporal listo para EAS"
}

build_apk() {
  echo "📦 Construyendo APK..."
  eas build --platform android --profile development --local

  GENERATED_APK=$(find . -name "*.apk" | head -n 1)

  if [ -z "$GENERATED_APK" ]; then
    echo "No se encontró ningún APK generado."
    exit 1
  fi

  echo "✅ APK generado en: $GENERATED_APK"

  NEW_APK_NAME="ayunpet.apk"
  mv "$GENERATED_APK" "$NEW_APK_NAME"

  send_apk_ssh "$NEW_APK_NAME"
}

send_apk_ssh() {
  APK="$1"
  echo "📤 Enviando APK al VPS..."

  scp -i "$PUBLIC_KEY_PATH" "$APK" "$VPS_USER@$VPS_IP:$VPS_TARGET_PATH/"

  echo "✅ APK enviado correctamente."
}

if [ $# -eq 0 ]; then
  usage
fi

RUN_API=false
RUN_MOBILE=false

for arg in "$@"; do
  case $arg in
    --api)
      RUN_API=true
      ;;
    --mobile)
      RUN_MOBILE=true
      ;;
    *)
      usage
      ;;
  esac
done

if [ "$RUN_API" = true ]; then
  update_api
  build_api
fi

if [ "$RUN_MOBILE" = true ]; then
  prepare_mobile
  build_apk
fi

echo "✅ Script finalizado."
