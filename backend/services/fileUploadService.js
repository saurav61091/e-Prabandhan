const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class FileUploadService {
  constructor() {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Configure multer storage
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const { type } = req.params;
        const typeDir = path.join(uploadsDir, type || 'misc');
        
        if (!fs.existsSync(typeDir)) {
          fs.mkdirSync(typeDir, { recursive: true });
        }
        
        cb(null, typeDir);
      },
      filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = uuidv4();
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    });

    // Configure file filter
    this.fileFilter = (req, file, cb) => {
      // Allow only specific file types
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images, PDFs, and Office documents are allowed.'), false);
      }
    };

    // Create multer upload instance
    this.upload = multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
      }
    });
  }

  // Handle single file upload
  async uploadFile(req, res) {
    try {
      return new Promise((resolve, reject) => {
        this.upload.single('file')(req, res, (err) => {
          if (err) {
            if (err instanceof multer.MulterError) {
              if (err.code === 'LIMIT_FILE_SIZE') {
                reject(new Error('File size too large. Maximum size is 5MB.'));
              } else {
                reject(err);
              }
            } else {
              reject(err);
            }
          } else {
            if (!req.file) {
              reject(new Error('No file uploaded.'));
            } else {
              // Generate URL for the uploaded file
              const fileUrl = `/uploads/${req.params.type || 'misc'}/${req.file.filename}`;
              resolve({
                url: fileUrl,
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
              });
            }
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }

  // Handle multiple file upload
  async uploadFiles(req, res) {
    try {
      return new Promise((resolve, reject) => {
        this.upload.array('files', 5)(req, res, (err) => {
          if (err) {
            if (err instanceof multer.MulterError) {
              if (err.code === 'LIMIT_FILE_SIZE') {
                reject(new Error('File size too large. Maximum size is 5MB.'));
              } else if (err.code === 'LIMIT_FILE_COUNT') {
                reject(new Error('Too many files. Maximum is 5 files.'));
              } else {
                reject(err);
              }
            } else {
              reject(err);
            }
          } else {
            if (!req.files || req.files.length === 0) {
              reject(new Error('No files uploaded.'));
            } else {
              // Generate URLs for the uploaded files
              const filesInfo = req.files.map(file => ({
                url: `/uploads/${req.params.type || 'misc'}/${file.filename}`,
                filename: file.filename,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size
              }));
              resolve(filesInfo);
            }
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }

  // Delete file
  async deleteFile(filename, type = 'misc') {
    try {
      const filePath = path.join(__dirname, '..', 'uploads', type, filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  // Get file info
  async getFileInfo(filename, type = 'misc') {
    try {
      const filePath = path.join(__dirname, '..', 'uploads', type, filename);
      if (fs.existsSync(filePath)) {
        const stats = await fs.promises.stat(filePath);
        return {
          filename,
          url: `/uploads/${type}/${filename}`,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      }
      return null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new FileUploadService();
