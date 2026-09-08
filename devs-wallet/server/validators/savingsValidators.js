const { body, param } = require('express-validator');

const createGoalRules = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ min: 2, max: 120 }).withMessage('Title must be 2-120 characters'),
  body('targetAmount').notEmpty().withMessage('Target amount is required')
    .bail().isFloat({ gt: 0 }).withMessage('Target amount must be a positive number'),
  body('deadline').optional({ checkFalsy: true }).isISO8601().withMessage('Deadline must be a valid date'),
];

const updateGoalRules = [
  param('id').isUUID().withMessage('Invalid goal id'),
  body('title').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 120 }).withMessage('Title must be 2-120 characters'),
  body('targetAmount').optional({ checkFalsy: true }).isFloat({ gt: 0 }).withMessage('Target amount must be a positive number'),
  body('deadline').optional({ checkFalsy: true }).isISO8601().withMessage('Deadline must be a valid date'),
  body('status').optional({ checkFalsy: true }).isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status'),
];

const goalIdRules = [param('id').isUUID().withMessage('Invalid goal id')];

const contributeRules = [
  param('id').isUUID().withMessage('Invalid goal id'),
  body('amount').notEmpty().withMessage('Amount is required')
    .bail().isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
];

module.exports = { createGoalRules, updateGoalRules, goalIdRules, contributeRules };
