import { readConfig } from './config.js';
import { assertLanguage, getLanguageNames } from './languages.js';
import { assertFormat, assertProvider, assertSize, buildFlagUrl } from './providers.js';
import type { CountryBase } from './registry.js';
import type { Country, FlagOptions, LanguageCode } from './types.js';

export type ResolvedOptions = Required<FlagOptions>;

/**
 * Merges call options over the configured defaults. Options given by the
 * caller are validated here, so nothing downstream has to check them again.
 * Accepts a bare language code as a shorthand for `{ language }`.
 */
export function resolveOptions(options?: LanguageCode | FlagOptions): ResolvedOptions {
  const config = readConfig();
  if (options === undefined || options === null) return config;

  const patch: FlagOptions = typeof options === 'string' ? { language: options } : options;

  return {
    language: patch.language === undefined ? config.language : assertLanguage(patch.language),
    provider: patch.provider === undefined ? config.provider : assertProvider(patch.provider),
    size: patch.size === undefined ? config.size : assertSize(patch.size),
    format: patch.format === undefined ? config.format : assertFormat(patch.format),
  };
}

/** The country name in the given language, falling back to English. */
export function countryName(alpha2: string, language: LanguageCode): string {
  const names = getLanguageNames(language);
  return names[alpha2] ?? getLanguageNames('en')[alpha2] ?? alpha2.toUpperCase();
}

export function toCountry(base: CountryBase, options: ResolvedOptions): Country {
  return {
    code: base.code,
    alpha2: base.alpha2,
    alpha3: base.alpha3,
    numeric: base.numeric,
    name: countryName(base.code, options.language),
    emoji: base.emoji,
    region: base.region,
    url: buildFlagUrl(base.code, options),
  };
}
