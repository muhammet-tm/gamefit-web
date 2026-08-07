// Plain data module (not a *.spec.ts file) so it can be imported by multiple
// Playwright spec files. Playwright forbids one spec file importing another
// spec file's module when both are collected in the same run ("test file
// should not import test file"), so the shared route list lives here instead
// of inside routes.spec.ts.
export const ROUTES = [
  '/', '/stats', '/features', '/leaderboard', '/research',
  '/roadmap', '/about', '/contact', '/beta', '/feedback', '/privacy',
];
