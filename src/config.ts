import { assertLanguage } from './languages.js';
import { assertFormat, assertProvider, assertSize } from './providers.js';
import type { Config } from './types.js';

const defaults: Config = {
  language: 'en',
  provider: 'welt-flaggen',
  size: 'h160',
  format: 'webp',
};

let current: Config = { ...defaults };

/** The live configuration. Internal, so hot paths can skip the copy. */
export function readConfig(): Readonly<Config> {
  return current;
}

/** The values used whenever a call leaves an option out. */
export function getConfig(): Config {
  return { ...current };
}

/**
 * Changes the package wide defaults and returns the new configuration.
 * Passing no argument resets everything to the built-in defaults.
 */
export function configure(patch?: Partial<Config>): Readonly<Config> {
  if (patch === undefined) {
    current = { ...defaults };
    return getConfig();
  }

  const next: Config = { ...current };

  if (patch.language !== undefined) next.language = assertLanguage(patch.language);
  if (patch.provider !== undefined) next.provider = assertProvider(patch.provider);
  if (patch.size !== undefined) next.size = assertSize(patch.size);
  if (patch.format !== undefined) next.format = assertFormat(patch.format);

  current = next;
  return getConfig();
}
