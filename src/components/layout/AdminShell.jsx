import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { adminNavSections } from '../../config/adminNav';
import CommandPalette from '../ui/CommandPalette';
import Badge from '../ui/Badge';
import MediaThumb from '../ui/MediaThumb';
import { userAvatarUrl } from '../../lib/placeholders';

function NavGroup({ label, pathPrefix, children, onPick }) {
  const location = useLocation();
  const under = location.pathname === pathPrefix || location.pathname.startsWith(`${pathPrefix}/`);
  const [open, setOpen] = useState(under);
  const wasUnder = useRef(under);

  useEffect(() => {
    if (!under) {
      setOpen(false);
      wasUnder.current = false;
      return;
    }
    if (under && !wasUnder.current) setOpen(true);
    wasUnder.current = true;
  }, [under]);

  return (
    <div className="rounded-xl">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800/80 ${
          under
            ? 'text-gray-900 dark:text-zinc-100'
            : 'text-gray-600 dark:text-zinc-300'
        }`}
      >
        <span>{label}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform dark:text-zinc-500 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open ? (
        <div className="ml-1 mt-0.5 flex flex-col gap-0.5 border-l border-gray-200 py-0.5 pl-2.5 dark:border-zinc-700">
          {children.map((child) => (
            <NavLink
              key={child.to + child.label}
              to={child.to}
              end={child.end}
              onClick={onPick}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800/80'
                }`
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminShell() {
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const crumb =
    location.pathname === '/' ? 'Dashboard' : location.pathname.replace(/\//g, ' ').replace(/^\s+/, '').trim() || 'Dashboard';

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!userMenu) return;
    const close = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [userMenu]);

  const roleLabel = session?.role ? String(session.role).replace(/_/g, ' ') : 'Admin';

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-100 text-gray-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950 dark:text-zinc-100">
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <button
        type="button"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        className={`fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-200 ease-in-out lg:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200/80 bg-white/95 shadow-xl shadow-gray-200/40 backdrop-blur-md transition-transform duration-200 ease-in-out dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-none lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-gray-200/80 px-4 py-5 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md">
              GF
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-gray-900 dark:text-zinc-50">GTBS Flicksy</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-500">Admin Studio</div>
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
          {adminNavSections.map((section) => (
            <div key={section.title}>
              <div className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                {section.title}
              </div>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) =>
                  item.children?.length ? (
                    <NavGroup
                      key={item.label}
                      label={item.label}
                      pathPrefix={item.pathPrefix}
                      children={item.children}
                      onPick={() => setMobileOpen(false)}
                    />
                  ) : (
                    <NavLink
                      key={item.to + item.label}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800/80'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  )
                )}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-gray-200/80 p-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 text-left text-xs text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <svg className="h-3.5 w-3.5 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="flex-1 truncate">Search pages…</span>
            <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono text-[10px] dark:border-zinc-600 dark:bg-zinc-900">⌘K</kbd>
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-gray-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              className="inline-flex rounded-xl border border-gray-200 p-2 text-gray-700 transition-colors duration-200 ease-in-out hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
            >
              <span className="sr-only">Menu</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <nav className="hidden min-w-0 items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 sm:flex" aria-label="Breadcrumb">
              <span className="font-semibold text-gray-800 dark:text-zinc-200">Console</span>
              <span className="text-gray-300 dark:text-zinc-600">/</span>
              <span className="truncate capitalize text-gray-600 dark:text-zinc-300">{crumb}</span>
            </nav>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:inline-flex"
            >
              <svg className="h-4 w-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-gray-400">Search</span>
              <kbd className="ml-1 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] text-gray-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl border border-gray-200 p-2.5 text-gray-600 transition-all hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenu((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                aria-expanded={userMenu}
                aria-haspopup="true"
              >
                <MediaThumb
                  src={userAvatarUrl({
                    username: session?.name,
                    email: session?.email,
                    _id: session?.email,
                  })}
                  className="h-9 w-9 shrink-0 rounded-lg border border-gray-200 dark:border-zinc-600"
                />
                <span className="hidden max-w-[120px] truncate text-left text-sm font-medium text-gray-800 dark:text-zinc-200 md:block">
                  {session?.name || session?.email}
                </span>
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {userMenu ? (
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                  role="menu"
                >
                  <div className="border-b border-gray-100 px-3 pb-2 dark:border-zinc-800">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-zinc-100">{session?.email}</p>
                    <div className="mt-1">
                      <Badge tone="purple" className="text-[10px]">
                        {roleLabel}
                      </Badge>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    className="mt-1 flex w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    onClick={() => {
                      setUserMenu(false);
                      logout();
                      navigate('/login');
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
