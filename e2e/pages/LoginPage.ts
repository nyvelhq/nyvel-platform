import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/login');
    await expect(this.page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  }

  async signIn(email: string, password: string) {
    await this.page.getByLabel('Email address').fill(email);
    await this.page.getByLabel('Password', { exact: true }).fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }

  error() {
    return this.page.getByRole('alert');
  }
}
