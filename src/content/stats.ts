export interface Stat {
  value: string;
  label: string;
  source: string;
  accent: 'lime' | 'amber' | 'violet' | 'plain';
}

export const heroStats: Stat[] = [
  { value: '78%', label: 'Want gamified fitness', source: 'GameFit user survey, peer-reviewed', accent: 'lime' },
  { value: '71%', label: 'Prefer AI-personalised coaching', source: 'GameFit user survey, peer-reviewed', accent: 'amber' },
  { value: '77%', label: 'Quit fitness apps within 3 days', source: 'Andrew Chen, 2023', accent: 'violet' },
];

export const marketStats: Stat[] = [
  { value: '77%', label: 'Fitness apps abandoned within three days', source: 'Andrew Chen, 2023', accent: 'lime' },
  { value: '$33.6B', label: 'Global fitness app market by 2033', source: '13.4% CAGR from $12.5B in 2023', accent: 'amber' },
  { value: '$25.3B', label: 'AI coaching segment by 2033', source: '27.6% CAGR', accent: 'violet' },
  { value: '160+', label: 'Prototype interactions during testing', source: 'Validated November 2025', accent: 'plain' },
];

export const surveyStats: Stat[] = [
  { value: '78%', label: 'Want more engaging exercise', source: 'GameFit user survey, peer-reviewed', accent: 'lime' },
  { value: '71%', label: 'Prefer AI personalisation', source: 'GameFit user survey, peer-reviewed', accent: 'amber' },
  { value: '64%', label: 'Value real-world rewards', source: 'GameFit user survey, peer-reviewed', accent: 'violet' },
];
