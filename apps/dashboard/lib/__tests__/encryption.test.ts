import { describe, it, expect, beforeEach } from "vitest";
import { encryptSecret, decryptSecret } from "../vault/encryption";

describe("Credential Vault Encryption", () => {
  beforeEach(() => {
    process.env.VAULT_SECRET = "test-secret-key-for-unit-testing-only-32chars";
  });

  it("encrypts and decrypts a secret correctly (roundtrip)", async () => {
    const plaintext = "my-super-secret-api-key";
    const encrypted = await encryptSecret(plaintext);
    const decrypted = await decryptSecret(encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it("produces different ciphertext for same plaintext (random IV)", async () => {
    const plaintext = "same-secret";
    const encrypted1 = await encryptSecret(plaintext);
    const encrypted2 = await encryptSecret(plaintext);

    expect(encrypted1).not.toBe(encrypted2);
  });

  it("encrypted value is in iv:ciphertext format", async () => {
    const encrypted = await encryptSecret("hello");
    const parts = encrypted.split(":");

    expect(parts).toHaveLength(2);
    expect(parts[0]).toBeTruthy(); // iv
    expect(parts[1]).toBeTruthy(); // ciphertext
  });

  it("throws if VAULT_SECRET is not set", async () => {
    delete process.env.VAULT_SECRET;

    await expect(encryptSecret("anything")).rejects.toThrow(
      "VAULT_SECRET environment variable is not set",
    );
  });

  it("throws on invalid encrypted format", async () => {
    await expect(decryptSecret("not-valid-format")).rejects.toThrow(
      "Invalid encrypted value format",
    );
  });

  it("handles empty string secrets", async () => {
    const encrypted = await encryptSecret("");
    const decrypted = await decryptSecret(encrypted);
    expect(decrypted).toBe("");
  });

  it("handles special characters in secrets", async () => {
    const secret = "p@$$w0rd!#%^&*()_+-=[]{}|;':\",./<>?";
    const encrypted = await encryptSecret(secret);
    const decrypted = await decryptSecret(encrypted);
    expect(decrypted).toBe(secret);
  });

  it("encryption is fast (<200ms)", async () => {
    const start = Date.now();
    await encryptSecret("test");
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(200);
  });
});
