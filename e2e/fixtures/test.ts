import { test as base, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { Role, storageStatePath } from '../lib/accounts';

const GATE_KEY = 'nyvel_authenticated';

type Fixtures = {
  /** Opens a page signed in as the given role (state saved by auth.setup). */
  as: (role: Role) => Promise<Page>;
  /** Fails the test on WCAG 2 A/AA violations on the current page. */
  expectAccessible: (page: Page) => Promise<void>;
};

/**
 * Every page starts past the site-wide password gate (tests for the gate
 * itself clear this). Role pages come from saved sign-in state, so tests
 * don't repeat the login flow.
 */
export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    await page.addInitScript((key) => window.localStorage.setItem(key, 'true'), GATE_KEY);
    await use(page);
  },
  as: async ({ browser }, use, testInfo) => {
    const contexts: import('@playwright/test').BrowserContext[] = [];
    await use(async (role: Role) => {
      const context = await browser.newContext({
        ...testInfo.project.use,
        storageState: storageStatePath(role),
        reducedMotion: 'reduce',
      });
      contexts.push(context);
      const page = await context.newPage();
      await page.addInitScript((key) => window.localStorage.setItem(key, 'true'), GATE_KEY);
      return page;
    });
    await Promise.all(contexts.map((c) => c.close()));
  },
  expectAccessible: async ({}, use) => {
    await use(async (page: Page) => {
      // Let entrance animations finish so text isn't measured mid-fade.
      await page.evaluate(() =>
        Promise.all(
          document
            .getAnimations()
            .filter((a) => a.effect?.getTiming().iterations !== Infinity)
            .map((a) => a.finished.catch(() => undefined))
        )
      );
      // @axe-core/playwright types against its own playwright-core copy; the
      // runtime Page is compatible.
      const results = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'] }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const summary = results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) — ${v.help}`);
      expect(summary, 'accessibility violations').toEqual([]);
    });
  },
});

export { expect };
