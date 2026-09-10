import type { FlagFormat, FlagImageOptions, FlagProvider, FlagSize } from './types.js';

const HOSTS: Record<FlagProvider, string> = {
  'welt-flaggen': 'https://www.welt-flaggen.de/data/flags',
  flagcdn: 'https://flagcdn.com',
};

export const FLAG_PROVIDERS = Object.keys(HOSTS) as readonly FlagProvider[];

export const FLAG_SIZES: readonly FlagSize[] = [
  'h20',
  'h24',
  'h40',
  'h60',
  'h80',
  'h120',
  'h160',
  'h240',
  'w20',
  'w40',
  'w80',
  'w160',
  'w320',
  'w580',
  'w640',
  'w1280',
  'w2560',
];

export const FLAG_FORMATS: readonly FlagFormat[] = ['webp', 'png', 'svg'];

const SIZE_SET = new Set<string>(FLAG_SIZES);
const FORMAT_SET = new Set<string>(FLAG_FORMATS);

export function assertProvider(provider: string): FlagProvider {
  if (!(provider in HOSTS)) {
    throw new RangeError(
      `Unknown flag provider: "${provider}". Available: ${FLAG_PROVIDERS.join(', ')}.`
    );
  }
  return provider as FlagProvider;
}

export function assertSize(size: string): FlagSize {
  if (!SIZE_SET.has(size)) {
    throw new RangeError(
      `Unsupported flag size: "${size}". Available: ${FLAG_SIZES.join(', ')}.`
    );
  }
  return size as FlagSize;
}

export function assertFormat(format: string): FlagFormat {
  if (!FORMAT_SET.has(format)) {
    throw new RangeError(
      `Unsupported flag format: "${format}". Available: ${FLAG_FORMATS.join(', ')}.`
    );
  }
  return format as FlagFormat;
}

/**
 * Builds the image URL for an alpha-2 code. SVG is only served by `flagcdn`
 * and ignores the size, every other format is resized by the provider.
 *
 * Expects options that have already been validated by `resolveOptions`.
 */
export function buildFlagUrl(alpha2: string, options: Required<FlagImageOptions>): string {
  const { provider, format, size } = options;

  if (format === 'svg') {
    if (provider !== 'flagcdn') {
      throw new RangeError(
        `The "${provider}" provider serves no SVG flags, use provider "flagcdn" instead.`
      );
    }
    return `${HOSTS.flagcdn}/${alpha2}.svg`;
  }

  return `${HOSTS[provider]}/${size}/${alpha2}.${format}`;
}
