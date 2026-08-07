const ENDPOINT = 'https://api.web3forms.com/submit';
const MIN_INTERVAL_MS = 30_000;

let lastSubmitAt = 0;

export interface SubmitResult {
  ok: boolean;
  error?: 'rate-limited' | 'network' | 'rejected';
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export async function submitForm(fields: Record<string, string>): Promise<SubmitResult> {
  if (fields.botcheck) return { ok: true };

  const now = Date.now();
  if (now - lastSubmitAt < MIN_INTERVAL_MS) return { ok: false, error: 'rate-limited' };

  const accessKey = import.meta.env.PUBLIC_WEB3FORMS_KEY;
  if (!accessKey) return { ok: false, error: 'rejected' };

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: accessKey, ...fields }),
    });
    if (!res.ok) return { ok: false, error: 'rejected' };
    const data = await res.json();
    if (!data.success) return { ok: false, error: 'rejected' };
    lastSubmitAt = now;
    return { ok: true };
  } catch {
    return { ok: false, error: 'network' };
  }
}
