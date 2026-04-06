import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

function isDarkMode() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

/**
 * SweetAlert2 confirm for delete / ban / restrict and similar actions.
 * Theme follows `document.documentElement` dark class (ThemeContext).
 *
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} [opts.text]
 * @param {string} [opts.confirmButtonText]
 * @param {string} [opts.cancelButtonText]
 * @param {string} [opts.confirmButtonColor] — default destructive red
 * @param {'warning'|'question'|'info'|'error'} [opts.icon]
 * @returns {Promise<boolean>} true if user confirmed
 */
export async function confirmDestructive({
  title,
  text = 'This action cannot be undone.',
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonColor = '#dc2626',
  icon = 'warning',
} = {}) {
  if (!title) return false;
  const isDark = isDarkMode();
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
    background: isDark ? '#18181b' : '#ffffff',
    color: isDark ? '#fafafa' : '#111827',
    confirmButtonColor,
    cancelButtonColor: isDark ? '#3f3f46' : '#6b7280',
  });
  return Boolean(result.isConfirmed);
}
