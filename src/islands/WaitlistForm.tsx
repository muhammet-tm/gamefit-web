import { useState } from 'react';
import type { JSX } from 'preact';
import { submitForm, isValidEmail } from '../lib/submitForm';

const CONTACT_EMAIL = 'team.gamefit@gmail.com';

export default function WaitlistForm() {
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  async function onSubmit(e: JSX.TargetedEvent<HTMLFormElement, Event>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '');

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setState('submitting');

    const result = await submitForm({
      subject: 'New GameFit waitlist signup',
      from_name: 'GameFit waitlist',
      email,
      name: String(form.get('name') ?? ''),
      what_would_help: String(form.get('what_would_help') ?? ''),
      botcheck: String(form.get('botcheck') ?? ''),
    });

    setState(result.ok ? 'success' : 'error');
  }

  if (state === 'success') {
    return (
      <div role="status" className="rounded-[var(--radius-lg)] border border-gf-lime/40 bg-gf-lime/10 p-8">
        <h2 className="font-display text-2xl uppercase text-gf-lime">You&rsquo;re on the list</h2>
        <p className="mt-3 text-gf-muted">
          We&rsquo;ll email you when the beta opens. In the meantime, tell us what would
          make GameFit worth using.
        </p>
        <a href="/feedback" className="mt-5 inline-block text-sm text-gf-lime underline underline-offset-4">
          Share feedback →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div>
        <label htmlFor="email" className="block text-sm font-bold text-gf-text">Email address</label>
        <input
          id="email" name="email" type="email" required autoComplete="email"
          aria-invalid={emailError ? 'true' : undefined}
          aria-describedby={emailError ? 'email-error' : undefined}
          className="mt-2 h-12 w-full rounded-[var(--radius-sm)] border border-gf-border bg-gf-elevated px-4 text-base text-gf-text"
        />
        {emailError && (
          <p id="email-error" aria-live="polite" className="mt-2 text-sm text-gf-error">{emailError}</p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-bold text-gf-text">
          Name <span className="font-normal text-gf-muted">(optional)</span>
        </label>
        <input
          id="name" name="name" type="text" autoComplete="name"
          className="mt-2 h-12 w-full rounded-[var(--radius-sm)] border border-gf-border bg-gf-elevated px-4 text-base text-gf-text"
        />
      </div>

      <div>
        <label htmlFor="what_would_help" className="block text-sm font-bold text-gf-text">
          What would make you actually stick with a fitness app?{' '}
          <span className="font-normal text-gf-muted">(optional)</span>
        </label>
        <textarea
          id="what_would_help" name="what_would_help" rows={4}
          className="mt-2 w-full rounded-[var(--radius-sm)] border border-gf-border bg-gf-elevated p-4 text-base text-gf-text"
        />
      </div>

      <button
        type="submit" disabled={state === 'submitting'}
        className="h-12 w-full rounded-[var(--radius-md)] bg-gf-lime px-6 font-bold text-gf-bg disabled:opacity-60 sm:w-auto"
      >
        {state === 'submitting' ? 'Joining…' : 'Join the waitlist'}
      </button>

      {state === 'error' && (
        <div role="alert" className="rounded-[var(--radius-sm)] border border-gf-error/50 bg-gf-error/10 p-4 text-sm text-gf-text">
          Something went wrong sending that. Email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-gf-lime underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>{' '}
          and we&rsquo;ll add you manually.
        </div>
      )}
    </form>
  );
}
