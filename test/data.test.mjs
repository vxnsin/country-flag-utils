import assert from 'node:assert/strict';
import test from 'node:test';

import {
  configure,
  getAllFlags,
  getCountryCodes,
  getFlag,
  getLanguages,
  getRegions,
} from '../dist/index.js';

test.afterEach(() => configure());

test('every language covers every country', () => {
  const codes = getCountryCodes();
  for (const language of getLanguages()) {
    for (const code of codes) {
      const { name } = getFlag(code, language);
      assert.ok(name.length > 0, `${code} has no name in ${language}`);
      assert.notEqual(name, code.toUpperCase(), `${code} falls back in ${language}`);
    }
  }
});

test('codes are unique, lower case and sorted', () => {
  const codes = getCountryCodes();
  assert.equal(new Set(codes).size, codes.length);
  assert.deepEqual(codes, [...codes].sort());
  for (const code of codes) assert.match(code, /^[a-z]{2}$/);
});

test('alpha-3 and numeric codes are unique and well formed', () => {
  const countries = getAllFlags();
  const alpha3 = new Set();
  const numeric = new Set();

  for (const country of countries) {
    assert.match(country.alpha3, /^[A-Z]{3}$/, country.code);
    assert.equal(alpha3.has(country.alpha3), false, `duplicate ${country.alpha3}`);
    alpha3.add(country.alpha3);

    if (country.numeric === '') {
      assert.equal(country.code, 'xk');
      continue;
    }
    assert.match(country.numeric, /^[0-9]{3}$/, country.code);
    assert.equal(numeric.has(country.numeric), false, `duplicate ${country.numeric}`);
    numeric.add(country.numeric);
  }
});

test('names are unique per language', () => {
  for (const language of getLanguages()) {
    const seen = new Map();
    for (const country of getAllFlags(language)) {
      const previous = seen.get(country.name);
      assert.equal(previous, undefined, `${language}: ${country.name} used by ${previous} and ${country.code}`);
      seen.set(country.name, country.code);
    }
  }
});

test('every country resolves by name in every language', () => {
  for (const language of getLanguages()) {
    for (const country of getAllFlags(language)) {
      assert.equal(getFlag(country.name, language).code, country.code, country.name);
    }
  }
});

test('every country resolves by alpha-3, numeric and emoji', () => {
  for (const country of getAllFlags()) {
    assert.equal(getFlag(country.alpha3).code, country.code, country.alpha3);
    assert.equal(getFlag(country.emoji).code, country.code, country.emoji);
    if (country.numeric !== '') {
      assert.equal(getFlag(country.numeric).code, country.code, country.numeric);
    }
  }
});

test('regions are known and every region is populated', () => {
  const regions = getRegions();
  const used = new Set(getAllFlags().map((country) => country.region));
  assert.deepEqual([...used].sort(), [...regions].sort());
});

test('the dataset covers ISO 3166-1 plus Kosovo', () => {
  assert.equal(getCountryCodes().length, 250);
});

test('known data errors of version 1 are fixed', () => {
  assert.equal(getFlag('cd').name, 'DR Congo');
  assert.equal(getFlag('cg').name, 'Republic of the Congo');
  assert.equal(getFlag('az', 'de').name, 'Aserbaidschan');
  assert.equal(getFlag('ss', 'de').name, 'Südsudan');
  assert.equal(getFlag('gq', 'de').name, 'Äquatorialguinea');
  assert.equal(getFlag('et', 'en').name, 'Ethiopia');
  assert.equal(getFlag('gb').name, 'United Kingdom');
});
