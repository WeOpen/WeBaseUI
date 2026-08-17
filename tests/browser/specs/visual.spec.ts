import { expect, test, type Locator, type Page } from '@playwright/test';
import { visualComponents, type VisualComponent } from './visual-cases';

const docsUrl = 'http://127.0.0.1:4175';
const fixtureUrl = 'http://127.0.0.1:4176';
const screenshotOptions = {
  animations: 'disabled' as const,
  caret: 'hide' as const,
  scale: 'css' as const,
  threshold: 0.2,
  maxDiffPixelRatio: 0.01
};

async function openSpecimen(page: Page, component: VisualComponent, theme: 'light' | 'dark' = 'light') {
  await page.addInitScript((selectedTheme) => {
    localStorage.setItem('webaseui-theme', selectedTheme);
  }, theme);
  await page.goto(`${docsUrl}/#component-${component.slug}`);
  await page.addStyleTag({
    content: `
      body::before { display: none !important; }
      *, *::before, *::after {
        animation: none !important;
        caret-color: transparent !important;
        transition: none !important;
      }
      [data-reveal] { opacity: 1 !important; transform: none !important; }
    `
  });

  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.evaluate(async () => {
    await document.fonts?.ready;
  });

  const detail = page.locator(`[data-selected-component="${component.name}"]`);
  await expect(detail).toBeVisible();
  await detail.scrollIntoViewIfNeeded();
  return detail;
}

async function openFixtureState(page: Page, testId: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(fixtureUrl);
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        caret-color: transparent !important;
        transition: none !important;
      }
    `
  });
  await page.evaluate(async () => {
    await document.fonts?.ready;
  });

  const state = page.getByTestId(testId);
  await expect(state).toBeVisible();
  await state.scrollIntoViewIfNeeded();
  return state;
}

function previewOf(detail: Locator) {
  return detail.locator('.preview-panel');
}

test.describe('component visual baselines', () => {
  for (const component of visualComponents) {
    test(`${component.name} light specimen`, async ({ page }) => {
      const detail = await openSpecimen(page, component);
      await expect(previewOf(detail)).toHaveScreenshot(`${component.slug}-light.png`, screenshotOptions);
    });
  }
});

test.describe('theme and viewport coverage', () => {
  test('dark theme preserves the component reference hierarchy', async ({ page }) => {
    const detail = await openSpecimen(page, { name: 'WeBaseButton', slug: 'button' }, 'dark');
    await expect(previewOf(detail)).toHaveScreenshot('button-dark.png', screenshotOptions);
  });

  test('mobile specimen stays composed without horizontal clipping', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const detail = await openSpecimen(page, { name: 'WeBaseSelect', slug: 'select' });
    await expect(previewOf(detail)).toHaveScreenshot('select-mobile.png', screenshotOptions);
  });

  test('brand theme preserves component geometry on the shared semantic contract', async ({ page }) => {
    await page.goto(fixtureUrl);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Use brand theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'brand');
    await expect(page.getByTestId('brand-theme-fixture')).toHaveScreenshot('brand-theme.png', screenshotOptions);
  });
});

test.describe('key interaction states', () => {
  test('button focus is visible', async ({ page }) => {
    const detail = await openSpecimen(page, { name: 'WeBaseButton', slug: 'button' });
    await detail.getByRole('button', { name: 'Save changes' }).focus();
    await expect(previewOf(detail)).toHaveScreenshot('button-focus.png', screenshotOptions);
  });

  test('select open state stays inside its specimen canvas', async ({ page }) => {
    const detail = await openSpecimen(page, { name: 'WeBaseSelect', slug: 'select' });
    await detail.getByRole('combobox', { name: 'Release channel' }).click();
    await expect(detail.getByRole('listbox')).toBeVisible();
    await expect(previewOf(detail)).toHaveScreenshot('select-open.png', screenshotOptions);
  });

  test('dialog open state has a stable modal baseline', async ({ page }) => {
    const detail = await openSpecimen(page, { name: 'WeBaseDialog', slug: 'dialog' });
    await detail.getByRole('button', { name: 'Open dialog' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveScreenshot('dialog-open.png', screenshotOptions);
  });

  test('tooltip focus state remains readable and dismissible', async ({ page }) => {
    const detail = await openSpecimen(page, { name: 'WeBaseTooltip', slug: 'tooltip' });
    await detail.getByRole('button', { name: 'Hover or focus' }).focus();
    await expect(detail.getByRole('tooltip').first()).toBeVisible();
    await expect(previewOf(detail)).toHaveScreenshot('tooltip-focus.png', screenshotOptions);
  });

  test('floating overlays remain composed at scroll and viewport edges', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 420 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(fixtureUrl);
    const container = page.getByTestId('floating-scroll-container');
    await container.evaluate((element) => { element.scrollTop = element.scrollHeight; });

    const select = page.getByRole('combobox', { name: 'Scrollable release channel' });
    await select.evaluate((element) => element.scrollIntoView({ block: 'end' }));
    await select.click();
    await expect(page.getByRole('listbox', { name: 'Scrollable release channel' })).toHaveAttribute('data-side', 'top');
    await expect(page).toHaveScreenshot('floating-select-collision.png', screenshotOptions);

    await select.press('Escape');
    const tooltipTrigger = page.getByRole('button', { name: 'Viewport edge help' });
    await tooltipTrigger.evaluate((element) => element.scrollIntoView({ block: 'start', inline: 'end' }));
    await tooltipTrigger.focus();
    await expect(page.getByRole('tooltip').filter({ hasText: 'This tooltip shifts and flips' })).toHaveAttribute('data-side', 'bottom');
    await expect(page).toHaveScreenshot('floating-tooltip-collision.png', screenshotOptions);
  });

  test('right-to-left and forced-colors fixtures retain hierarchy', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 420 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(fixtureUrl);
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    const select = page.getByRole('combobox', { name: 'Release channel', exact: true });
    await select.click();
    await expect(page.getByRole('listbox', { name: 'Release channel' })).toBeVisible();
    await expect(page).toHaveScreenshot('rtl-floating.png', screenshotOptions);

    await select.press('Escape');
    await page.emulateMedia({ forcedColors: 'active' });
    await expect(page).toHaveScreenshot('forced-colors-fixture.png', screenshotOptions);
  });

  test('localized copy remains composed at 200 percent text scale', async ({ page }) => {
    await page.setViewportSize({ width: 195, height: 844 });
    await page.goto(fixtureUrl);
    const fixture = page.getByTestId('i18n-fixture');
    await fixture.evaluate((element) => {
      const main = document.querySelector<HTMLElement>('main');
      if (main) main.style.gridTemplateColumns = 'minmax(0, 1fr)';
      document.querySelectorAll('main > *:not([data-testid="i18n-fixture"])').forEach((section) => {
        (section as HTMLElement).style.display = 'none';
      });
      element.scrollIntoView({ block: 'start' });
    });
    await expect(fixture).toHaveScreenshot('localized-copy-zoom.png', screenshotOptions);
  });

  test('button hover, disabled, loading, and pressed states remain distinct', async ({ page }) => {
    const state = await openFixtureState(page, 'action-state-matrix');
    await state.getByRole('button', { name: 'Hover action' }).hover();
    await expect(state).toHaveScreenshot('action-state-matrix.png', screenshotOptions);
  });

  test('form error states keep visible messages and invalid affordances', async ({ page }) => {
    const state = await openFixtureState(page, 'form-error-state-matrix');
    await expect(state).toHaveScreenshot('form-error-state-matrix.png', screenshotOptions);
  });

  test('disabled form controls remain legible as a group', async ({ page }) => {
    const state = await openFixtureState(page, 'form-disabled-state-matrix');
    await expect(state).toHaveScreenshot('form-disabled-state-matrix.png', screenshotOptions);
  });

  test('disabled selection controls preserve state and hierarchy', async ({ page }) => {
    const state = await openFixtureState(page, 'selection-disabled-state-matrix');
    await expect(state).toHaveScreenshot('selection-disabled-state-matrix.png', screenshotOptions);
  });

  test('warning and error feedback tones remain distinguishable', async ({ page }) => {
    const state = await openFixtureState(page, 'feedback-tone-state-matrix');
    await expect(state).toHaveScreenshot('feedback-tone-state-matrix.png', screenshotOptions);
  });

  test('navigation hover and disabled states remain composed', async ({ page }) => {
    const state = await openFixtureState(page, 'navigation-state-matrix');
    await state.getByRole('button', { name: 'Page 2' }).hover();
    await expect(state).toHaveScreenshot('navigation-state-matrix.png', screenshotOptions);
  });

  test('tabs expose a stable hover state', async ({ page }) => {
    const detail = await openSpecimen(page, { name: 'WeBaseTabs', slug: 'tabs' });
    await detail.getByRole('tab', { name: 'Behavior' }).hover();
    await expect(previewOf(detail)).toHaveScreenshot('tabs-hover.png', screenshotOptions);
  });

  test('accordion exposes a stable hover state', async ({ page }) => {
    const detail = await openSpecimen(page, { name: 'WeBaseAccordion', slug: 'accordion' });
    await detail.getByRole('button', { name: /Consumer surface/ }).hover();
    await expect(previewOf(detail)).toHaveScreenshot('accordion-hover.png', screenshotOptions);
  });

  test('toast open state remains readable and dismissible', async ({ page }) => {
    const detail = await openSpecimen(page, { name: 'WeBaseToast', slug: 'toast' });
    await detail.getByRole('button', { name: 'Show toast' }).click();
    await expect(detail.getByRole('status').getByText('Saved locally', { exact: true })).toBeVisible();
    await expect(previewOf(detail)).toHaveScreenshot('toast-open.png', screenshotOptions);
  });
});
