export default function PageShell({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-7xl space-y-4 px-4 py-3 md:space-y-6 md:py-4 ${className}`}>{children}</div>;
}
