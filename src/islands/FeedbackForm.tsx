import { useState } from 'react';
import type { JSX } from 'preact';
import { submitForm, isValidEmail } from '../lib/submitForm';

const CONTACT_EMAIL = 'team.gamefit@gmail.com';
const RATINGS = [1, 2, 3, 4, 5];

export default function FeedbackForm() {
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: JSX.TargetedEvent<HTMLFormElement, Event>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const works = String(form.get('what_works') ?? '').trim();
    const missing = String(form.get('what_missing') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();

    if (!works && !missing) {
      setError('Tell us at least one thing — what works, or what is missing.');
      return;
    }
    if (email && !isValidEmail(email)) {
      setError('That email address does not look right.');
      return;
    }
    setError('');
    setState('submitting');

    const result = await submitForm({
      subject: 'New GameFit feedback',
      from_name: 'GameFit feedback',
      rating: String(form.get('rating') ?? 'not given'),
      what_works: works,
      what_missing: missing,
      email: email || 'not given',
      botcheck: String(form.get('botcheck') ?? ''),
    });

    setState(result.ok ? 'success' : 'error');
  }

  if (state === 'success') {
    return (
      <div role="status" className="rounded-[var(--radius-lg)] border border-gf-gold/40 bg-gf-gold/10 p-8">
        <h2 className="font-display text-2xl uppercase text-gf-gold">Thank you</h2>
        <p className="mt-3 text-gf-muted">
          Genuinely useful. Every piece of this gets read.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <fieldset>
        <legend className="text-sm font-bold text-gf-text">Overall, how does GameFit feel?</legend>
        <div className="mt-3 flex gap-2">
          {RATINGS.map((n) => (
            <label key={n} className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-gf-border bg-gf-elevated text-gf-text has-[:checked]:border-gf-gold has-[:checked]:text-gf-gold">
              <input type="radio" name="rating" value={n} className="sr-only" />
              {n}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="what_works" className="block text-sm font-bold text-gf-text">What works?</label>
        <textarea id="what_works" name="what_works" rows={4}
          className="mt-2 w-full rounded-[var(--radius-sm)] border border-gf-border bg-gf-elevated p-4 text-base text-gf-text" />
      </div>

      <div>
        <label htmlFor="what_missing" className="block text-sm font-bold text-gf-text">What&rsquo;s missing?</label>
        <textarea id="what_missing" name="what_missing" rows={4}
          className="mt-2 w-full rounded-[var(--radius-sm)] border border-gf-border bg-gf-elevated p-4 text-base text-gf-text" />
      </div>

      <div>
        <label htmlFor="fb-email" className="block text-sm font-bold text-gf-text">
          Email <span className="font-normal text-gf-muted">(optional, if you want a reply)</span>
        </label>
        <input id="fb-email" name="email" type="email" autoComplete="email"
          className="mt-2 h-12 w-full rounded-[var(--radius-sm)] border border-gf-border bg-gf-elevated px-4 text-base text-gf-text" />
      </div>

      {error && <p aria-live="polite" className="text-sm text-gf-error">{error}</p>}

      <button type="submit" disabled={state === 'submitting'}
        className="h-12 w-full rounded-[var(--radius-md)] bg-gf-gold px-6 font-bold text-gf-bg disabled:opacity-60 sm:w-auto">
        {state === 'submitting' ? 'Sending…' : 'Send feedback'}
      </button>

      {state === 'error' && (
        <div role="alert" className="rounded-[var(--radius-sm)] border border-gf-error/50 bg-gf-error/10 p-4 text-sm text-gf-text">
          That didn&rsquo;t send. Email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-gf-gold underline underline-offset-4">{CONTACT_EMAIL}</a>{' '}
          instead.
        </div>
      )}
    </form>
  );
}
