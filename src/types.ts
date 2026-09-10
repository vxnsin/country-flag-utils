/** Continental grouping, following the UN M49 top level. */
export type Region = 'africa' | 'americas' | 'antarctica' | 'asia' | 'europe' | 'oceania';

/** One row of the country table: alpha-2, alpha-3, numeric, region. */
export type CountryEntry = readonly [
  alpha2: string,
  alpha3: string,
  numeric: string,
  region: Region,
];

/**
 * A registered language. `de` and `en` ship with the package, further codes
 * become available through {@link registerLanguage}.
 */
export type LanguageCode = 'de' | 'en' | (string & {});

/** Host serving the flag images. Both are operated by Flagpedia. */
export type FlagProvider = 'welt-flaggen' | 'flagcdn';

/** Rendered image size. `h` is a fixed height, `w` a fixed width, in pixels. */
export type FlagSize =
  | 'h20'
  | 'h24'
  | 'h40'
  | 'h60'
  | 'h80'
  | 'h120'
  | 'h160'
  | 'h240'
  | 'w20'
  | 'w40'
  | 'w80'
  | 'w160'
  | 'w320'
  | 'w580'
  | 'w640'
  | 'w1280'
  | 'w2560';

/** Image format. `svg` is only served by the `flagcdn` provider. */
export type FlagFormat = 'webp' | 'png' | 'svg';

export interface FlagImageOptions {
  /** Host serving the image. Defaults to the configured provider. */
  provider?: FlagProvider;
  /** Image size. Ignored for `svg`. Defaults to the configured size. */
  size?: FlagSize;
  /** Image format. Defaults to the configured format. */
  format?: FlagFormat;
}

export interface FlagOptions extends FlagImageOptions {
  /** Language of the returned country name. Defaults to the configured language. */
  language?: LanguageCode;
}

export interface SearchOptions extends FlagOptions {
  /** Maximum number of results. Defaults to 10. */
  limit?: number;
  /** Restrict results to one region. */
  region?: Region;
}

export interface Country {
  /** ISO 3166-1 alpha-2 code, lower case. */
  readonly code: string;
  /** ISO 3166-1 alpha-2 code, upper case. */
  readonly alpha2: string;
  /** ISO 3166-1 alpha-3 code, upper case. */
  readonly alpha3: string;
  /** ISO 3166-1 numeric code, zero padded. Empty for Kosovo, which has none. */
  readonly numeric: string;
  /** Country name in the requested language. */
  readonly name: string;
  /** Flag as a regional indicator pair. */
  readonly emoji: string;
  /** Continental grouping. */
  readonly region: Region;
  /** URL of the flag image. */
  readonly url: string;
}

export interface Config {
  language: LanguageCode;
  provider: FlagProvider;
  size: FlagSize;
  format: FlagFormat;
}
