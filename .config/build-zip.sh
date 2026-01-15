#!/bin/bash

# Script para gerar ZIP do plugin manualmente (para distribuição/teste)
# Uso: ./.config/build-zip.sh

set -e

# Get plugin root directory
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PLUGIN_DIR"

# Get wp-content directory (2 levels up from plugin)
WP_CONTENT_DIR="$(cd "$PLUGIN_DIR/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get version from plugin file
VERSION=$(grep -m 1 "Version:" cabinets-calculator.php | sed 's/.*Version: *//' | tr -d '\r' | xargs)
PLUGIN_NAME="cabinets-calculator"
ZIP_NAME="${PLUGIN_NAME}-${VERSION}.zip"
ZIP_PATH="$WP_CONTENT_DIR/$ZIP_NAME"
BUILD_DIR="dist-zip"

echo -e "${BLUE}📦 Gerando ZIP do plugin...${NC}"
echo -e "${BLUE}Versão: ${VERSION}${NC}\n"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Aviso: Existem mudanças não commitadas${NC}"
    read -p "Deseja continuar? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Clean previous build
if [ -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}🧹 Limpando build anterior...${NC}"
    rm -rf "$BUILD_DIR"
fi

# Install frontend dependencies
echo -e "${GREEN}📥 Instalando dependências frontend...${NC}"
cd frontend
npm ci --silent
cd ..

echo -e "${GREEN}📥 Instalando dependências Composer (produção)...${NC}"
composer install --no-dev --optimize-autoloader --quiet

# Build frontend
echo -e "${GREEN}🔨 Compilando frontend...${NC}"
cd frontend
npm run build
cd ..

# Create build directory
mkdir -p "$BUILD_DIR"

echo -e "${GREEN}📋 Copiando arquivos do plugin...${NC}"

# Copy plugin files excluding development files
rsync -a --progress "$PLUGIN_DIR/" "$BUILD_DIR/$PLUGIN_NAME" \
    --exclude='.git/' \
    --exclude='.github/' \
    --exclude='.vscode/' \
    --exclude='node_modules/' \
    --exclude='frontend/node_modules/' \
    --exclude='frontend/src/' \
    --exclude='frontend/.vite/' \
    --exclude="$BUILD_DIR" \
    --exclude='.gitignore' \
    --exclude='.gitattributes' \
    --exclude='frontend/package.json' \
    --exclude='frontend/package-lock.json' \
    --exclude='frontend/tsconfig.json' \
    --exclude='frontend/tsconfig.node.json' \
    --exclude='frontend/vite.config.ts' \
    --exclude='frontend/postcss.config.js' \
    --exclude='frontend/tailwind.config.js' \
    --exclude='frontend/components.json' \
    --exclude='frontend/index.html' \
    --exclude='composer.json' \
    --exclude='composer.lock' \
    --exclude='phpcs.xml' \
    --exclude='.config/' \
    --exclude='README.md' \
    --exclude='*.zip'

# Create ZIP
echo -e "${GREEN}🗜️  Criando arquivo ZIP...${NC}"
cd "$BUILD_DIR"
zip -r -q "$ZIP_PATH" "$PLUGIN_NAME"
cd ..

# Cleanup
echo -e "${GREEN}🧹 Limpando arquivos temporários...${NC}"
rm -rf "$BUILD_DIR"

# Reinstall dev dependencies if needed
if [ -f "composer.json" ]; then
    echo -e "${GREEN}🔄 Restaurando dependências de desenvolvimento...${NC}"
    composer install --quiet
fi

# Show result
FILE_SIZE=$(du -h "$ZIP_PATH" | cut -f1)
echo ""
echo -e "${GREEN}✅ ZIP criado com sucesso!${NC}"
echo -e "${BLUE}📦 Arquivo: ${ZIP_PATH}${NC}"
echo -e "${BLUE}📏 Tamanho: ${FILE_SIZE}${NC}"
echo ""
echo -e "${YELLOW}💡 Para testar:${NC}"
echo -e "   1. Faça upload no WordPress: Plugins → Adicionar novo → Enviar plugin"
echo -e "   2. Ou extraia localmente: unzip ${ZIP_PATH}"
echo ""
