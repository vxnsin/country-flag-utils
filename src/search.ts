import { countryName, resolveOptions, toCountry } from './country.js';
import { ALIASES } from './data/aliases.js';
import { looseKey, tightKey } from './normalize.js';
import { getBases, type CountryBase } from './registry.js';
import type { Country, LanguageCode, SearchOptions } from './types.js';

const EXACT = 0;
const PREFIX = 1;
const CONTAINS = 2;
const FUZZY_BASE = 3;
const NO_MATCH = Number.POSITIVE_INFINITY;

const MAX_EDIT_DISTANCE = 2;

/** Shortest query length that is matched fuzzily; below that typos are noise. */
const MIN_FUZZY_LENGTH = 4;

/**
 * Levenshtein distance, abandoned as soon as it exceeds `max`. Two rows of the
 * matrix are enough, which keeps the allocation per comparison constant.
 */
function boundedDistance(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;

  let previous = new Uint16Array(b.length + 1);
  let current = new Uint16Array(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) previous[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      const value = Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + cost);
      current[j] = value;
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return max + 1;
    const swap = previous;
    previous = current;
    current = swap;
  }

  return previous[b.length]!;
}

function scoreCandidate(query: string, candidate: string, fuzzy: boolean): number {
  if (candidate === query) return EXACT;
  if (candidate.startsWith(query)) return PREFIX;
  if (candidate.includes(query)) return CONTAINS;
  if (!fuzzy) return NO_MATCH;
  const distance = boundedDistance(query, candidate, MAX_EDIT_DISTANCE);
  return distance <= MAX_EDIT_DISTANCE ? FUZZY_BASE + distance : NO_MATCH;
}

function scoreCountry(base: CountryBase, query: string, name: string): number {
  if (query === base.code || query === base.alpha3.toLowerCase()) return EXACT;

  const fuzzy = query.length >= MIN_FUZZY_LENGTH;
  let best = Math.min(
    scoreCandidate(query, tightKey(name), fuzzy),
    scoreCandidate(query, looseKey(name), fuzzy)
  );

  for (const alias of ALIASES[base.code] ?? []) {
    if (best === EXACT) break;
    best = Math.min(best, scoreCandidate(query, tightKey(alias), fuzzy));
  }

  return best;
}

/**
 * Ranked country search over codes, names in the requested language and
 * aliases. Exact matches come first, then prefixes, then substrings, then
 * results within a small edit distance for typos.
 */
export function searchFlags(
  query: string,
  options?: LanguageCode | SearchOptions
): Country[] {
  if (typeof query !== 'string') {
    throw new TypeError('Search query must be a string');
  }

  const resolved = resolveOptions(options);
  const settings: SearchOptions = typeof options === 'string' ? {} : (options ?? {});
  const limit = settings.limit ?? 10;
  const region = settings.region;
  const key = tightKey(query);
  if (key.length === 0 || limit <= 0) return [];

  const matches: { base: CountryBase; name: string; score: number }[] = [];

  for (const base of getBases()) {
    if (region !== undefined && base.region !== region) continue;
    const name = countryName(base.code, resolved.language);
    const score = scoreCountry(base, key, name);
    if (score !== NO_MATCH) matches.push({ base, name, score });
  }

  matches.sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));

  return matches.slice(0, limit).map((match) => toCountry(match.base, resolved));
}

/** Names of the closest matches, used for the "did you mean" hint on errors. */
export function suggestNames(query: string, language: LanguageCode, limit = 3): string[] {
  return searchFlags(query, { language, limit }).map((country) => country.name);
}
