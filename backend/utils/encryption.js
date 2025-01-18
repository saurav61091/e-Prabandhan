const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Generate a secure encryption key from a password
 * @param {string} password - The password to derive key from
 * @param {Buffer} salt - The salt for key derivation
 * @returns {Promise<Buffer>} The derived key
 */
const deriveKey = async (password, salt) => {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, 'sha512', (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
};

/**
 * Encrypt a file
 * @param {string} inputPath - Path to the input file
 * @param {string} password - Encryption password
 * @returns {Promise<{encryptedPath: string, salt: string, iv: string, tag: string}>}
 */
const encryptFile = async (inputPath, password) => {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = await deriveKey(password, salt);

  const inputData = await fs.readFile(inputPath);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(inputData),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  // Create encrypted file path
  const encryptedPath = inputPath + '.enc';
  
  // Write encrypted file
  await fs.writeFile(encryptedPath, encrypted);

  // Delete original file
  await fs.unlink(inputPath);

  return {
    encryptedPath,
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
};

/**
 * Decrypt a file
 * @param {string} inputPath - Path to the encrypted file
 * @param {string} password - Decryption password
 * @param {string} salt - Salt used in encryption (hex string)
 * @param {string} iv - IV used in encryption (hex string)
 * @param {string} tag - Auth tag from encryption (hex string)
 * @returns {Promise<string>} Path to the decrypted file
 */
const decryptFile = async (inputPath, password, salt, iv, tag) => {
  const key = await deriveKey(password, Buffer.from(salt, 'hex'));
  
  const encrypted = await fs.readFile(inputPath);
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  // Create decrypted file path (remove .enc extension)
  const decryptedPath = inputPath.replace('.enc', '');
  
  // Write decrypted file
  await fs.writeFile(decryptedPath, decrypted);

  return decryptedPath;
};

/**
 * Create a temporary decrypted copy of a file
 * @param {string} inputPath - Path to the encrypted file
 * @param {string} password - Decryption password
 * @param {string} salt - Salt used in encryption (hex string)
 * @param {string} iv - IV used in encryption (hex string)
 * @param {string} tag - Auth tag from encryption (hex string)
 * @returns {Promise<{path: string, cleanup: Function}>} Path to temp file and cleanup function
 */
const createTempDecryptedCopy = async (inputPath, password, salt, iv, tag) => {
  const key = await deriveKey(password, Buffer.from(salt, 'hex'));
  
  const encrypted = await fs.readFile(inputPath);
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  // Create temporary file path
  const tempPath = path.join(
    path.dirname(inputPath),
    `temp-${path.basename(inputPath, '.enc')}-${Date.now()}`
  );
  
  // Write temporary decrypted file
  await fs.writeFile(tempPath, decrypted);

  // Return path and cleanup function
  return {
    path: tempPath,
    cleanup: async () => {
      try {
        await fs.unlink(tempPath);
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }
    }
  };
};

module.exports = {
  encryptFile,
  decryptFile,
  createTempDecryptedCopy
};
