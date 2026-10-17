# Projeto Monorepo FATEC

c20cfd9f0812f29d4d0eb5c785f11c09c0d5d705

dentro da organização- sqco_BKBuaPhisbrI1btmimyYU2QKhFn0YrTeQjFIjC6CYopLysmyNRqHZOfK4kQ

## Teste Skip ci

![Status do CI](https://github.com/i-davies/projeto-monorepo/actions/workflows/ci.yml/badge.svg)

## Como rodar o projeto

### Rodando com pnpm (local)

```bash
cd backend
pnpm install
pnpm dev
```

### Rodando com Docker

```bash
docker-compose up --build
```

### Rodando as migrations do banco de dados

```bash
cd backend
pnpm sequelize-cli db:migrate
```

## Scripts disponíveis

### Raiz do monorepo (`package.json`)

| Comando | Descrição |
| --- | --- |
| `pnpm docker:build-api` | Builda a imagem Docker do backend |
| `pnpm docker:build-app` | Builda a imagem Docker do app |
| `pnpm compose:up` | Sobe os containers em background |
| `pnpm compose:down` | Derruba os containers |
| `pnpm compose:logs` | Acompanha os logs dos containers |

### Backend (`backend/package.json`)

| Comando | Descrição |
| --- | --- |
| `pnpm dev` | Sobe o servidor em modo desenvolvimento (watch) |
| `pnpm build` | Compila o TypeScript para `dist/` |
| `pnpm start` | Roda o servidor já compilado (`dist/server.js`) |