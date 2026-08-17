export interface CollectionItem {
  disabled?: boolean;
}

/** Return the first enabled item while wrapping around the collection. */
export function findEnabledIndex<T extends CollectionItem>(items: readonly T[], start: number, direction: 1 | -1): number {
  if (items.length === 0) return -1;

  const length = items.length;
  const normalizedStart = ((Math.trunc(start) % length) + length) % length;

  for (let offset = 0; offset < length; offset += 1) {
    const index = (normalizedStart + offset * direction + length) % length;
    if (!items[index]?.disabled) return index;
  }

  return -1;
}

/** Normalize a controlled collection index, using -1 for an empty collection. */
export function normalizeIndex(value: number, length: number, fallback = 0): number {
  if (length <= 0) return -1;
  const safeFallback = Math.min(Math.max(Math.trunc(fallback), 0), length - 1);
  if (!Number.isInteger(value) || value < 0 || value >= length) return safeFallback;
  return value;
}

/** Move an index by a signed step and wrap it into the collection. */
export function wrapIndex(index: number, length: number, step: number): number {
  if (length <= 0) return -1;
  return ((Math.trunc(index) + Math.trunc(step)) % length + length) % length;
}
