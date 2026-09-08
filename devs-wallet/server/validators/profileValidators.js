const { body } = require('express-validator');

const updateProfileRules = [
  body('fullName').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 120 }).withMessage('Full name must be 2-120 characters'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ min: 7, max: 20 }).withMessage('Phone number looks invalid'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

module.exports = { updateProfileRules, changePasswordRules };
