# Estágio 1: Build da Aplicação

# 1. Define a imagem de origem base 
FROM node:24-alpine AS builder

# Instalação do pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2. Define diretório de trabalho interno do container
WORKDIR /app

# Cópia dos manifestos de dependencias do backend
COPY package.json pnpm.lock.yaml* ./

# Instalação de todas as dependencias incluindo devDependencies para o build
RUN npm install --frozen-lockfile

# 3. Instalar o pnpm globalmente para gerenciar as dependências
RUN npm install -g pnpm

# Desativa a restrição do pnpm 11
RUN pnpm config set strict-dep-builds false

# Cópia do codigo-fonte e da configuração do Typescript
COPY tsconfig.json ./
COPY dsrc ./src

# Compilação do typescript para javascript (gera a pasta dist/)
RUN pnpm run build

# Remoção das dependencias de desenvolvimento para diminuir o tamanho final
RUN pnpm prune --prod

# Estágio 2: Imagem Final de execução (Produção)
FROM node:24-alpine AS runner

WORKDIR /app

# Definição do ambiente como produção
ENV NODE_ENV=production
ENV PORT=3000

