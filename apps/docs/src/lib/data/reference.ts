import contractSource from '../../../../../packages/webaseui-svelte/API_CONTRACT.md?raw';
import packageSource from '../../../../../packages/webaseui-svelte/package.json?raw';
import { inlineParts, parseFields, type ParsedContractField } from './reference-utils.js';

export { inlineParts, parseFields } from './reference-utils.js';

export const componentGroups = {
  WeBaseAccordion: 'Disclosure',
  WeBaseAlert: 'Feedback',
  WeBaseBadge: 'Status',
  WeBaseBreadcrumbs: 'Navigation',
  WeBaseButton: 'Action',
  WeBaseCard: 'Surface',
  WeBaseCheck: 'Selection',
  WeBaseDialog: 'Overlay',
  WeBaseDivider: 'Structure',
  WeBaseEmptyState: 'Content',
  WeBaseField: 'Form',
  WeBaseIcon: 'Foundation',
  WeBaseIconButton: 'Action',
  WeBaseLink: 'Navigation',
  WeBaseLoader: 'Feedback',
  WeBasePagination: 'Navigation',
  WeBaseProgress: 'Feedback',
  WeBaseRadio: 'Selection',
  WeBaseSectionHeader: 'Structure',
  WeBaseSelect: 'Form',
  WeBaseSkeleton: 'Feedback',
  WeBaseSlider: 'Form',
  WeBaseSwitch: 'Selection',
  WeBaseTag: 'Navigation',
  WeBaseTabs: 'Navigation',
  WeBaseTextarea: 'Form',
  WeBaseToast: 'Feedback',
  WeBaseTooltip: 'Overlay'
} as const;

export type ComponentName = keyof typeof componentGroups;

export const groupOrder = [
  'Action',
  'Content',
  'Disclosure',
  'Feedback',
  'Form',
  'Foundation',
  'Navigation',
  'Overlay',
  'Selection',
  'Status',
  'Structure',
  'Surface'
] as const;

export type ContractField = ParsedContractField;

export interface ComponentReference {
  name: ComponentName;
  shortName: string;
  slug: string;
  group: (typeof componentGroups)[ComponentName];
  summary: string;
  fields: ContractField[];
  example: string;
  searchText: string;
}

const usageExamples: Record<ComponentName, string> = {
  WeBaseAccordion: `<WeBaseAccordion items={sections} bind:open />`,
  WeBaseAlert: `<WeBaseAlert title="Saved" tone="success" dismissible />`,
  WeBaseBadge: `<WeBaseBadge label="Stable" variant="canonical" />`,
  WeBaseBreadcrumbs: `<WeBaseBreadcrumbs items={trail} />`,
  WeBaseButton: `<WeBaseButton label="Save changes" variant="ink" />`,
  WeBaseCard: `<WeBaseCard title="Portable surface" body="Composable content." />`,
  WeBaseCheck: `<WeBaseCheck label="Release notes" bind:checked />`,
  WeBaseDialog: `<WeBaseDialog bind:open title="Confirm release" />`,
  WeBaseDivider: `<WeBaseDivider label="Public exports" />`,
  WeBaseEmptyState: `<WeBaseEmptyState title="No results" onclick={createItem} />`,
  WeBaseField: `<WeBaseField label="Project name" bind:value />`,
  WeBaseIcon: `<WeBaseIcon name="arrow-up-right" size={18} />`,
  WeBaseIconButton: `<WeBaseIconButton label="Bookmark" icon="bookmark" bind:pressed />`,
  WeBaseLink: `<WeBaseLink href="/guide" label="Read guide" variant="action" />`,
  WeBaseLoader: `<WeBaseLoader label="Checking contract" />`,
  WeBasePagination: `<WeBasePagination total={8} bind:page />`,
  WeBaseProgress: `<WeBaseProgress label="Coverage" value={72} />`,
  WeBaseRadio: `<WeBaseRadio name="channel" label="Stable" value="stable" bind:selected />`,
  WeBaseSectionHeader: `<WeBaseSectionHeader kicker="Reference" title="Components" />`,
  WeBaseSelect: `<WeBaseSelect label="Channel" options={channels} bind:value />`,
  WeBaseSkeleton: `<WeBaseSkeleton rows={3} media />`,
  WeBaseSlider: `<WeBaseSlider label="Density" bind:value />`,
  WeBaseSwitch: `<WeBaseSwitch label="Dark theme" bind:checked />`,
  WeBaseTag: `<WeBaseTag label="Navigation" href="/components" count="05" />`,
  WeBaseTabs: `<WeBaseTabs items={labels} panels={content} bind:active />`,
  WeBaseTextarea: `<WeBaseTextarea label="Notes" bind:value />`,
  WeBaseToast: `<WeBaseToast bind:open title="Saved locally" />`,
  WeBaseTooltip: `<WeBaseTooltip label="Details" text="Press Escape to dismiss." />`
};

function isComponentName(value: string): value is ComponentName {
  return value in componentGroups;
}

const sectionPattern = /^### (WeBase[A-Za-z]+)\s*$([\s\S]*?)(?=^### |^## Change policy)/gm;

export const components: ComponentReference[] = Array.from(contractSource.matchAll(sectionPattern)).flatMap((match) => {
  const name = match[1];
  if (!name || !isComponentName(name)) return [];

  const fields = parseFields(match[2] ?? '');
  const boundary = fields.find((field) => field.label === 'Boundary')?.value;
  const rawSummary = boundary ?? fields.at(-1)?.value ?? 'Public component contract.';
  const summary = `${rawSummary.charAt(0).toLocaleUpperCase()}${rawSummary.slice(1)}`;
  const shortName = name.replace(/^WeBase/, '');
  const slug = shortName.toLocaleLowerCase();
  const group = componentGroups[name];
  const example = usageExamples[name];

  return [{
    name,
    shortName,
    slug,
    group,
    summary,
    fields,
    example,
    searchText: `${name} ${shortName} ${group} ${fields.map(({ label, value }) => `${label} ${value}`).join(' ')}`.toLocaleLowerCase()
  }];
});

if (components.length !== 28) {
  throw new Error(`Expected 28 component contracts, found ${components.length}.`);
}

export const packageVersion = (JSON.parse(packageSource) as { version: string }).version;
