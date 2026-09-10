# Changelog

## 2.0.0

### Data

The country table was rebuilt from ISO 3166-1 and every flag URL it produces
was verified against the provider.

- Fixed `cd` and `cg`, which were swapped: `cd` is the DR Congo, `cg` the
  Republic of the Congo.
- Fixed `az`, which carried the German name of the Azores instead of
  Azerbaijan.
- Fixed `ss`, whose German name was truncated to `dsudan`.
- Fixed `gq`, which was left untranslated in the German dataset.
- Added Ethiopia (`et`) to the English dataset, where it was missing.
- Added the 40 codes that were missing from both datasets, among them
  Guinea-Bissau, the Marshall Islands, Hong Kong, the Faroe Islands, Gibraltar,
  Guam, the Cayman Islands, Bermuda, Curaçao and Åland.
- Removed `a` (Abkhazia), which is not an ISO code, and `an` (Netherlands
  Antilles), which was dissolved in 2010. Its successors `cw`, `sx` and `bq`
  are part of the dataset.
- Updated names to their current ISO forms: `gb` is United Kingdom, `cz` is
  Czechia, `tr` is Türkiye, `us` is United States. The former names still
  resolve.
- Every country now also carries its alpha-3 code, numeric code, region and
  flag emoji.

### Added

- `findFlag`, a non-throwing `getFlag`.
- `searchFlags`, ranked search over codes, names and aliases with typo
  tolerance.
- `getAllFlags`, `getFlagsByRegion`, `getCountryCodes`, `getRegions`,
  `countCountries`, `getFlagEmoji`, `isCountryCode`, `isKnownCountry`.
- `configure` and `getConfig` for package wide defaults.
- `registerLanguage`, `getLanguages` and `hasLanguage` for languages beyond the
  built-in German and English.
- Lookup by alpha-3 code, numeric code, flag emoji and 160 aliases, short forms
  and former names across 77 countries.
- `provider`, `size` and `format` options, including SVG through `flagcdn`.
- TypeScript declarations and an ESM build alongside CommonJS.

### Changed

- Lookups are indexed instead of scanned, which makes resolving a country by
  name roughly twenty times faster.
- Identifiers are matched without regard to case, accents, punctuation and
  filler words, and German umlauts written as digraphs also resolve.
- Unknown countries throw `UnknownCountryError`, which extends `TypeError` and
  carries `identifier` and up to three `suggestions`. Version 1 listed every
  substring match in the message.
- Numeric identifiers resolve to their ISO numeric code instead of throwing.
- Invalid languages, regions, providers, sizes and formats throw `RangeError`.

### Removed

- The `fs` and `path` dependencies. The dataset is compiled into the bundle, so
  nothing is read from disk at import time and the package works in browsers
  and bundlers.
- The `countries/*.json` files are no longer part of the published package.

## 1.3.0

- Last release of the version 1 line.
