// Generates the Content-Security-Policy in vercel.json from the built output.
//
// Astro inlines several scripts it controls: the island hydration bootstrap
// for client:load and client:visible, and any component <script>. It also
// leaves our JSON-LD block inline. A policy of `script-src 'self'` blocks
// every one of them and takes the whole site down, which is easy to write and
// impossible to notice until it is live.
//
// Rather than weaken the policy with 'unsafe-inline', this hashes each inline
// script and allows exactly those. Hashes change whenever the scripts change,
// so this runs as part of `npm run build` and is never maintained by hand.
//
// Run after `astro build`. Rewrites the CSP header in vercel.json in place.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const VERCEL_JSON = 'vercel.json';

function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (entry.endsWith('.html')) out.push(p);
  }
  return out;
}

function inlineScriptHashes(files) {
  const hashes = new Set();
  const re = /<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/g;
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    let m;
    while ((m = re.exec(html)) !== null) {
      const body = m[2];
      if (body.trim() === '') continue;
      // The hash covers the element's exact text content, byte for byte.
      const digest = createHash('sha256').update(body, 'utf8').digest('base64');
      hashes.add(`'sha256-${digest}'`);
    }
  }
  return [...hashes].sort();
}

const files = htmlFiles(DIST);
const hashes = inlineScriptHashes(files);

if (hashes.length === 0) {
  console.error('generate-csp: found no inline scripts. Refusing to write a policy that has not been verified against real output.');
  process.exit(1);
}

const csp = [
  "default-src 'self'",
  `script-src 'self' ${hashes.join(' ')}`,
  // Astro emits scoped component styles inline. This grants no script
  // execution and is the one accepted concession in this policy.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://api.web3forms.com",
  "form-action 'self' https://api.web3forms.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const config = JSON.parse(readFileSync(VERCEL_JSON, 'utf8'));
let replaced = false;
for (const rule of config.headers) {
  for (const header of rule.headers) {
    if (header.key === 'Content-Security-Policy') {
      header.value = csp;
      replaced = true;
    }
  }
}

if (!replaced) {
  console.error('generate-csp: no Content-Security-Policy header found in vercel.json.');
  process.exit(1);
}

writeFileSync(VERCEL_JSON, JSON.stringify(config, null, 2) + '\n');
console.log(`generate-csp: allowed ${hashes.length} inline script hash(es) across ${files.length} page(s).`);
