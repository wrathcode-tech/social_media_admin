import { getBackendBase } from '../services/httpClient';

/** No backend URL → static seed. REACT_APP_USE_STATIC_DATA=true forces static even when URL is set. */
export function isAdminStaticDataMode() {
  if (process.env.REACT_APP_USE_STATIC_DATA === 'true') return true;
  return !getBackendBase();
}
