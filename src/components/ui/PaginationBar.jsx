import Button from './Button';

export default function PaginationBar({ page, pages, onPageChange, disabled }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 px-2 py-3 sm:justify-start sm:gap-4 sm:px-4">
      <Button type="button" variant="secondary" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <span className="text-sm text-gray-500 dark:text-zinc-400">
        Page {page} / {pages}
      </span>
      <Button type="button" variant="secondary" disabled={disabled || page >= pages} onClick={() => onPageChange(page + 1)}>
        Next
      </Button>
    </div>
  );
}
