import { Link } from 'react-router-dom';

export function LoginPage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
      <p className="mt-1 text-sm text-slate-600">
        Authentication is implemented in Phase 1. This form is a non-functional layout shell.
      </p>

      <form className="mt-6 space-y-4" aria-describedby="login-status">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-700">
            Username or email
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            disabled
            className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            disabled
            className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500"
          />
        </div>

        <button
          type="submit"
          disabled
          className="w-full rounded-lg bg-slate-300 px-4 py-2 text-sm font-semibold text-white"
        >
          Sign in
        </button>
      </form>

      <p id="login-status" className="mt-4 text-xs text-slate-500">
        Not yet available — see the{' '}
        <Link to="/app/dashboard" className="font-medium text-brand-700 hover:underline">
          foundation dashboard
        </Link>
        .
      </p>
    </div>
  );
}
