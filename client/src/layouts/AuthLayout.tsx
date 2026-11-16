import { Outlet } from 'react-router-dom';

import { APP_DESCRIPTION, APP_NAME } from '@sms/shared';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8">
        <section className="mb-8 max-w-md lg:mb-0">
          <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            {APP_NAME}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {APP_DESCRIPTION}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            A single-school platform for students, teachers, accountants, parents, and
            administrators.
          </p>
        </section>

        <section className="w-full max-w-md lg:flex-1">
          <Outlet />
        </section>
      </div>
      <footer className="px-4 py-4 text-center text-xs text-slate-500">
        Phase 0 foundation · English · PKR · Asia/Karachi
      </footer>
    </div>
  );
}
