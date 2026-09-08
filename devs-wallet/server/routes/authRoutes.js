const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const {
  registerRules, loginRules, forgotPasswordRules, resetPasswordRules,
} = require('../validators/authValidators');

router.post('/register', registerRules, handleValidation, register);
router.post('/login', loginRules, handleValidation, login);
router.post('/forgot-password', forgotPasswordRules, handleValidation, forgotPassword);
router.post('/reset-password', resetPasswordRules, handleValidation, resetPassword);
router.get('/me', authenticate, me);

module.exports = router;
