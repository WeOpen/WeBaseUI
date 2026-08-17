import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator } from '@playwright/test';

const fixtureUrl = 'http://127.0.0.1:4176';

async function expectMinimumTarget(locator: Locator, name: string) {
  const box = await locator.boundingBox();
  expect(box, `${name} must be rendered`).not.toBeNull();
  expect(box!.width, `${name} target width`).toBeGreaterThanOrEqual(24);
  expect(box!.height, `${name} target height`).toBeGreaterThanOrEqual(24);
}

async function expectStaticMotion(locator: Locator, name: string) {
  const motion = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      animationDuration: style.animationDuration,
      transitionDuration: style.transitionDuration
    };
  });
  const durations = `${motion.animationDuration},${motion.transitionDuration}`
    .split(',')
    .map((value) => Number.parseFloat(value));
  expect(durations.every((duration) => duration === 0), `${name} motion: ${JSON.stringify(motion)}`).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.goto(fixtureUrl);
});

test('native controls participate in form serialization', async ({ page }) => {
  await page.getByTestId('serialize-form').click();

  await expect(page.getByTestId('form-output')).toHaveText(JSON.stringify({
    title: 'Field notes',
    notes: 'A portable form contract.',
    include: 'yes',
    updates: 'enabled',
    coverage: '30',
    plan: 'standard',
    channel: 'stable'
  }));
});

test('select supports keyboard selection and synchronizes its native control', async ({ page }) => {
  const trigger = page.getByRole('combobox', { name: 'Release channel', exact: true });
  await trigger.focus();
  await trigger.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await trigger.press('ArrowDown');
  await trigger.press('Enter');

  await expect(trigger).toContainText('Preview');
  await expect(page.getByTestId('native-select')).toHaveValue('preview');
  await expect(page.getByTestId('native-select')).toHaveClass(/custom-native-select/);
  await expect(page.getByTestId('select-changes')).toHaveText('1');
});

test('select typeahead refines queries, cycles repeated characters, and skips disabled options', async ({ page }) => {
  const trigger = page.getByRole('combobox', { name: 'Release channel', exact: true });
  await trigger.focus();
  await trigger.press('p');

  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('option', { name: 'Preview' })).toHaveClass(/is-highlighted/);
  await trigger.press('p');
  await expect(page.getByRole('option', { name: 'Paused' })).not.toHaveClass(/is-highlighted/);
  await expect(page.getByRole('option', { name: 'Production' })).toHaveClass(/is-highlighted/);

  await page.waitForTimeout(550);
  await trigger.press('c');
  await expect(page.getByRole('option', { name: 'Canary' })).toHaveClass(/is-highlighted/);
  await trigger.press('Enter');
  await expect(trigger).toContainText('Canary');
});

test('select dismisses its listbox after a pointer action outside the component', async ({ page }) => {
  const trigger = page.getByRole('combobox', { name: 'Release channel', exact: true });
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  await page.getByRole('heading', { name: 'Native form fixture' }).click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('floating overlays escape scroll clipping, track anchors, flip, and shift inside the viewport', async ({ page }) => {
  const container = page.getByTestId('floating-scroll-container');
  const select = page.getByRole('combobox', { name: 'Scrollable release channel' });
  await container.scrollIntoViewIfNeeded();
  await container.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await select.click();

  const listbox = page.getByRole('listbox', { name: 'Scrollable release channel' });
  await expect(listbox).toBeVisible();
  await expect.poll(async () => page.evaluate(() => {
    const containerElement = document.querySelector<HTMLElement>('[data-testid="floating-scroll-container"]');
    const listboxElement = document.querySelector<HTMLElement>('[role="listbox"][data-side]');
    if (!containerElement || !listboxElement) return false;
    const containerRect = containerElement.getBoundingClientRect();
    const listboxRect = listboxElement.getBoundingClientRect();
    return listboxRect.top < containerRect.top || listboxRect.bottom > containerRect.bottom;
  })).toBe(true);

  await container.evaluate((element) => { element.scrollTop -= 24; });
  await expect.poll(async () => {
    const triggerRect = await select.boundingBox();
    const menuRect = await listbox.boundingBox();
    const side = await listbox.getAttribute('data-side');
    if (!triggerRect || !menuRect || !side) return -1;
    return side === 'bottom'
      ? Math.abs(menuRect.y - (triggerRect.y + triggerRect.height) - 9)
      : Math.abs(triggerRect.y - (menuRect.y + menuRect.height) - 9);
  }).toBeLessThan(1);

  await select.press('Escape');
  const tooltipTrigger = page.getByRole('button', { name: 'Viewport edge help' });
  await tooltipTrigger.evaluate((element) => element.scrollIntoView({ block: 'start', inline: 'end' }));
  await tooltipTrigger.focus();
  const tooltip = page.getByRole('tooltip').filter({ hasText: 'This tooltip shifts and flips' });
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveAttribute('data-side', 'bottom');

  const bounds = await tooltip.boundingBox();
  const viewport = page.viewportSize();
  expect(bounds).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(7);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport!.width - 7);

  await tooltip.hover();
  await expect(tooltip).toBeVisible();
});

test('hover-triggered tooltip is dismissible with Escape and reopens after attention leaves', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Viewport edge help' });
  const tooltip = page.getByRole('tooltip').filter({ hasText: 'This tooltip shifts and flips' });

  await trigger.hover();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tooltip).toBeHidden();

  await page.getByRole('heading', { name: 'Floating overlay fixture' }).hover();
  await trigger.hover();
  await expect(tooltip).toBeVisible();
});

test('right-to-left direction preserves logical floating alignment and keyboard order', async ({ page }) => {
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; });

  const select = page.getByRole('combobox', { name: 'Release channel', exact: true });
  await select.click();
  const listbox = page.getByRole('listbox', { name: 'Release channel' });
  await expect(listbox).toBeVisible();

  const triggerBox = await select.boundingBox();
  const listboxBox = await listbox.boundingBox();
  expect(triggerBox).not.toBeNull();
  expect(listboxBox).not.toBeNull();
  expect(listboxBox!.x + listboxBox!.width).toBeCloseTo(triggerBox!.x + triggerBox!.width, 0);

  await select.press('Escape');
  const composite = page.getByRole('region', { name: 'Composite accessibility fixture' });
  const overview = composite.getByRole('tab', { name: 'Overview' });
  await overview.focus();
  await overview.press('ArrowLeft');
  await expect(composite.getByRole('tab', { name: 'Usage' })).toBeFocused();
  await expect(page.getByTestId('composite-tab-active')).toHaveText('1');
});

test('forced-colors tokens keep focus and contrast semantics available', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  const trigger = page.getByRole('combobox', { name: 'Release channel', exact: true });
  await trigger.focus();

  const tokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const control = document.querySelector<HTMLElement>('[role="combobox"]');
    const style = control ? getComputedStyle(control) : null;
    return {
      ink: root.getPropertyValue('--webase-color-ink').trim(),
      surface: root.getPropertyValue('--webase-color-surface').trim(),
      brand: root.getPropertyValue('--webase-color-brand').trim(),
      outlineStyle: style?.outlineStyle,
      outlineWidth: style?.outlineWidth
    };
  });

  expect(tokens).toMatchObject({ ink: 'CanvasText', surface: 'Canvas', brand: 'LinkText' });
  expect(tokens.outlineStyle).toBe('solid');
  expect(tokens.outlineWidth).toBe('2px');

  const scan = await new AxeBuilder({ page }).include('main').analyze();
  const violations = scan.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
});

test('localized copy wraps without horizontal overflow at 200 percent zoom', async ({ page }) => {
  // A 195px CSS viewport models a 390px device at 200% browser zoom while
  // preserving normal reflow instead of scaling the entire document canvas.
  await page.setViewportSize({ width: 195, height: 844 });
  const fixture = page.getByTestId('i18n-fixture');
  await fixture.evaluate((element) => {
    const main = document.querySelector<HTMLElement>('main');
    if (main) main.style.gridTemplateColumns = 'minmax(0, 1fr)';
    document.querySelectorAll('main > *:not([data-testid="i18n-fixture"])').forEach((section) => {
      (section as HTMLElement).style.display = 'none';
    });
    element.scrollIntoView({ block: 'start' });
  });

  const metrics = await page.evaluate(() => {
    const root = document.documentElement;
    const fixtureElement = document.querySelector<HTMLElement>('[data-testid="i18n-fixture"]');
    return {
      documentOverflow: root.scrollWidth > root.clientWidth,
      fixtureOverflow: fixtureElement ? fixtureElement.scrollWidth > fixtureElement.clientWidth : true,
      tabs: document.querySelectorAll('[data-testid="i18n-fixture"] [role="tab"]').length
    };
  });

  expect(metrics.documentOverflow, JSON.stringify(metrics)).toBe(false);
  expect(metrics.fixtureOverflow, JSON.stringify(metrics)).toBe(false);
  expect(metrics.tabs).toBe(3);
  await expect(page.getByRole('combobox', { name: 'قناة الإصدار والبيئة المستهدفة' })).toBeVisible();
  await expect(fixture.getByText('٦٢ بالمئة', { exact: true })).toBeVisible();
  await expect(fixture.getByText('٣٠ درجة', { exact: true })).toBeVisible();
  await expect(fixture.getByText('٧ من ٢٠', { exact: true })).toBeVisible();
  await expect(fixture.getByRole('button', { name: 'الصفحة ٢' })).toHaveText('٢');
});

test('dialog reports confirm, cancel, escape, and backdrop actions only', async ({ page }) => {
  const result = page.getByTestId('dialog-result');
  const openButton = page.getByRole('button', { name: 'Open dialog' });

  await openButton.click();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(openButton).toBeFocused();
  await expect(result).toHaveText('confirm');
  await expect(page.getByTestId('dialog-clicks')).toHaveText('1');
  await expect(page.getByTestId('dialog-closes')).toHaveText('1');

  await openButton.click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(result).toHaveText('cancel');

  await openButton.click();
  await page.keyboard.press('Escape');
  await expect(result).toHaveText('cancel');

  await openButton.click();
  await page.mouse.click(6, 6);
  await expect(result).toHaveText('cancel');

  await openButton.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.evaluate(() => (window as Window & { closeFixtureDialog?: () => void }).closeFixtureDialog?.());
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(openButton).toBeFocused();
  await expect(result).toHaveText('none');
});

test('select does not display an option that does not match its bound value', async ({ page }) => {
  await page.getByRole('button', { name: 'Set invalid selection' }).click();

  await expect(page.getByRole('combobox', { name: 'Release channel', exact: true })).toContainText('Select an option');
});

test('card and empty-state actions never render as enabled inert controls', async ({ page }) => {
  await page.getByRole('button', { name: 'Run action' }).click();
  await expect(page.getByTestId('card-actions')).toHaveText('1');
  await expect(page.getByRole('button', { name: 'Hidden action' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Hidden empty action' })).toHaveCount(0);
});

test('toast auto-dismiss pauses on hover and restarts after pointer leave', async ({ page }) => {
  await page.getByRole('button', { name: 'Show timed toast' }).click();
  const timedRegion = page.getByRole('status').filter({ hasText: 'Timed fixture' });
  const toast = timedRegion.locator('aside');

  await expect(toast).toBeVisible();
  await toast.hover();
  await page.waitForTimeout(750);
  await expect(toast).toBeVisible();

  await page.getByRole('heading', { name: 'Composite accessibility fixture' }).hover();
  await page.waitForTimeout(300);
  await expect(toast).toBeVisible();
  await expect(toast).toBeHidden({ timeout: 700 });
});

test('tabs and accordion share wrapping roving focus and react to collection changes', async ({ page }) => {
  const compositeFixture = page.getByRole('region', { name: 'Composite accessibility fixture' });
  const tabList = compositeFixture.getByRole('tablist', { name: 'Fixture tabs' });
  const overviewTab = tabList.getByRole('tab', { name: 'Overview' });
  const releaseTab = tabList.getByRole('tab', { name: 'Release' });

  await overviewTab.focus();
  await overviewTab.press('ArrowLeft');
  await expect(releaseTab).toBeFocused();
  await expect(releaseTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('composite-tab-active')).toHaveText('2');

  const firstAccordionTrigger = compositeFixture.getByRole('button', { name: /Keyboard contract/ });
  const lastAccordionTrigger = compositeFixture.getByRole('button', { name: /Dynamic collection/ });
  await firstAccordionTrigger.focus();
  await firstAccordionTrigger.press('ArrowUp');
  await expect(lastAccordionTrigger).toBeFocused();
  await expect(firstAccordionTrigger).toHaveAttribute('aria-expanded', 'true');
  await expect(lastAccordionTrigger).toHaveAttribute('aria-expanded', 'false');

  await compositeFixture.getByRole('button', { name: 'Remove last composite item' }).click();
  await expect(releaseTab).toHaveCount(0);
  await expect(lastAccordionTrigger).toHaveCount(0);
  await expect(overviewTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('composite-tab-active')).toHaveText('0');
});

test('the example brand theme changes semantics without changing component geometry', async ({ page }) => {
  const action = page.getByRole('button', { name: 'Brand action' });
  const lightBox = await action.boundingBox();

  await page.getByRole('button', { name: 'Use brand theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'brand');

  const brandTokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      canvas: style.getPropertyValue('--webase-color-canvas').trim(),
      surface: style.getPropertyValue('--webase-color-surface').trim(),
      brand: style.getPropertyValue('--webase-color-brand').trim(),
      controlHeight: style.getPropertyValue('--webase-component-button-height').trim()
    };
  });
  expect(brandTokens).toEqual({
    canvas: '#f4f6f2',
    surface: '#fbfcf8',
    brand: '#315c52',
    controlHeight: '44px'
  });

  const brandBox = await action.boundingBox();
  expect(brandBox && lightBox ? { width: brandBox.width, height: brandBox.height } : null).toEqual(
    lightBox ? { width: lightBox.width, height: lightBox.height } : null
  );
});

test('reduced motion makes component transitions and entrances static', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();

  const select = page.getByRole('combobox', { name: 'Release channel', exact: true });
  await select.click();
  const tooltipTrigger = page.getByRole('button', { name: 'Keyboard help' });
  await tooltipTrigger.focus();

  const samples: Array<[string, Locator]> = [
    ['field', page.getByTestId('field-input')],
    ['button', page.getByRole('button', { name: 'Hover action' })],
    ['card', page.getByRole('article').filter({ hasText: 'Action card' })],
    ['pagination', page.getByRole('button', { name: 'Page 2' })],
    ['radio', page.getByTestId('radio-input').locator('+ .ds-radio-dot')],
    ['select trigger', select],
    ['select menu', page.getByRole('listbox', { name: 'Release channel' })],
    ['toast', page.getByRole('status').filter({ hasText: 'Fixture ready' }).locator('aside')],
    ['tooltip', page.getByRole('tooltip').filter({ hasText: 'Press Escape' })]
  ];

  for (const [name, locator] of samples) await expectStaticMotion(locator, name);

  await select.press('Escape');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Open dialog' }).click();
  await expectStaticMotion(page.getByRole('dialog').locator('.ds-dialog'), 'dialog');
});

test('interactive controls meet the WCAG 2.2 minimum target size', async ({ page }) => {
  const targets: Array<[string, Locator]> = [
    ['check', page.getByTestId('check-input').locator('..')],
    ['radio', page.getByTestId('radio-input').locator('..')],
    ['switch', page.getByTestId('switch-input').locator('..')],
    ['slider', page.getByTestId('slider-input')],
    ['card action', page.getByRole('button', { name: 'Run action' })],
    ['action link', page.getByRole('link', { name: 'Back to form' })],
    ['icon button', page.getByRole('button', { name: 'Pressed icon action' })],
    ['pagination', page.getByRole('button', { name: 'Page 2' })],
    ['tab', page.getByRole('tab', { name: 'Behavior' })],
    ['accordion', page.getByRole('button', { name: /Keyboard contract/ })],
    ['select', page.getByRole('combobox', { name: 'Release channel', exact: true })],
    ['tooltip', page.getByRole('button', { name: 'Keyboard help' })],
    ['alert dismiss', page.getByRole('button', { name: 'Dismiss alert' })],
    ['toast dismiss', page.getByRole('button', { name: 'Dismiss notification' }).first()]
  ];

  for (const [name, locator] of targets) await expectMinimumTarget(locator, name);

  await page.getByRole('button', { name: 'Open dialog' }).click();
  await expectMinimumTarget(page.getByRole('button', { name: 'Close dialog' }), 'dialog close');
  await expectMinimumTarget(page.getByRole('button', { name: 'Cancel' }), 'dialog cancel');
  await expectMinimumTarget(page.getByRole('button', { name: 'Confirm' }), 'dialog confirm');
});

test('priority components have no serious or critical accessibility violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const trigger = page.getByRole('combobox', { name: 'Release channel', exact: true });
  await trigger.click();

  const openSelectScan = await new AxeBuilder({ page }).include('main').analyze();
  const openSelectViolations = openSelectScan.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(openSelectViolations, JSON.stringify(openSelectViolations, null, 2)).toEqual([]);

  await trigger.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');

  const tooltipTrigger = page.getByRole('button', { name: 'Keyboard help' });
  await tooltipTrigger.focus();
  await expect(page.getByRole('tooltip').filter({ hasText: 'Press Escape' })).toBeVisible();
  const openTooltipScan = await new AxeBuilder({ page }).include('main').analyze();
  const openTooltipViolations = openTooltipScan.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(openTooltipViolations, JSON.stringify(openTooltipViolations, null, 2)).toEqual([]);
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Open dialog' }).click();

  const openDialogScan = await new AxeBuilder({ page }).include('main').analyze();
  const openDialogViolations = openDialogScan.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(openDialogViolations, JSON.stringify(openDialogViolations, null, 2)).toEqual([]);
});

test.describe('coarse pointer input', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test('touch keeps hover-only motion off and preserves equivalent controls', async ({ page }) => {
    const media = await page.evaluate(() => ({
      coarse: matchMedia('(pointer: coarse)').matches,
      hover: matchMedia('(hover: hover)').matches
    }));
    expect(media).toEqual({ coarse: true, hover: false });

    const tooltipTrigger = page.getByRole('button', { name: 'Keyboard help' });
    await tooltipTrigger.focus();
    await expect(page.getByRole('tooltip').filter({ hasText: 'Press Escape' })).toBeVisible();
    await expect(tooltipTrigger).toBeFocused();

    const check = page.getByTestId('check-input');
    await check.locator('..').tap();
    await expect(check).not.toBeChecked();

    const action = page.getByRole('button', { name: 'Hover action' });
    await action.tap();
    await expect(action).toHaveCSS('transform', 'none');
    await expect(page.getByRole('article').filter({ hasText: 'Action card' })).toHaveCSS('transform', 'none');

    await expectMinimumTarget(check.locator('..'), 'coarse pointer check');
    await expectMinimumTarget(page.getByTestId('slider-input'), 'coarse pointer slider');
    await expectMinimumTarget(page.getByRole('button', { name: 'Run action' }), 'coarse pointer card action');
  });
});
