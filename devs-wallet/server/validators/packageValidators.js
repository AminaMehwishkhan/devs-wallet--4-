const { body } = require('express-validator');

const purchasePackageRules = [
  body('packageId').notEmpty().withMessage('Package is required').isUUID().withMessage('Invalid package id'),
  body('mobileNumber').trim().notEmpty().withMessage('Mobile number is required')
    .matches(/^[0-9+\-\s]{7,20}$/).withMessage('Enter a valid mobile number'),
];

module.exports = { purchasePackageRules };
