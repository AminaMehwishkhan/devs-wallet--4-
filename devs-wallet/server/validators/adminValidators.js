const { body, param, query } = require('express-validator');

const updateUserStatusRules = [
  param('id').isUUID().withMessage('Invalid user id'),
  body('status').trim().notEmpty().withMessage('Status is required')
    .isIn(['active', 'suspended']).withMessage('Status must be "active" or "suspended"'),
];

const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

module.exports = { updateUserStatusRules, paginationRules };
