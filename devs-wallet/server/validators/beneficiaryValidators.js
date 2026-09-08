const { body, param } = require('express-validator');

const addBeneficiaryRules = [
  body('nickname').trim().notEmpty().withMessage('Nickname is required').isLength({ min: 2, max: 100 }).withMessage('Nickname must be 2-100 characters'),
  body('beneficiaryEmail').trim().notEmpty().withMessage('Beneficiary email is required').isEmail().withMessage('Enter a valid email address'),
  body('bankOrWallet').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('This field is too long'),
];

const updateBeneficiaryRules = [
  param('id').isUUID().withMessage('Invalid beneficiary id'),
  body('nickname').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 100 }).withMessage('Nickname must be 2-100 characters'),
  body('bankOrWallet').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('This field is too long'),
];

const beneficiaryIdRules = [param('id').isUUID().withMessage('Invalid beneficiary id')];

module.exports = { addBeneficiaryRules, updateBeneficiaryRules, beneficiaryIdRules };
