const db = require('../config/db');
const { success, error } = require('../utils/response');

const listPackages = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM mobile_packages ORDER BY price ASC');
    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

const purchasePackage = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { packageId, mobileNumber } = req.body;
    if (!packageId || !mobileNumber) return error(res, 'Package and mobile number are required', 422);

    const pkgResult = await db.query('SELECT * FROM mobile_packages WHERE id = $1', [packageId]);
    if (pkgResult.rows.length === 0) return error(res, 'Package not found', 404);
    const pkg = pkgResult.rows[0];

    await client.query('BEGIN');

    const walletCheck = await client.query('SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [req.user.id]);
    const wallet = walletCheck.rows[0];
    if (Number(wallet.balance) < Number(pkg.price)) {
      await client.query('ROLLBACK');
      return error(res, 'Insufficient balance', 400);
    }

    const walletUpdate = await client.query(
      'UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
      [pkg.price, req.user.id]
    );

    const txResult = await client.query(
      `INSERT INTO transactions (wallet_id, type, amount, balance_after, description)
       VALUES ($1, 'package_purchase', $2, $3, $4) RETURNING *`,
      [walletUpdate.rows[0].id, pkg.price, walletUpdate.rows[0].balance, `${pkg.name} (${pkg.network})`]
    );

    const purchaseResult = await client.query(
      `INSERT INTO package_purchases (user_id, package_id, mobile_number, amount, transaction_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, packageId, mobileNumber, pkg.price, txResult.rows[0].id]
    );

    await client.query('COMMIT');
    return success(res, { purchase: purchaseResult.rows[0], wallet: walletUpdate.rows[0] }, 'Package purchased successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const listMyPurchases = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT pp.*, mp.name, mp.network, mp.type FROM package_purchases pp
       JOIN mobile_packages mp ON mp.id = pp.package_id
       WHERE pp.user_id = $1 ORDER BY pp.created_at DESC`,
      [req.user.id]
    );
    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { listPackages, purchasePackage, listMyPurchases };
