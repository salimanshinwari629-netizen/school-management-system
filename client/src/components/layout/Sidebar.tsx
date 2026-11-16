import { NavLink } from 'react-router-dom';

import { APP_NAME } from '@sms/shared';

const navigation = [
  { label: 'Dashboard', to: '/app/dashboard', available: true },
  { label: 'Students', to: '/app/students', available: false },
  { label: 'Teachers', to: '/app/teachers', available: false },
  { label: 'Classes & Subjects', to: '/app/academics', available: false },
  { label: 'Attendance', to: '/app/attendance', available: false },
  { label: 'Fees', to: '/app/fees', available: false },
  { label: 'Exams & Results', to: '/app/exams', available: false },
  { label: 'Reports', to: '/app/reports', available: false },
  { label: 'Promotion', to: '/app/promotions', available: false },
  { label: 'Settings', to: '/app/settings', available: false },
] as const;

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <div>
          <p className="text-base font-bold tracking-tight text-brand-700">{APP_NAME}</p>
          <p className="text-xs text-slate-500">School Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        {navigation.map((item) =>
          item.available ? (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ) : (
            <span
              key={item.label}
              aria-disabled="true"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-400"
            >
              {item.label}
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Soon
              </span>
            </span>
          ),
        )}
      </nav>

      <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500">
        Foundation build
        <br />
        Phase 0 of 8
      </div>
    </aside>
  );
}
