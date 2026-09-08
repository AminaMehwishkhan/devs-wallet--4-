const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, updateAvatar } = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { handleValidation } = require('../middleware/validate');
const { updateProfileRules, changePasswordRules } = require('../validators/profileValidators');

router.use(authenticate);
router.put('/', updateProfileRules, handleValidation, updateProfile);
router.put('/password', changePasswordRules, handleValidation, changePassword);
router.post('/avatar', upload.single('avatar'), updateAvatar);

module.exports = router;
