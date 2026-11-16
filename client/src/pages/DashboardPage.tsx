import { API_VERSION, SCHOOL_CURRENCY, SCHOOL_TIMEZONE } from '@sms/shared';

const modules = [
  'Admin Dashboard',
  'Student Management',
  'Teacher Management',
  'Classes & Subjects',
  'Attendance',
  'Fees',
  'Examinations & Results',
  'Reports & Analytics',
  'Parent Portal',
  'Student Portal',
] as const;

const foundationChecks = [
  'npm workspaces monorepo',
  'React + Vite + Tailwind + TypeScript',
  'Express + TypeScript API',
  'Shared contracts package',
  'MongoDB/Mongoose configuration',
  'Lint, format, typecheck, tests',
  'CI workflow',
] as const;

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          Phase 0 foundation
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          The application shell is in place. Business modules begin in Phase 1.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'API version', value: API_VERSION },
          { label: 'Currency', value: SCHOOL_CURRENCY },
          { label: 'Timezone', value: SCHOOL_TIMEZONE },
          { label: 'Modules implemented', value: '0 of 10' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {item.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Foundation checklist</h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          {foundationChecks.map((check) => (
            <li key={check} className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-0.5 text-emerald-600">
                ✓
              </span>
              {check}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Planned modules</h2>
        <p className="mt-1 text-xs text-slate-500">
          Listed for planning only — none of these are implemented yet.
        </p>
        <ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <li key={module} className="flex items-center justify-between gap-2">
              <span>{module}</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Planned
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
