# BluePrint Cabinets Calculator

Plugin WordPress para cálculo e orçamento de armários de cozinha com frontend React e integração Postmark.

## 📋 Requisitos

-   PHP >= 8.0
-   WordPress >= 6.0
-   Node.js >= 20
-   Composer

## 🚀 Fluxo de Desenvolvimento

### 1. Setup Inicial

```bash
# Instalar dependências PHP
composer install

# Instalar dependências frontend
cd frontend
npm install
```

### 2. Desenvolvimento Local

#### Frontend (React + Vite)

```bash
cd frontend

# Modo desenvolvimento com hot reload
npm run dev

# Build para produção
npm run build
```

O frontend será compilado para `frontend/dist/` que é servido pelo WordPress.

#### Backend (PHP)

Edite os arquivos PHP normalmente. O WordPress carrega automaticamente as mudanças.

### 3. Testing

```bash
# Lint do código PHP
composer run fix

# Preview do build de produção
cd frontend
npm run preview
```

## 📦 Fluxo de Build + Release + Deploy

### Visão Geral

```
Código Local → Build → Tag → GitHub Actions → Release → WordPress Update
```

### Passo a Passo

#### 1. Preparar Release

Certifique-se que todas as mudanças estão commitadas:

```bash
git status
git add .
git commit -m "feat: sua descrição"
git push origin main
```

#### 2. Criar Release

Execute o script de release (substituir X.Y.Z pela versão):

```bash
./.config/create-release.sh 1.0.1
```

**O que o script faz:**

-   ✅ Valida o formato da versão (X.Y.Z)
-   ✅ Verifica se há mudanças não commitadas
-   ✅ Atualiza versão em `cabinets-calculator.php`
-   ✅ Faz build do frontend (`npm run build`)
-   ✅ Commita as mudanças
-   ✅ Cria tag Git (`v1.0.1`)
-   ✅ Faz push da tag para o GitHub

#### 3. Build Automático (GitHub Actions)

Quando a tag é enviada, o workflow `.github/workflows/release.yml` é acionado automaticamente:

**Etapas do Workflow:**

1. Checkout do código
2. Setup Node.js 20 e PHP 8.3
3. Instala dependências (npm + composer em modo produção)
4. Build do frontend
5. Cria diretório de distribuição
6. Copia apenas arquivos necessários (exclui node_modules, src, etc)
7. Cria arquivo ZIP do plugin
8. Publica GitHub Release com o ZIP anexado

**Tempo estimado:** 2-3 minutos

#### 4. Deploy Automático (WordPress)

**Plugin Update Checker** verifica atualizações automaticamente:

-   Verifica o GitHub a cada 12 horas
-   Compara versão local vs versão no GitHub Releases
-   Mostra notificação de atualização no WordPress Admin
-   Permite atualização com 1 clique

**Forçar verificação manual:**

-   WordPress Admin → Plugins
-   O sistema verificará imediatamente

## 🔄 Estrutura de Arquivos para Release

### Incluído no ZIP:

```
cabinets-calculator/
├── backend/
├── frontend/
│   └── dist/          # Build compilado
├── vendor/            # Dependências PHP (produção)
├── cabinets-calculator.php
└── composer.json
```

### Excluído do ZIP:

-   `.git/`, `.github/`, `.config/`
-   `node_modules/`
-   `frontend/src/` (código fonte React)
-   `frontend/package.json` (não necessário em produção)
-   Arquivos de configuração de desenvolvimento
-   README.md

## 📝 Convenções de Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

-   **MAJOR** (1.0.0): Mudanças incompatíveis
-   **MINOR** (0.1.0): Novas funcionalidades (compatível)
-   **PATCH** (0.0.1): Bug fixes

### Exemplos:

```bash
# Bug fix
./.config/create-release.sh 1.0.1

# Nova feature
./.config/create-release.sh 1.1.0

# Breaking change
./.config/create-release.sh 2.0.0
```

## 🛠️ Configuração

### Update Checker

Configurado em `backend/update-checker.php`:

-   Repositório: `tales-bluecrocus/cabinets-calculator`
-   Branch: `main`
-   Usa GitHub Releases (não branch ZIP)

### Variáveis de Ambiente

Configure no WordPress Admin → Cabinets Calculator:

-   **Postmark API Token**: Token para envio de emails
-   **Postmark From Email**: Email remetente
-   **Admin Email**: Email para receber orçamentos

## 📚 Estrutura do Projeto

```
.
├── .config/
│   └── create-release.sh      # Script de release
├── .github/
│   └── workflows/
│       └── release.yml        # GitHub Actions workflow
├── backend/
│   ├── update-checker.php     # Sistema de atualizações
│   └── ...
├── frontend/
│   ├── src/                   # Código React
│   ├── dist/                  # Build compilado
│   ├── package.json
│   └── vite.config.ts
├── vendor/                    # Dependências PHP
├── cabinets-calculator.php    # Arquivo principal do plugin
├── composer.json
└── README.md
```

## 🐛 Troubleshooting

### Build falha no GitHub Actions

```bash
# Teste o build localmente primeiro
cd frontend
npm ci
npm run build
```

### Plugin não detecta atualizações

1. Verifique se a release foi criada no GitHub
2. Force verificação: WordPress Admin → Plugins
3. Aguarde até 12 horas para verificação automática

### Erro de permissões ao criar release

Certifique-se que:

-   Você tem permissões de push no repositório
-   O token `GITHUB_TOKEN` está configurado (automático)

## 📞 Suporte

Para problemas ou dúvidas:

-   Issues: https://github.com/tales-bluecrocus/cabinets-calculator/issues
-   Email: tales@bluecrocus.com

---

**Desenvolvido por BluePrint Cabinets** | Version 1.0.0
