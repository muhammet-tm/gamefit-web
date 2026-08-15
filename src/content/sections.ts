export interface SectionMeta {
  id: string;
  route: string | null;
  navLabel: string | null;
  title: string;
  metaTitle: string;
  metaDescription: string;
}

export const sections: SectionMeta[] = [
  {
    id: 'hero',
    route: null,
    navLabel: null,
    title: 'Fitness that sticks. Finally.',
    metaTitle: 'GameFit — Fitness, Gamified',
    metaDescription:
      '77% of fitness app users quit within three days. GameFit fixes that with AI coaching, avatar evolution and social competition, grounded in peer-reviewed research.',
  },
  {
    id: 'stats',
    route: '/stats',
    navLabel: 'Stats',
    title: 'The case for GameFit',
    metaTitle: 'The Numbers Behind GameFit',
    metaDescription:
      'The fitness app retention crisis in data: 77% abandonment within three days, a $33.6B market by 2033, and what our research found.',
  },
  {
    id: 'features',
    route: '/features',
    navLabel: 'Features',
    title: 'Not an app. An arena.',
    metaTitle: 'GameFit Features — AI Coaching and Deep Gamification',
    metaDescription:
      'Three systems fused into one adaptive loop: an AI coach powered by Anthropic Claude, 25 evolving avatar tiers, and weekly social competition.',
  },
  {
    id: 'leaderboard',
    route: '/leaderboard',
    navLabel: 'Leaderboard',
    title: 'Climb. Compete. Win.',
    metaTitle: 'GameFit Leaderboards — Weekly Competition',
    metaDescription:
      'Weekly leaderboards reset every Monday. Global rankings and friends-only mode, with four stats tracked from every workout logged.',
  },
  {
    id: 'research',
    route: '/research',
    navLabel: 'Research',
    title: 'Built on science, not hype.',
    metaTitle: 'GameFit Research — Peer-Reviewed in Springer LNNS',
    metaDescription:
      'GameFit was peer-reviewed and published in Springer Lecture Notes in Networks and Systems before it launched, grounded in Self-Determination Theory.',
  },
  {
    id: 'roadmap',
    route: '/roadmap',
    navLabel: 'Roadmap',
    title: 'From prototype to platform.',
    metaTitle: 'GameFit Roadmap — MVP Ready',
    metaDescription:
      'Phase one validated the concept. Phase two is complete: the MVP is built, deployed and working end to end. Phase three is scale.',
  },
  {
    id: 'about',
    route: '/about',
    navLabel: 'About',
    title: 'Built in Abu Dhabi. Scaling to the world.',
    metaTitle: 'About GameFit — Founder Story',
    metaDescription:
      'GameFit began with a real problem: managing a fitness club at 15 and watching members quit from boredom, not effort.',
  },
  {
    id: 'faq',
    route: '/faq',
    navLabel: 'FAQ',
    title: 'Questions, answered.',
    metaTitle: 'GameFit FAQ — Pricing, AI Coaching and Your Data',
    metaDescription:
      'What GameFit costs, which AI powers Coach G, why the leaderboard cannot be cheated, when the mobile apps arrive, and how to delete your data.',
  },
  {
    id: 'contact',
    route: '/contact',
    navLabel: 'Contact',
    title: "Let's build together.",
    metaTitle: 'Contact GameFit',
    metaDescription:
      'For investment, partnerships or general enquiries — get in touch with the GameFit team.',
  },
];

export const navSections = sections.filter((s) => s.navLabel !== null);
export const routedSections = sections.filter((s) => s.route !== null);
