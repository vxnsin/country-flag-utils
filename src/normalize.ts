const COMBINING_MARKS = /\p{M}/gu;

const LIGATURES: Record<string, string> = {
  'ß': 'ss',
  'æ': 'ae',
  'œ': 'oe',
  'ø': 'o',
  'đ': 'd',
  'ð': 'd',
  'þ': 'th',
  'ł': 'l',
  'ı': 'i',
  'ħ': 'h',
  'ŧ': 't',
};

const LIGATURE_PATTERN = new RegExp(`[${Object.keys(LIGATURES).join('')}]`, 'g');

/** Words that carry no distinguishing information in a country name. */
const FILLER = new Set(['and', 'und', 'of', 'the', 'von', 'e', 'y', 'et', 'la', 'le', 'los', 'el']);

/** Spellings of "saint" that appear across the English and German name sets. */
const SAINT = new Set(['st', 'ste', 'sankt']);

function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(LIGATURE_PATTERN, (char) => LIGATURES[char]!);
}

function tokenize(value: string): string[] {
  const tokens = fold(value)
    .replace(/&/g, ' and ')
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  // A lone "st" is São Tomé's alpha-2 code, not an abbreviation of "saint".
  return tokens.length > 1
    ? tokens.map((token) => (SAINT.has(token) ? 'saint' : token))
    : tokens;
}

/**
 * Case, accent and punctuation insensitive form of an identifier.
 * `"Côte d'Ivoire"` and `"cote divoire"` both become `cotedivoire`.
 */
export function tightKey(value: string): string {
  return tokenize(value).join('');
}

/**
 * Like {@link tightKey}, but without filler words, so `"Antigua & Barbuda"`
 * still matches `"Antigua and Barbuda"`.
 */
export function looseKey(value: string): string {
  const tokens = tokenize(value);
  const meaningful = tokens.filter((token) => !FILLER.has(token));
  return (meaningful.length > 0 ? meaningful : tokens).join('');
}

const UMLAUTS: Record<string, string> = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue' };

/**
 * Key for the German habit of writing umlauts as digraphs, so a name indexed
 * as `Elfenbeinküste` is also reachable as `elfenbeinkueste`.
 */
export function transliteratedKey(value: string): string {
  return tightKey(value.toLowerCase().replace(/[äöü]/g, (char) => UMLAUTS[char]!));
}
