import { ALIASES } from './data/aliases.js';
import { COUNTRY_TABLE } from './data/countries.js';
import { fromFlagEmoji, toFlagEmoji } from './emoji.js';
import { getLanguageNames, getLanguages, getRevision } from './languages.js';
import { looseKey, tightKey, transliteratedKey } from './normalize.js';
import type { Region } from './types.js';

export const REGIONS: readonly Region[] = [
  'africa',
  'americas',
  'antarctica',
  'asia',
  'europe',
  'oceania',
];

/** The part of a country that depends on neither language nor provider. */
export interface CountryBase {
  readonly code: string;
  readonly alpha2: string;
  readonly alpha3: string;
  readonly numeric: string;
  readonly emoji: string;
  readonly region: Region;
}

const bases: CountryBase[] = [];
const byAlpha2 = new Map<string, CountryBase>();
const byAlpha3 = new Map<string, CountryBase>();
const byNumeric = new Map<string, CountryBase>();

for (const [alpha2, alpha3, numeric, region] of COUNTRY_TABLE) {
  const base: CountryBase = {
    code: alpha2,
    alpha2: alpha2.toUpperCase(),
    alpha3,
    numeric,
    emoji: toFlagEmoji(alpha2),
    region,
  };
  bases.push(base);
  byAlpha2.set(alpha2, base);
  byAlpha3.set(alpha3.toLowerCase(), base);
  if (numeric.length > 0) byNumeric.set(numeric, base);
}

interface NameIndex {
  revision: number;
  tight: Map<string, string>;
  loose: Map<string, string>;
}

let names: NameIndex | undefined;

function buildNameIndex(): NameIndex {
  const tight = new Map<string, string>();
  const loose = new Map<string, string>();

  const add = (target: Map<string, string>, key: string, code: string): void => {
    if (key.length > 0 && !target.has(key)) target.set(key, code);
  };
  const addVariants = (value: string, code: string): void => {
    add(tight, tightKey(value), code);
    add(tight, transliteratedKey(value), code);
    add(loose, looseKey(value), code);
  };

  for (const language of getLanguages()) {
    for (const [code, name] of Object.entries(getLanguageNames(language))) {
      if (byAlpha2.has(code)) addVariants(name, code);
    }
  }

  for (const [code, aliases] of Object.entries(ALIASES)) {
    if (!byAlpha2.has(code)) continue;
    for (const alias of aliases) addVariants(alias, code);
  }

  return { revision: getRevision(), tight, loose };
}

function getNameIndex(): NameIndex {
  if (names === undefined || names.revision !== getRevision()) names = buildNameIndex();
  return names;
}

export function getBase(alpha2: string): CountryBase | undefined {
  return byAlpha2.get(alpha2);
}

export function getBases(): readonly CountryBase[] {
  return bases;
}

export function isAlpha2(value: string): boolean {
  return byAlpha2.has(value);
}

/**
 * Resolves any supported identifier to an alpha-2 code: alpha-2, alpha-3,
 * numeric code, flag emoji, or a country name or alias in any registered
 * language. Returns `undefined` when nothing matches.
 */
export function resolveCode(identifier: string): string | undefined {
  const raw = identifier.trim().toLowerCase();
  if (raw.length === 0) return undefined;

  if (raw.length === 2) {
    if (byAlpha2.has(raw)) return raw;
  } else if (raw.length === 3) {
    const base = byAlpha3.get(raw);
    if (base) return base.code;
  }

  if (raw.length <= 3 && /^[0-9]+$/.test(raw)) {
    const base = byNumeric.get(raw.padStart(3, '0'));
    if (base) return base.code;
  }

  const emojiCode = fromFlagEmoji(raw);
  if (emojiCode !== undefined) return byAlpha2.has(emojiCode) ? emojiCode : undefined;

  const index = getNameIndex();
  const key = tightKey(raw);
  if (key.length === 0) return undefined;

  return index.tight.get(key) ?? index.loose.get(looseKey(raw));
}
