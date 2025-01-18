const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, checkRole } = require('../middleware/auth');
const {
  createEmployee,
  updateEmployee,
  getEmployee,
  searchEmployees,
  getReportingStructure,
  getEmployeeStats,
  uploadDocument,
  getDocuments
} = require('../controllers/employeeController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/employee-documents');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${req.params.employeeId}-${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Employee management routes
router.post(
  '/',
  auth,
  checkRole(['admin', 'hr']),
  createEmployee
);

router.put(
  '/:employeeId',
  auth,
  checkRole(['admin', 'hr']),
  updateEmployee
);

router.get(
  '/:employeeId',
  auth,
  getEmployee
);

router.get(
  '/',
  auth,
  searchEmployees
);

router.get(
  '/:employeeId/reporting',
  auth,
  getReportingStructure
);

router.get(
  '/stats',
  auth,
  checkRole(['admin', 'hr', 'manager']),
  getEmployeeStats
);

// Document management routes
router.post(
  '/:employeeId/documents',
  auth,
  checkRole(['admin', 'hr']),
  upload.single('document'),
  uploadDocument
);

router.get(
  '/:employeeId/documents',
  auth,
  getDocuments
);

module.exports = router;
