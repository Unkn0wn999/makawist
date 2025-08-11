const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const verificarToken = require('../Middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;

