const { body } = require('express-validator');

const amountRule = body('amount')
  .notEmpty().withMessage('Amount is required')
  .bail()
  .isFloat({ gt: 0 }).withMessage('Amount must be a positive number');

const depositRules = [
  amountRule,
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 255 }).withMessage('Description is too long'),
];

const withdrawRules = [
  amountRule,
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 255 }).withMessage('Description is too long'),
];

const transferRules = [
  body('recipientEmail').trim().notEmpty().withMessage('Recipient email is required')
    .isEmail().withMessage('Enter a valid recipient email'),
  amountRule,
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 255 }).withMessage('Description is too long'),
];

module.exports = { depositRules, withdrawRules, transferRules };
