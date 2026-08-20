import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const docsUrl = 'http://127.0.0.1:4175';

test.beforeEach(async ({ page }) => {
  await page.goto(docsUrl);
});

test('docs header keeps the logo-only brand, route navigation, theme, and search', async ({ page }) => {
  const brand = page.locator('header .brand');
  await expect(brand.locator('img')).toHaveAttribute('src', '/logo.svg');
  await expect(brand.locator('img')).toBeVisible();
  await expect(brand.locator('.brand-mark, .brand-name')).toHaveCount(0);

  await expect(page.getByRole('navigation', { name: 'Documentation' }).getByRole('link')).toHaveText(['Components', 'Release']);

  await page.getByRole('switch', { name: 'Toggle dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: 'Search documentation' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Search components and API fields' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Search documentation' })).toBeFocused();
});

test('landing hero actions share the same control height', async ({ page }) => {
  const heights = await page.locator('.hero-actions > *').evaluateAll((elements) => elements.map((element) => Math.round(element.getBoundingClientRect().height)));
  expect(heights).toEqual([44, 44]);
});

test('global search selects a component and exposes its parsed API contract', async ({ page }) => {
  await page.keyboard.press('/');
  const search = page.getByRole('searchbox', { name: 'Search components and API fields' });
  await expect(search).toBeFocused();
  await search.fill('dialog');

  await page.getByRole('button', { name: /WeBaseDialog/ }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page).toHaveURL(`${docsUrl}/components/dialog`);
  await expect(page.locator('[data-selected-component="WeBaseDialog"]')).toBeVisible();
  await expect(page.locator('[data-selected-component="WeBaseDialog"]')).toBeFocused();
  await expect(page.getByRole('heading', { name: 'WeBaseDialog', level: 1 })).toBeVisible();
  await expect(page.locator('.contract-panel')).toContainText('showModal()');
});

test('the component index exposes all 28 components and supports local filtering', async ({ page }) => {
  await page.goto(`${docsUrl}/components`);
  await expect(page.getByRole('heading', { name: 'Components.', level: 1 })).toBeVisible();
  await expect(page.locator('.component-index-item')).toHaveCount(28);

  await page.getByRole('searchbox', { name: 'Filter components' }).fill('slider');
  await expect(page.locator('.component-index-item')).toHaveCount(1);
  await page.getByRole('link', { name: /Slider/ }).click();

  await expect(page).toHaveURL(`${docsUrl}/components/slider`);
  await expect(page.locator('[data-selected-component="WeBaseSlider"]')).toBeVisible();
  await expect(page.locator('.contract-panel')).toContainText('inputProps');
});

test('the component detail sidebar supports local filtering', async ({ page }) => {
  await page.goto(`${docsUrl}/components/button`);
  await expect(page.locator('.sidebar-count')).toHaveText('28 components');
  await expect(page.locator('.sidebar-group-trigger')).toHaveCount(12);

  await page.getByRole('searchbox', { name: 'Filter components' }).fill('slider');
  await expect(page.locator('.sidebar-group > div > a')).toHaveCount(1);
  await page.getByRole('link', { name: 'WeBaseSlider', exact: true }).click();

  await expect(page.locator('[data-selected-component="WeBaseSlider"]')).toBeVisible();
  await expect(page.locator('.contract-panel')).toContainText('inputProps');
});

test('direct component routes and reloads restore the matching sidebar group', async ({ page }) => {
  await page.goto(`${docsUrl}/components/dialog`);

  await expect(page.locator('[data-selected-component="WeBaseDialog"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Overlay' })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('link', { name: 'WeBaseDialog', exact: true })).toHaveAttribute('aria-current', 'page');

  await page.reload();
  await expect(page).toHaveURL(`${docsUrl}/components/dialog`);
  await expect(page.locator('[data-selected-component="WeBaseDialog"]')).toBeVisible();
  await expect(page).toHaveTitle('WeBaseDialog - WeBaseUI');

  await page.goto(`${docsUrl}/components/not-a-component`);
  await expect(page).toHaveURL(`${docsUrl}/components`);
  await expect(page.getByRole('heading', { name: 'Components.', level: 1 })).toBeVisible();
});

test('returning home after visiting a component initializes landing reveals', async ({ page }) => {
  await page.goto(`${docsUrl}/components/button`);
  await expect(page.locator('[data-selected-component="WeBaseButton"]')).toBeVisible();

  await page.getByRole('link', { name: 'WeBaseUI home' }).click();
  await expect(page).toHaveURL(`${docsUrl}/`);
  await expect(page.locator('.landing-page')).toBeVisible();

  await page.locator('.proof-rail').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.proof-rail').evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
  await page.locator('#tokens').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('#tokens').evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
});

test('usage examples and install commands provide copy feedback', async ({ page }) => {
  await page.goto(`${docsUrl}/components/button`);
  const exampleCopy = page.getByRole('button', { name: 'Copy WeBaseButton example' });
  await exampleCopy.click();
  await expect(exampleCopy).toContainText('Copied');

  await page.goto(docsUrl);
  await page.locator('#install').scrollIntoViewIfNeeded();
  const installCopy = page.getByRole('button', { name: 'Copy install command' });
  await installCopy.click();
  await expect(installCopy).toContainText('Copied');
});

test('release is an independent route and browser history restores each page', async ({ page }) => {
  await page.getByRole('link', { name: 'Components', exact: true }).click();
  await expect(page).toHaveURL(`${docsUrl}/components`);

  await page.getByRole('link', { name: 'Release', exact: true }).click();
  await expect(page).toHaveURL(`${docsUrl}/release`);
  await expect(page.getByRole('heading', { name: 'Release.', level: 1 })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(`${docsUrl}/components`);
  await expect(page.getByRole('heading', { name: 'Components.', level: 1 })).toBeVisible();

  await page.goForward();
  await expect(page).toHaveURL(`${docsUrl}/release`);
  await expect(page.getByRole('heading', { name: 'Release.', level: 1 })).toBeVisible();
});

test('production preview serves the application shell for nested routes', async ({ request }) => {
  for (const path of ['/components', '/components/dialog', '/release']) {
    const response = await request.get(`${docsUrl}${path}`);
    expect(response.ok(), `${path} should resolve to the docs shell`).toBe(true);
    expect(await response.text()).toContain('<div id="app"></div>');
  }
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

  await page.locator('.component-index-item[href="/components/button"]').click();
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
