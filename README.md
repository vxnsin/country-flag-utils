# country-flag-utils

Country lookup for Node and the browser: ISO 3166-1 codes, localized names,
flag emoji and flag image URLs. No dependencies, ESM and CommonJS, typed.

- All **250** ISO 3166-1 alpha-2 codes plus Kosovo, with alpha-3, numeric code,
  region and flag emoji
- Lookup by code, name, alias or emoji, insensitive to case, accents and
  punctuation, with a "did you mean" hint on misses
- German and English names built in, further languages can be registered
- Every flag URL in this package is verified against the provider

## Installation

```bash
npm install country-flag-utils
```

## Usage

```javascript
import { getFlag, getFlagUrl, searchFlags } from 'country-flag-utils';
// CommonJS: const { getFlag } = require('country-flag-utils');

getFlag('de');
// {
//   code: 'de',
//   alpha2: 'DE',
//   alpha3: 'DEU',
//   numeric: '276',
//   name: 'Germany',
//   emoji: '🇩🇪',
//   region: 'europe',
//   url: 'https://www.welt-flaggen.de/data/flags/h160/de.webp'
// }
```

Every identifier below resolves to the same country:

```javascript
getFlag('ci');
getFlag('CIV');
getFlag('384');
getFlag('🇨🇮');
getFlag("Côte d'Ivoire");
getFlag('ivory coast');
getFlag('Elfenbeinküste');
getFlag('elfenbeinkueste');
```

### Languages

```javascript
import { getFlag, Language, registerLanguage } from 'country-flag-utils';

getFlag('de', Language.GERMAN).name; // 'Deutschland'
getFlag('de', 'en').name; // 'Germany'

registerLanguage('fr', { de: 'Allemagne', fr: 'France' });
getFlag('de', 'fr').name; // 'Allemagne'
getFlag('Allemagne').code; // 'de'
```

Names that a registered language leaves out fall back to English.

### Flag images

Both providers are operated by Flagpedia and serve the same images.
`welt-flaggen` is the default; `flagcdn` additionally serves SVG.

```javascript
getFlagUrl('de');
// https://www.welt-flaggen.de/data/flags/h160/de.webp

getFlagUrl('de', { size: 'w320', format: 'png' });
// https://www.welt-flaggen.de/data/flags/w320/de.png

getFlagUrl('de', { provider: 'flagcdn', format: 'svg' });
// https://flagcdn.com/de.svg
```

Sizes: `h20`, `h24`, `h40`, `h60`, `h80`, `h120`, `h160`, `h240`, `w20`, `w40`,
`w80`, `w160`, `w320`, `w580`, `w640`, `w1280`, `w2560`. Formats: `webp`,
`png`, `svg`.

### Defaults

`configure` sets the values used whenever a call leaves an option out, so the
language and image options only have to be stated once.

```javascript
import { configure, getFlag } from 'country-flag-utils';

configure({ language: 'de', provider: 'flagcdn', size: 'w320', format: 'png' });

getFlag('de');
// { ..., name: 'Deutschland', url: 'https://flagcdn.com/w320/de.png' }

configure(); // back to the built-in defaults
```

### Search

```javascript
searchFlags('guine').map((country) => country.name);
// ['Guinea', 'Guinea-Bissau', 'Equatorial Guinea', 'Papua New Guinea']

searchFlags('deutschlnad', 'de')[0].name; // 'Deutschland'
searchFlags('island', { region: 'europe', limit: 3 });
```

Results are ranked: exact match, prefix, substring, then a small edit distance
for typos.

### Lists

```javascript
import { getAllFlags, getFlagsByRegion, getCountryCodes } from 'country-flag-utils';

getAllFlags('de'); // all 250 countries, German names
getFlagsByRegion('africa'); // 59 countries
getCountryCodes(); // ['ad', 'ae', 'af', ...]
```

## API

| Function | Returns |
| --- | --- |
| `getFlag(identifier, options?)` | `Country`, throws `UnknownCountryError` when unknown |
| `findFlag(identifier, options?)` | `Country` or `null`, never throws |
| `getFlagUrl(identifier, options?)` | `string` |
| `getFlagEmoji(identifier)` | `string` |
| `getRandomFlag(options?)` | `Country` |
| `getAllFlags(options?)` | `Country[]` |
| `getFlagsByRegion(region, options?)` | `Country[]` |
| `searchFlags(query, options?)` | `Country[]`, ranked |
| `isCountryCode(value)` | `boolean`, alpha-2 only |
| `isKnownCountry(value)` | `boolean`, any identifier |
| `getCountryCodes()` | `string[]` |
| `getRegions()` | `Region[]` |
| `countCountries()` | `number` |
| `configure(patch?)` / `getConfig()` | `Config` |
| `registerLanguage(code, names)` | `void` |
| `getLanguages()` / `hasLanguage(code)` | `string[]` / `boolean` |

`options` is either a language code or an object with `language`, `provider`,
`size` and `format`. `searchFlags` also takes `limit` and `region`.

Constants: `Language`, `REGIONS`, `FLAG_PROVIDERS`, `FLAG_SIZES`,
`FLAG_FORMATS`. Types: `Country`, `Region`, `LanguageCode`, `FlagOptions`,
`FlagImageOptions`, `SearchOptions`, `FlagProvider`, `FlagSize`, `FlagFormat`,
`Config`.

### Errors

| Error | When |
| --- | --- |
| `TypeError` | The identifier is not a string |
| `UnknownCountryError` | The identifier matches no country. Carries `identifier` and up to three `suggestions`. Extends `TypeError` |
| `RangeError` | Unknown language, region, provider, size or format |

```javascript
import { getFlag, UnknownCountryError } from 'country-flag-utils';

try {
  getFlag('Germanyy');
} catch (error) {
  if (error instanceof UnknownCountryError) {
    error.suggestions; // ['Germany']
  }
}
```

## Upgrading from 1.x

`getFlag`, `getFlagUrl`, `getRandomFlag` and `Language` keep their signatures,
and the returned object keeps `name`, `code` and `url` with the same default
URL, so most code needs no change. What differs:

- **The dataset was rebuilt against ISO 3166-1.** 1.x had `cd` and `cg`
  swapped, listed Ethiopia only in German, gave `az` the name of the Azores in
  German, and shipped a truncated name for South Sudan. It also missed 40
  countries and territories, among them Guinea-Bissau, the Marshall Islands,
  Hong Kong, the Faroe Islands and Gibraltar.
- **Removed identifiers:** `a` (Abkhazia, no ISO code) and `an` (Netherlands
  Antilles, dissolved in 2010 — use `cw`, `sx` or `bq`).
- **Renamed:** `gb` is now `United Kingdom` / `Vereinigtes Königreich`, `cz` is
  `Czechia`, `tr` is `Türkiye`, and `us` is `United States`. The former names
  still resolve as aliases.
- **Numeric identifiers no longer throw.** `getFlag('276')` returns Germany
  where 1.x rejected any identifier containing a digit.
- **Error messages changed** and unknown countries now throw
  `UnknownCountryError`. It extends `TypeError`, so existing `catch` blocks
  keep working. Suggestions are capped at three instead of listing every
  substring match.
- **`fs` and `path` are no longer dependencies.** The data is compiled into the
  bundle instead of being read from disk at import time, which is what makes
  the package work in browsers and bundlers.

## Development

```bash
npm install
npm run check      # typecheck, build, test
npm run check:urls # HEAD request for every flag image
```

## License

ISC
