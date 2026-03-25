/**
 * AES-256-GCM encryption for the Credential Vault.
 * Uses VAULT_SECRET env var as the encryption key.
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM

function getVaultKey(): string {
  const secret = process.env.VAULT_SECRET;
  if (!secret) {
    throw new Error("VAULT_SECRET environment variable is not set");
  }
  return secret;
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret).slice(0, 32).buffer as ArrayBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("wetrack-vault-salt"),
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptSecret(plaintext: string): Promise<string> {
  const key = await deriveKey(getVaultKey());
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoder = new TextEncoder();

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext),
  );

  // Store as base64(iv):base64(ciphertext)
  const ivB64 = Buffer.from(iv).toString("base64");
  const ctB64 = Buffer.from(ciphertext).toString("base64");
  return `${ivB64}:${ctB64}`;
}

export async function decryptSecret(encrypted: string): Promise<string> {
  const key = await deriveKey(getVaultKey());
  const [ivB64, ctB64] = encrypted.split(":");

  if (!ivB64 || !ctB64) {
    throw new Error("Invalid encrypted value format");
  }

  const iv = Buffer.from(ivB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(plaintext);
}
