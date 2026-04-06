import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { adminNavSections } from '../../config/adminNav';
import CommandPalette from '../ui/CommandPalette';
import BrandLogo from '../ui/BrandLogo';

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
        className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800/80 ${under
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
                `rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${isActive
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

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

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-100 text-gray-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950 dark:text-zinc-100">
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <button
        type="button"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        className={`fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-200 ease-in-out lg:hidden ${mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] max-h-[100dvh] w-[min(17rem,calc(100vw-2.5rem))] flex-col border-r border-gray-200/80 bg-white/95 pt-[env(safe-area-inset-top,0px)] shadow-xl shadow-gray-200/40 backdrop-blur-md transition-transform duration-200 ease-in-out dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-none sm:w-64 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="border-b border-gray-200/80 px-3 py-4 dark:border-zinc-800 sm:px-4 sm:py-5">
          <div className="flex flex-col gap-2">
            <BrandLogo className="h-9 w-full max-w-[11rem]" />
          </div>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-2.5 sm:p-3">
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
                        `rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out ${isActive
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
        <div className="border-t border-gray-200/80 p-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] dark:border-zinc-800 sm:p-3">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
              setMobileOpen(false);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200/80 bg-red-50/80 px-3 py-2.5 text-sm font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-[100dvh] min-w-0 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-gray-200/80 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80 sm:gap-3 sm:px-4 sm:py-3 md:px-6 pt-[max(0.625rem,env(safe-area-inset-top,0px))]">
          <button
            type="button"
            className="mr-auto inline-flex rounded-xl border border-gray-200 p-2 text-gray-700 transition-colors duration-200 ease-in-out hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
          >
            <span className="sr-only">Menu</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
            <p
              className="min-w-0 max-w-[min(100%,12rem)] truncate text-xs text-gray-600 dark:text-zinc-300 sm:max-w-[min(100%,20rem)] sm:text-sm"
              title={session?.email}
            >
              {session?.email}
            </p>
            <button
              type="button"
              onClick={toggleTheme}
              className="shrink-0 rounded-xl border border-gray-200 p-2.5 text-gray-600 transition-all hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-auto overflow-y-auto pb-[env(safe-area-inset-bottom,0px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
