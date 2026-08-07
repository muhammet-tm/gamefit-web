export interface Phase {
  label: string;
  status: 'Done' | 'MVP ready' | 'Next';
  title: string;
  items: string[];
}

export const phases: Phase[] = [
  {
    label: 'Phase 1 — Foundation',
    status: 'Done',
    title: 'Concept validated',
    items: [
      'Working prototype launched',
      'User survey validated the demand',
      'Springer paper peer-reviewed and published',
      'WebSummit Qatar 2026, ALPHA stage',
      'Dubai Create Apps Championship',
      'Full test suite passing',
    ],
  },
  {
    label: 'Phase 2 — MVP',
    status: 'MVP ready',
    title: 'Built, deployed, working',
    items: [
      'MVP live with a server-authoritative economy',
      'AI coaching in production',
      'Subscription payments integrated',
      'Store submission materials prepared',
      'Pre-seed raise open',
      'Hub71 and ADU Innovate applications submitted',
    ],
  },
  {
    label: 'Phase 3 — Scale',
    status: 'Next',
    title: 'Growth',
    items: [
      'Wearable integrations',
      'Corporate wellness B2B',
      'Rewards marketplace live',
      'Seed round ready',
    ],
  },
];
