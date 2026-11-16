# AGENTS.md

## Current status (2026-11-15)

- **Phase 0 (Foundations) is complete and verified. Phase 1 has not started.**
- Implemented: npm workspaces monorepo, React/Vite/Tailwind/TS shell, Express API with `/health`, shared contracts package, MongoDB/Mongoose config, ESLint/Prettier/typecheck/Vitest, CI workflow.
- Not implemented: authentication, database models, any business module, email/SMS, payments. Do not build these without explicit approval.
- See `docs/ARCHITECTURE.md` for the approved design. Update both docs when a decision or command changes.

## Project

School Management System (SMS) for **one school**, ~**300–700 students**, in **Khyber District, Khyber Pakhtunkhwa, Pakistan**.

- Single-tenant: never add multi-school scoping.
- Modules (later phases): students, teachers, classes & subjects, attendance, fees, exams & results, reports, parent/student portals.

## Confirmed decisions

- TypeScript everywhere; English now, Urdu later; PKR; `Asia/Karachi`.
- React + Vite + Tailwind + React Router 7 (SPA) · Node.js + Express 5 (`/api/v1`) · MongoDB + Mongoose.
- npm workspaces: `client`, `server`, `packages/shared`.
- Roles: admin, teacher, accountant, student, parent only.
- Daily attendance (schema keeps `period` for later) · percentage grading with settings-driven bands · monthly offline fees · manual promotion with admin approval.
- No email/SMS in v1: admin-issued temporary passwords, in-app announcements.
- Auth target: short-lived access JWT in memory + rotating refresh token in an `httpOnly` cookie; server-side RBAC + ownership checks.
- Deployment: Atlas + Render recommended; final host pending.

## Layout

- `client/` — SPA (React 19, Vite 8, React Router 7, Tailwind 3). `src/routes`, `src/layouts`, `src/pages`, `src/components`, `src/test`.
- `server/` — `src/app.ts` (no listen), `src/server.ts` (bootstrap), `src/config`, `src/middleware`, `src/routes`, `tests`.
- `packages/shared/` — framework-free roles/permissions/enums/money/dates/API types. No Express or React imports.
- Server imports the **built** `@sms/shared` (`dist/index.js`), not its source. Rebuild with `npm run build -w @sms/shared` after editing it; `npm run dev` watches and rebuilds it.

## Commands (verified)

Run from the repo root. Node ≥22.13; this machine uses 26.13.1.

| Command | What it does |
|---|---|
| `npm install` | Install all workspaces |
| `npm run dev` | Shared watch + API (`:4000`) + client (`:5173`, proxies `/api`) |
| `npm run build` | Shared → server → client, with typechecking |
| `npm run lint` | ESLint, all workspaces |
| `npm run typecheck` | `tsc --noEmit`, all workspaces |
| `npm test` | Vitest, all workspaces |
| `npm run format` / `format:check` | Prettier write / verify |

- Single test: `npm test -w @sms/server -- tests/health.test.ts` (same pattern for `@sms/client` / `@sms/shared`).
- API only: `npm run dev -w @sms/server`; client only: `npm run dev -w @sms/client`; built API: `npm start -w @sms/server`.
- Verify API: `Invoke-RestMethod http://localhost:4000/health` (200), `/health/ready` (200 only with MongoDB, else 503), `/api/v1`.

## Environment

- Copy `server/.env.example` → `server/.env`; never commit `.env`. Only `VITE_API_BASE_URL` is exposed to the client — never put secrets in `VITE_*`.
- Without MongoDB the API starts degraded **in development** (readiness 503); production exits on DB failure. No local MongoDB server binary is installed on this machine.
- Windows PowerShell: `npm.ps1` is blocked by execution policy, so use `npm.cmd`. Node is installed user-scoped at `%LOCALAPPDATA%\Programs\nodejs` and was added to the user PATH (already-open shells must be restarted).
- `git` is not on `PATH`; use `C:\Program Files\Git\cmd\git.exe`.
- npm 11 `allowScripts` approves only esbuild; if a dependency's install script is newly required, review and approve it explicitly.

## Rules

- Enforce permissions and ownership on the server; client checks are UI-only.
- Keep money as integer paisa; UTC instants; attendance days `YYYY-MM-DD`; billing months `YYYY-MM`.
- Archive financial/academic records instead of deleting; use transactions for payments and promotion.
- Validate input with Zod at API boundaries; use the shared error envelope.
- Add/extend tests with every feature; keep `format:check → lint → typecheck → test → build` green.
- No real student/personal data in the repo or test fixtures.

## Pending decisions

Grade bands and pass rules; fee due day, fines, concession types; academic calendar/terms; report/receipt formats; import data source; admin/accountant account holders; deployment host/budget; browser/device targets. Do not assume values.
