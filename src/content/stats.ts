export interface Stat {
  value: string;
  label: string;
  source: string;
  accent: 'gold' | 'ember' | 'slate' | 'plain';
}

export const heroStats: Stat[] = [
  { value: '78%', label: 'Want gamified fitness', source: 'GameFit user survey, peer-reviewed', accent: 'gold' },
  { value: '71%', label: 'Prefer AI-personalised coaching', source: 'GameFit user survey, peer-reviewed', accent: 'ember' },
  { value: '3%', label: 'Fitness app users still active on day 30', source: 'Business of Apps benchmarks, 2023 data', accent: 'slate' },
];

export const marketStats: Stat[] = [
  { value: '3%', label: 'Fitness app users still active on day 30', source: 'Business of Apps benchmarks, 2023 data', accent: 'gold' },
  { value: '$33.6B', label: 'Global fitness app market by 2033', source: 'Grand View Research: $12.1B in 2025, 13.4% a year', accent: 'ember' },
  { value: '$201M', label: 'UAE and Saudi fitness app markets, 2025', source: 'Grand View Research; our launch markets', accent: 'slate' },
  { value: '66%', label: 'UAE adults not active enough', source: 'WHO Global Health Observatory, 2022', accent: 'plain' },
];

export const surveyStats: Stat[] = [
  { value: '78%', label: 'Want more engaging exercise', source: 'GameFit user survey, peer-reviewed', accent: 'gold' },
  { value: '71%', label: 'Prefer AI personalisation', source: 'GameFit user survey, peer-reviewed', accent: 'ember' },
  { value: '64%', label: 'Value real-world rewards', source: 'GameFit user survey, peer-reviewed', accent: 'slate' },
];
