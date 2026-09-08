const { query, param } = require('express-validator');

const TX_TYPES = ['deposit', 'withdraw', 'transfer_in', 'transfer_out', 'bill_payment', 'package_purchase'];

const listTransactionsRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional({ checkFalsy: true }).isIn(TX_TYPES).withMessage(`Type must be one of: ${TX_TYPES.join(', ')}`),
  query('status').optional({ checkFalsy: true }).isIn(['pending', 'success', 'failed']).withMessage('Invalid status'),
  query('startDate').optional({ checkFalsy: true }).isISO8601().withMessage('startDate must be a valid date'),
  query('endDate').optional({ checkFalsy: true }).isISO8601().withMessage('endDate must be a valid date'),
  query('search').optional({ checkFalsy: true }).trim().isLength({ max: 255 }).withMessage('Search term is too long'),
];

const transactionIdRules = [param('id').isUUID().withMessage('Invalid transaction id')];

module.exports = { listTransactionsRules, transactionIdRules };