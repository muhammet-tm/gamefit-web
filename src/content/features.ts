export interface Feature {
  title: string;
  body: string;
  tags: string[];
  accent: 'lime' | 'violet' | 'amber';
}

export const features: Feature[] = [
  {
    title: 'Deep gamification',
    body: 'XP and levels, 25 evolving avatar tiers rendered live, rank badges from Bronze to Apex, and a rewards marketplace. Strength, endurance, agility and recovery are tracked from every workout logged.',
    tags: ['XP & levels', 'Avatar evolution', 'Rewards marketplace', 'STR/END/AGI/REC'],
    accent: 'lime',
  },
  {
    title: 'AI Coach G',
    body: 'Coaching powered by Anthropic Claude Haiku 4.5 that adapts in real time. Personalised workout plans, nutrition guidance and 24/7 feedback that gets sharper with every session. The model never sees your data from the browser — every call runs server-side.',
    tags: ['Anthropic Claude', 'Nutrition plans', 'Adaptive loop', '24/7 available'],
    accent: 'violet',
  },
  {
    title: 'Social leaderboards',
    body: 'Weekly global and friends leaderboards reset every Monday at midnight UTC. Compete, climb, earn coins and redeem real fitness rewards in the marketplace.',
    tags: ['Weekly reset', 'Global + friends', 'Challenges', 'Marketplace'],
    accent: 'amber',
  },
];
