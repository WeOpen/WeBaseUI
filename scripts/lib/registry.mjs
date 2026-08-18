const SLSA_PROVENANCE_PREDICATE = 'https://slsa.dev/provenance/v1';

function defaultSleep(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export function parseRegistryVersion(raw, packageSpec) {
  const parsed = JSON.parse(raw);
  const version = Array.isArray(parsed) ? parsed.at(-1) : parsed;
  if (typeof version !== 'string' || version.length === 0) {
    throw new Error(`Registry did not return a version for ${packageSpec}`);
  }
  return version;
}

export function hasSlsaProvenance(raw) {
  const parsed = raw ? JSON.parse(raw) : null;
  const metadata = Array.isArray(parsed) ? parsed.at(-1) : parsed;
  return metadata?.provenance?.predicateType === SLSA_PROVENANCE_PREDICATE;
}

export async function retryRegistryLookup(
  lookup,
  { attempts = 6, delayMs = 5_000, sleep = defaultSleep, onRetry = () => {} } = {}
) {
  if (!Number.isInteger(attempts) || attempts < 1) throw new Error('Registry retry attempts must be a positive integer.');
  if (!Number.isInteger(delayMs) || delayMs < 0) throw new Error('Registry retry delay must be a non-negative integer.');

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await lookup();
    } catch (error) {
      if (attempt === attempts) throw error;
      onRetry({ attempt, attempts, delayMs, error });
      await sleep(delayMs);
    }
  }

  throw new Error('Registry lookup exhausted without returning a result.');
}
