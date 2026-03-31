const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500',
  secondary:
    'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
  danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500',
  ghost: 'text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
};

export default function Button({ as: Comp = 'button', variant = 'secondary', className = '', type = 'button', disabled, children, ...rest }) {
  const isBtn = Comp === 'button';
  return (
    <Comp
      type={isBtn ? type : undefined}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold no-underline transition-all duration-200 ease-in-out disabled:pointer-events-none disabled:opacity-50 ${variants[variant] || variants.secondary} ${className}`}
      {...rest}
    >
      {children}
    </Comp>
  );
}
