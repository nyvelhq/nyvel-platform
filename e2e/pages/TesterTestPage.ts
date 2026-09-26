import { Page, expect, Locator } from '@playwright/test';

/** /tester/tests/:id — apply, submit findings, reply to questions. */
export class TesterTestPage {
  constructor(private readonly page: Page) {}

  async open(testId: string) {
    await this.page.goto(`/tester/tests/${testId}`);
  }

  async apply({ nda = false } = {}) {
    await this.page.getByRole('button', { name: 'Apply Now' }).click();
    if (nda) {
      const dialog = this.page.getByRole('dialog');
      await dialog.getByRole('checkbox').check();
      await dialog.getByRole('button', { name: 'Accept & Apply' }).click();
    }
  }

  async submitFinding(title: string, description: string, severity = 'high') {
    await this.page.getByLabel('Title').fill(title);
    await this.page.getByLabel('Description').fill(description);
    await this.page.getByLabel('Severity').selectOption(severity);
    await this.page.getByRole('button', { name: 'Submit Finding' }).click();
    await expect(this.finding(title)).toBeVisible();
  }

  finding(title: string): Locator {
    return this.page.getByRole('listitem').filter({ has: this.page.getByText(title, { exact: true }) });
  }

  async reply(title: string, text: string) {
    const card = this.finding(title);
    await card.getByRole('textbox', { name: 'Reply to the company' }).fill(text);
    await card.getByRole('button', { name: 'Send reply' }).click();
    await expect(card.getByRole('textbox', { name: 'Reply to the company' })).toHaveCount(0);
  }
}
