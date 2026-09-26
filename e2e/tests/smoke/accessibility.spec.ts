import { test } from '../../fixtures/test';
import { Role } from '../../lib/accounts';

const pages: Array<{ role: Role | null; path: string }> = [
  { role: null, path: '/' },
  { role: null, path: '/login' },
  { role: null, path: '/request-access' },
  { role: 'company', path: '/company/dashboard' },
  { role: 'company', path: '/company/create-test' },
  { role: 'tester', path: '/tester/dashboard' },
  { role: 'tester', path: '/tester/profile' },
  { role: 'admin', path: '/admin/dashboard' },
  { role: 'admin', path: '/admin/reports' },
];

test.describe('key pages meet WCAG 2 AA @smoke', () => {
  for (const { role, path } of pages) {
    test(`${path}${role ? ` as ${role}` : ''}`, async ({ page, as, expectAccessible }) => {
      const target = role ? await as(role) : page;
      await target.goto(path);
      await target.waitForLoadState('networkidle');
      await expectAccessible(target);
    });
  }
});
