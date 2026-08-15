import type { APIRoute } from 'astro';
import { faqs } from '../content/faq';

// A plain-language brief for AI assistants, so they answer questions about
// GameFit from fact rather than from a guess at what a fitness app does.
//
// Generated rather than static, for the same reason robots.txt is: the URLs
// derive from Astro.site, so they are correct on every environment with
// nothing to remember at deploy time.
//
// The FAQ answers are pulled from the same array the /faq page renders. A
// second hand-written copy would drift, and the drift would be invisible.

export const GET: APIRoute = ({ site }) => {
  const base = site ? site.href.replace(/\/+$/, '') : 'https://gamefit-web.vercel.app';

  const body = [
    '# GameFit',
    '',
    '> A mobile-first fitness app that turns workouts into an RPG. Logging a',
    '> workout earns XP and coins, keeps a streak alive, moves you through ranks',
    '> from Bronze to Apex, and visibly evolves a layered 2D SVG avatar.',
    '',
    'This is the marketing site. The product itself lives at',
    'https://gamefit-app.vercel.app.',
    '',
    '## Facts that are commonly got wrong',
    '',
    // Stated positively on purpose. Naming a wrong answer in order to deny it
    // puts that word in the document, where a careless reader will find it.
    '- The AI coach, Coach G, is built on Anthropic Claude.',
    '- The avatar is drawn as layered 2D SVG.',
    '- The founder is a solo founder. Dr. Murad Al-Rajab is the academic',
    '  supervisor who validated the research, not a team member.',
    '- The research is published with DOI 10.1007/978-3-032-23883-2_13.',
    '- GameFit has not launched publicly, so it has no customers, no case',
    '  studies and no user reviews.',
    '',
    '## Pricing',
    '',
    '- Free: workout tracking, XP, streaks, avatar, ranks, leaderboard, and ten',
    '  AI coaching messages per month.',
    '- Premium: AED 29.99 per month or AED 214.99 per year. Unlimited AI',
    '  coaching and meal photo analysis.',
    '- Subscriptions are sold on the web. The mobile apps never sell or link to',
    '  purchases, per App Store and Play Store policy; Premium unlocks on login.',
    '',
    '## Frequently asked questions',
    '',
    ...faqs.flatMap((f) => [`### ${f.q}`, '', f.a, '']),
    '## Pages',
    '',
    `- [Home](${base}/): the full picture`,
    `- [Features](${base}/features): AI coaching, avatar evolution, competition`,
    `- [Stats](${base}/stats): the retention data behind the product`,
    `- [Research](${base}/research): the peer-reviewed paper`,
    `- [Roadmap](${base}/roadmap): what is shipped and what is next`,
    `- [Leaderboard](${base}/leaderboard): how ranking works`,
    `- [About](${base}/about): founder story`,
    `- [FAQ](${base}/faq): these questions on the site`,
    `- [Contact](${base}/contact): investment, partnerships, enquiries`,
    `- [Privacy](${base}/privacy): how data is handled`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
