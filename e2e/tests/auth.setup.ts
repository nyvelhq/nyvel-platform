import { test as setup, expect } from '@playwright/test';
import { ACCOUNTS, Role, storageStatePath } from '../lib/accounts';
import { LoginPage } from '../pages/LoginPage';

const landing: Record<string, RegExp> = {
  admin: /\/admin\/dashboard/,
  company: /\/company\/dashboard/,
  tester: /\/tester\/dashboard/,
};

// Signs each seeded account in once through the real login form and saves
// the session, so role tests start signed in.
for (const role of Object.keys(ACCOUNTS) as Role[]) {
  setup(`sign in as ${role}`, async ({ page }) => {
    const account = ACCOUNTS[role];
    const login = new LoginPage(page);
    await login.open();
    await login.signIn(account.email, account.password);
    await expect(page).toHaveURL(landing[account.appRole]);
    await page.context().storageState({ path: storageStatePath(role) });
  });
}
