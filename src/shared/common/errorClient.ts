/**
 * Custom error class for domain-specific errors.
 *
 * This class extends the native JavaScript {@link Error} object to represent errors
 * that occur within the application's domain logic.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error Error}
 *
 * @example
 * throw new DomainError("Invalid user credentials");
 */
export class DomainError extends Error {
  /**
   * Creates a new DomainError instance.
   *
   * @param message Error message describing the domain error.
   */
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}
