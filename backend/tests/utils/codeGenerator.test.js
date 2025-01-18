const { codeGenerator } = require('../../utils/codeGenerator');

describe('CodeGenerator', () => {
  describe('generateCode', () => {
    it('should generate code with specified length', () => {
      const code = codeGenerator.generateCode(10);
      expect(code.length).toBe(10);
    });

    it('should generate code with prefix', () => {
      const code = codeGenerator.generateCode(6, 'TEST');
      expect(code).toMatch(/^TEST-[A-Z0-9]{6}$/);
    });

    it('should generate different codes each time', () => {
      const code1 = codeGenerator.generateCode();
      const code2 = codeGenerator.generateCode();
      expect(code1).not.toBe(code2);
    });
  });

  describe('generateUniqueCode', () => {
    it('should generate unique code', async () => {
      const validator = jest.fn().mockResolvedValue(false);
      const code = await codeGenerator.generateUniqueCode('TEST', validator);
      expect(code).toMatch(/^TEST-[A-Z0-9]+$/);
      expect(validator).toHaveBeenCalledTimes(1);
    });

    it('should retry on collision', async () => {
      const validator = jest.fn()
        .mockResolvedValueOnce(true)  // First attempt fails
        .mockResolvedValueOnce(false); // Second attempt succeeds
      const code = await codeGenerator.generateUniqueCode('TEST', validator);
      expect(code).toMatch(/^TEST-[A-Z0-9]+$/);
      expect(validator).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max attempts', async () => {
      const validator = jest.fn().mockResolvedValue(true); // Always exists
      await expect(codeGenerator.generateUniqueCode('TEST', validator))
        .rejects.toThrow('Failed to generate unique code');
    });
  });

  describe('generateReference', () => {
    it('should generate reference with prefix and correct format', () => {
      const ref = codeGenerator.generateReference('REF');
      expect(ref).toMatch(/^REF\d{12}$/);
    });

    it('should generate unique references', () => {
      const ref1 = codeGenerator.generateReference('REF');
      const ref2 = codeGenerator.generateReference('REF');
      expect(ref1).not.toBe(ref2);
    });
  });

  describe('generateTrackingNumber', () => {
    it('should generate tracking number with correct format', () => {
      const tracking = codeGenerator.generateTrackingNumber();
      expect(tracking).toMatch(/^TRK\d{16}$/);
    });

    it('should accept custom prefix', () => {
      const tracking = codeGenerator.generateTrackingNumber('CUSTOM');
      expect(tracking).toMatch(/^CUSTOM\d{16}$/);
    });
  });

  describe('generateVersion', () => {
    it('should bump major version', () => {
      const newVersion = codeGenerator.generateVersion('1.0.0', 'major');
      expect(newVersion).toBe('2.0.0');
    });

    it('should bump minor version', () => {
      const newVersion = codeGenerator.generateVersion('1.0.0', 'minor');
      expect(newVersion).toBe('1.1.0');
    });

    it('should bump patch version', () => {
      const newVersion = codeGenerator.generateVersion('1.0.0', 'patch');
      expect(newVersion).toBe('1.0.1');
    });

    it('should throw error for invalid type', () => {
      expect(() => codeGenerator.generateVersion('1.0.0', 'invalid'))
        .toThrow('Invalid version bump type');
    });
  });

  describe('generateSecureToken', () => {
    it('should generate token with specified length', () => {
      const token = codeGenerator.generateSecureToken(16);
      expect(token).toHaveLength(32); // hex string is twice the byte length
    });

    it('should generate different tokens', () => {
      const token1 = codeGenerator.generateSecureToken();
      const token2 = codeGenerator.generateSecureToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateFileName', () => {
    it('should generate file name with timestamp and extension', () => {
      const fileName = codeGenerator.generateFileName('test.jpg');
      expect(fileName).toMatch(/^\d+_\d{4}\.jpg$/);
    });

    it('should include prefix if provided', () => {
      const fileName = codeGenerator.generateFileName('test.jpg', 'prefix-');
      expect(fileName).toMatch(/^prefix-\d+_\d{4}\.jpg$/);
    });
  });

  describe('generateSlug', () => {
    it('should convert text to slug format', () => {
      const slug = codeGenerator.generateSlug('Test String 123!@#');
      expect(slug).toBe('test-string-123');
    });

    it('should handle multiple spaces and special characters', () => {
      const slug = codeGenerator.generateSlug('  Test   String  @#$  ');
      expect(slug).toBe('test-string');
    });

    it('should handle empty string', () => {
      const slug = codeGenerator.generateSlug('');
      expect(slug).toBe('');
    });
  });
});
