const db = require('../config/db');
const { success, error } = require('../utils/response');

const listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = ["1=1"];
    const params = [];
    let idx = 1;
    if (search) {
      conditions.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (status) {
      conditions.push(`status = $${idx++}`);
      params.push(status);
    }
    const whereClause = conditions.join(' AND ');

    const countResult = await db.query(`SELECT COUNT(*) FROM users WHERE ${whereClause}`, params);
    const total = Number(countResult.rows[0].count);

    params.push(Number(limit), offset);
    const result = await db.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.status, u.created_at, w.balance
       FROM users u LEFT JOIN wallets w ON w.user_id = u.id
       WHERE ${whereClause} ORDER BY u.created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      params
    );

    return success(res, {
      users: result.rows,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) return error(res, 'Invalid status', 422);

    const result = await db.query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, full_name, email, status',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return error(res, 'User not found', 404);
    return success(res, result.rows[0], `User ${status}`);
  } catch (err) {
    next(err);
  }
};

const listAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, type, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = ['1=1'];
    const params = [];
    let idx = 1;
    if (type) {
      conditions.push(`t.type = $${idx++}`);
      params.push(type);
    }
    if (status) {
      conditions.push(`t.status = $${idx++}`);
      params.push(status);
    }
    const whereClause = conditions.join(' AND ');

    const countResult = await db.query(`SELECT COUNT(*) FROM transactions t WHERE ${whereClause}`, params);
    const total = Number(countResult.rows[0].count);

    params.push(Number(limit), offset);
    const result = await db.query(
      `SELECT t.*, u.full_name, u.email FROM transactions t
       JOIN wallets w ON w.id = t.wallet_id
       JOIN users u ON u.id = w.user_id
       WHERE ${whereClause}
       ORDER BY t.created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      params
    );

    return success(res, {
      transactions: result.rows,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

const getReports = async (req, res, next) => {
  try {
    const totalsResult = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM users WHERE status = 'active') AS active_users,
        (SELECT COALESCE(SUM(balance),0) FROM wallets) AS total_wallet_balance,
        (SELECT COUNT(*) FROM transactions) AS total_transactions,
        (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type = 'deposit') AS total_deposits,
        (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type = 'withdraw') AS total_withdrawals,
        (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type = 'bill_payment') AS total_bill_payments,
        (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type = 'package_purchase') AS total_package_sales
    `);

    const monthlyResult = await db.query(`
      SELECT to_char(date_trunc('month', created_at), 'Mon YYYY') AS month,
             COUNT(*) AS transaction_count,
             COALESCE(SUM(amount),0) AS volume
      FROM transactions
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at)
    `);

    const newUsersResult = await db.query(`
      SELECT to_char(date_trunc('month', created_at), 'Mon YYYY') AS month, COUNT(*) AS new_users
      FROM users
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at)
    `);

    return success(res, {
      totals: totalsResult.rows[0],
      monthlyTransactionVolume: monthlyResult.rows,
      newUsersPerMonth: newUsersResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, updateUserStatus, listAllTransactions, getReports };
