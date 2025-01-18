const fs = require('fs').promises;
const path = require('path');
const { createTempDecryptedCopy } = require('../utils/encryption');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const sharp = require('sharp');
const libre = require('libreoffice-convert');
const libreAsync = util.promisify(libre.convert);

class PreviewService {
  // Generate preview for different file types
  static async generatePreview(file, previewType = 'thumbnail') {
    const fileExt = path.extname(file.path).toLowerCase();
    let previewPath = null;

    try {
      // Handle encrypted files
      const filePath = file.isEncrypted 
        ? await createTempDecryptedCopy(file.path, file.encryptionKey)
        : file.path;

      switch (fileExt) {
        case '.pdf':
          previewPath = await this.handlePDFPreview(filePath, previewType);
          break;
        case '.jpg':
        case '.jpeg':
        case '.png':
        case '.gif':
          previewPath = await this.handleImagePreview(filePath, previewType);
          break;
        case '.doc':
        case '.docx':
        case '.xls':
        case '.xlsx':
        case '.ppt':
        case '.pptx':
          previewPath = await this.handleOfficePreview(filePath, previewType);
          break;
        case '.txt':
        case '.csv':
        case '.json':
        case '.xml':
          previewPath = await this.handleTextPreview(filePath);
          break;
        default:
          throw new Error('Unsupported file type for preview');
      }

      // Clean up temporary decrypted file if it was created
      if (file.isEncrypted) {
        await fs.unlink(filePath);
      }

      return previewPath;
    } catch (error) {
      console.error('Preview generation error:', error);
      throw error;
    }
  }

  // Handle PDF files
  static async handlePDFPreview(filePath, previewType) {
    if (previewType === 'thumbnail') {
      // Use PDFjs to render first page as image
      const outputPath = filePath.replace('.pdf', '_thumb.png');
      await execAsync(`pdftoppm -png -f 1 -l 1 "${filePath}" "${outputPath}"`);
      return outputPath;
    }
    // For full preview, return the PDF file path itself
    return filePath;
  }

  // Handle image files
  static async handleImagePreview(filePath, previewType) {
    if (previewType === 'thumbnail') {
      const outputPath = filePath + '_thumb.jpg';
      await sharp(filePath)
        .resize(200, 200, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toFile(outputPath);
      return outputPath;
    }
    return filePath;
  }

  // Handle Office documents
  static async handleOfficePreview(filePath, previewType) {
    // Convert to PDF first
    const pdfPath = filePath + '.pdf';
    const fileContent = await fs.readFile(filePath);
    await libreAsync(fileContent, '.pdf', undefined);
    
    if (previewType === 'thumbnail') {
      // Generate thumbnail from the PDF
      return await this.handlePDFPreview(pdfPath, 'thumbnail');
    }
    return pdfPath;
  }

  // Handle text files
  static async handleTextPreview(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    return {
      type: 'text',
      content: content.slice(0, 10000) // Limit preview size
    };
  }

  // Clean up preview files
  static async cleanupPreviews(previewPaths) {
    for (const path of previewPaths) {
      try {
        await fs.unlink(path);
      } catch (error) {
        console.error('Error cleaning up preview:', error);
      }
    }
  }
}

module.exports = PreviewService;
