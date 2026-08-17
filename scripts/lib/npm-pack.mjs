/** Normalize npm pack --json output across npm's array and workspace-map formats. */
export function parseNpmPackOutput(output, workspace) {
  let parsed;

  try {
    parsed = JSON.parse(output);
  } catch (error) {
    throw new Error(`npm pack returned invalid JSON for ${workspace}`, { cause: error });
  }

  const candidates = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object'
      ? Object.values(parsed)
      : [];
  const pack = candidates.find((candidate) => candidate?.name === workspace) ?? candidates[0];

  if (!pack || typeof pack !== 'object') {
    throw new Error(`npm pack returned no package metadata for ${workspace}`);
  }

  return pack;
}
