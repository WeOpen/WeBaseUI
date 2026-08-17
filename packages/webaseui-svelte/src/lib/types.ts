/** One disclosure entry rendered by WeBaseAccordion. */
export interface WeBaseAccordionItem {
  title: string;
  content: string;
}

/** One navigation entry rendered by WeBaseBreadcrumbs. */
export interface WeBaseBreadcrumbItem {
  label: string;
  href?: string;
}

/** One choice rendered by WeBaseSelect. Values must be unique within a select. */
export interface WeBaseSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

/** Produces an accessible label for a numbered pagination control. */
export type WeBasePageLabel = (page: number) => string;

/** Formats a visible numeric value using the consumer's locale and notation. */
export type WeBaseNumberFormatter = (value: number) => string;

/** Formats a slider value together with its consumer-defined unit. */
export type WeBaseSliderValueFormatter = (value: number, unit: string) => string;

/** Formats a current and maximum character count. */
export type WeBaseCountFormatter = (current: number, maximum: number) => string;
