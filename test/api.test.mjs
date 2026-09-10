import assert from 'node:assert/strict';
import test from 'node:test';

import {
  configure,
  countCountries,
  findFlag,
  getAllFlags,
  getConfig,
  getFlag,
  getFlagEmoji,
  getFlagUrl,
  getFlagsByRegion,
  getLanguages,
  getRandomFlag,
  isCountryCode,
  isKnownCountry,
  Language,
  registerLanguage,
  searchFlags,
  UnknownCountryError,
} from '../dist/index.js';

test.afterEach(() => configure());

test('getFlag returns the full record', () => {
  assert.deepEqual(getFlag('de'), {
    code: 'de',
    alpha2: 'DE',
    alpha3: 'DEU',
    numeric: '276',
    name: 'Germany',
    emoji: '🇩🇪',
    region: 'europe',
    url: 'https://www.welt-flaggen.de/data/flags/h160/de.webp',
  });
});

test('getFlag accepts a language as second argument', () => {
  assert.equal(getFlag('de', Language.GERMAN).name, 'Deutschland');
  assert.equal(getFlag('de', 'en').name, 'Germany');
  assert.equal(getFlag('de', { language: 'de' }).name, 'Deutschland');
});

test('identifiers are matched regardless of case, accents and punctuation', () => {
  for (const identifier of [
    'CI',
    'civ',
    "Côte d'Ivoire",
    'cote divoire',
    '  IVORY COAST  ',
    'Elfenbeinküste',
    'elfenbeinkueste',
    '384',
  ]) {
    assert.equal(getFlag(identifier).code, 'ci', identifier);
  }
});

test('filler words are optional', () => {
  assert.equal(getFlag('Antigua & Barbuda').code, 'ag');
  assert.equal(getFlag('Antigua Barbuda').code, 'ag');
  assert.equal(getFlag('St. Kitts and Nevis').code, 'kn');
  assert.equal(getFlag('Saint Kitts Nevis').code, 'kn');
});

test('short forms resolve, and a lone "st" stays São Tomé', () => {
  assert.equal(getFlag('st').code, 'st');
  assert.equal(getFlag('Sao Tome').code, 'st');
  assert.equal(getFlag('Antigua').code, 'ag');
  assert.equal(getFlag('Bosnia').code, 'ba');
  assert.equal(getFlag('Trinidad').code, 'tt');
  assert.equal(getFlag('Saint Vincent').code, 'vc');
});

test('common aliases and former names resolve', () => {
  const expected = {
    usa: 'us',
    america: 'us',
    uk: 'gb',
    'Great Britain': 'gb',
    holland: 'nl',
    burma: 'mm',
    swaziland: 'sz',
    'east timor': 'tl',
    turkey: 'tr',
    macedonia: 'mk',
    'DR Congo': 'cd',
    zaire: 'cd',
    'congo brazzaville': 'cg',
    weissrussland: 'by',
    Weißrussland: 'by',
    'Vereinigte Staaten von Amerika': 'us',
  };
  for (const [identifier, code] of Object.entries(expected)) {
    assert.equal(getFlag(identifier).code, code, identifier);
  }
});

test('unknown identifiers throw with suggestions', () => {
  assert.throws(
    () => getFlag('Germanyy'),
    (error) => {
      assert.ok(error instanceof UnknownCountryError);
      assert.ok(error instanceof TypeError);
      assert.equal(error.identifier, 'Germanyy');
      assert.deepEqual(error.suggestions, ['Germany']);
      return true;
    }
  );
  assert.throws(() => getFlag('Atlantis'), UnknownCountryError);
});

test('non-string identifiers throw a TypeError', () => {
  for (const value of [undefined, null, 42, {}, ['de']]) {
    assert.throws(() => getFlag(value), TypeError);
  }
});

test('findFlag never throws', () => {
  assert.equal(findFlag('Atlantis'), null);
  assert.equal(findFlag(undefined), null);
  assert.equal(findFlag('de').code, 'de');
});

test('getFlagUrl honours provider, size and format', () => {
  assert.equal(getFlagUrl('de'), 'https://www.welt-flaggen.de/data/flags/h160/de.webp');
  assert.equal(
    getFlagUrl('de', { size: 'w320', format: 'png' }),
    'https://www.welt-flaggen.de/data/flags/w320/de.png'
  );
  assert.equal(
    getFlagUrl('de', { provider: 'flagcdn', size: 'w80' }),
    'https://flagcdn.com/w80/de.webp'
  );
  assert.equal(
    getFlagUrl('de', { provider: 'flagcdn', format: 'svg' }),
    'https://flagcdn.com/de.svg'
  );
});

test('invalid image options throw a RangeError', () => {
  assert.throws(() => getFlagUrl('de', { size: 'h999' }), RangeError);
  assert.throws(() => getFlagUrl('de', { format: 'jpg' }), RangeError);
  assert.throws(() => getFlagUrl('de', { provider: 'nope' }), RangeError);
  assert.throws(() => getFlagUrl('de', { format: 'svg' }), RangeError);
});

test('configure changes the defaults for every call', () => {
  configure({ language: 'de', provider: 'flagcdn', size: 'w320', format: 'png' });
  assert.deepEqual(getConfig(), {
    language: 'de',
    provider: 'flagcdn',
    size: 'w320',
    format: 'png',
  });
  assert.equal(getFlag('de').name, 'Deutschland');
  assert.equal(getFlag('de').url, 'https://flagcdn.com/w320/de.png');

  configure();
  assert.equal(getFlag('de').name, 'Germany');
});

test('configure rejects unknown values', () => {
  assert.throws(() => configure({ language: 'xx' }), RangeError);
  assert.throws(() => configure({ size: 'h1' }), RangeError);
});

test('emoji round trips', () => {
  assert.equal(getFlagEmoji('de'), '🇩🇪');
  assert.equal(getFlagEmoji('Vereinigte Staaten'), '🇺🇸');
  assert.equal(getFlag('🇨🇭').name, 'Switzerland');
  assert.equal(findFlag('🏳️'), null);
});

test('getRandomFlag stays inside the dataset', () => {
  const codes = new Set(getAllFlags().map((country) => country.code));
  for (let i = 0; i < 100; i += 1) {
    assert.ok(codes.has(getRandomFlag().code));
  }
});

test('getAllFlags and countCountries agree', () => {
  assert.equal(getAllFlags().length, countCountries());
});

test('getFlagsByRegion filters and validates', () => {
  const europe = getFlagsByRegion('europe');
  assert.ok(europe.length > 40);
  assert.ok(europe.every((country) => country.region === 'europe'));
  assert.ok(europe.some((country) => country.code === 'de'));
  assert.throws(() => getFlagsByRegion('atlantis'), RangeError);
});

test('searchFlags ranks exact matches first', () => {
  assert.equal(searchFlags('germ')[0].code, 'de');
  assert.equal(searchFlags('deutsch', 'de')[0].code, 'de');
  assert.equal(searchFlags('guine')[0].name, 'Guinea');
  assert.deepEqual(searchFlags('', { limit: 5 }), []);
  assert.equal(searchFlags('island', { limit: 3 }).length, 3);
  assert.throws(() => searchFlags(7), TypeError);
});

test('searchFlags can be limited to a region', () => {
  const results = searchFlags('guinea', { region: 'africa', limit: 20 });
  assert.ok(results.length >= 3);
  assert.ok(results.every((country) => country.region === 'africa'));
});

test('code checks', () => {
  assert.equal(isCountryCode('de'), true);
  assert.equal(isCountryCode('DE'), true);
  assert.equal(isCountryCode('deu'), false);
  assert.equal(isCountryCode('zz'), false);
  assert.equal(isCountryCode(42), false);
  assert.equal(isKnownCountry('deu'), true);
  assert.equal(isKnownCountry('Atlantis'), false);
});

test('registerLanguage adds a language and refreshes the index', () => {
  registerLanguage('fr', { de: 'Allemagne', fr: 'France', ch: 'Suisse' });
  assert.ok(getLanguages().includes('fr'));
  assert.equal(getFlag('de', 'fr').name, 'Allemagne');
  assert.equal(getFlag('Allemagne').code, 'de');
  assert.equal(getFlag('it', 'fr').name, 'Italy', 'missing names fall back to English');
  assert.throws(() => registerLanguage('deutsch!', {}), RangeError);
  assert.throws(() => registerLanguage('nl', null), TypeError);
});

test('unknown languages throw', () => {
  assert.throws(() => getFlag('de', 'xx'), RangeError);
});
