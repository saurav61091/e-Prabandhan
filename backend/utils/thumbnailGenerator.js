const sharp = require('sharp');
const pdf2img = require('pdf-img-convert');
const path = require('path');
const fs = require('fs').promises;

class ThumbnailGenerator {
  constructor(options = {}) {
    this.thumbnailSize = options.thumbnailSize || 200;
    this.quality = options.quality || 80;
    this.outputFormat = options.outputFormat || 'jpeg';
    this.tempDir = path.join(process.cwd(), 'uploads', 'temp');
    this.thumbnailDir = path.join(process.cwd(), 'uploads', 'thumbnails');
  }

  /**
   * Generate thumbnail for different file types
   * @param {string} filePath - Path to the source file
   * @param {string} fileName - Original file name
   * @returns {Promise<string>} Path to the generated thumbnail
   */
  async generate(filePath, fileName) {
    try {
      // Ensure directories exist
      await fs.mkdir(this.thumbnailDir, { recursive: true });
      await fs.mkdir(this.tempDir, { recursive: true });

      const fileExt = path.extname(fileName).toLowerCase();
      const thumbnailName = `thumb_${Date.now()}_${path.basename(fileName, fileExt)}.${this.outputFormat}`;
      const thumbnailPath = path.join(this.thumbnailDir, thumbnailName);

      switch (fileExt) {
        case '.pdf':
          return await this.generatePdfThumbnail(filePath, thumbnailPath);
        case '.jpg':
        case '.jpeg':
        case '.png':
        case '.webp':
          return await this.generateImageThumbnail(filePath, thumbnailPath);
        default:
          return await this.generateDefaultThumbnail(fileExt, thumbnailPath);
      }
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      throw new Error('Failed to generate thumbnail');
    }
  }

  /**
   * Generate thumbnail for PDF files
   * @private
   */
  async generatePdfThumbnail(pdfPath, outputPath) {
    try {
      // Convert first page of PDF to image
      const pdfArray = await pdf2img.convert(pdfPath, {
        width: this.thumbnailSize * 2, // Higher resolution for better quality
        page_numbers: [1]
      });

      // Save converted image and resize
      const tempPath = path.join(this.tempDir, `temp_${Date.now()}.png`);
      await fs.writeFile(tempPath, pdfArray[0]);

      // Resize and save final thumbnail
      await this.resizeImage(tempPath, outputPath);

      // Clean up temp file
      await fs.unlink(tempPath).catch(() => {});

      return outputPath;
    } catch (error) {
      console.error('PDF thumbnail generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate thumbnail for image files
   * @private
   */
  async generateImageThumbnail(imagePath, outputPath) {
    try {
      await this.resizeImage(imagePath, outputPath);
      return outputPath;
    } catch (error) {
      console.error('Image thumbnail generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate default thumbnail for unsupported file types
   * @private
   */
  async generateDefaultThumbnail(fileExt, outputPath) {
    try {
      // Create a simple colored square with file extension text
      const svg = `
        <svg width="${this.thumbnailSize}" height="${this.thumbnailSize}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f0f0f0"/>
          <text x="50%" y="50%" font-family="Arial" font-size="32" fill="#333"
                text-anchor="middle" dominant-baseline="middle">
            ${fileExt.toUpperCase().replace('.', '')}
          </text>
        </svg>
      `;

      await sharp(Buffer.from(svg))
        .jpeg({ quality: this.quality })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      console.error('Default thumbnail generation failed:', error);
      throw error;
    }
  }

  /**
   * Resize image to thumbnail size
   * @private
   */
  async resizeImage(inputPath, outputPath) {
    await sharp(inputPath)
      .resize(this.thumbnailSize, this.thumbnailSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .jpeg({ quality: this.quality })
      .toFile(outputPath);
  }

  /**
   * Clean up old thumbnails
   * @param {number} maxAge - Maximum age in milliseconds
   */
  async cleanup(maxAge = 24 * 60 * 60 * 1000) { // Default 24 hours
    try {
      const files = await fs.readdir(this.thumbnailDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.thumbnailDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtimeMs > maxAge) {
          await fs.unlink(filePath).catch(() => {});
        }
      }
    } catch (error) {
      console.error('Thumbnail cleanup failed:', error);
    }
  }
}

// Create singleton instance
const thumbnailGenerator = new ThumbnailGenerator();

// Export instance and class
module.exports = {
  thumbnailGenerator,
  ThumbnailGenerator
};
