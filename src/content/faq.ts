/**
 * Frequently asked questions.
 *
 * Answers state only what is true of the product today. GameFit has not
 * launched publicly, so there are no customers, no case studies and no
 * reviews — and inventing any of those would be a lie a visitor could act on.
 * "Not yet launched" is a perfectly good answer to give honestly.
 *
 * These also feed FAQPage structured data, which is what can surface them
 * directly in a search result. Google's guidance is that the markup must match
 * what a visitor actually sees on the page, so this array is the single source
 * for both the rendered section and the JSON-LD.
 */
export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: 'Is GameFit free?',
    a: 'Yes. Workout tracking, XP, streaks, your avatar, ranks and the leaderboard are all free, with ten AI coaching messages a month. Premium removes the coaching limit and adds meal photo analysis, at AED 29.99 a month or AED 214.99 a year.',
  },
  {
    q: 'What makes it different from every other fitness tracker?',
    a: 'Most trackers record what you did. GameFit turns the record into progression: every workout earns XP and coins, keeps a streak alive, and moves you through ranks from Bronze to Apex while your avatar visibly evolves across five classes and five tiers. The design is grounded in peer-reviewed research on gamification and adherence rather than assembled from guesswork.',
  },
  {
    q: 'Which AI does the coach use?',
    a: 'Coach G is built on Anthropic Claude. It never runs in your browser and never sees an API key on your device — every request goes through our server, which adds your profile context and enforces safety rules, including more conservative guidance for anyone under 18.',
  },
  {
    q: 'Can someone cheat their way up the leaderboard?',
    a: 'Not by editing anything on their device. XP, coins, streaks, badges and purchases are all calculated by the database itself rather than by the app, so the numbers a phone sends are never trusted. Self-reported personal records deliberately earn badges but no XP, for exactly this reason.',
  },
  {
    q: 'Is it on the App Store and Google Play?',
    a: 'Not yet. GameFit runs today as a web app that installs to your home screen and works offline, and the iOS and Android builds are prepared and awaiting store review. Subscriptions are handled on the website, so Premium unlocks automatically in the apps when you sign in.',
  },
  {
    q: 'What happens to my data if I leave?',
    a: 'You can delete your account from inside the app or from the delete-account page on the web. Deletion cancels any active subscription and removes your profile, workouts, photos and history. It is immediate and it is not recoverable.',
  },
];
