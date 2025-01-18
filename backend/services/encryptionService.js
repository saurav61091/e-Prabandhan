const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const pbkdf2 = promisify(crypto.pbkdf2);

class EncryptionService {
  static ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  static KEY_LENGTH = 32; // 256 bits
  static IV_LENGTH = 16; // 128 bits
  static SALT_LENGTH = 32;
  static AUTH_TAG_LENGTH = 16;
  static KEY_ITERATIONS = 100000;

  // Generate a random encryption key
  static async generateEncryptionKey() {
    const salt = crypto.randomBytes(this.SALT_LENGTH);
    const key = await pbkdf2(
      crypto.randomBytes(32), // Random password
      salt,
      this.KEY_ITERATIONS,
      this.KEY_LENGTH,
      'sha256'
    );
    return {
      key: key,
      salt: salt
    };
  }

  // Encrypt a file
  static async encryptFile(inputPath, outputPath = null) {
    try {
      // Generate encryption materials
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const { key, salt } = await this.generateEncryptionKey();

      // Create cipher
      const cipher = crypto.createCipheriv(
        this.ENCRYPTION_ALGORITHM,
        key,
        iv
      );

      // Read input file
      const data = await fs.readFile(inputPath);

      // Encrypt data
      const encryptedData = Buffer.concat([
        cipher.update(data),
        cipher.final()
      ]);

      // Get auth tag
      const authTag = cipher.getAuthTag();

      // Combine all encryption components
      const finalData = Buffer.concat([
        salt,
        iv,
        authTag,
        encryptedData
      ]);

      // Write to output file or return buffer
      if (outputPath) {
        await fs.writeFile(outputPath, finalData);
        return {
          path: outputPath,
          key: key.toString('hex')
        };
      }

      return {
        data: finalData,
        key: key.toString('hex')
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('File encryption failed');
    }
  }

  // Decrypt a file
  static async decryptFile(inputPath, key, outputPath = null) {
    try {
      // Read encrypted file
      const encryptedData = await fs.readFile(inputPath);

      // Extract encryption components
      const salt = encryptedData.slice(0, this.SALT_LENGTH);
      const iv = encryptedData.slice(
        this.SALT_LENGTH,
        this.SALT_LENGTH + this.IV_LENGTH
      );
      const authTag = encryptedData.slice(
        this.SALT_LENGTH + this.IV_LENGTH,
        this.SALT_LENGTH + this.IV_LENGTH + this.AUTH_TAG_LENGTH
      );
      const encryptedContent = encryptedData.slice(
        this.SALT_LENGTH + this.IV_LENGTH + this.AUTH_TAG_LENGTH
      );

      // Create decipher
      const decipher = crypto.createDecipheriv(
        this.ENCRYPTION_ALGORITHM,
        Buffer.from(key, 'hex'),
        iv
      );

      // Set auth tag
      decipher.setAuthTag(authTag);

      // Decrypt data
      const decryptedData = Buffer.concat([
        decipher.update(encryptedContent),
        decipher.final()
      ]);

      // Write to output file or return buffer
      if (outputPath) {
        await fs.writeFile(outputPath, decryptedData);
        return { path: outputPath };
      }

      return { data: decryptedData };
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('File decryption failed');
    }
  }

  // Create a temporary decrypted copy
  static async createTempDecryptedCopy(inputPath, key) {
    const tempDir = path.join(process.cwd(), 'temp');
    const tempPath = path.join(
      tempDir,
      `temp_${Date.now()}_${path.basename(inputPath)}`
    );

    // Ensure temp directory exists
    await fs.mkdir(tempDir, { recursive: true });

    // Decrypt to temp file
    await this.decryptFile(inputPath, key, tempPath);

    return tempPath;
  }

  // Encrypt sensitive data (for metadata, etc.)
  static async encryptData(data, key = null) {
    try {
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const encKey = key ? Buffer.from(key, 'hex') : (await this.generateEncryptionKey()).key;
      
      const cipher = crypto.createCipheriv(
        this.ENCRYPTION_ALGORITHM,
        encKey,
        iv
      );

      const encrypted = Buffer.concat([
        cipher.update(JSON.stringify(data), 'utf8'),
        cipher.final()
      ]);

      const authTag = cipher.getAuthTag();

      return {
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        data: encrypted.toString('base64'),
        key: key || encKey.toString('hex')
      };
    } catch (error) {
      console.error('Data encryption error:', error);
      throw new Error('Data encryption failed');
    }
  }

  // Decrypt sensitive data
  static async decryptData(encryptedData, key) {
    try {
      const decipher = crypto.createDecipheriv(
        this.ENCRYPTION_ALGORITHM,
        Buffer.from(key, 'hex'),
        Buffer.from(encryptedData.iv, 'hex')
      );

      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedData.data, 'base64')),
        decipher.final()
      ]);

      return JSON.parse(decrypted.toString('utf8'));
    } catch (error) {
      console.error('Data decryption error:', error);
      throw new Error('Data decryption failed');
    }
  }

  // Clean up temporary files
  static async cleanupTempFiles() {
    const tempDir = path.join(process.cwd(), 'temp');
    try {
      const files = await fs.readdir(tempDir);
      const now = Date.now();
      
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        // Remove files older than 1 hour
        if (now - stats.mtime.getTime() > 3600000) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

module.exports = EncryptionService;
