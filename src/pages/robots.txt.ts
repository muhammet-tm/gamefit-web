import type { APIRoute } from 'astro';

// Generated, not static. The previous public/robots.txt carried a
// REPLACE_WITH_SITE_URL placeholder that a human was supposed to substitute
// at deploy time, and it shipped to production unsubstituted — which is what
// a manual step in a deploy checklist eventually always does.
//
// Deriving the host from Astro.site means it is correct on every environment
// with nothing to remember.

export const GET: APIRoute = ({ site }) => {
  const sitemap = site ? new URL('sitemap-index.xml', site).href : '';

  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    ...(sitemap ? [`Sitemap: ${sitemap}`] : []),
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
