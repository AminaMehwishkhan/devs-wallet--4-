const express = require('express');
const router = express.Router();
const {
  listUsers, updateUserStatus, listAllTransactions, getReports,
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { handleValidation } = require('../middleware/validate');
const { updateUserStatusRules, paginationRules } = require('../validators/adminValidators');
const { listTransactionsRules } = require('../validators/transactionValidators');

router.use(authenticate, requireRole('admin'));
router.get('/users', paginationRules, handleValidation, listUsers);
router.put('/users/:id/status', updateUserStatusRules, handleValidation, updateUserStatus);
router.get('/transactions', listTransactionsRules, handleValidation, listAllTransactions);
router.get('/reports', getReports);

module.exports = router;
