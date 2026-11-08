import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getKey(): Buffer {
  const secret = process.env.VAULT_SECRET_KEY || "proje-notlar-kasa-sifresi-32byte";
  // Always produce a 32-byte key using sha256
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a plain text string using AES-256-GCM.
 * Output format: iv:tag:ciphertext (base64)
 */
export function encryptVaultText(plainText: string): string {
  if (!plainText) return "";
  try {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
  } catch (error) {
    console.error("Vault encryption error:", error);
    return plainText;
  }
}

/**
 * Decrypts an encrypted vault string using AES-256-GCM.
 */
export function decryptVaultText(encryptedText: string): string {
  if (!encryptedText) return "";
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    // If not in encrypted format (e.g. legacy plain text), return as is
    return encryptedText;
  }

  try {
    const key = getKey();
    const iv = Buffer.from(parts[0], "base64");
    const tag = Buffer.from(parts[1], "base64");
    const encrypted = Buffer.from(parts[2], "base64");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch (error) {
    console.error("Vault decryption error:", error);
    return "[Şifre Çözülemedi]";
  }
}
