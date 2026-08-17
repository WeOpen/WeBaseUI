import type { WeBaseSelectOption } from '../types.js';
import { findEnabledIndex } from '../utils/collection.js';

/** Resolve the controlled value to an enabled option, or the first fallback. */
export function findSelectedOptionIndex(options: readonly WeBaseSelectOption[], value: string): number {
  const selectedIndex = options.findIndex((option) => option.value === value);
  if (selectedIndex >= 0 && !options[selectedIndex]?.disabled) return selectedIndex;
  return findEnabledIndex(options, 0, 1);
}
