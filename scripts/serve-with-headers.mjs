// Static server that applies the real vercel.json headers to dist/.
//
// vercel.json only takes effect on Vercel, so a CSP written but never
// exercised can break production in ways nothing local catches. This exists
// so tests/csp.spec.ts can load the site under the actual policy.
//
// Usage: node scripts/serve-with-headers.mjs [port]

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist';
const port = Number(process.argv[2] ?? 4322);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const config = JSON.parse(readFileSync('vercel.json', 'utf8'));

function headersFor(pathname) {
  const out = {};
  for (const rule of config.headers ?? []) {
    // vercel.json sources are path patterns; the ones used here are
    // "/(.*)" and a prefix match, so a RegExp anchored at both ends is
    // faithful enough for a test server.
    const pattern = new RegExp(`^${rule.source}$`);
    if (pattern.test(pathname)) {
      for (const h of rule.headers) out[h.key] = h.value;
    }
  }
  return out;
}

function resolveFile(pathname) {
  const decoded = decodeURIComponent(pathname.split('?')[0]);
  const candidates = [
    join(DIST, decoded),
    join(DIST, decoded, 'index.html'),
    join(DIST, `${decoded}.html`),
  ];
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

const server = createServer((req, res) => {
  const pathname = (req.url ?? '/').split('?')[0];
  const file = resolveFile(pathname);
  const headers = headersFor(pathname);

  if (!file) {
    const notFound = join(DIST, '404.html');
    const body = existsSync(notFound) ? readFileSync(notFound) : 'Not found';
    res.writeHead(404, { ...headers, 'Content-Type': 'text/html; charset=utf-8' });
    res.end(body);
    return;
  }

  res.writeHead(200, {
    ...headers,
    'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
  });
  res.end(readFileSync(file));
});

server.listen(port, () => {
  console.log(`serve-with-headers: http://localhost:${port} (vercel.json headers applied)`);
});
