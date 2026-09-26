import { test, expect } from '../../fixtures/test';
import { uniqueName } from '../../lib/factory';

test('a visitor requests access and an admin sees it @smoke @mobile', async ({ page, as }) => {
  const name = uniqueName('Visitor');
  await page.goto('/request-access');
  await page.getByLabel('Your name').fill(name);
  await page.getByLabel('Work email').fill(`${Date.now()}@example.com`);
  await page.getByLabel('Company').fill('E2E Prospects Ltd');
  await page.getByRole('button', { name: /Request access/ }).click();
  await expect(page.getByText(/we've got it/i)).toBeVisible();

  const admin = await as('admin');
  await admin.goto('/admin/requests');
  await expect(admin.getByText(name)).toBeVisible();
});
