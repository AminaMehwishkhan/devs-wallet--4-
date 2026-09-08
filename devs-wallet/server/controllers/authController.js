const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { success, error } = require('../utils/response');

const SALT_ROUNDS = 10;

const register = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { fullName, email, phone, password } = req.body;
    if (!fullName || !email || !password) {
      return error(res, 'Full name, email and password are required', 422);
    }
    if (password.length < 6) {
      return error(res, 'Password must be at least 6 characters', 422);
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) return error(res, 'Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await client.query('BEGIN');
    const userResult = await client.query(
      `INSERT INTO users (full_name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, phone, role, avatar_url, created_at`,
      [fullName, email.toLowerCase(), phone || null, passwordHash]
    );
    const user = userResult.rows[0];

    await client.query('INSERT INTO wallets (user_id) VALUES ($1)', [user.id]);
    await client.query('COMMIT');

    const token = generateToken({ id: user.id, role: user.role });
    return success(res, { user, token }, 'Registration successful', 201);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, 'Email and password are required', 422);

    const result = await db.query(
      `SELECT id, full_name, email, password_hash, role, status, avatar_url FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );
    if (result.rows.length === 0) return error(res, 'Invalid email or password', 401);

    const user = result.rows[0];
    if (user.status === 'suspended') return error(res, 'Account suspended. Contact support.', 403);

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return error(res, 'Invalid email or password', 401);

    const token = generateToken({ id: user.id, role: user.role });
    delete user.password_hash;

    return success(res, { user, token }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return error(res, 'Email is required', 422);

    const result = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    // Always respond the same way to avoid leaking which emails are registered
    if (result.rows.length === 0) {
      return success(res, {}, 'If that email exists, a reset link has been generated');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min

    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, expires, result.rows[0].id]
    );

    // In production this would be emailed. For the internship demo we return it directly.
    return success(res, { resetToken }, 'Reset token generated (demo mode: returned directly instead of emailed)');
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return error(res, 'Token and new password are required', 422);
    if (newPassword.length < 6) return error(res, 'Password must be at least 6 characters', 422);

    const result = await db.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );
    if (result.rows.length === 0) return error(res, 'Invalid or expired reset token', 400);

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [passwordHash, result.rows[0].id]
    );

    return success(res, {}, 'Password reset successful. You can now log in.');
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const walletResult = await db.query('SELECT balance, currency FROM wallets WHERE user_id = $1', [req.user.id]);
    return success(res, { user: req.user, wallet: walletResult.rows[0] || null });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, forgotPassword, resetPassword, me };
