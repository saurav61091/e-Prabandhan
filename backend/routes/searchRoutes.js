const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const {
  searchFiles,
  searchMetadata,
  reindexFiles
} = require('../controllers/searchController');

// Rate limiting for search endpoints
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all search routes
router.use(searchLimiter);

// Search routes
router.get('/files', auth, searchFiles);
router.get('/metadata', auth, searchMetadata);

// Admin routes
router.post('/reindex', 
  auth, 
  authorize(['admin']), 
  reindexFiles
);

module.exports = router;
