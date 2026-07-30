const crypto = require('crypto');

/**
 * Decrypt encrypted strings
 * @param {string} encryptedText - Encrypted text in format "iv:encrypted"
 * @returns {string} - Decrypted text
 */
function decrypt(encryptedText) {
  const MASTER_KEY = process.env.MASTER_KEY || 'your-32-char-secret-key-here!!!';
  const algorithm = 'aes-256-cbc';

  // If not encrypted format, return as-is
  if (!encryptedText || !encryptedText.includes(':')) {
    return encryptedText;
  }

  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(MASTER_KEY.padEnd(32, '0')),
      iv
    );
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    console.warn('Decryption failed, returning original value:', e.message);
    return encryptedText;
  }
}

/**
 * Encrypt plain text strings
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in format "iv:encrypted"
 */
function encrypt(text) {
  const MASTER_KEY = process.env.MASTER_KEY || 'your-32-char-secret-key-here!!!';
  const algorithm = 'aes-256-cbc';

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(MASTER_KEY.padEnd(32, '0')),
    iv
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Get decrypted secrets from environment
 * @returns {object} - Object with decrypted credentials
 */
function getDecryptedSecrets() {
  return {
    SF_USERNAME: decrypt(process.env.SF_USERNAME_ENCRYPTED || process.env.SF_USERNAME),
    SF_PASSWORD: decrypt(process.env.SF_PASSWORD_ENCRYPTED || process.env.SF_PASSWORD),
    SF_TOTP_SECRET: decrypt(process.env.SF_TOTP_SECRET_ENCRYPTED || process.env.SF_TOTP_SECRET),
    SF_ORG_URL: process.env.SF_ORG_URL
  };
}

module.exports = {
  decrypt,
  encrypt,
  getDecryptedSecrets
};
