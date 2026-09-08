const db = require('../config/db');
const { success, error } = require('../utils/response');

const getWallet = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM wallets WHERE user_id = $1', [req.user.id]);
    if (result.rows.length === 0) return error(res, 'Wallet not found', 404);
    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const deposit = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { amount, description } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) return error(res, 'Amount must be a positive number', 422);

    await client.query('BEGIN');
    const walletResult = await client.query(
      'UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
      [amt, req.user.id]
    );
    const wallet = walletResult.rows[0];

    const txResult = await client.query(
      `INSERT INTO transactions (wallet_id, type, amount, balance_after, description)
       VALUES ($1, 'deposit', $2, $3, $4) RETURNING *`,
      [wallet.id, amt, wallet.balance, description || 'Wallet deposit']
    );
    await client.query('COMMIT');

    return success(res, { wallet, transaction: txResult.rows[0] }, 'Deposit successful');
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const withdraw = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { amount, description } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) return error(res, 'Amount must be a positive number', 422);

    await client.query('BEGIN');
    const walletCheck = await client.query('SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [req.user.id]);
    const currentWallet = walletCheck.rows[0];
    if (Number(currentWallet.balance) < amt) {
      await client.query('ROLLBACK');
      return error(res, 'Insufficient balance', 400);
    }

    const walletResult = await client.query(
      'UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
      [amt, req.user.id]
    );
    const wallet = walletResult.rows[0];

    const txResult = await client.query(
      `INSERT INTO transactions (wallet_id, type, amount, balance_after, description)
       VALUES ($1, 'withdraw', $2, $3, $4) RETURNING *`,
      [wallet.id, amt, wallet.balance, description || 'Wallet withdrawal']
    );
    await client.query('COMMIT');

    return success(res, { wallet, transaction: txResult.rows[0] }, 'Withdrawal successful');
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const transfer = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { recipientEmail, amount, description } = req.body;
    const amt = Number(amount);
    if (!recipientEmail || !amt || amt <= 0) {
      return error(res, 'Recipient email and a positive amount are required', 422);
    }
    if (recipientEmail.toLowerCase() === req.user.email.toLowerCase()) {
      return error(res, 'You cannot transfer money to yourself', 400);
    }

    const recipientResult = await db.query('SELECT id, full_name, email FROM users WHERE email = $1', [
      recipientEmail.toLowerCase(),
    ]);
    if (recipientResult.rows.length === 0) return error(res, 'Recipient not found', 404);
    const recipient = recipientResult.rows[0];

    await client.query('BEGIN');

    const senderWalletCheck = await client.query('SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [req.user.id]);
    const senderWallet = senderWalletCheck.rows[0];
    if (Number(senderWallet.balance) < amt) {
      await client.query('ROLLBACK');
      return error(res, 'Insufficient balance', 400);
    }

    const senderUpdate = await client.query(
      'UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
      [amt, req.user.id]
    );
    const recipientUpdate = await client.query(
      'UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
      [amt, recipient.id]
    );

    const outTx = await client.query(
      `INSERT INTO transactions (wallet_id, type, amount, balance_after, description, counterparty_user_id)
       VALUES ($1, 'transfer_out', $2, $3, $4, $5) RETURNING *`,
      [senderUpdate.rows[0].id, amt, senderUpdate.rows[0].balance, description || `Transfer to ${recipient.email}`, recipient.id]
    );
    await client.query(
      `INSERT INTO transactions (wallet_id, type, amount, balance_after, description, counterparty_user_id, reference_id)
       VALUES ($1, 'transfer_in', $2, $3, $4, $5, $6)`,
      [
        recipientUpdate.rows[0].id,
        amt,
        recipientUpdate.rows[0].balance,
        description || `Transfer from ${req.user.email}`,
        req.user.id,
        outTx.rows[0].id,
      ]
    );

    await client.query('COMMIT');

    return success(res, { wallet: senderUpdate.rows[0], transaction: outTx.rows[0] }, 'Transfer successful');
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = { getWallet, deposit, withdraw, transfer };
