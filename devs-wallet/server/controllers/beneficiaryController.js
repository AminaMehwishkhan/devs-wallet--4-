const db = require('../config/db');
const { success, error } = require('../utils/response');

const listBeneficiaries = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM beneficiaries WHERE user_id = $1 ORDER BY created_at DESC', [
      req.user.id,
    ]);
    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

const addBeneficiary = async (req, res, next) => {
  try {
    const { nickname, beneficiaryEmail, bankOrWallet } = req.body;
    if (!nickname || !beneficiaryEmail) return error(res, 'Nickname and email are required', 422);

    const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [beneficiaryEmail.toLowerCase()]);
    if (userCheck.rows.length === 0) return error(res, 'No Devs Wallet user found with that email', 404);

    const result = await db.query(
      `INSERT INTO beneficiaries (user_id, nickname, beneficiary_email, bank_or_wallet)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, nickname, beneficiaryEmail.toLowerCase(), bankOrWallet || 'Devs Wallet']
    );
    return success(res, result.rows[0], 'Beneficiary added', 201);
  } catch (err) {
    next(err);
  }
};

const updateBeneficiary = async (req, res, next) => {
  try {
    const { nickname, bankOrWallet } = req.body;
    const result = await db.query(
      `UPDATE beneficiaries SET nickname = COALESCE($1, nickname), bank_or_wallet = COALESCE($2, bank_or_wallet)
       WHERE id = $3 AND user_id = $4 RETURNING *`,
      [nickname, bankOrWallet, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return error(res, 'Beneficiary not found', 404);
    return success(res, result.rows[0], 'Beneficiary updated');
  } catch (err) {
    next(err);
  }
};

const deleteBeneficiary = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM beneficiaries WHERE id = $1 AND user_id = $2 RETURNING id', [
      req.params.id,
      req.user.id,
    ]);
    if (result.rows.length === 0) return error(res, 'Beneficiary not found', 404);
    return success(res, {}, 'Beneficiary removed');
  } catch (err) {
    next(err);
  }
};

module.exports = { listBeneficiaries, addBeneficiary, updateBeneficiary, deleteBeneficiary };
