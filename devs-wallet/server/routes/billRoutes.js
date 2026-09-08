const express = require('express');
const router = express.Router();
const { listBills, payBill } = require('../controllers/billController');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { payBillRules } = require('../validators/billValidators');

router.use(authenticate);
router.get('/', listBills);
router.post('/pay', payBillRules, handleValidation, payBill);

module.exports = router;
