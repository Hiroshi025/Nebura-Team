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

/**
 * Custom error class for JWT-related errors.
 *
 * This class extends the native JavaScript {@link Error} object to represent errors
 * that occur during JWT validation or processing.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error Error}
 *
 * @example
 * throw new JwtError("Invalid JWT token");
 */
export class JwtError extends Error {
  /**
   * Creates a new JwtError instance.
   *
   * @param message Error message describing the JWT error.
   */
  constructor(message: string) {
    super(message);
    this.name = "JwtError";
  }
}
