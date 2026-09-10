/**
 * Sends a HEAD request for every flag image the package can produce and
 * reports the ones the provider does not serve. Run it after changing the
 * country table or a provider URL:
 *
 *   npm run check:urls
 *   npm run check:urls -- --provider flagcdn --format svg
 */
import { getAllFlags, FLAG_PROVIDERS, FLAG_FORMATS } from '../dist/index.js';

const CONCURRENCY = 16;

function readArgs(argv) {
  const options = { provider: 'welt-flaggen', format: 'webp', size: 'h160' };
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '');
    const value = argv[i + 1];
    if (key === undefined || value === undefined) continue;
    if (key in options) options[key] = value;
  }
  if (!FLAG_PROVIDERS.includes(options.provider)) {
    throw new Error(`Unknown provider: ${options.provider}`);
  }
  if (!FLAG_FORMATS.includes(options.format)) {
    throw new Error(`Unknown format: ${options.format}`);
  }
  return options;
}

async function head(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return response.status;
  } catch (error) {
    return error instanceof Error ? error.message : 'request failed';
  }
}

const options = readArgs(process.argv.slice(2));
const countries = getAllFlags(options);
const failures = [];
let checked = 0;

const queue = countries.values();
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (const country of queue) {
      const status = await head(country.url);
      checked += 1;
      if (status !== 200) failures.push({ country, status });
    }
  })
);

console.log(
  `checked ${checked} flags (${options.provider}, ${options.size}, ${options.format})`
);

if (failures.length > 0) {
  failures.sort((a, b) => a.country.code.localeCompare(b.country.code));
  for (const { country, status } of failures) {
    console.error(`  ${country.code} ${country.name}: ${status} ${country.url}`);
  }
  console.error(`${failures.length} flag(s) unavailable`);
  process.exitCode = 1;
} else {
  console.log('all flags available');
}
