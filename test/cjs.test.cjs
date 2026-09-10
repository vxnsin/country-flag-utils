const assert = require('node:assert/strict');
const test = require('node:test');

const flags = require('../dist/index.cjs');

test('the CommonJS build exposes the version 1 API', () => {
  assert.equal(typeof flags.getFlag, 'function');
  assert.equal(typeof flags.getFlagUrl, 'function');
  assert.equal(typeof flags.getRandomFlag, 'function');
  assert.deepEqual(flags.Language, { GERMAN: 'de', ENGLISH: 'en' });
});

test('the version 1 call shapes still work', () => {
  const germany = flags.getFlag('de');
  assert.equal(germany.name, 'Germany');
  assert.equal(germany.code, 'de');
  assert.equal(germany.url, 'https://www.welt-flaggen.de/data/flags/h160/de.webp');

  assert.equal(flags.getFlag('de', flags.Language.GERMAN).name, 'Deutschland');
  assert.equal(flags.getFlagUrl('de'), germany.url);
  assert.equal(typeof flags.getRandomFlag(flags.Language.ENGLISH).name, 'string');
});

test('names that version 1 used still resolve', () => {
  const legacy = {
    'Great Britain': 'gb',
    'Ivory Coast': 'ci',
    'Federated States of Micronesia': 'fm',
    'United States of America': 'us',
    Vatican: 'va',
    Osttimor: 'tl',
    'Demokratische Republik Kongo': 'cd',
    Botsuana: 'bw',
  };
  for (const [name, code] of Object.entries(legacy)) {
    assert.equal(flags.getFlag(name).code, code, name);
  }
});
