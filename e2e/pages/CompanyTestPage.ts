import { Page, expect, Locator } from '@playwright/test';

/** /company/tests/:id — applicants and findings triage. */
export class CompanyTestPage {
  constructor(private readonly page: Page) {}

  async open(testId: string) {
    await this.page.goto(`/company/tests/${testId}`);
    await expect(this.page.getByRole('heading', { name: 'Applicants' })).toBeVisible();
  }

  applicantRow(name: string): Locator {
    return this.page.getByRole('row').filter({ hasText: name });
  }

  async acceptApplicant(name: string) {
    await this.applicantRow(name).getByRole('button', { name: 'Accept' }).click();
    await expect(this.applicantRow(name)).toContainText('Accepted');
  }

  finding(title: string): Locator {
    return this.page.getByRole('listitem').filter({ has: this.page.getByText(title, { exact: true }) });
  }

  async askForMoreInfo(title: string, question: string) {
    const card = this.finding(title);
    await card.getByRole('button', { name: 'More Info' }).click();
    await card.getByRole('textbox', { name: 'Reason' }).fill(question);
    await card.getByRole('button', { name: 'Confirm' }).click();
    await expect(card).toContainText('More Info Needed');
  }

  async acceptFinding(title: string) {
    const card = this.finding(title);
    await card.getByRole('button', { name: 'Accept' }).click();
    await expect(card).toContainText('Accepted');
  }
}
