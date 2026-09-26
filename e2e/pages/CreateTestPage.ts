import { Page, expect } from '@playwright/test';

const isoDay = (offsetDays: number) => new Date(Date.now() + offsetDays * 864e5).toISOString().slice(0, 10);

export class CreateTestPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/company/create-test');
    await expect(this.page.getByRole('heading', { name: 'Test Details' })).toBeVisible();
  }

  async fillDetails(name: string, type = 'Bug Hunt') {
    await this.page.getByLabel('Test Name *').fill(name);
    await this.page.getByRole('button', { name: new RegExp(type) }).click();
    await this.page.getByLabel('Start Date *').fill(isoDay(0));
    await this.page.getByLabel('End Date *').fill(isoDay(14));
    await this.page.getByRole('button', { name: 'Continue' }).click();
    await expect(this.page.getByRole('heading', { name: 'Tester Criteria' })).toBeVisible();
  }

  async fillCriteria({ platform = 'Web', nda = false }: { platform?: string; nda?: boolean } = {}) {
    await this.page.getByRole('button', { name: platform, exact: true }).click();
    if (nda) await this.page.getByLabel(/Mark this test as NDA-required/).check();
    await this.page.getByRole('button', { name: 'Review Test' }).click();
  }

  async launch() {
    await this.page.getByRole('button', { name: /Launch Test/ }).click();
    await expect(this.page.getByRole('heading', { name: 'Test launched' })).toBeVisible();
  }
}
