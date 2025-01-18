const express = require('express');
const router = express.Router();
const setupController = require('../controllers/setupController');

// Check if system is configured
router.get('/status', setupController.checkSetupStatus);

// Database setup
router.post('/database', setupController.setupDatabase);
router.post('/database/test', setupController.testDatabaseConnection);

// Complete setup
router.post('/complete', setupController.completeSetup);

module.exports = router;
