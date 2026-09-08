const express = require('express');
const router = express.Router();
const { getWallet, deposit, withdraw, transfer } = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { depositRules, withdrawRules, transferRules } = require('../validators/walletValidators');

router.use(authenticate);
router.get('/', getWallet);
router.post('/deposit', depositRules, handleValidation, deposit);
router.post('/withdraw', withdrawRules, handleValidation, withdraw);
router.post('/transfer', transferRules, handleValidation, transfer);

module.exports = router;
