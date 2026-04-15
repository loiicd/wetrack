/**
 * Structured error for credential-related failures.
 * Thrown instead of generic Error so API routes / Server Components
 * can return a controlled HTTP status (400/422) rather than 500.
 */
export class CredentialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CredentialError";
  }
}
