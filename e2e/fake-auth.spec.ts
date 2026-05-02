import { expect, test } from '@playwright/test';

// Practice credentials are public, non-sensitive training values.
const CREDS = { username: 'learner', password: 'practice' } as const;

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Sign in using the documented practice credentials. */
async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/practice/fake-auth');
  await page.getByLabel(/username/i).fill(CREDS.username);
  await page.getByLabel(/password/i).fill(CREDS.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL('/practice/fake-auth/protected');
}

test.describe('Fake Auth Session lab', () => {
  test.beforeEach(async ({ page }) => {
    // Start every test from a clean session state
    await page.goto('/practice/fake-auth');
    await page.evaluate(() => localStorage.removeItem('stagecraft_fake_session'));
  });

  // ─── Login page ──────────────────────────────────────────────────────────────

  test('login page loads with correct title and sign-in form', async ({ page }) => {
    await expect(page).toHaveTitle(/Fake Auth Session Lab — Stagecraft/);
    await expect(
      page.getByRole('heading', { level: 1, name: /fake auth session lab/i }),
    ).toBeVisible();
    await expect(page.getByRole('form', { name: /sign in/i })).toBeVisible();
  });

  test('login page displays the documented practice credentials', async ({ page }) => {
    const credBox = page.getByRole('complementary', { name: /practice credentials/i });
    await expect(credBox).toBeVisible();
    // Use exact:true so 'learner' / 'practice' don't partially match other text
    await expect(credBox.getByText(CREDS.username, { exact: true })).toBeVisible();
    await expect(credBox.getByText(CREDS.password, { exact: true })).toBeVisible();
  });

  // getByLabel — labelled username and password inputs
  test('login form has labelled username and password inputs', async ({ page }) => {
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  // Error state on wrong credentials
  test('incorrect credentials shows an error alert', async ({ page }) => {
    await page.getByLabel(/username/i).fill('wrong');
    await page.getByLabel(/password/i).fill('wrong');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Scope to the form to avoid the Next.js route announcer alert
    const form = page.getByRole('form', { name: /sign in/i });
    await expect(form.getByRole('alert')).toBeVisible();
    await expect(form.getByRole('alert')).toContainText(/incorrect credentials/i);
  });

  // ─── Login flow ───────────────────────────────────────────────────────────────

  // Full sign-in: fills form → navigates to protected page
  test('correct credentials navigate to the protected area', async ({ page }) => {
    await signIn(page);

    await expect(page.getByRole('heading', { name: /practice portal/i })).toBeVisible();
  });

  // Session is written to localStorage after sign-in
  test('sign-in writes a session to localStorage', async ({ page }) => {
    await signIn(page);

    const session = await page.evaluate(() =>
      localStorage.getItem('stagecraft_fake_session'),
    );
    expect(session).not.toBeNull();
    const parsed = JSON.parse(session!) as { username: string };
    expect(parsed.username).toBe(CREDS.username);
  });

  // ─── Protected page ───────────────────────────────────────────────────────────

  // Unauthenticated access → redirect back to login
  test('unauthenticated access to the protected page redirects to login', async ({ page }) => {
    await page.goto('/practice/fake-auth/protected');

    // Playwright auto-waits for the URL to change
    await expect(page).toHaveURL('/practice/fake-auth');
  });

  // Authenticated: protected content is visible
  test('authenticated visit shows the Practice Portal heading', async ({ page }) => {
    await signIn(page);
    await expect(
      page.getByRole('heading', { level: 1, name: /practice portal/i }),
    ).toBeVisible();
  });

  // Session details section
  test('authenticated visit shows the active session details', async ({ page }) => {
    await signIn(page);
    const sessionSection = page.getByRole('region', { name: /session details/i });
    await expect(sessionSection).toBeVisible();
    // Use exact:true — 'learner' substring also matches 'Practice Learner'
    await expect(sessionSection.getByText(CREDS.username, { exact: true })).toBeVisible();
  });

  // Available modules list
  test('authenticated visit shows the available practice modules', async ({ page }) => {
    await signIn(page);
    const modulesSection = page.getByRole('region', { name: /available modules/i });
    await expect(modulesSection).toBeVisible();
    await expect(modulesSection.getByRole('listitem', { name: /locator strategies/i })).toBeVisible();
    await expect(modulesSection.getByRole('listitem', { name: /async assertions/i })).toBeVisible();
  });

  // ─── Sign-out flow ────────────────────────────────────────────────────────────

  // Sign out removes session and redirects to login
  test('Sign out clears the session and redirects to the login page', async ({ page }) => {
    await signIn(page);

    await page.getByRole('button', { name: /sign out/i }).click();

    await expect(page).toHaveURL('/practice/fake-auth');

    // Session is gone from localStorage
    const session = await page.evaluate(() =>
      localStorage.getItem('stagecraft_fake_session'),
    );
    expect(session).toBeNull();
  });

  // After sign-out, protected page redirects again
  test('after sign-out, the protected page is inaccessible', async ({ page }) => {
    await signIn(page);
    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page).toHaveURL('/practice/fake-auth');

    await page.goto('/practice/fake-auth/protected');
    await expect(page).toHaveURL('/practice/fake-auth');
  });

  // Signed-in state on login page: link to protected area visible
  test('visiting login page while already signed in shows a link to the protected area', async ({
    page,
  }) => {
    await signIn(page);
    await page.goto('/practice/fake-auth');

    await expect(page.getByRole('link', { name: /go to protected area/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });

  // ─── Storage state concept ────────────────────────────────────────────────────

  // Demonstrates page.evaluate to set localStorage (the Playwright storageState concept)
  test('injecting a session via localStorage grants direct access to the protected area', async ({
    page,
  }) => {
    // Simulate what Playwright's storageState feature does:
    // write the session to localStorage before navigating.
    await page.evaluate(
      ([key, value]) => localStorage.setItem(key, value),
      [
        'stagecraft_fake_session',
        JSON.stringify({
          username: CREDS.username,
          displayName: 'Practice Learner',
          signedInAt: new Date().toISOString(),
        }),
      ] as const,
    );

    await page.goto('/practice/fake-auth/protected');

    // Protected content is immediately visible — no sign-in required
    await expect(
      page.getByRole('heading', { level: 1, name: /practice portal/i }),
    ).toBeVisible();
  });

  // ─── Challenge navigation ──────────────────────────────────────────────────────

  test('challenge detail page links to this lab', async ({ page }) => {
    await page.goto('/challenges/fake-auth-session');
    await page.getByRole('link', { name: /open fake auth session lab/i }).click();
    await expect(page).toHaveURL('/practice/fake-auth');
  });

  // ─── Reset ────────────────────────────────────────────────────────────────────

  test('Reset lab clears the form and error state', async ({ page }) => {
    const form = page.getByRole('form', { name: /sign in/i });

    // Trigger an error
    await page.getByLabel(/username/i).fill('wrong');
    await page.getByLabel(/password/i).fill('wrong');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(form.getByRole('alert')).toBeVisible();

    // Reset remounts the content, clearing form state and error
    await page.getByRole('button', { name: /reset lab/i }).click();

    await expect(page.getByRole('form', { name: /sign in/i })).toBeVisible();
    await expect(page.getByText(/incorrect credentials/i)).not.toBeVisible();
  });
});
