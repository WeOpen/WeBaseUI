import type { TimeoutScheduler } from './timing.js';

type ItemText<T> = (item: T, index: number) => string;
type IsItemDisabled<T> = (item: T, index: number) => boolean;

/** Find the first enabled prefix match from a cyclic collection position. */
export function findTypeaheadMatchIndex<T>(
  items: readonly T[],
  query: string,
  startIndex: number,
  itemText: ItemText<T>,
  isItemDisabled: IsItemDisabled<T> = () => false
): number {
  if (items.length === 0 || !query) return -1;

  const normalizedQuery = query.toLocaleLowerCase();
  const normalizedStart = ((Math.trunc(startIndex) % items.length) + items.length) % items.length;

  for (let offset = 0; offset < items.length; offset += 1) {
    const index = (normalizedStart + offset) % items.length;
    const item = items[index];
    if (
      item !== undefined &&
      !isItemDisabled(item, index) &&
      itemText(item, index).toLocaleLowerCase().startsWith(normalizedQuery)
    ) return index;
  }

  return -1;
}

/**
 * Keep the short-lived typeahead query outside component state. Repeating one
 * character cycles to the next match; adding a different character refines the
 * current match until the reset delay expires.
 */
export function createTypeaheadController<Handle>(
  scheduler: TimeoutScheduler<Handle>,
  resetDelay = 500
) {
  let query = '';
  let resetHandle: Handle;
  let resetPending = false;

  function cancelReset() {
    if (!resetPending) return;
    resetPending = false;
    scheduler.clearTimeout(resetHandle);
  }

  function reset() {
    cancelReset();
    query = '';
  }

  function search<T>(
    items: readonly T[],
    currentIndex: number,
    key: string,
    itemText: ItemText<T>,
    isItemDisabled: IsItemDisabled<T> = () => false
  ): number | undefined {
    if (key.length !== 1 || !/\S/.test(key)) return;

    const normalizedKey = key.toLocaleLowerCase();
    const repeatedCharacter = query.length > 0 && Array.from(query).every((character) => character === normalizedKey);
    query = repeatedCharacter ? normalizedKey : `${query}${normalizedKey}`;

    cancelReset();
    resetPending = true;
    resetHandle = scheduler.setTimeout(() => {
      query = '';
      resetPending = false;
    }, resetDelay);

    const startIndex = repeatedCharacter && currentIndex >= 0 ? currentIndex + 1 : Math.max(currentIndex, 0);
    return findTypeaheadMatchIndex(items, query, startIndex, itemText, isItemDisabled);
  }

  return { reset, search };
}
