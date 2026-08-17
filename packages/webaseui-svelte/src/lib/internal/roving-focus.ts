export type RovingFocusOrientation = 'horizontal' | 'vertical';
export type RovingFocusDirection = 'ltr' | 'rtl';

type IsItemDisabled<T> = (item: T, index: number) => boolean;

function findEnabledIndex<T>(
  items: readonly T[],
  start: number,
  direction: 1 | -1,
  isItemDisabled: IsItemDisabled<T>
): number {
  if (items.length === 0) return -1;

  const length = items.length;
  const normalizedStart = ((Math.trunc(start) % length) + length) % length;

  for (let offset = 0; offset < length; offset += 1) {
    const index = (normalizedStart + offset * direction + length) % length;
    const item = items[index];
    if (item !== undefined && !isItemDisabled(item, index)) return index;
  }

  return -1;
}

/**
 * Resolve APG-style roving focus keys to the next enabled item. Unsupported
 * keys return undefined so components can leave native keyboard behavior alone.
 */
export function findRovingFocusIndex<T>(
  items: readonly T[],
  currentIndex: number,
  key: string,
  orientation: RovingFocusOrientation,
  isItemDisabled: IsItemDisabled<T> = () => false,
  inlineDirection: RovingFocusDirection = 'ltr'
): number | undefined {
  if (key === 'Home') return findEnabledIndex(items, 0, 1, isItemDisabled);
  if (key === 'End') return findEnabledIndex(items, items.length - 1, -1, isItemDisabled);

  const previousKey = orientation === 'horizontal'
    ? inlineDirection === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
    : 'ArrowUp';
  const nextKey = orientation === 'horizontal'
    ? inlineDirection === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
    : 'ArrowDown';
  if (key !== previousKey && key !== nextKey) return;

  const movement = key === nextKey ? 1 : -1;
  return findEnabledIndex(items, currentIndex + movement, movement, isItemDisabled);
}
