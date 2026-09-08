const express = require('express');
const router = express.Router();
const { listTransactions, getTransactionById, getDashboardStats } = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { listTransactionsRules, transactionIdRules } = require('../validators/transactionValidators');

router.use(authenticate);
router.get('/', listTransactionsRules, handleValidation, listTransactions);
router.get('/dashboard-stats', getDashboardStats);
router.get('/:id', transactionIdRules, handleValidation, getTransactionById);

module.exports = router;
