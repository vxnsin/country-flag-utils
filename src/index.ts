import { resolveOptions, toCountry } from './country.js';
import { toFlagEmoji } from './emoji.js';
import { UnknownCountryError } from './errors.js';
import { buildFlagUrl } from './providers.js';
import { getBase, getBases, isAlpha2, resolveCode, REGIONS } from './registry.js';
import { suggestNames } from './search.js';
import type {
  Country,
  FlagImageOptions,
  FlagOptions,
  LanguageCode,
  Region,
} from './types.js';

export { Language, getLanguages, hasLanguage, registerLanguage } from './languages.js';
export { configure, getConfig } from './config.js';
export { FLAG_FORMATS, FLAG_PROVIDERS, FLAG_SIZES } from './providers.js';
export { UnknownCountryError } from './errors.js';
export { searchFlags } from './search.js';
export { REGIONS } from './registry.js';
export type {
  Config,
  Country,
  FlagFormat,
  FlagImageOptions,
  FlagOptions,
  FlagProvider,
  FlagSize,
  LanguageCode,
  Region,
  SearchOptions,
} from './types.js';

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string') {
    throw new TypeError(`${label} must be a string`);
  }
  return value;
}

function requireCode(identifier: unknown, language: LanguageCode): string {
  const value = requireString(identifier, 'Country identifier');
  const code = resolveCode(value);
  if (code === undefined) {
    throw new UnknownCountryError(value, suggestNames(value, language));
  }
  return code;
}

/**
 * Looks up a country by alpha-2 code, alpha-3 code, numeric code, flag emoji
 * or name in any registered language.
 *
 * @param identifier Country identifier, matched without regard to case,
 *   accents or punctuation.
 * @param options Language code, or an options object.
 * @throws {UnknownCountryError} When the identifier matches no country.
 *
 * @example
 * getFlag('de');
 * getFlag('DEU', 'de');
 * getFlag('🇩🇪', { size: 'w320', format: 'png' });
 */
export function getFlag(
  identifier: string,
  options?: LanguageCode | FlagOptions
): Country {
  const resolved = resolveOptions(options);
  const code = requireCode(identifier, resolved.language);
  return toCountry(getBase(code)!, resolved);
}

/** Like {@link getFlag}, but returns `null` instead of throwing. */
export function findFlag(
  identifier: string,
  options?: LanguageCode | FlagOptions
): Country | null {
  if (typeof identifier !== 'string') return null;
  const resolved = resolveOptions(options);
  const code = resolveCode(identifier);
  return code === undefined ? null : toCountry(getBase(code)!, resolved);
}

/**
 * URL of a country's flag image.
 *
 * @example
 * getFlagUrl('de');
 * getFlagUrl('de', { provider: 'flagcdn', format: 'svg' });
 */
export function getFlagUrl(identifier: string, options?: FlagImageOptions): string {
  const resolved = resolveOptions(options);
  const code = requireCode(identifier, resolved.language);
  return buildFlagUrl(code, resolved);
}

/** A country's flag emoji, e.g. 🇩🇪 for `de`. */
export function getFlagEmoji(identifier: string): string {
  return toFlagEmoji(requireCode(identifier, resolveOptions().language));
}

/** A random country. */
export function getRandomFlag(options?: LanguageCode | FlagOptions): Country {
  const resolved = resolveOptions(options);
  const bases = getBases();
  const base = bases[Math.floor(Math.random() * bases.length)]!;
  return toCountry(base, resolved);
}

/** Every country, ordered by alpha-2 code. */
export function getAllFlags(options?: LanguageCode | FlagOptions): Country[] {
  const resolved = resolveOptions(options);
  return getBases().map((base) => toCountry(base, resolved));
}

/** Every country of one region, ordered by alpha-2 code. */
export function getFlagsByRegion(
  region: Region,
  options?: LanguageCode | FlagOptions
): Country[] {
  if (!REGIONS.includes(region)) {
    throw new RangeError(`Unknown region: "${region}". Available: ${REGIONS.join(', ')}.`);
  }
  const resolved = resolveOptions(options);
  return getBases()
    .filter((base) => base.region === region)
    .map((base) => toCountry(base, resolved));
}

/** Whether a string is an ISO 3166-1 alpha-2 code this package knows. */
export function isCountryCode(value: unknown): boolean {
  return typeof value === 'string' && isAlpha2(value.trim().toLowerCase());
}

/** Whether an identifier resolves to a country, in any supported form. */
export function isKnownCountry(value: unknown): boolean {
  return typeof value === 'string' && resolveCode(value) !== undefined;
}

/** All alpha-2 codes, sorted. */
export function getCountryCodes(): string[] {
  return getBases().map((base) => base.code);
}

/** All regions, sorted. */
export function getRegions(): Region[] {
  return [...REGIONS];
}

/** Number of countries in the dataset. */
export function countCountries(): number {
  return getBases().length;
}
