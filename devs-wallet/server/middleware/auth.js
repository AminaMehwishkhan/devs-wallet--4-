const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');
const db = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return error(res, 'No authentication token provided', 401);
    }
    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    const result = await db.query(
      'SELECT id, full_name, email, role, status, avatar_url FROM users WHERE id = $1',
      [decoded.id]
    );
    if (result.rows.length === 0) return error(res, 'User no longer exists', 401);
    if (result.rows[0].status === 'suspended') return error(res, 'Account suspended', 403);

    req.user = result.rows[0];
    next();
  } catch (err) {
    return error(res, 'Invalid or expired token', 401);
  }
};

module.exports = { authenticate };
