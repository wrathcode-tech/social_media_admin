/**
 * Imperative toasts (no hook). Wired when {@link ToastProvider} mounts.
 * Same UI as useToast() — bottom-right stack.
 */

let pushToast = null;

/** Called from ToastProvider — do not use in app code. */
export function bindToastPush(fn) {
  pushToast = fn;
}

export const snackbar = {
  success(message) {
    const m = message == null ? '' : String(message);
    if (pushToast) pushToast(m, 'success');
    else if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[snackbar] ToastProvider not mounted:', m);
    }
  },
  error(message) {
    const m = message == null ? '' : String(message);
    if (pushToast) pushToast(m, 'error');
    else if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[snackbar] ToastProvider not mounted:', m);
    }
  },
  /** Neutral / info style (same as useToast default). */
  info(message) {
    const m = message == null ? '' : String(message);
    if (pushToast) pushToast(m, 'default');
    else if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[snackbar] ToastProvider not mounted:', m);
    }
  },
};

export const alertSuccessMessage = (message) => {
  snackbar.success(message);
};

export const alertErrorMessage = (message) => {
  snackbar.error(message);
};
