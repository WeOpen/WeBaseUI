export interface ParsedContractField {
  label: string;
  value: string;
}

export function parseFields(body: string): ParsedContractField[] {
  const bullets: string[] = [];
  let current = '';

  for (const line of body.split(/\r?\n/)) {
    if (line.startsWith('- ')) {
      if (current) bullets.push(current);
      current = line.slice(2).trim();
    } else if (current && /^\s{2,}\S/.test(line)) {
      current += ` ${line.trim()}`;
    }
  }

  if (current) bullets.push(current);

  return bullets.map((bullet) => {
    const separator = bullet.indexOf(': ');
    if (separator < 0) return { label: 'Contract', value: bullet };
    return {
      label: bullet.slice(0, separator),
      value: bullet.slice(separator + 2)
    };
  });
}

export function inlineParts(value: string) {
  return value
    .split('`')
    .map((text, index) => ({ text, code: index % 2 === 1 }))
    .filter(({ text }) => text.length > 0);
}
