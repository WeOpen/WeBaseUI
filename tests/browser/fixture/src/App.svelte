<script lang="ts">
  import { onMount } from 'svelte';
  import '@webaseui/core/theme.css';
  import '@webaseui/core/brand-theme.css';
  import {
    WeBaseAlert,
    WeBaseAccordion,
    WeBaseButton,
    WeBaseCard,
    WeBaseCheck,
    WeBaseDialog,
    WeBaseEmptyState,
    WeBaseField,
    WeBasePagination,
    WeBaseRadio,
    WeBaseProgress,
    WeBaseSelect,
    WeBaseSlider,
    WeBaseSwitch,
    WeBaseTabs,
    WeBaseTextarea,
    WeBaseToast,
    WeBaseTooltip
  } from '@webaseui/svelte';
  import VisualStates from './VisualStates.svelte';

  const channels = [
    { label: 'Stable', value: 'stable' },
    { label: 'Preview', value: 'preview' },
    { label: 'Paused', value: 'paused', disabled: true },
    { label: 'Production', value: 'production' },
    { label: 'Canary', value: 'canary' }
  ];

  const localizedChannels = [
    { label: 'مستقر ومستعد للنشر', value: 'stable' },
    { label: '预览与内部审核版本', value: 'preview' },
    { label: 'Pseudo-localized release candidate', value: 'candidate' }
  ];

  const localizedAccordionItems = [
    { title: 'ملخص التغيير', content: 'تفاصيل التغيير المترجمة.' },
    { title: '迁移与兼容性', content: '迁移步骤与兼容性说明。' }
  ];
  const arabicNumber = new Intl.NumberFormat('ar-EG', { useGrouping: false });

  let fieldValue = $state('Field notes');
  let textareaValue = $state('A portable form contract.');
  let checkValue = $state(true);
  let switchValue = $state(true);
  let sliderValue = $state(30);
  let radioValue = $state('standard');
  let selectValue = $state('stable');
  let selectChanges = $state(0);
  let floatingSelectValue = $state('stable');
  let formOutput = $state('');
  let dialogOpen = $state(false);
  let dialogResult = $state('none');
  let dialogClicks = $state(0);
  let dialogCloses = $state(0);
  let cardActions = $state(0);
  let toastOpen = $state(true);
  let timedToastOpen = $state(false);
  let compositeTabActive = $state(0);
  let compositeTabItems = $state(['Overview', 'Usage', 'Release']);
  let compositeTabPanels = $state(['Overview panel', 'Usage panel', 'Release panel']);
  let accordionItems = $state([
    { title: 'Keyboard contract', content: 'Arrow keys move between disclosure triggers.' },
    { title: 'Mounted panels', content: 'Controlled regions remain available to assistive technology.' },
    { title: 'Dynamic collection', content: 'Focus navigation uses the latest registered item order.' }
  ]);
  let localizedSelectValue = $state('stable');
  let localizedPage = $state(2);
  let localizedTab = $state(0);
  let localizedSliderValue = $state(30);
  let localizedTextareaValue = $state('ملاحظات');

  function localizedPageLabel(page: number) {
    return `الصفحة ${formatArabicNumber(page)}`;
  }

  function formatArabicNumber(value: number) {
    return arabicNumber.format(value);
  }

  function formatArabicSliderValue(value: number, unit: string) {
    return `${formatArabicNumber(value)} ${unit}`;
  }

  function formatArabicCount(current: number, maximum: number) {
    return `${formatArabicNumber(current)} من ${formatArabicNumber(maximum)}`;
  }

  function formatArabicPercent(value: number) {
    return `${formatArabicNumber(value)} بالمئة`;
  }

  function serializeForm(event: SubmitEvent) {
    event.preventDefault();
    if (!(event.currentTarget instanceof HTMLFormElement)) return;
    formOutput = JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)));
  }

  function openDialog() {
    dialogResult = 'none';
    dialogOpen = true;
  }

  function closeDialogProgrammatically() {
    dialogOpen = false;
  }

  function setFixtureTheme(theme: 'light' | 'brand') {
    document.documentElement.dataset.theme = theme;
  }

  function removeLastCompositeItem() {
    if (compositeTabItems.length <= 1 || accordionItems.length <= 1) return;
    compositeTabItems = compositeTabItems.slice(0, -1);
    compositeTabPanels = compositeTabPanels.slice(0, -1);
    accordionItems = accordionItems.slice(0, -1);
  }

  onMount(() => {
    const fixtureWindow = window as Window & { closeFixtureDialog?: () => void };
    fixtureWindow.closeFixtureDialog = closeDialogProgrammatically;
    return () => {
      delete fixtureWindow.closeFixtureDialog;
    };
  });
</script>

<main>
  <section aria-labelledby="form-heading">
    <h1 id="form-heading">Native form fixture</h1>
    <form id="fixture-form" onsubmit={serializeForm}>
      <WeBaseField label="Title" bind:value={fieldValue} inputProps={{ name: 'title', 'data-testid': 'field-input' }} />
      <WeBaseTextarea label="Notes" bind:value={textareaValue} textareaProps={{ name: 'notes', 'data-testid': 'textarea-input' }} />
      <WeBaseCheck label="Include notes" bind:checked={checkValue} inputProps={{ name: 'include', value: 'yes', 'data-testid': 'check-input' }} />
      <WeBaseSwitch label="Enable updates" bind:checked={switchValue} inputProps={{ name: 'updates', value: 'enabled', 'data-testid': 'switch-input' }} />
      <WeBaseSlider label="Coverage" bind:value={sliderValue} inputProps={{ name: 'coverage', 'data-testid': 'slider-input' }} />
      <div role="group" aria-label="Plan">
        <WeBaseRadio name="plan" label="Standard" value="standard" bind:selected={radioValue} inputProps={{ 'data-testid': 'radio-input' }} />
        <WeBaseRadio name="plan" label="Priority" value="priority" bind:selected={radioValue} />
      </div>
      <button data-testid="serialize-form" type="submit">Serialize form</button>
    </form>
    <WeBaseSelect
      label="Release channel"
      options={channels}
      bind:value={selectValue}
      name="channel"
      form="fixture-form"
      required
      selectProps={{ class: 'custom-native-select', 'data-testid': 'native-select', onchange: () => (selectChanges += 1) }}
    />
    <button type="button" onclick={() => (selectValue = 'missing')}>Set invalid selection</button>
    <output data-testid="form-output">{formOutput}</output>
    <output data-testid="select-changes">{selectChanges}</output>
  </section>

  <section aria-labelledby="dialog-heading">
    <h2 id="dialog-heading">Dialog fixture</h2>
    <div class="actions">
      <button type="button" onclick={openDialog}>Open dialog</button>
    </div>
    <output data-testid="dialog-result">{dialogResult}</output>
    <output data-testid="dialog-clicks">{dialogClicks}</output>
    <output data-testid="dialog-closes">{dialogCloses}</output>
    <WeBaseDialog
      bind:open={dialogOpen}
      title="Publish changes?"
      message="This verifies explicit action callbacks."
      onconfirm={() => (dialogResult = 'confirm')}
      oncancel={() => (dialogResult = 'cancel')}
      onclick={() => (dialogClicks += 1)}
      onclose={() => (dialogCloses += 1)}
    />
  </section>

  <section aria-labelledby="action-heading">
    <h2 id="action-heading">Action fixture</h2>
    <WeBaseCard title="Action card" action="Run action" onaction={() => (cardActions += 1)} />
    <WeBaseCard title="Inert card" action="Hidden action" />
    <WeBaseEmptyState title="No handler" actionLabel="Hidden empty action" />
    <output data-testid="card-actions">{cardActions}</output>
  </section>

  <section aria-labelledby="composite-heading">
    <h2 id="composite-heading">Composite accessibility fixture</h2>
    <WeBaseAccordion items={accordionItems} />
    <WeBaseTabs items={compositeTabItems} panels={compositeTabPanels} label="Fixture tabs" bind:active={compositeTabActive} />
    <button type="button" onclick={removeLastCompositeItem}>Remove last composite item</button>
    <output data-testid="composite-tab-active">{compositeTabActive}</output>
    <WeBaseTooltip label="Keyboard help" text="Press Escape to dismiss this description." />
    <WeBaseToast bind:open={toastOpen} title="Fixture ready" message="The live region is mounted and testable." />
    <button type="button" onclick={() => (timedToastOpen = true)}>Show timed toast</button>
    <WeBaseToast
      bind:open={timedToastOpen}
      title="Timed fixture"
      message="Hover pauses this notification before a fresh countdown resumes."
      duration={600}
    />
  </section>

  <section aria-labelledby="theme-heading" data-testid="brand-theme-fixture">
    <h2 id="theme-heading">Brand theme fixture</h2>
    <p>Semantic colors change while component geometry stays on the shared contract.</p>
    <div class="actions">
      <button type="button" onclick={() => setFixtureTheme('brand')}>Use brand theme</button>
      <button type="button" onclick={() => setFixtureTheme('light')}>Use light theme</button>
    </div>
    <WeBaseButton label="Brand action" variant="ink" />
  </section>

  <section aria-labelledby="floating-heading" data-testid="floating-overlay-fixture">
    <h2 id="floating-heading">Floating overlay fixture</h2>
    <p>Manual popovers stay anchored across nested scrolling and viewport edges.</p>
    <div class="floating-scroll" data-testid="floating-scroll-container">
      <div class="floating-spacer" aria-hidden="true"></div>
      <div class="floating-edge-row">
        <WeBaseSelect label="Scrollable release channel" options={channels} bind:value={floatingSelectValue} />
        <div class="floating-right-edge">
          <WeBaseTooltip label="Viewport edge help" text="This tooltip shifts and flips without leaving the visible viewport." />
        </div>
      </div>
    </div>
  </section>

  <VisualStates />

  <section class="i18n-fixture" data-testid="i18n-fixture" dir="rtl" aria-labelledby="i18n-heading">
    <h2 id="i18n-heading">Internationalized copy fixture</h2>
    <div class="i18n-grid">
      <WeBaseField
        label="اسم المشروع وإصدار الترحيل طويل للغاية"
        help="استخدم وصفاً واضحاً حتى يتمكن فريق المراجعة من فهم التغيير دون فقدان أي معلومة."
        required
        requiredLabel="مطلوب"
      />
      <WeBaseSelect
        label="قناة الإصدار والبيئة المستهدفة"
        options={localizedChannels}
        bind:value={localizedSelectValue}
      />
      <WeBaseTabs
        items={['ملخص التغيير والتوافق', '使用说明与迁移步骤', 'Pseudo localized review copy']}
        panels={['لوحة الملخص', '迁移面板', 'Pseudo panel']}
        label="طرق عرض المستند"
        bind:active={localizedTab}
      />
      <WeBaseAccordion items={localizedAccordionItems} formatIndex={formatArabicNumber} />
      <WeBaseAlert
        title="مراجعة مطلوبة قبل النشر"
        message="这是一段很长的中文提示，用来验证在窄屏和放大文本时不会被操作按钮遮挡或产生横向滚动。"
        tone="warning"
      />
      <WeBaseCard
        eyebrow="محتوى مترجم"
        title="عنوان طويل يلتف داخل البطاقة دون اقتطاع"
        body="يجب أن تبقى الرسالة كاملة وقابلة للقراءة عند استخدام العربية أو الصينية أو نص تجريبي مطول."
        action="فتح تفاصيل الترحيل"
        onaction={() => undefined}
      />
      <WeBaseEmptyState
        kicker="أرشيف فارغ"
        title="لا توجد ملاحظات في هذا الدرج"
        message="ابدأ ملاحظة جديدة أو عدّل عوامل التصفية الحالية لمتابعة العمل."
        actionLabel="إنشاء ملاحظة جديدة"
        onclick={() => undefined}
      />
      <WeBasePagination
        total={4}
        bind:page={localizedPage}
        label="تنقل الصفحات"
        previousLabel="الصفحة السابقة"
        nextLabel="الصفحة التالية"
        getPageLabel={localizedPageLabel}
        formatPage={formatArabicNumber}
      />
      <WeBaseSlider
        label="كثافة الواجهة"
        bind:value={localizedSliderValue}
        unit="درجة"
        formatValue={formatArabicSliderValue}
      />
      <WeBaseTextarea
        label="ملاحظات المراجعة"
        bind:value={localizedTextareaValue}
        maxLength={20}
        formatCount={formatArabicCount}
      />
      <WeBaseProgress value={62} label="نسبة اكتمال الترحيل والاختبارات" formatValue={formatArabicPercent} />
    </div>
  </section>
</main>

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) { margin: 0; color: var(--ink); background: var(--paper); font-family: var(--font); }
  main { display: grid; max-width: 900px; gap: 32px; margin: 0 auto; padding: 32px 20px 80px; }
  section { display: grid; gap: 16px; min-width: 0; }
  form { display: grid; gap: 16px; }
  h1, h2 { margin: 0; overflow-wrap: anywhere; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; }
  button { min-height: 40px; padding: 0 12px; }
  output { overflow-wrap: anywhere; font-family: var(--mono); }
  .floating-scroll { height: 180px; overflow: auto; padding: 12px; border: 1px solid var(--hairline-strong); background: var(--surface); }
  .floating-spacer { height: 150px; }
  .floating-edge-row { display: grid; grid-template-columns: minmax(180px, 1fr) auto; align-items: end; gap: 16px; }
  .floating-right-edge { display: flex; justify-content: flex-end; }
  .i18n-fixture { grid-template-columns: minmax(0, 1fr); width: 100%; }
  .i18n-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; min-width: 0; }
  .i18n-grid > :global(*) { min-width: 0; }
  .i18n-grid > :global(.ds-tabs), .i18n-grid > :global(.ds-accordion), .i18n-grid > :global(.ds-alert), .i18n-grid > :global(.ds-empty-state), .i18n-grid > :global(.ds-progress-wrap) { grid-column: 1 / -1; }

  @media (max-width: 520px) {
    .floating-edge-row { grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
    .i18n-grid { grid-template-columns: minmax(0, 1fr); }
    .i18n-grid > :global(.ds-tabs), .i18n-grid > :global(.ds-accordion), .i18n-grid > :global(.ds-alert), .i18n-grid > :global(.ds-empty-state), .i18n-grid > :global(.ds-progress-wrap) { grid-column: auto; }
  }
</style>
