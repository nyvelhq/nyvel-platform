import { test, expect } from '../../fixtures/test';
import { ACCOUNTS } from '../../lib/accounts';
import { serviceClient } from '../../lib/db';
import { uniqueName } from '../../lib/factory';
import { CreateTestPage } from '../../pages/CreateTestPage';
import { CompanyTestPage } from '../../pages/CompanyTestPage';
import { TesterTestPage } from '../../pages/TesterTestPage';

// The core company ↔ tester loop, end to end through the UI with real
// sign-in and RLS: create an NDA test, apply, accept, report, ask for more
// info, reply, accept the finding, pay.
test('company and tester complete a test from launch to payout @smoke', async ({ as }) => {
  const title = uniqueName('Checkout flow');
  const findingTitle = uniqueName('Pay button does nothing');

  // Company launches an NDA test.
  const company = await as('company');
  const create = new CreateTestPage(company);
  await create.open();
  await create.fillDetails(title);
  await create.fillCriteria({ nda: true });
  await create.launch();
  const { data: created } = await serviceClient().from('tests').select('id').eq('title', title).single();
  const testId = created!.id as string;

  // Tester finds it and applies, accepting the NDA.
  const tester = await as('tester');
  await tester.goto('/tester/dashboard');
  await expect(tester.getByText(title)).toBeVisible();
  const testerTest = new TesterTestPage(tester);
  await testerTest.open(testId);
  await testerTest.apply({ nda: true });
  await expect(tester.getByText(/pending/i).first()).toBeVisible();

  const { data: application } = await serviceClient()
    .from('applications').select('nda_accepted_at, status').eq('test_id', testId).single();
  expect(application!.nda_accepted_at, 'NDA acceptance is recorded').toBeTruthy();

  // Company accepts the applicant.
  const companyTest = new CompanyTestPage(company);
  await companyTest.open(testId);
  await companyTest.acceptApplicant(ACCOUNTS.tester.name);

  // Tester reports a finding.
  await testerTest.open(testId);
  await testerTest.submitFinding(findingTitle, 'Tap Pay on the checkout page; nothing happens.');

  // Company asks for more info; tester replies; company accepts.
  await companyTest.open(testId);
  await companyTest.askForMoreInfo(findingTitle, 'Which browser?');
  await testerTest.open(testId);
  await expect(testerTest.finding(findingTitle)).toContainText('Which browser?');
  await testerTest.reply(findingTitle, 'Safari 17 on iOS.');
  await companyTest.open(testId);
  await expect(companyTest.finding(findingTitle)).toContainText('Safari 17 on iOS.');
  await companyTest.acceptFinding(findingTitle);

  // The whole conversation is kept (UX-07).
  const { data: finding } = await serviceClient().from('findings').select('id').eq('title', findingTitle).single();
  const { data: thread } = await serviceClient()
    .from('finding_messages').select('kind').eq('finding_id', finding!.id).order('created_at');
  expect(thread!.map((m) => m.kind)).toEqual(['question', 'reply', 'accepted']);

  // Admin pays the tester.
  const admin = await as('admin');
  await admin.goto('/admin/payouts');
  const row = admin.getByRole('row').filter({ hasText: title });
  await row.getByRole('button', { name: 'Mark Paid' }).click();
  await admin.getByRole('dialog').getByRole('button', { name: 'Mark paid' }).click();
  await expect(row).toContainText('Paid');

  // Tester sees the earnings.
  await tester.goto('/tester/dashboard');
  await expect(tester.getByText('Total Earned').first()).toBeVisible();
  const { data: payout } = await serviceClient().from('payouts').select('status, amount').eq('test_id', testId).single();
  expect(payout).toMatchObject({ status: 'paid' });
});
