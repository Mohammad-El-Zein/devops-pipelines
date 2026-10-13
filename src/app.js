'use strict';

const http = require('node:http');
const { version } = require('../package.json');

const startedAt = Date.now();

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

const routes = {
  '/': () => ({ message: 'Hello DevOps', description: 'Learning CI/CD using GitHub Actions' }),
  '/health': () => ({ status: 'ok', uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000) }),
  '/version': () => ({ version }),
};

function createApp() {
  return http.createServer((req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    const handler = routes[pathname];

    if (req.method !== 'GET') {
      return sendJson(res, 405, { error: 'Method Not Allowed' });
    }
    if (!handler) {
      return sendJson(res, 404, { error: 'Not Found' });
    }
    return sendJson(res, 200, handler());
  });
}

module.exports = { createApp };
