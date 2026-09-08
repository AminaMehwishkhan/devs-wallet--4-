const { body } = require('express-validator');

const registerRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 120 }).withMessage('Full name must be 2-120 characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim()
    .isLength({ min: 7, max: 20 }).withMessage('Phone number looks invalid'),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordRules = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Enter a valid email address'),
];

const resetPasswordRules = [
  body('token').trim().notEmpty().withMessage('Reset token is required'),
  body('newPassword').notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

module.exports = { registerRules, loginRules, forgotPasswordRules, resetPasswordRules };
