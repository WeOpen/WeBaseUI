import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const docsUrl = 'http://127.0.0.1:4175';

test.beforeEach(async ({ page }) => {
  await page.goto(docsUrl);
});

test('docs header keeps the logo-only brand, stable anchors, theme, and search', async ({ page }) => {
  const brand = page.locator('header .brand');
  await expect(brand.locator('img')).toHaveAttribute('src', '/logo.svg');
  await expect(brand.locator('strong, small')).toHaveCount(0);

  await expect(page.getByRole('navigation', { name: 'Documentation' }).getByRole('link')).toHaveText(['Tokens', 'Components', 'Install']);

  await page.getByRole('switch', { name: 'Toggle dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: 'Search documentation' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Search components and API fields' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Search documentation' })).toBeFocused();
});

test('global search selects a component and exposes its parsed API contract', async ({ page }) => {
  await page.keyboard.press('/');
  const search = page.getByRole('searchbox', { name: 'Search components and API fields' });
  await expect(search).toBeFocused();
  await search.fill('dialog');

  await page.getByRole('button', { name: /WeBaseDialog/ }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page).toHaveURL(/#component-dialog$/);
  await expect(page.locator('[data-selected-component="WeBaseDialog"]')).toBeVisible();
  await expect(page.locator('[data-selected-component="WeBaseDialog"]')).toBeFocused();
  await expect(page.getByRole('heading', { name: 'WeBaseDialog', level: 3 })).toBeVisible();
  await expect(page.locator('.contract-panel')).toContainText('showModal()');
});

test('the reference desk indexes all 28 components and supports local filtering', async ({ page }) => {
  await expect(page.locator('.sidebar-group button')).toHaveCount(28);

  await page.getByRole('searchbox', { name: 'Filter components' }).fill('slider');
  await expect(page.locator('.sidebar-group button')).toHaveCount(1);
  await page.getByRole('button', { name: 'Slider', exact: true }).click();

  await expect(page.locator('[data-selected-component="WeBaseSlider"]')).toBeVisible();
  await expect(page.locator('.contract-panel')).toContainText('inputProps');
});

test('usage examples and install commands provide copy feedback', async ({ page }) => {
  const exampleCopy = page.getByRole('button', { name: 'Copy WeBaseButton example' });
  await exampleCopy.click();
  await expect(exampleCopy).toContainText('Copied');

  await page.locator('#install').scrollIntoViewIfNeeded();
  const installCopy = page.getByRole('button', { name: 'Copy install command' });
  await installCopy.click();
  await expect(installCopy).toContainText('Copied');
});

test('favicon metadata covers scalable, small, touch, and installed-app icons', async ({ page, request }) => {
  const iconHrefs = await page.locator('link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]').evaluateAll((links) => {
    return links.map((link) => link.getAttribute('href')).filter((href): href is string => Boolean(href));
  });

  expect(iconHrefs).toEqual(expect.arrayContaining([
    '/logo.svg',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/favicon-48x48.png',
    '/favicon.ico',
    '/apple-touch-icon.png',
    '/site.webmanifest'
  ]));

  for (const href of iconHrefs) {
    const response = await request.get(new URL(href, docsUrl).toString());
    expect(response.ok(), `${href} should be served`).toBe(true);
  }

  const manifestResponse = await request.get(new URL('/site.webmanifest', docsUrl).toString());
  const manifest = await manifestResponse.json() as { icons?: Array<{ src: string; sizes: string; type: string; purpose?: string }> };
  expect(manifest.icons).toEqual(expect.arrayContaining([
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]));

  for (const icon of manifest.icons ?? []) {
    const response = await request.get(new URL(icon.src, docsUrl).toString());
    expect(response.ok(), `${icon.src} should be served`).toBe(true);
  }

  const robotsResponse = await request.get(new URL('/robots.txt', docsUrl).toString());
  expect(robotsResponse.ok()).toBe(true);
  expect(await robotsResponse.text()).toContain('User-agent: *');
});

test('mobile navigation and component selection are explicitly composed without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  await expect(page.locator('header .brand-logo')).toBeVisible();
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Mobile documentation' })).toBeVisible();
  await page.getByRole('link', { name: 'Components', exact: true }).last().click();

  await page.getByLabel('Choose a component').selectOption('WeBaseDialog');
  await expect(page.locator('[data-selected-component="WeBaseDialog"]')).toBeVisible();

  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(horizontalOverflow).toBe(false);
});

test('reduced motion removes entry, reveal, and state transition animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();

  const motion = await page.locator('.hero-stage').evaluate((element) => {
    const heroStyle = getComputedStyle(element);
    const revealStyle = getComputedStyle(document.querySelector('[data-reveal]')!);
    return {
      animationName: heroStyle.animationName,
      transitionDuration: heroStyle.transitionDuration,
      revealOpacity: revealStyle.opacity,
      revealTransform: revealStyle.transform
    };
  });

  expect(motion.animationName).toBe('none');
  expect(motion.transitionDuration).toBe('0s');
  expect(motion.revealOpacity).toBe('1');
  expect(motion.revealTransform).toBe('none');
});

test('the documentation surface has no serious or critical accessibility violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();

  const pageScan = await new AxeBuilder({ page }).include('main').analyze();
  const pageViolations = pageScan.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(pageViolations, JSON.stringify(pageViolations, null, 2)).toEqual([]);

  await page.getByRole('button', { name: 'Search documentation' }).click();
  const lightSearchScan = await new AxeBuilder({ page }).include('.search-dialog').analyze();
  const lightSearchViolations = lightSearchScan.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(lightSearchViolations, JSON.stringify(lightSearchViolations, null, 2)).toEqual([]);

  await page.getByRole('button', { name: 'Close search' }).click();
  await page.getByRole('switch', { name: 'Toggle dark theme' }).click();

  const darkPageScan = await new AxeBuilder({ page }).include('main').analyze();
  const darkPageViolations = darkPageScan.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(darkPageViolations, JSON.stringify(darkPageViolations, null, 2)).toEqual([]);

  await page.getByRole('button', { name: 'Search documentation' }).click();
  const darkSearchScan = await new AxeBuilder({ page }).include('.search-dialog').analyze();
  const darkSearchViolations = darkSearchScan.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(darkSearchViolations, JSON.stringify(darkSearchViolations, null, 2)).toEqual([]);
});
