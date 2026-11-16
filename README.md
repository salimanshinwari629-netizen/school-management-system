# SMS — School Management System

Single-school management system for ~300–700 students in Khyber District, Khyber Pakhtunkhwa, Pakistan.

**Current status: Phase 0 (Foundations) complete. Phase 1 (authentication) has not started.** This repo currently contains the application shell, API foundation, shared contracts, and tooling — no business modules.

## Documentation

- [`AGENTS.md`](./AGENTS.md) — operational guide and verified commands
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — architecture, data model, security, roadmap

## Stack

- **Client:** React 19, Vite 8, Tailwind CSS 3, TypeScript, React Router 7
- **Server:** Node.js, Express 5, TypeScript, Pino, Zod
- **Database:** MongoDB + Mongoose (Atlas recommended)
- **Shared:** `@sms/shared` — roles, permissions, enums, money/date helpers, API types

## Prerequisites

- Node.js 22.13+ (developed on 26.13.1; see `.nvmrc`)
- npm 10+
- MongoDB (local or Atlas) — optional for running the UI only

## Setup

```powershell
npm install
Copy-Item server/.env.example server/.env   # adjust MONGODB_URI if needed
npm run dev
```

- Client: http://localhost:5173 (proxies `/api` to the server)
- API: http://localhost:4000
- Liveness: http://localhost:4000/health
- Readiness: http://localhost:4000/health/ready (200 only when MongoDB is connected)

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Shared watch + API + client |
| `npm run build` | Build shared, server, client |
| `npm run lint` | ESLint in every workspace |
| `npm run typecheck` | `tsc --noEmit` in every workspace |
| `npm test` | Vitest in every workspace |
| `npm run format` / `format:check` | Prettier write / verify |

Single test example: `npm test -w @sms/server -- tests/health.test.ts`

## Layout

```
client/           React SPA (layout shell + placeholder pages)
server/           Express API (/health, /api/v1, error envelope)
packages/shared/  Framework-free TypeScript contracts
docs/             Architecture
```

Never commit `.env` files or real student data.
