#!/bin/bash

# Script de instalación de dependencias para el módulo de Noticias
# ================================================================

echo "======================================"
echo " Instalación de dependencias - News "
echo "======================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio del proyecto
PROJECT_DIR="/home/hjflash/Documentos/AyunPetIV"

# Instalar dependencias en el servicio de entities
echo -e "${BLUE}>>> Instalando dependencias en el servicio de Entities...${NC}"
cd "${PROJECT_DIR}/apps/entities"

pnpm add axios form-data multer
pnpm add -D @types/multer

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencias instaladas correctamente en Entities${NC}"
else
    echo "✗ Error al instalar dependencias en Entities"
    exit 1
fi

echo ""
echo -e "${GREEN}======================================"
echo " Instalación completada"
echo "======================================"
echo ""
echo "Dependencias instaladas:"
echo "  - axios (comunicación HTTP)"
echo "  - form-data (envío de archivos)"
echo "  - multer (manejo de archivos)"
echo "  - @types/multer (tipos TypeScript)"
echo ""
echo "Siguiente paso:"
echo "  1. Ejecutar los servicios necesarios"
echo "  2. Ejecutar las pruebas: ./test-news-endpoints.sh"
echo -e "${NC}"
