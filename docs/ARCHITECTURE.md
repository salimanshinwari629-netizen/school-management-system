# SMS — Architecture & Decisions

**Status:** Phase 0 (Foundations) complete and verified. Phase 1 has **not** started; business modules and authentication do not exist yet.
**Scope:** v1, one school in Khyber District, Khyber Pakhtunkhwa, Pakistan; ~300–700 students.
**Last updated:** 2026-11-15

This document is the source of truth for structure and decisions. It supersedes SMS Proposal v1 where they differ. `AGENTS.md` is the operational entry point with the verified commands.

**Implemented in Phase 0:** npm workspaces (`client`, `server`, `packages/shared`), React/Vite/Tailwind shell, Express API (`/health`, `/health/ready`, `/api/v1`, error envelope), Mongoose connection config, shared contracts (roles, permissions, enums, money/dates, API types), ESLint/Prettier/typecheck/Vitest, CI workflow.

**Not implemented:** authentication, any Mongoose model, business modules, portal data, email/SMS, payments.

---

## 0. School profile (confirmed)

| Item | Value |
|---|---|
| Country / Province / District | Pakistan / Khyber Pakhtunkhwa (KPK) / Khyber |
| Currency | PKR |
| Timezone | `Asia/Karachi` (UTC+5, no DST) |
| Language | English now; Urdu planned |
| Scale | ~300–700 students, one school |
| Tenancy | Single-tenant |

These values are seeded into the `settings` document, so a future change does not require code edits.

---

## 1. Decision log

| # | Decision | Architectural consequence |
|---|---|---|
| D1 | **TypeScript** for client, server, and shared code | Strict mode; shared DTOs/schemas; `typecheck` is a required check |
| D2 | Roles: `admin`, `teacher`, `accountant`, `student`, `parent` | Accountant owns fees/finance reports; no other roles in v1 |
| D3 | **Daily attendance** in v1 | Session document carries `period = 0`; unique index already includes `period`, so per-period can be enabled later without migration |
| D4 | **Percentage grading**, configurable grade bands and pass marks, **ranking optional** | Grade bands live in settings; `results.rank` is nullable and computed only when enabled |
| D5 | **Monthly fees in PKR**, no online payments | Invoice per student per billing month; cash/bank/cheque receipts recorded by accountant |
| D6 | Deployment **flexible**; Atlas + Render recommended | No hard vendor coupling; env-driven config; final host pending budget/security review (Phase 8) |
| D7 | **No email/SMS in v1** | Password resets are admin-issued temporary passwords; announcements are in-app only |
| D8 | **npm workspaces monorepo** | Single lockfile, root scripts, `client` + `server` + `packages/shared` |
| D9 | **Manual promotion with admin approval** | `promotionBatches` with draft → approved → applied states; applied inside a transaction |
| D10 | **English now, Urdu later**; i18n-ready | Central copy dictionary; no RTL work in v1 |
| D11 | **Location confirmed:** Khyber District, Khyber Pakhtunkhwa, Pakistan → **PKR**, `Asia/Karachi` | Currency/timezone are seeded defaults in `settings`, not hardcoded |
| D12 | **React Router 7** (upgraded from v6) | Resolves the v6 high-severity advisories; declarative routing API used by the current shell is unchanged. Supersedes the v6 choice in Proposal v1 |

School location, currency, and timezone are **confirmed** (D11). They remain `settings` values so a future relocation or policy change does not require code edits.

---

## 2. System architecture

```
React SPA (Vite + TS + Tailwind)
   │  HTTPS/JSON, Authorization: Bearer <access JWT>
   ▼
Express API  /api/v1  (TS)
   ├─ helmet, CORS allowlist, rate limit, request ID, pino logging
   ├─ authenticate → authorize(permission) → ownership/scope check
   ├─ Zod validation → controller → service → Mongoose model
   ├─ jobs (cron): rollover reminders, overdue-fee scan, summaries
   └─ reports: aggregation + PDF/Excel export
   ▼
MongoDB (replica set → transactions for fees/promotion)
```

Principles:

- **Two deployables, one repo.** Static client; stateless API (sessions live in MongoDB via refresh-token records).
- **Domain modules, layered internally.** HTTP concerns in controllers; every rule in services so jobs, reports, and tests reuse them.
- **Shared contract.** Request/response schemas and enums are defined once in `@sms/shared` and used by both sides.
- **Single-tenant.** No `schoolId` scoping. School identity, currency, timezone, and grading live in a singleton `settings` document.
- **History is preserved.** Official numbers (admission, invoice, receipt) come from counters; financial and academic records are archived, not deleted.
- **Server is the only authority.** Frontend permission checks are cosmetic.

---

## 3. Planned stack

| Layer | Choice | Notes |
|---|---|---|
| Client | React 18+, Vite, TypeScript, Tailwind CSS | SPA; React Router 7, TanStack Query, React Hook Form + Zod, Recharts |
| Server | Node.js LTS, Express 4/5, TypeScript | Zod validation, pino logging, `express-rate-limit`, `helmet` |
| Database | MongoDB 7.x + Mongoose | Replica set required for transactions |
| Shared | `@sms/shared` workspace | Roles, permission keys, enums, Zod schemas, DTO types, money/date helpers |
| Testing | Vitest, React Testing Library, Supertest, `mongodb-memory-server` | Playwright for a small e2e suite late in the project |
| CI | GitHub Actions | lint → typecheck → test → build on PRs |

Exact package versions and the server build tool (tsc vs tsup) are pinned in Phase 0 after environment verification. Constraints: ES modules, strict TS, one root command per task.

---

## 4. Repository layout (planned)

```
sms/
  AGENTS.md
  docs/ARCHITECTURE.md
  package.json                 # workspaces: client, server, packages/*
  package-lock.json
  tsconfig.base.json
  .editorconfig  .gitattributes  .gitignore  .nvmrc
  .github/workflows/ci.yml
  client/
  server/
  packages/shared/
```

### `client/`

```
client/
  index.html
  vite.config.ts  tailwind.config.ts  postcss.config.js  .env.example
  src/
    main.tsx  App.tsx
    routes/        AppRouter.tsx  ProtectedRoute.tsx  RoleRoute.tsx
    layouts/       AuthLayout.tsx  AppLayout.tsx  PortalLayout.tsx
    components/
      ui/          Button, Input, Select, Modal, Table, Badge, Pagination…
      layout/      Sidebar, Topbar, Breadcrumbs
      charts/  forms/
    modules/
      students/  teachers/  classes/  subjects/  attendance/
      fees/  exams/  reports/  announcements/  promotions/
      users/  settings/
      # each: pages/, components/, api.ts, hooks.ts, schemas.ts (re-exports from shared)
    portal/
      student/  parent/
    services/      apiClient.ts (axios + refresh interceptor)  queryClient.ts
    context/       AuthContext.tsx  ToastContext.tsx
    hooks/  lib/   i18n/en.ts  i18n/index.ts  styles/  types/
```

### `server/`

```
server/
  package.json  tsconfig.json  .env.example  vitest.config.ts
  src/
    server.ts                  # env → db → app.listen
    app.ts                     # express app, no listen (testable)
    config/        env.ts  db.ts  logger.ts  cors.ts
    routes/        index.ts
    middleware/    authenticate.ts  authorize.ts  ownership.ts  validate.ts
                   errorHandler.ts  notFound.ts  rateLimit.ts  upload.ts  audit.ts
    modules/
      auth/  users/  students/  guardians/  teachers/
      academics/   # academicYears, terms, classes, subjects, classSubjects, enrollments
      attendance/  fees/  exams/  reports/
      announcements/  promotions/  settings/
      # each: *.model.ts, *.service.ts, *.controller.ts, *.routes.ts, *.schemas.ts
    jobs/          feeOverdue.job.ts  attendanceSummary.job.ts
    utils/         AppError.ts  asyncHandler.ts  pagination.ts  money.ts  dates.ts
    constants/     roles.ts (re-export)  enums.ts
  tests/           unit/  integration/  fixtures/
  scripts/         seed.ts  create-admin.ts
```

### `packages/shared/`

```
packages/shared/
  src/
    roles.ts  permissions.ts  enums.ts
    schemas/    # Zod: student, teacher, class, attendance, invoice, payment, exam, marks…
    types/      # API DTOs, pagination, error envelope
    money.ts  dates.ts
    index.ts
```

Rules: framework-free (no Express/React imports); built with `tsc` to `dist`; client and server consume the package name. Server uses relative imports; client uses the `@/` alias.

---

## 5. Backend design

### Request flow

`route → validate(schema) → authenticate → authorize(permission) → controller → service → model`

Controllers return `200/201/204` and never touch Mongoose directly. Services receive plain inputs, enforce invariants, and throw typed `AppError`s.

### API conventions

- Base path `/api/v1`; plural resource names (`/students`, `/attendance-sessions`, `/fee-invoices`).
- Query: `page` (default 1), `limit` (default 25, max 100), whitelisted `sort`/`filter` fields only.
- Success: `{ "data": … , "meta": { "page", "limit", "total", "totalPages" } }` (meta only for lists).
- Error: `{ "error": { "code": "VALIDATION_ERROR", "message": "…", "details": […], "requestId": "…" } }`.
- Status codes: 400 invalid, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict (duplicate/state), 422 validation, 429 limited, 500 unexpected.
- Dates: ISO 8601 UTC in JSON. Academic/billing days are strings: `date = "YYYY-MM-DD"`, `billingMonth = "YYYY-MM"`.
- Money: **integer paisa** (PKR minor unit); helpers in `shared/money.ts`; formatted with `en-PK`.
- Official numbers via atomic counter increments: `ADM-…`, `INV-YYYY-MM-####`, `RCPT-…`.

### Resource surface (planned)

`/auth`, `/users`, `/students`, `/guardians`, `/teachers`, `/academic-years`, `/terms`, `/classes`, `/subjects`, `/class-subjects`, `/enrollments`, `/attendance-sessions`, `/fee-structures`, `/invoices`, `/payments`, `/exams`, `/exam-subjects`, `/marks`, `/results`, `/promotions`, `/announcements`, `/reports`, `/settings`, `/audit-logs`.

### Cross-cutting

- `audit` middleware on mutating admin/finance/academic routes.
- pino JSON logs with `requestId`; no passwords, tokens, or full PII.
- Cron jobs are idempotent and safe to re-run; no job owns business rules (they call services).
- `/health` checks process and DB; used by the host.

---

## 6. Frontend design

### Routing

| Path | Audience | Notes |
|---|---|---|
| `/login` | all | Public |
| `/app/dashboard` | staff | Role-specific widgets |
| `/app/students`, `/teachers`, `/classes`, `/subjects`, `/users` | admin (+ scoped reads) | CRUD |
| `/app/attendance` | teacher, admin | Marking + register |
| `/app/exams` | teacher, admin | Setup, marks, publish |
| `/app/fees` | accountant, admin | Invoices, receipts, defaulters |
| `/app/reports`, `/app/settings`, `/app/audit-logs` | admin/accountant | Permission-gated |
| `/app/promotions` | admin | Draft → approve → apply |
| `/portal/student/*` | student | Own attendance, results, fees |
| `/portal/parent/*` | parent | Linked children only |

`ProtectedRoute` checks the session; `RoleRoute` checks capabilities from `GET /auth/me`. Neither replaces server checks.

### State and data

- Access token in memory (never `localStorage`); silent refresh on boot; axios interceptor queues requests during refresh.
- TanStack Query for all server state; cache keys per resource; invalidate on mutations.
- Auth/toast context only; no global state library.
- Forms: React Hook Form + Zod schemas from `@sms/shared`.
- Tables: server-side pagination/filtering; empty, loading, and error states are required on every list.

### Copy and locale

All user-facing strings go through `i18n/en.ts` (`t('students.title')`); components contain no hardcoded copy. Values are formatted via `Intl` with `en-PK` / `Asia/Karachi`. This keeps a future Urdu + RTL phase additive.

---

## 7. Data model

### Conventions

- Plural collections, camelCase fields, `timestamps: true`, ObjectId refs.
- Store references, plus **snapshots** of names/amounts on financial and result documents so later edits do not rewrite history.
- Archive instead of delete (`status`, `archivedAt`).
- Attendance day and billing month are strings to avoid timezone drift; instants are UTC.
- Every collection gets indexes for its real query paths (listed below).

### Identity and people

| Collection | Key fields | Relationships / rules |
|---|---|---|
| `users` | username (unique; admission/employee no or generated), email (optional, unique sparse), passwordHash, role, phone, avatarKey, isActive, mustChangePassword, tokenVersion, lastLoginAt | 1—1 profile |
| `students` | userId, admissionNo (unique), name, dob, gender, guardianIds[], address, photoKey, admissionDate, status (active/left/graduated) | N—M guardians; 1—N enrollments |
| `guardians` | userId, name, relation, phone, email, occupation, address | linked via `students.guardianIds` |
| `teachers` | userId, employeeNo (unique), name, qualification, specialization, joiningDate, phone, status | assigned via `classSubjects`; class teacher via `classes.classTeacherId` |
| `refreshTokens` | userId, tokenHash, expiresAt, revokedAt, replacedBy, ip, userAgent | rotation + reuse detection |

### Academic structure

| Collection | Key fields | Rules |
|---|---|---|
| `academicYears` | name (`2026-2027`), startDate, endDate, isCurrent | one current year enforced in service |
| `terms` | academicYearId, name, startDate, endDate | exam grouping |
| `classes` | name (`Grade 5`), section (`A`), academicYearId, classTeacherId, room, capacity | unique `(academicYearId, name, section)` |
| `subjects` | code (unique), name, type (core/elective) | — |
| `classSubjects` | academicYearId, classId, subjectId, teacherId | unique `(classId, subjectId, academicYearId)`; defines curriculum + teaching scope |
| `enrollments` | studentId, classId, academicYearId, rollNo, status (active/completed/withdrawn), startDate | unique `(studentId, academicYearId)`; source of truth for rosters |

### Attendance (daily now, per-period later)

`attendanceSessions`: classId, academicYearId, `date`, **`period` (0 = daily)**, markedBy, status (`draft`/`submitted`), `records[] { studentId, status: present|absent|late|excused, remark }`, `amendments[] { by, at, reason, previousStatus }`.
Index: unique `(classId, date, period)`; query index `(classId, date)`.

- Bulk marking writes one document atomically; a class has < 60 students, far below the 16 MB document limit.
- Teachers edit their own class sessions; admin edits after submission and must record a reason (appended to `amendments`).
- Per-period support later needs only `settings.attendance.mode = "period"`, period configuration, and a timetable collection — the schema and indexes stay valid.

### Fees (monthly, PKR, offline)

| Collection | Key fields | Notes |
|---|---|---|
| `feeStructures` | academicYearId, classId, components[{name, amount, frequency: monthly\|one-time}], monthlyTotal, isActive | template per class/year |
| `feeConcessions` | studentId, type (percentage/fixed), value, reason, approvedBy, activeFrom, activeTo | sibling/staff discounts; applied during invoice generation |
| `invoices` | invoiceNo (unique), studentId, academicYearId, classId, **billingMonth `YYYY-MM`**, items[] (snapshot), gross, discount, fine, total, paid, balance, dueDate, status (unpaid/partial/paid/waived) | unique `(studentId, billingMonth)`; "overdue" is derived (dueDate + balance) |
| `payments` | receiptNo (unique), invoiceId, studentId, amount, method (cash/bank_transfer/cheque/other), reference, paidAt, receivedBy, notes | 1 invoice → N payments; updated with the invoice in one transaction |
| `counters` | `_id` (admissionNo, invoiceNo, receiptNo), seq | atomic `$inc` |

Monthly invoice generation is an explicit admin/accountant action (optionally cron-assisted): for each active enrollment, build the invoice from the class structure and concessions, skipping months that already have one. Due day and optional late-fine rule are settings. No gateway, no payment intent records.

### Examinations and results (percentage)

| Collection | Key fields | Notes |
|---|---|---|
| `exams` | academicYearId, termId, name, type, startDate, endDate, status (draft/ongoing/published) | publishing gates portal visibility |
| `examSubjects` | examId, classId, subjectId, examDate, maxMarks, passMarks, teacherId | unique `(examId, classId, subjectId)` |
| `marks` | examSubjectId, studentId, obtained, enteredBy | unique `(examSubjectId, studentId)`; locked once the exam is published |
| `results` | studentId, examId, classId, totalMarks, obtainedMarks, percentage, grade, rank (nullable), publishedAt | recomputed idempotently on publish; frozen afterwards |

Grade bands (e.g. A+ ≥ 90) are an ordered array in `settings.grading`; pass/fail is evaluated per subject and overall from configurable pass marks. `rank` is computed per class only when `settings.exam.rankingEnabled` is true.

### Promotion (manual, approved)

`promotionBatches`: academicYearIdFrom, academicYearIdTo, status (draft/approved/applied), decisions[{ studentId, outcome: promote|retain|graduate, fromClassId, toClassId?, note }], createdBy, approvedBy, approvedAt, appliedAt.

Apply runs in a transaction: create next-year enrollments for `promote`/`retain`, mark `graduate` students accordingly, close old enrollments. Structure for the new year is staged beforehand (clone classes/subjects/class-subjects is an explicit admin action) so the batch only moves students.

### Cross-cutting

`announcements` (title, body, audience {roles, classIds}, createdBy, publishedAt), `settings` (singleton: school identity, logo, address, timezone `Asia/Karachi`, currency `PKR`, grading bands, pass marks, ranking toggle, attendance mode, fee due day, invoice prefix), `auditLogs` (actorId, action, entity, entityId, diff, ip, userAgent, at; TTL, append-only), `notifications` (in-app, per user).

### Indexes

`users.username`, `users.email` (sparse unique), `students.admissionNo`, `enrollments (studentId, academicYearId)`, `attendanceSessions (classId, date, period)`, `invoices (studentId, billingMonth)` unique, `invoices (billingMonth, status)`, `payments.invoiceId`, `marks (examSubjectId, studentId)` unique, `results (examId, classId)`, `auditLogs.at`.

### Transactions

Fee payment posting and promotion apply require multi-document transactions → **replica set**. Atlas provides one; a standalone local `mongod` does not. Integration tests must run against a replica-set-backed in-memory server for these paths.

---

## 8. Authentication and access control

### Identity and login

- Login identifier: **username or email**, plus password. Every student/parent/teacher gets a unique username (admission/employee number or generated) so accounts work without email addresses.
- Argon2id (bcrypt cost ≥ 12 acceptable) password hashing.
- Access JWT (~15 min) kept in memory; refresh token (~7 days) is an opaque random value, hashed in `refreshTokens`, sent as `httpOnly; Secure; SameSite=Strict` cookie, rotated on every refresh with reuse detection.
- Logout revokes the refresh record; admin "force logout" bumps `users.tokenVersion`.
- Account provisioning by admin: temporary password + `mustChangePassword`; forced change on first login.

### Password reset without email (v1)

There is **no self-service forgot-password endpoint** in v1, because no email/SMS channel exists. Admin/accountant can trigger an audited "reset password" action that issues a new temporary password (shown once to the admin) and forces a change at next login. The flow is designed so email-based reset can be added later without changing token storage.

### Roles and permissions

| Capability | Admin | Teacher | Accountant | Student | Parent |
|---|---|---|---|---|---|
| Users, settings, audit logs | full | — | — | — | — |
| Students / guardians | CRUD | read assigned classes | read basic | read self | read children |
| Teachers, classes, subjects | CRUD | read assigned | — | read own class | read child's class |
| Attendance | all + override | mark/read own classes | — | read own | read children |
| Exams, marks, results | all + publish | enter/read assigned subjects | — | read published own | read published children |
| Fees, invoices, payments | full | — | full | read own | read children |
| Reports | all | class-level | finance | — | — |
| Announcements | create | create to own classes | read | read targeted | read targeted |
| Promotion | propose/approve/apply | — | — | — | — |

Permission keys (shared): `students:read|write`, `teachers:read|write`, `academics:read|write`, `attendance:mark|read|override`, `fees:read|write`, `exams:read|write|publish`, `results:read`, `reports:read|finance`, `users:manage`, `settings:manage`, `announcements:manage`, `promotions:manage`, `audit:read`.

### Enforcement

1. `authenticate` verifies the access token and loads role/capabilities.
2. `authorize(permission)` denies by default.
3. Ownership/scope checks in services: `assertSelf(studentId)`, `assertOwnChild(studentId)`, `assertTeacherOfClass(classId)`, `assertTeacherOfExamSubject(id)`.
4. A student's `studentId` is always derived from the token, never from a URL parameter; parents' child IDs are validated against their guardian link on every request.
5. Every 403/401 path gets a negative integration test, including IDOR attempts.

---

## 9. Security requirements

- **Transport/headers:** HTTPS + HSTS in production; `helmet`; CSP for the SPA; strict CORS allowlist per environment.
- **Rate limiting:** global limiter; stricter on `/auth/login` and `/auth/refresh` (keyed by IP + username); capped list/export endpoints.
- **Input:** Zod on body/query/params; reject unknown fields; strip Mongo operators; `hpp`; max page size; upload MIME/magic-byte and size checks (~5 MB).
- **AuthZ:** deny-by-default; permission + ownership tests; no trust in client-supplied roles or IDs.
- **CSRF:** refresh/logout protected by `SameSite=Strict` + Origin check; no cookie-authenticated writes beyond refresh.
- **XSS:** React escaping; no `dangerouslySetInnerHTML` on user content; sanitize any future rich text.
- **Files:** photos/documents only; randomized keys; dev local storage, production object storage with signed access; never served from the API's executable path.
- **Secrets:** `.env` only, `.env.example` committed, `.gitignore` covers `.env*`; no secrets in `VITE_*`; rotate JWT secrets on exposure.
- **Database:** least-privilege Mongo user, network allowlist, auth enabled, encrypted Atlas storage; daily backups plus a **tested restore**; export before promotion/rollover.
- **Audit:** append-only logs for logins, user/password changes, fee edits/payments, marks changes, result publishing, promotion apply.
- **Data minimization:** list endpoints project only needed fields; PII masked in logs; no bulk student export outside admin/supervision.
- **Dependencies:** committed lockfile, `npm audit` + Dependabot in CI, no unreviewed runtime packages.
- **Operations:** request timeouts, graceful shutdown, `/health`, error monitoring, generic 500 messages with `requestId`.

---

## 10. Configuration (planned env names)

Server: `NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_TTL`, `REFRESH_TOKEN_TTL`, `COOKIE_SECURE`, `COOKIE_DOMAIN`, `CORS_ORIGIN`, `RATE_LIMIT_*`, `LOG_LEVEL`, `UPLOAD_DRIVER`, `UPLOAD_DIR`, optional `S3_*`, `TZ=Asia/Karachi`.
Client: `VITE_API_BASE_URL` only.

School-specific values (name, logo, address, grading bands, pass marks, fee due day, ranking toggle) live in `settings` in the database, not env. No secrets or school data are committed.

---

## 11. Testing strategy

- **Unit:** services (grading math, invoice balances, attendance rules, promotion transitions), money/date utilities.
- **Integration:** Supertest against the real Express app and in-memory Mongo (replica set for transactions); every module gets happy path + validation + 401/403 + IDOR cases.
- **Client:** React Testing Library for forms, guards, and critical tables; MSW for API mocking if needed.
- **E2E (late):** Playwright — admin creates student → teacher marks attendance → exam marks → publish → parent views result.
- Seeded test data mirrors a plausible school: 12 classes, ~700 students, one academic year.

---

## 12. Deployment (final host pending)

**Recommended:** MongoDB Atlas (replica set, daily backups) + Render (API web service, static client), with secrets in platform dashboards. Alternatives kept viable: VPS + Docker/Nginx/PM2, or school-hosted. No application code depends on a specific host; configuration is env-driven and `/health` is provided for any platform. Final choice is **pending** budget and the security review (Phase 8).

---

## 13. Roadmap

| Phase | Scope | Exit criteria |
|---|---|---|
| **0. Foundations** — ✅ complete | Monorepo + strict TS, shared package, env config, pino, `/health`, lint/format/typecheck/test wiring, CI, base layouts + login shell | Install/dev/build/typecheck/test commands work on a clean clone; CI green |
| **1. Auth & RBAC** | Users, username/email login, access+refresh tokens, forced change, admin reset, permission middleware, user management UI, audit base | Role matrix and 401/403/IDOR tests pass; force logout works |
| **2. Academic core** | Settings, academic years/terms, classes, subjects, teacher assignments, teachers, students, guardians, enrollments, CSV import | 700 students imported; rosters and teaching scopes correct |
| **3. Attendance (daily)** | Sessions, bulk marking, amendments, teacher scoping, student/parent views, daily/monthly summaries | Duplicate marking blocked; bulk mark fast; overrides audited |
| **4. Exams & results** | Exams, exam subjects, marks entry, percentage/grade computation, optional ranking, publish/lock, report cards, portal reads | Recompute idempotent; published marks immutable; grades follow settings |
| **5. Fees (monthly)** | Structures, concessions, monthly invoice generation, manual receipts, balances/defaulters, transaction-safe posting | Ledger reconciles; duplicate invoices prevented; concurrent payment test passes |
| **6. Portals, announcements & promotion** | Student/parent dashboards, in-app announcements, profile, promotion batches (draft → approve → apply) | Scoping proven; promotion apply is transactional and reversible via archive |
| **7. Reports & analytics** | Attendance %, fee collection/defaulters, class performance, enrollment stats, PDF/Excel exports | Report totals reconcile with source queries; exports permission-gated |
| **8. Hardening & launch** | Security review, load test (~700 students, concurrent attendance), backup/restore drill, UAT, deployment, ops runbook + training | Launch checklist signed; restore verified; monitoring live |

Promotion is deliberately late: it depends on stable enrollments, fees, and results.

---

## 14. Out of scope for v1 (deferred)

Online payments/gateways · email/SMS/push · per-period attendance + timetable · Urdu/RTL · 2FA · GPA/transcripts beyond percentage report cards · library, transport, hostel, payroll, inventory · mobile app · public website/CMS · biometric/RFID attendance · automated promotion · self-service password reset.

---

## 15. Pending decisions

**Confirmed:** location (Khyber, KPK, Pakistan), PKR, `Asia/Karachi`, English now / Urdu later, TypeScript stack, monorepo, roles, daily attendance, percentage grading, monthly offline fees, manual promotion, Atlas + Render recommended.

**Still pending — do not encode assumptions:**

| Item | Status |
|---|---|
| Grade bands (A+ … F thresholds) and per-subject vs overall pass rules | Pending |
| Monthly fee due day, late-fine policy, concession types beyond sibling/staff | Pending |
| Academic year dates and term count | Pending |
| Report-card and receipt formats (header, signatures, Urdu name line) | Pending |
| Existing data to import (Excel/CSV/paper) and who validates it | Pending |
| Admin/accountant account holders and expected concurrent users | Pending |
| Final deployment host/budget (Atlas + Render recommended) | Pending |
| Browser/device targets (assume modern Chrome/Edge, tablets) | Pending |

Where a phase needs one of these, implement it as a configurable setting with a neutral default, and record the decision here once confirmed.

---

## 16. Approval

These two documents are approved in principle. **Final approval authorized Phase 0 (Foundations) only**, which is now complete. Phase 1 requires a new explicit approval. No authentication or business code may be added before then.
