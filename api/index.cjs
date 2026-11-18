'use strict';

let handlerModule;
let loadError = null;

try {
  handlerModule = require('./_server.cjs');
} catch (err) {
  loadError = err;
  console.error('Failed to load bundled server handler:', err);
}

const app =
  handlerModule &&
  (handlerModule.default || handlerModule.app || handlerModule);

module.exports = function handler(req, res) {
  if (loadError || typeof app !== 'function') {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error:
            (loadError && loadError.message) ||
            'Server handler CBT gagal dimuat.',
        })
      );
    }
    return;
  }

  try {
    return app(req, res);
  } catch (err) {
    console.error('Vercel handler runtime error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error:
            (err && err.message) ||
            'Terjadi kesalahan saat memproses permintaan CBT.',
        })
      );
    }
  }
};
