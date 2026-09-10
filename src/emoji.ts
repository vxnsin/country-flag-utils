const INDICATOR_BASE = 0x1f1e6;
const LETTER_A = 'a'.charCodeAt(0);
const INDICATOR_PAIR = /^[\u{1f1e6}-\u{1f1ff}]{2}$/u;

/** Turns an alpha-2 code into its regional indicator pair, e.g. `de` into 🇩🇪. */
export function toFlagEmoji(alpha2: string): string {
  const code = alpha2.toLowerCase();
  return String.fromCodePoint(
    INDICATOR_BASE + (code.charCodeAt(0) - LETTER_A),
    INDICATOR_BASE + (code.charCodeAt(1) - LETTER_A)
  );
}

/**
 * Reads an alpha-2 code back out of a flag emoji. Returns `undefined` for
 * anything that is not a plain regional indicator pair.
 */
export function fromFlagEmoji(value: string): string | undefined {
  const trimmed = value.trim();
  if (!INDICATOR_PAIR.test(trimmed)) return undefined;
  const points = [...trimmed].map(
    (char) => char.codePointAt(0)! - INDICATOR_BASE + LETTER_A
  );
  return String.fromCharCode(...points);
}
