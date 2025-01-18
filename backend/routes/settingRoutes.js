const express = require('express');
const router = express.Router();
const settingController = require('../controllers/SettingController');
const { isAdmin } = require('../middleware/authMiddleware');

// Get all settings
router.get('/', isAdmin, settingController.getSettings);

// Update settings
router.post('/', isAdmin, settingController.updateSettings);

// Apply settings
router.post('/apply', isAdmin, settingController.applySettings);

// Test settings
router.post('/test', isAdmin, settingController.testSettings);

module.exports = router;
