import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBackendBase } from '../services/httpClient';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const liveBackend = !!getBackendBase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const ok = await login(email, password);
      if (!ok) setError(liveBackend ? 'Invalid email or password.' : 'Email and password required.');
      else navigate(from, { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4 transition-colors duration-200 ease-in-out dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 text-sm font-bold text-white shadow-md">
            GF
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-50">GTBS Flicksy</h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Admin Studio</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm transition-all duration-200 ease-in-out focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="admin@gtbs.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="login-password" className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm transition-all duration-200 ease-in-out focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 ease-in-out hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-500 dark:text-zinc-500">
          {liveBackend ? (
            <>
              Seed: <code className="rounded-lg bg-gray-100 px-1.5 py-0.5 dark:bg-zinc-800">admin@gtbs.in</code> /{' '}
              <code className="rounded-lg bg-gray-100 px-1.5 py-0.5 dark:bg-zinc-800">Admin123!</code>
            </>
          ) : (
            <>You can sign in with any email and password.</>
          )}
        </p>
      </div>
    </div>
  );
}
