const express = require('express');
const router = express.Router();
const {
  listBeneficiaries, addBeneficiary, updateBeneficiary, deleteBeneficiary,
} = require('../controllers/beneficiaryController');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const {
  addBeneficiaryRules, updateBeneficiaryRules, beneficiaryIdRules,
} = require('../validators/beneficiaryValidators');

router.use(authenticate);
router.get('/', listBeneficiaries);
router.post('/', addBeneficiaryRules, handleValidation, addBeneficiary);
router.put('/:id', updateBeneficiaryRules, handleValidation, updateBeneficiary);
router.delete('/:id', beneficiaryIdRules, handleValidation, deleteBeneficiary);

module.exports = router;
