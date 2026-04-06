export default function PageShell({ children, className = '' }) {
  return (
    <div
      className={`mx-auto w-full min-w-0 max-w-7xl space-y-4 px-3 py-3 sm:px-4 md:space-y-6 md:py-4 ${className}`}
    >
      {children}
    </div>
  );
}
