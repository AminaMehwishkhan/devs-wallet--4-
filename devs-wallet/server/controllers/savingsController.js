const db = require('../config/db');
const { success, error } = require('../utils/response');

const listGoals = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

const createGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, deadline } = req.body;
    if (!title || !targetAmount || Number(targetAmount) <= 0) {
      return error(res, 'Title and a positive target amount are required', 422);
    }
    const result = await db.query(
      `INSERT INTO savings_goals (user_id, title, target_amount, deadline)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, title, targetAmount, deadline || null]
    );
    return success(res, result.rows[0], 'Savings goal created', 201);
  } catch (err) {
    next(err);
  }
};

const updateGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, deadline, status } = req.body;
    const result = await db.query(
      `UPDATE savings_goals SET
        title = COALESCE($1, title),
        target_amount = COALESCE($2, target_amount),
        deadline = COALESCE($3, deadline),
        status = COALESCE($4, status),
        updated_at = NOW()
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [title, targetAmount, deadline, status, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return error(res, 'Savings goal not found', 404);
    return success(res, result.rows[0], 'Savings goal updated');
  } catch (err) {
    next(err);
  }
};

const deleteGoal = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM savings_goals WHERE id = $1 AND user_id = $2 RETURNING id', [
      req.params.id,
      req.user.id,
    ]);
    if (result.rows.length === 0) return error(res, 'Savings goal not found', 404);
    return success(res, {}, 'Savings goal deleted');
  } catch (err) {
    next(err);
  }
};

// Add money from the wallet into a savings goal
const contributeToGoal = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { amount } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) return error(res, 'Amount must be a positive number', 422);

    await client.query('BEGIN');

    const walletCheck = await client.query('SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [req.user.id]);
    const wallet = walletCheck.rows[0];
    if (Number(wallet.balance) < amt) {
      await client.query('ROLLBACK');
      return error(res, 'Insufficient wallet balance', 400);
    }

    const goalCheck = await client.query('SELECT * FROM savings_goals WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.user.id,
    ]);
    if (goalCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return error(res, 'Savings goal not found', 404);
    }

    await client.query('UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE user_id = $2', [
      amt,
      req.user.id,
    ]);

    const goalResult = await client.query(
      `UPDATE savings_goals SET saved_amount = saved_amount + $1,
        status = CASE WHEN saved_amount + $1 >= target_amount THEN 'completed' ELSE status END,
        updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [amt, req.params.id]
    );

    await client.query(
      `INSERT INTO transactions (wallet_id, type, amount, balance_after, description)
       VALUES ($1, 'withdraw', $2, $3, $4)`,
      [wallet.id, amt, Number(wallet.balance) - amt, `Savings contribution: ${goalCheck.rows[0].title}`]
    );

    await client.query('COMMIT');
    return success(res, goalResult.rows[0], 'Contribution added to savings goal');
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = { listGoals, createGoal, updateGoal, deleteGoal, contributeToGoal };
