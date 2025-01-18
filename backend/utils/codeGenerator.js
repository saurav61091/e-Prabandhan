const crypto = require('crypto');

class CodeGenerator {
  constructor() {
    this.defaultLength = 8;
    this.retryAttempts = 3;
  }

  /**
   * Generate a random code
   * @param {number} length - Length of the code
   * @param {string} prefix - Prefix for the code
   * @returns {string} Generated code
   */
  generateCode(length = this.defaultLength, prefix = '') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      code += chars[randomIndex];
    }

    return prefix ? `${prefix}-${code}` : code;
  }

  /**
   * Generate a unique code with validation
   * @param {string} prefix - Prefix for the code
   * @param {Function} validator - Async function to check if code exists
   * @param {number} length - Length of the code
   * @returns {Promise<string>} Unique code
   */
  async generateUniqueCode(prefix, validator, length = this.defaultLength) {
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      const code = this.generateCode(length, prefix);
      
      // Check if code is unique using provided validator
      const exists = await validator(code);
      if (!exists) {
        return code;
      }
    }

    throw new Error('Failed to generate unique code after multiple attempts');
  }

  /**
   * Generate a reference number
   * @param {string} prefix - Prefix for the reference
   * @param {number} length - Length of the numeric part
   * @returns {string} Reference number
   */
  generateReference(prefix, length = 6) {
    const timestamp = Date.now().toString().slice(-6);
    const random = crypto.randomInt(0, Math.pow(10, length))
      .toString()
      .padStart(length, '0');
    
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Generate a tracking number
   * @param {string} prefix - Prefix for tracking number
   * @returns {string} Tracking number
   */
  generateTrackingNumber(prefix = 'TRK') {
    const timestamp = new Date().toISOString()
      .replace(/[-:]/g, '')
      .slice(0, 12);
    const random = crypto.randomInt(0, 9999)
      .toString()
      .padStart(4, '0');
    
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Generate a version number
   * @param {string} currentVersion - Current version string (e.g., "1.0.0")
   * @param {string} type - Type of version bump ("major", "minor", "patch")
   * @returns {string} New version number
   */
  generateVersion(currentVersion, type = 'patch') {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    switch (type.toLowerCase()) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      default:
        throw new Error('Invalid version bump type');
    }
  }

  /**
   * Generate a secure token
   * @param {number} length - Length of the token
   * @returns {string} Secure token
   */
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a file name with timestamp
   * @param {string} originalName - Original file name
   * @param {string} prefix - Prefix for the file name
   * @returns {string} Generated file name
   */
  generateFileName(originalName, prefix = '') {
    const timestamp = Date.now();
    const random = crypto.randomInt(1000, 9999);
    const ext = originalName.split('.').pop();
    
    return `${prefix}${timestamp}_${random}.${ext}`;
  }

  /**
   * Generate a slug from text
   * @param {string} text - Text to convert to slug
   * @returns {string} Generated slug
   */
  generateSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
      .trim();
  }
}

// Create singleton instance
const codeGenerator = new CodeGenerator();

// Export instance and class
module.exports = {
  codeGenerator,
  CodeGenerator
};
