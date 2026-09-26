import { test, expect } from '../../fixtures/test';
import { ACCOUNTS } from '../../lib/accounts';
import { createTest, enrol } from '../../lib/factory';

// Access rules, checked through the real UI with real sessions. The database
// tests (supabase/tests) prove the policies; these prove the app respects them.
test.describe('data isolation', () => {
  test('another company cannot open a test it does not own', async ({ as }) => {
    const test1 = await createTest();
    const other = await as('otherCompany');
    await other.goto(`/company/tests/${test1.id}`);
    await expect(other.getByRole('heading', { name: 'Test not found' })).toBeVisible();
    await expect(other.getByText(test1.title)).toHaveCount(0);
  });

  test('draft tests are not listed for testers', async ({ as }) => {
    const draft = await createTest({ status: 'draft' });
    const open = await createTest();
    const tester = await as('tester');
    await tester.goto('/tester/dashboard');
    await expect(tester.getByText(open.title)).toBeVisible();
    await expect(tester.getByText(draft.title)).toHaveCount(0);
  });

  test('only accepted testers see the briefing', async ({ as }) => {
    const secret = `Staging login: e2e-${Date.now()}`;
    const withBriefing = await createTest({ briefing: secret });
    await enrol(withBriefing.id, ACCOUNTS.tester.email, 'accepted');
    await enrol(withBriefing.id, ACCOUNTS.otherTester.email, 'pending');

    const accepted = await as('tester');
    await accepted.goto(`/tester/tests/${withBriefing.id}`);
    await expect(accepted.getByText(secret)).toBeVisible();

    const pending = await as('otherTester');
    await pending.goto(`/tester/tests/${withBriefing.id}`);
    await expect(pending.getByRole('main').getByRole('heading', { name: withBriefing.title })).toBeVisible();
    await expect(pending.getByText(secret)).toHaveCount(0);
  });
});
