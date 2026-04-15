import { describe, it, expect } from "vitest";
import { CredentialError } from "../errors/CredentialError";

describe("CredentialError", () => {
  it("is an instance of Error", () => {
    const err = new CredentialError("test message");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(CredentialError);
  });

  it("has name 'CredentialError'", () => {
    const err = new CredentialError("missing credential");
    expect(err.name).toBe("CredentialError");
  });

  it("carries the message", () => {
    const msg = 'Credential "my-key" not found in vault.';
    const err = new CredentialError(msg);
    expect(err.message).toBe(msg);
  });

  it("can be caught by checking instanceof", () => {
    try {
      throw new CredentialError("fail");
    } catch (e) {
      expect(e).toBeInstanceOf(CredentialError);
      if (e instanceof CredentialError) {
        expect(e.message).toBe("fail");
      }
    }
  });
});
