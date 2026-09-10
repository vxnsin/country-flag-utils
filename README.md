<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/vxnsin/country-flag-utils/main/assets/wordmark-dark.svg">
  <img src="https://raw.githubusercontent.com/vxnsin/country-flag-utils/main/assets/wordmark-light.svg" width="420" alt="country-flag-utils">
</picture>

<br>

**Country lookup for Node and the browser.**<br>
ISO 3166-1 codes, localized names, flag emoji and flag image URLs.

[![npm](https://img.shields.io/npm/v/country-flag-utils?color=cb3837)](https://www.npmjs.com/package/country-flag-utils)
[![downloads](https://img.shields.io/npm/dm/country-flag-utils?color=cb3837)](https://www.npmjs.com/package/country-flag-utils)
[![CI](https://github.com/vxnsin/country-flag-utils/actions/workflows/ci.yml/badge.svg)](https://github.com/vxnsin/country-flag-utils/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/country-flag-utils)](LICENSE)

</div>

---

```bash
npm install country-flag-utils
```

```javascript
import { getFlag } from 'country-flag-utils';

getFlag('de');
```

```javascript
{
  code: 'de',
  alpha2: 'DE',
  alpha3: 'DEU',
  numeric: '276',
  name: 'Germany',
  emoji: '🇩🇪',
  region: 'europe',
  url: 'https://www.welt-flaggen.de/data/flags/h160/de.webp'
}
```

<div align="center">

<img src="https://www.welt-flaggen.de/data/flags/h40/de.webp" height="24" alt="Germany">&nbsp;<img src="https://www.welt-flaggen.de/data/flags/h40/gb.webp" height="24" alt="United Kingdom">&nbsp;<img src="https://www.welt-flaggen.de/data/flags/h40/jp.webp" height="24" alt="Japan">&nbsp;<img src="https://www.welt-flaggen.de/data/flags/h40/br.webp" height="24" alt="Brazil">&nbsp;<img src="https://www.welt-flaggen.de/data/flags/h40/za.webp" height="24" alt="South Africa">&nbsp;<img src="https://www.welt-flaggen.de/data/flags/h40/in.webp" height="24" alt="India">&nbsp;<img src="https://www.welt-flaggen.de/data/flags/h40/au.webp" height="24" alt="Australia">&nbsp;<img src="https://www.welt-flaggen.de/data/flags/h40/ci.webp" height="24" alt="Côte d'Ivoire">&nbsp;<img src="https://www.welt-flaggen.de/data/flags/h40/kr.webp" height="24" alt="South Korea">&nbsp;<img src="https://www.welt-flaggen.de/data/flags/h40/us.webp" height="24" alt="United States">

<sub>Every flag here is a URL the package produced.</sub>

</div>

## Why

|  |  |
| --- | --- |
| **Complete** | All 250 ISO 3166-1 alpha-2 codes plus Kosovo, each with alpha-3, numeric code, region and emoji |
| **Forgiving** | Codes, names, emoji and 160 aliases — matched regardless of case, accents, punctuation and filler words |
| **Verified** | A scheduled job sends a HEAD request for every flag image, so no entry points at a dead URL |
| **Small** | 32 kB packed, no runtime dependencies, nothing read from disk at import |
| **Typed** | TypeScript declarations, ESM and CommonJS |

## Lookup

Every identifier below returns the same country:

```javascript
getFlag('ci');              // alpha-2
getFlag('CIV');             // alpha-3
getFlag('384');             // numeric
getFlag('🇨🇮');              // emoji
getFlag("Côte d'Ivoire");   // name
getFlag('ivory coast');     // former name
getFlag('Elfenbeinküste');  // German name
getFlag('elfenbeinkueste'); // umlaut written out
```

`getFlag` throws when nothing matches. Use `findFlag` for a `null` instead:

```javascript
findFlag('Atlantis'); // null
```

### The `Country` object

| Field | Example | Notes |
| --- | --- | --- |
| `code` | `'de'` | Alpha-2, lower case |
| `alpha2` | `'DE'` | Alpha-2, upper case |
| `alpha3` | `'DEU'` | ISO 3166-1 alpha-3 |
| `numeric` | `'276'` | ISO 3166-1 numeric, empty for Kosovo |
| `name` | `'Germany'` | In the requested language |
| `emoji` | `'🇩🇪'` | Regional indicator pair |
| `region` | `'europe'` | One of six continental groups |
| `url` | `'…/h160/de.webp'` | Flag image |

## Languages

German and English ship with the package.

```javascript
import { getFlag, Language, registerLanguage } from 'country-flag-utils';

getFlag('de', Language.GERMAN).name; // 'Deutschland'
getFlag('de', 'en').name;            // 'Germany'
```

Register your own, and it becomes searchable straight away:

```javascript
registerLanguage('fr', { de: 'Allemagne', fr: 'France' });

getFlag('de', 'fr').name;  // 'Allemagne'
getFlag('Allemagne').code; // 'de'
getFlag('it', 'fr').name;  // 'Italy' — missing names fall back to English
```

## Flag images

Both providers are run by Flagpedia and serve the same images. `welt-flaggen`
is the default, `flagcdn` additionally serves SVG.

```javascript
getFlagUrl('de');
// https://www.welt-flaggen.de/data/flags/h160/de.webp

getFlagUrl('de', { size: 'w320', format: 'png' });
// https://www.welt-flaggen.de/data/flags/w320/de.png

getFlagUrl('de', { provider: 'flagcdn', format: 'svg' });
// https://flagcdn.com/de.svg
```

| Option | Values |
| --- | --- |
| `provider` | `welt-flaggen`, `flagcdn` |
| `size` | `h20` `h24` `h40` `h60` `h80` `h120` `h160` `h240` `w20` `w40` `w80` `w160` `w320` `w580` `w640` `w1280` `w2560` |
| `format` | `webp`, `png`, `svg` |

## Defaults

Say it once instead of at every call:

```javascript
import { configure, getFlag } from 'country-flag-utils';

configure({ language: 'de', provider: 'flagcdn', size: 'w320', format: 'png' });

getFlag('de').name; // 'Deutschland'
getFlag('de').url;  // https://flagcdn.com/w320/de.png

configure(); // back to the built-in defaults
```

## Search

```javascript
searchFlags('guine').map((c) => c.name);
// ['Guinea', 'Guinea-Bissau', 'Equatorial Guinea', 'Papua New Guinea']

searchFlags('deutschlnad', 'de')[0].name; // 'Deutschland'
searchFlags('island', { region: 'europe', limit: 3 });
```

Ranked: exact match, then prefix, then substring, then a small edit distance
for typos.

## Lists

```javascript
getAllFlags('de');          // all 250 countries, German names
getFlagsByRegion('africa'); // 59 countries
getCountryCodes();          // ['ad', 'ae', 'af', …]
getRandomFlag();
```

Regions are `africa`, `americas`, `antarctica`, `asia`, `europe` and `oceania`.

## API

| Function | Returns |
| --- | --- |
| `getFlag(identifier, options?)` | `Country`, throws when unknown |
| `findFlag(identifier, options?)` | `Country \| null`, never throws |
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
| `configure(patch?)` · `getConfig()` | `Config` |
| `registerLanguage(code, names)` | `void` |
| `getLanguages()` · `hasLanguage(code)` | `string[]` · `boolean` |

`options` is either a language code or an object with `language`, `provider`,
`size` and `format`. `searchFlags` also takes `limit` and `region`.

**Constants** `Language` `REGIONS` `FLAG_PROVIDERS` `FLAG_SIZES` `FLAG_FORMATS`

**Types** `Country` `Region` `LanguageCode` `FlagOptions` `FlagImageOptions`
`SearchOptions` `FlagProvider` `FlagSize` `FlagFormat` `Config`

## Errors

| Error | When |
| --- | --- |
| `TypeError` | The identifier is not a string |
| `UnknownCountryError` | Nothing matched. Carries `identifier` and up to three `suggestions`. Extends `TypeError` |
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
URL — most code needs no change. What differs:

**The dataset was rebuilt against ISO 3166-1.** 1.x had `cd` and `cg` swapped,
listed Ethiopia in German only, gave `az` the name of the Azores in German, and
shipped a truncated name for South Sudan. It also missed 40 countries and
territories, among them Guinea-Bissau, the Marshall Islands, Hong Kong, the
Faroe Islands and Gibraltar.

| Change | Detail |
| --- | --- |
| Removed identifiers | `a` (Abkhazia, no ISO code) and `an` (Netherlands Antilles, dissolved in 2010 — use `cw`, `sx` or `bq`) |
| Renamed | `gb` → United Kingdom, `cz` → Czechia, `tr` → Türkiye, `us` → United States. The former names still resolve as aliases |
| Numeric identifiers | `getFlag('276')` returns Germany where 1.x rejected any identifier containing a digit |
| Errors | Unknown countries throw `UnknownCountryError`, which extends `TypeError`, so existing `catch` blocks keep working. Suggestions are capped at three instead of listing every substring match |
| Dependencies | `fs` and `path` are gone. The data is compiled in, which is what makes the package work in browsers and bundlers |

Full list in [CHANGELOG.md](CHANGELOG.md).

## Development

```bash
npm install
npm run check      # typecheck, build, test
npm run check:urls # HEAD request for every flag image
```

## License

ISC
