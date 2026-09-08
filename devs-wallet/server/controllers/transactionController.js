const db = require('../config/db');
const { success, error } = require('../utils/response');

const listTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, status, startDate, endDate, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const walletResult = await db.query('SELECT id FROM wallets WHERE user_id = $1', [req.user.id]);
    if (walletResult.rows.length === 0) return error(res, 'Wallet not found', 404);
    const walletId = walletResult.rows[0].id;

    const conditions = ['wallet_id = $1'];
    const params = [walletId];
    let idx = 2;

    if (type) {
      conditions.push(`type = $${idx++}`);
      params.push(type);
    }
    if (status) {
      conditions.push(`status = $${idx++}`);
      params.push(status);
    }
    if (startDate) {
      conditions.push(`created_at >= $${idx++}`);
      params.push(startDate);
    }
    if (endDate) {
      conditions.push(`created_at <= $${idx++}`);
      params.push(endDate);
    }
    if (search) {
      conditions.push(`description ILIKE $${idx++}`);
      params.push(`%${search}%`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await db.query(`SELECT COUNT(*) FROM transactions WHERE ${whereClause}`, params);
    const total = Number(countResult.rows[0].count);

    params.push(Number(limit), offset);
    const dataResult = await db.query(
      `SELECT * FROM transactions WHERE ${whereClause} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      params
    );

    return success(res, {
      transactions: dataResult.rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const walletResult = await db.query('SELECT id FROM wallets WHERE user_id = $1', [req.user.id]);
    const walletId = walletResult.rows[0].id;

    const result = await db.query('SELECT * FROM transactions WHERE id = $1 AND wallet_id = $2', [
      req.params.id,
      walletId,
    ]);
    if (result.rows.length === 0) return error(res, 'Transaction not found', 404);
    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const walletResult = await db.query('SELECT id, balance FROM wallets WHERE user_id = $1', [req.user.id]);
    if (walletResult.rows.length === 0) return error(res, 'Wallet not found', 404);
    const wallet = walletResult.rows[0];

    const monthlyResult = await db.query(
      `SELECT to_char(date_trunc('month', created_at), 'Mon') AS month,
              SUM(CASE WHEN type IN ('deposit','transfer_in') THEN amount ELSE 0 END) AS inflow,
              SUM(CASE WHEN type IN ('withdraw','transfer_out','bill_payment','package_purchase') THEN amount ELSE 0 END) AS outflow
       FROM transactions
       WHERE wallet_id = $1 AND created_at >= NOW() - INTERVAL '6 months'
       GROUP BY date_trunc('month', created_at)
       ORDER BY date_trunc('month', created_at)`,
      [wallet.id]
    );

    const breakdownResult = await db.query(
      `SELECT type, SUM(amount) AS total FROM transactions WHERE wallet_id = $1 GROUP BY type`,
      [wallet.id]
    );

    const recentResult = await db.query(
      `SELECT * FROM transactions WHERE wallet_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [wallet.id]
    );

    return success(res, {
      balance: wallet.balance,
      monthly: monthlyResult.rows,
      breakdown: breakdownResult.rows,
      recentTransactions: recentResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listTransactions, getTransactionById, getDashboardStats };
