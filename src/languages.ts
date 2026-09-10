import de from './data/names/de.js';
import en from './data/names/en.js';
import type { LanguageCode } from './types.js';

/** Language codes that ship with the package. */
export const Language = Object.freeze({
  GERMAN: 'de',
  ENGLISH: 'en',
});

const registry = new Map<string, Readonly<Record<string, string>>>([
  ['de', de],
  ['en', en],
]);

let revision = 0;

/** Increases whenever the language registry changes, so caches can be dropped. */
export function getRevision(): number {
  return revision;
}

export function hasLanguage(code: LanguageCode): boolean {
  return registry.has(String(code).toLowerCase());
}

export function getLanguages(): string[] {
  return [...registry.keys()].sort();
}

function unknownLanguage(code: unknown): RangeError {
  return new RangeError(
    `Unknown language: "${String(code)}". Registered languages: ${getLanguages().join(', ')}.`
  );
}

/** Returns the language code in its canonical form, or throws. */
export function assertLanguage(code: LanguageCode): string {
  if (typeof code === 'string' && registry.has(code)) return code;
  const language = String(code).toLowerCase();
  if (!registry.has(language)) throw unknownLanguage(code);
  return language;
}

export function getLanguageNames(code: LanguageCode): Readonly<Record<string, string>> {
  const names =
    typeof code === 'string' && registry.has(code)
      ? registry.get(code)
      : registry.get(String(code).toLowerCase());
  if (!names) throw unknownLanguage(code);
  return names;
}

/**
 * Adds or replaces a set of country names. Keys are ISO 3166-1 alpha-2 codes;
 * codes that are left out fall back to the English name.
 *
 * @example
 * registerLanguage('fr', { de: 'Allemagne', fr: 'France' });
 */
export function registerLanguage(
  code: LanguageCode,
  names: Record<string, string>
): void {
  const language = String(code).trim().toLowerCase();
  if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/.test(language)) {
    throw new RangeError(`Invalid language code: "${code}".`);
  }
  if (!names || typeof names !== 'object') {
    throw new TypeError('Country names must be an object keyed by alpha-2 code.');
  }

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(names)) {
    if (typeof value !== 'string' || value.length === 0) continue;
    normalized[key.toLowerCase()] = value;
  }

  registry.set(language, Object.freeze(normalized));
  revision += 1;
}
