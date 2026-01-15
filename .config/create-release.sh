#!/bin/bash

# Script para criar uma nova versão/release do plugin
# Uso: ./.config/create-release.sh 1.0.1

set -e  # Exit on error

# Get plugin root directory (parent of .config)
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")'/.." && pwd)"
cd "$PLUGIN_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validate version argument
if [ -z "$1" ]; then
    echo -e "${RED}❌ Erro: Você deve fornecer o número da versão${NC}"
    echo -e "Uso: ./.config/create-release.sh 1.0.1"
    exit 1
fi

VERSION=$1
TAG="v$VERSION"

# Validate semantic versioning format (X.Y.Z)
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}❌ Erro: Versão inválida. Use formato: X.Y.Z (ex: 1.0.1)${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Criando release $TAG...${NC}\n"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ Erro: Existem mudanças não commitadas.${NC}"
    echo -e "Commit ou stash antes de continuar.\n"
    git status --short
    exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Aviso: Você está na branch '$CURRENT_BRANCH', não 'main'${NC}"
    read -p "Deseja continuar? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo -e "${RED}❌ Erro: Tag $TAG já existe!${NC}"
    echo -e "Use: git tag -d $TAG (local) e git push --delete origin $TAG (remoto)"
    exit 1
fi

# Get current version from plugin file
CURRENT_VERSION=$(grep -m 1 "Version:" cabinets-calculator.php | sed 's/.*Version: *//' | tr -d '\r' | xargs)
echo -e "${BLUE}📋 Versão atual: $CURRENT_VERSION${NC}"
echo -e "${BLUE}📋 Nova versão: $VERSION${NC}\n"

# Confirm before proceeding
read -p "Confirmar criação da release $TAG? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Operação cancelada.${NC}"
    exit 1
fi

# Update version in plugin file
echo -e "${GREEN}📝 Atualizando versão no cabinets-calculator.php...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/Version: .*/Version: $VERSION/" cabinets-calculator.php
else
    # Linux
    sed -i "s/Version: .*/Version: $VERSION/" cabinets-calculator.php
fi

# Verify the change
NEW_VERSION=$(grep -m 1 "Version:" cabinets-calculator.php | sed 's/.*Version: *//' | tr -d '\r' | xargs)
if [ "$NEW_VERSION" != "$VERSION" ]; then
    echo -e "${RED}❌ Erro: Falha ao atualizar versão no cabinets-calculator.php${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Versão atualizada: $CURRENT_VERSION → $VERSION${NC}\n"

# Build frontend
echo -e "${GREEN}🔨 Building frontend...${NC}"
cd frontend
npm run build
cd ..
echo -e "${GREEN}✓ Frontend build completo${NC}\n"

# Commit version bump and build (only if there are changes)
echo -e "${GREEN}📦 Commitando mudanças...${NC}"
git add cabinets-calculator.php frontend/dist
if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  Sem mudanças (já está em $VERSION)${NC}\n"
else
    git commit -m "chore: bump version to $VERSION"
fi

# Create annotated tag
echo -e "${GREEN}🏷️  Criando tag $TAG...${NC}"
git tag -a "$TAG" -m "Release $VERSION"

# Push changes
echo -e "${GREEN}📤 Fazendo push para o GitHub...${NC}"
git push origin "$CURRENT_BRANCH"
git push origin "$TAG"

echo ""
echo -e "${GREEN}✅ Release $TAG criada com sucesso!${NC}"
echo ""
echo -e "${BLUE}🔗 Acompanhe o build em:${NC}"
echo -e "   https://github.com/seu-usuario/cabinets-calculator/actions"
echo ""
echo -e "${BLUE}📦 A release está disponível em:${NC}"
echo -e "   https://github.com/seu-usuario/cabinets-calculator/releases/tag/$TAG"
echo ""
