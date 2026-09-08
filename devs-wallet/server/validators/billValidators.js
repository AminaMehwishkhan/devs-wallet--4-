const { body } = require('express-validator');

const payBillRules = [
  body('category').trim().notEmpty().withMessage('Category is required')
    .isIn(['electricity', 'gas', 'internet', 'mobile']).withMessage('Category must be one of: electricity, gas, internet, mobile'),
  body('provider').trim().notEmpty().withMessage('Provider is required').isLength({ max: 100 }).withMessage('Provider name is too long'),
  body('accountNumber').trim().notEmpty().withMessage('Account/consumer number is required').isLength({ max: 100 }).withMessage('Account number is too long'),
  body('amount').notEmpty().withMessage('Amount is required')
    .bail().isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
];

module.exports = { payBillRules };
