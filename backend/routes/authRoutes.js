const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { auth, authorize } = require('../middleware/auth');

router.post('/register', auth, authorize(['admin']), register);
router.post('/login', login);
router.get('/profile', auth, getProfile);

module.exports = router;
