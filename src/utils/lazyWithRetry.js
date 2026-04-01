import { lazy } from 'react';

/**
 * Lazy import; on failure, reload once (helps after new deploy when old chunks 404).
 */
export function lazyWithRetry(importer) {
  return lazy(async () => {
    const refreshed = JSON.parse(window.sessionStorage.getItem('lazy-chunk-refreshed') || 'false');
    try {
      const mod = await importer();
      window.sessionStorage.setItem('lazy-chunk-refreshed', 'false');
      return mod;
    } catch (e) {
      if (!refreshed) {
        window.sessionStorage.setItem('lazy-chunk-refreshed', 'true');
        window.location.reload();
      }
      throw e;
    }
  });
}
