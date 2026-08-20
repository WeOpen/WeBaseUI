import { describe, expect, it } from 'vitest';
import { inlineParts, parseFields } from '../../apps/docs/src/lib/data/reference-utils.js';

describe('parseFields', () => {
  it('parses named fields and joins indented continuation lines', () => {
    expect(parseFields(`
- Props: \`label\`, \`disabled\`
  and native attributes
- Boundary: keeps the root stable
`)).toEqual([
      { label: 'Props', value: '`label`, `disabled` and native attributes' },
      { label: 'Boundary', value: 'keeps the root stable' }
    ]);
  });

  it('preserves colons inside the value and labels unlabeled bullets as Contract', () => {
    expect(parseFields(`
- Events: callback: event
- Keyboard behavior remains documented
`)).toEqual([
      { label: 'Events', value: 'callback: event' },
      { label: 'Contract', value: 'Keyboard behavior remains documented' }
    ]);
  });

  it('ignores prose outside the bullet contract', () => {
    expect(parseFields('Introduction only.')).toEqual([]);
  });
});

describe('inlineParts', () => {
  it('marks alternating backtick segments as inline code', () => {
    expect(inlineParts('Use `open` with `onclose`.')).toEqual([
      { text: 'Use ', code: false },
      { text: 'open', code: true },
      { text: ' with ', code: false },
      { text: 'onclose', code: true },
      { text: '.', code: false }
    ]);
  });

  it('omits empty segments without changing code parity', () => {
    expect(inlineParts('`value`')).toEqual([{ text: 'value', code: true }]);
  });
});
