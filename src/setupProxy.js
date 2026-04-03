const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Dev-only: browser calls /api-reports/* → real reports service /reports/*.
 * Avoids CORS and avoids using localhost:PORT/reports when PORT is the CRA dev server (same-origin → SPA HTML).
 *
 * Target: reports API root host (no /reports). Default 7001 — if CRA also uses PORT=7001, set
 * REACT_APP_REPORTS_PROXY_TARGET=http://127.0.0.1:<reports-api-port> in .env
 */
module.exports = function setupProxy(app) {
  const target = (process.env.REACT_APP_REPORTS_PROXY_TARGET || 'http://127.0.0.1:7001').replace(/\/$/, '');
  app.use(
    '/api-reports',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { '^/api-reports': '/reports' },
    })
  );
};
