const express = require('express');
const router = express.Router();
const { listPackages, purchasePackage, listMyPurchases } = require('../controllers/packageController');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { purchasePackageRules } = require('../validators/packageValidators');

router.use(authenticate);
router.get('/', listPackages);
router.get('/my-purchases', listMyPurchases);
router.post('/purchase', purchasePackageRules, handleValidation, purchasePackage);

module.exports = router;
