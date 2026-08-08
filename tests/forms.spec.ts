import { test, expect } from '@playwright/test';

test.describe('waitlist form', () => {
  test('rejects an invalid email without submitting', async ({ page }) => {
    await page.goto('/beta');
    await page.getByLabel('Email address').fill('not-an-email');
    await page.getByRole('button', { name: /join the waitlist/i }).click();
    await expect(page.getByText(/enter a valid email/i)).toBeVisible();
  });

  test('honeypot field is present and hidden from users', async ({ page }) => {
    await page.goto('/beta');
    const honeypot = page.locator('input[name="botcheck"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toBeHidden();
  });

  test('shows a success state when the API succeeds', async ({ page }) => {
    await page.route('https://api.web3forms.com/submit', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    );
    await page.goto('/beta');
    await page.getByLabel('Email address').fill('test@example.com');
    await page.getByRole('button', { name: /join the waitlist/i }).click();
    await expect(page.getByRole('status')).toContainText(/you.re on the list/i);
  });

  test('shows an error state with a mailto fallback when the API fails', async ({ page }) => {
    await page.route('https://api.web3forms.com/submit', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false }) })
    );
    await page.goto('/beta');
    await page.getByLabel('Email address').fill('test@example.com');
    await page.getByRole('button', { name: /join the waitlist/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert').getByRole('link')).toHaveAttribute('href', /^mailto:/);
  });
});
