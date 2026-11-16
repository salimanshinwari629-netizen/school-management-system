import { Link } from 'react-router-dom';

import { APP_NAME } from '@sms/shared';

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Link to="/app/dashboard" className="text-sm font-bold text-brand-700 lg:hidden">
          {APP_NAME}
        </Link>
        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-slate-900">School Management System</p>
          <p className="text-xs text-slate-500">Khyber District, Khyber Pakhtunkhwa</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          Phase 0
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-slate-500 sm:inline">Asia/Karachi · PKR</span>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600"
          title="Authentication arrives in Phase 1"
        >
          —
        </div>
      </div>
    </header>
  );
}
