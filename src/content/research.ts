export const paper = {
  title:
    'GameFit: An AI-Powered Gamification for Enhancing User Retention in Mobile Fitness Applications',
  authors: [
    'Muhammet Yalkapov',
    'Dr. Murad Al-Rajab',
    'Dr. Samia Loucif',
    'Dr. Suhail Odeh',
    'Ayyub Ishnazarov',
  ],
  venue: 'Springer Lecture Notes in Networks and Systems',
  indexed: 'Scopus indexed · ACR’26',
  conference: 'ACR’26 — International Conference on Advances in Computing Research, Amsterdam',
  presentation: 'Presented remotely by the founder',
  doi: '10.1007/978-3-032-23883-2_13',
  doiUrl: 'https://doi.org/10.1007/978-3-032-23883-2_13',
  abstract:
    'This research applies AI and gamification grounded in Self-Determination Theory — autonomy, competence and relatedness — to increase intrinsic motivation and address retention failure in mobile fitness applications.',
} as const;

export interface Pillar { name: string; body: string; }

export const sdtPillars: Pillar[] = [
  { name: 'Autonomy', body: 'AI personalisation gives users choice and control over their fitness journey. Your plan, your pace.' },
  { name: 'Competence', body: 'XP, levels, badges and visible progression build mastery and a genuine sense of achievement.' },
  { name: 'Relatedness', body: 'Leaderboards and social competition create community connection and belonging.' },
];
