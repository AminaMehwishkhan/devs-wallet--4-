const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/wallet', require('./walletRoutes'));
router.use('/transactions', require('./transactionRoutes'));
router.use('/savings-goals', require('./savingsRoutes'));
router.use('/bills', require('./billRoutes'));
router.use('/packages', require('./packageRoutes'));
router.use('/beneficiaries', require('./beneficiaryRoutes'));
router.use('/profile', require('./profileRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;
