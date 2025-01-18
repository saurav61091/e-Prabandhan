const path = require('path');
const fs = require('fs').promises;
const { thumbnailGenerator } = require('../../utils/thumbnailGenerator');

describe('ThumbnailGenerator', () => {
  const testFilesDir = path.join(__dirname, '../test-files');
  const testImagePath = path.join(testFilesDir, 'test-image.jpg');
  const testPdfPath = path.join(testFilesDir, 'test-pdf.pdf');

  beforeAll(async () => {
    // Create test files directory
    await fs.mkdir(testFilesDir, { recursive: true });

    // Create a test image
    const imageData = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    await fs.writeFile(testImagePath, imageData);

    // Create a test PDF (minimal valid PDF)
    const pdfData = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%%EOF',
      'utf-8'
    );
    await fs.writeFile(testPdfPath, pdfData);
  });

  afterAll(async () => {
    // Cleanup test files
    await fs.rm(testFilesDir, { recursive: true, force: true });
    await fs.rm(thumbnailGenerator.thumbnailDir, { recursive: true, force: true });
    await fs.rm(thumbnailGenerator.tempDir, { recursive: true, force: true });
  });

  describe('generate', () => {
    it('should generate thumbnail for image file', async () => {
      const thumbnailPath = await thumbnailGenerator.generate(testImagePath, 'test-image.jpg');
      
      // Check if thumbnail was created
      const stats = await fs.stat(thumbnailPath);
      expect(stats.isFile()).toBe(true);
      
      // Check if thumbnail has correct extension
      expect(path.extname(thumbnailPath)).toBe('.jpeg');
    });

    it('should generate thumbnail for PDF file', async () => {
      const thumbnailPath = await thumbnailGenerator.generate(testPdfPath, 'test-pdf.pdf');
      
      // Check if thumbnail was created
      const stats = await fs.stat(thumbnailPath);
      expect(stats.isFile()).toBe(true);
      
      // Check if thumbnail has correct extension
      expect(path.extname(thumbnailPath)).toBe('.jpeg');
    });

    it('should generate default thumbnail for unsupported file', async () => {
      const thumbnailPath = await thumbnailGenerator.generate(testImagePath, 'test.txt');
      
      // Check if thumbnail was created
      const stats = await fs.stat(thumbnailPath);
      expect(stats.isFile()).toBe(true);
      
      // Check if thumbnail has correct extension
      expect(path.extname(thumbnailPath)).toBe('.jpeg');
    });

    it('should throw error for non-existent file', async () => {
      await expect(
        thumbnailGenerator.generate('non-existent.jpg', 'non-existent.jpg')
      ).rejects.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should remove old thumbnails', async () => {
      // Generate a thumbnail
      const thumbnailPath = await thumbnailGenerator.generate(testImagePath, 'test-image.jpg');
      
      // Modify file time to make it old
      const oldTime = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
      await fs.utimes(thumbnailPath, oldTime, oldTime);
      
      // Run cleanup
      await thumbnailGenerator.cleanup(24 * 60 * 60 * 1000); // 24 hours
      
      // Check if thumbnail was removed
      await expect(fs.access(thumbnailPath)).rejects.toThrow();
    });

    it('should keep recent thumbnails', async () => {
      // Generate a thumbnail
      const thumbnailPath = await thumbnailGenerator.generate(testImagePath, 'test-image.jpg');
      
      // Run cleanup
      await thumbnailGenerator.cleanup(24 * 60 * 60 * 1000); // 24 hours
      
      // Check if thumbnail still exists
      const stats = await fs.stat(thumbnailPath);
      expect(stats.isFile()).toBe(true);
    });
  });
});
