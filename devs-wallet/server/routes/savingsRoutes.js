const express = require('express');
const router = express.Router();
const {
  listGoals, createGoal, updateGoal, deleteGoal, contributeToGoal,
} = require('../controllers/savingsController');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const {
  createGoalRules, updateGoalRules, goalIdRules, contributeRules,
} = require('../validators/savingsValidators');

router.use(authenticate);
router.get('/', listGoals);
router.post('/', createGoalRules, handleValidation, createGoal);
router.put('/:id', updateGoalRules, handleValidation, updateGoal);
router.delete('/:id', goalIdRules, handleValidation, deleteGoal);
router.post('/:id/contribute', contributeRules, handleValidation, contributeToGoal);

module.exports = router;
