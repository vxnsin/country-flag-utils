/**
 * Thrown when an identifier cannot be resolved to a country. Extends
 * `TypeError` so existing `catch` blocks keep working.
 */
export class UnknownCountryError extends TypeError {
  override readonly name = 'UnknownCountryError';

  /** The identifier that was passed in, unchanged. */
  readonly identifier: string;

  /** Country names that come closest, best match first. Possibly empty. */
  readonly suggestions: readonly string[];

  constructor(identifier: string, suggestions: readonly string[] = []) {
    const hint =
      suggestions.length > 0 ? ` Did you mean ${suggestions.join(', ')}?` : '';
    super(`Unknown country: "${identifier}".${hint}`);
    this.identifier = identifier;
    this.suggestions = suggestions;
  }
}
