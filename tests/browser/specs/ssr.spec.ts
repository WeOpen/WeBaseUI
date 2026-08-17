import { expect, test } from '@playwright/test';

const ssrUrl = 'http://127.0.0.1:4177';

test('all public components render on the server and hydrate without warnings', async ({ page, request }) => {
  const serverResponse = await request.get(ssrUrl);
  expect(serverResponse.ok()).toBe(true);
  const serverHtml = await serverResponse.text();
  expect(serverHtml).toContain('data-testid="ssr-root"');
  expect(serverHtml).toContain('Increment hydrated count');
  expect(serverHtml).toContain('data-component="WeBaseTooltip"');

  const runtimeIssues: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') runtimeIssues.push(message.text());
  });
  page.on('pageerror', (error) => runtimeIssues.push(error.message));

  await page.goto(ssrUrl);
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  await page.getByRole('button', { name: 'Increment hydrated count' }).click();
  await expect(page.getByTestId('hydration-count')).toHaveText('1');
  expect(runtimeIssues.filter((message) => /hydration|mismatch|uncaught|error/i.test(message))).toEqual([]);
});
