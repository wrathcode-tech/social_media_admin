import { useEffect, useId, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getBackendBase } from '../services/httpClient';
import Button from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const liveBackend = !!getBackendBase();
  const showDevCredentials = process.env.NODE_ENV === 'development';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pwdId = useId();

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const ok = await login(email, password);
      if (!ok) setError(liveBackend ? 'Invalid email or password.' : 'Enter email and password to continue.');
      else navigate(from, { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 text-gray-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950 dark:text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-80 dark:opacity-40" />

      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl border border-gray-200/90 bg-white/90 p-2.5 text-gray-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:bg-zinc-800"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-gray-200/90 bg-white/95 p-6 shadow-xl shadow-gray-200/50 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-none sm:p-8">
            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md">
                GF
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">GTBS Flicksy</h1>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Admin Studio</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">Sign in with your super admin account.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <TextField
                label="Email"
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                inputMode="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div>
                <label htmlFor={pwdId} className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id={pwdId}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-3 pr-12 text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error ? (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-200"
                >
                  {error}
                </div>
              ) : null}

              <Button type="submit" variant="primary" disabled={busy} className="w-full py-3 shadow-md">
                {busy ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/60">
              <p className="text-center text-xs leading-relaxed text-gray-600 dark:text-zinc-400">
                {liveBackend ? (
                  showDevCredentials ? (
                    <>
                      Local API: after{' '}
                      <code className="rounded-md bg-gray-200/80 px-1.5 py-0.5 font-mono text-[11px] text-gray-800 dark:bg-zinc-800 dark:text-zinc-200">
                        seed
                      </code>
                      , use{' '}
                      <code className="rounded-md bg-gray-200/80 px-1.5 py-0.5 font-mono text-[11px] text-gray-800 dark:bg-zinc-800 dark:text-zinc-200">
                        admin@gtbs.in
                      </code>{' '}
                      /{' '}
                      <code className="rounded-md bg-gray-200/80 px-1.5 py-0.5 font-mono text-[11px] text-gray-800 dark:bg-zinc-800 dark:text-zinc-200">
                        Admin123!
                      </code>
                    </>
                  ) : (
                    <>Use the admin credentials provided by your organization.</>
                  )
                ) : (
                  <>Offline mode: any email and password will open the admin console (demo data).</>
                )}
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-gray-500 dark:text-zinc-600">Super admin access only · Secure session</p>
        </div>
      </div>
    </div>
  );
}
