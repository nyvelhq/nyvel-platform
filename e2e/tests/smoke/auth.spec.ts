import { test, expect } from '../../fixtures/test';
import { ACCOUNTS } from '../../lib/accounts';
import { LoginPage } from '../../pages/LoginPage';

test.describe('sign-in and role access @smoke', () => {
  test('each role lands on its own dashboard @mobile', async ({ as }) => {
    const company = await as('company');
    await company.goto('/company/dashboard');
    await expect(company.getByRole('heading', { name: /Good (morning|afternoon|evening), Dana/ })).toBeVisible();

    const tester = await as('tester');
    await tester.goto('/tester/dashboard');
    await expect(tester.getByRole('heading', { name: 'Tariq Tester' })).toBeVisible();

    const admin = await as('admin');
    await admin.goto('/admin/dashboard');
    await expect(admin).toHaveURL(/\/admin\/dashboard/);
  });

  test('a wrong password is rejected with a message', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.signIn(ACCOUNTS.tester.email, 'not-the-password');
    await expect(login.error()).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('signed-out visitors are sent to sign in', async ({ page }) => {
    await page.goto('/company/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('a tester cannot open company or admin pages', async ({ as }) => {
    const tester = await as('tester');
    await tester.goto('/company/dashboard');
    await expect(tester).toHaveURL(/\/tester\/dashboard/);
    await tester.goto('/admin/users');
    await expect(tester).toHaveURL(/\/tester\/dashboard/);
  });
});
