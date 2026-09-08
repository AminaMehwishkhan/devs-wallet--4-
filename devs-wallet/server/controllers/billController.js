const db = require('../config/db');
const { success, error } = require('../utils/response');

const VALID_CATEGORIES = ['electricity', 'gas', 'internet', 'mobile'];

const listBills = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM bills WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

const payBill = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { category, provider, accountNumber, amount } = req.body;
    const amt = Number(amount);

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return error(res, `Category must be one of: ${VALID_CATEGORIES.join(', ')}`, 422);
    }
    if (!provider || !accountNumber || !amt || amt <= 0) {
      return error(res, 'Provider, account number and a positive amount are required', 422);
    }

    await client.query('BEGIN');

    const walletCheck = await client.query('SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [req.user.id]);
    const wallet = walletCheck.rows[0];
    if (Number(wallet.balance) < amt) {
      await client.query('ROLLBACK');
      return error(res, 'Insufficient balance', 400);
    }

    const walletUpdate = await client.query(
      'UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
      [amt, req.user.id]
    );

    const txResult = await client.query(
      `INSERT INTO transactions (wallet_id, type, amount, balance_after, description)
       VALUES ($1, 'bill_payment', $2, $3, $4) RETURNING *`,
      [walletUpdate.rows[0].id, amt, walletUpdate.rows[0].balance, `${category} bill - ${provider}`]
    );

    const billResult = await client.query(
      `INSERT INTO bills (user_id, category, provider, account_number, amount, transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, category, provider, accountNumber, amt, txResult.rows[0].id]
    );

    await client.query('COMMIT');
    return success(res, { bill: billResult.rows[0], wallet: walletUpdate.rows[0] }, 'Bill paid successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = { listBills, payBill };
