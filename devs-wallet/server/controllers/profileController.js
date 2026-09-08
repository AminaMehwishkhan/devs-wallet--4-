const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { success, error } = require('../utils/response');

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    const result = await db.query(
      `UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), updated_at = NOW()
       WHERE id = $3 RETURNING id, full_name, email, phone, role, avatar_url`,
      [fullName, phone, req.user.id]
    );
    return success(res, result.rows[0], 'Profile updated');
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return error(res, 'Current and new password are required', 422);
    if (newPassword.length < 6) return error(res, 'New password must be at least 6 characters', 422);

    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const match = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!match) return error(res, 'Current password is incorrect', 401);

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user.id]);

    return success(res, {}, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'No file uploaded', 422);
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const result = await db.query(
      'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2 RETURNING id, avatar_url',
      [avatarUrl, req.user.id]
    );
    return success(res, result.rows[0], 'Avatar updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { updateProfile, changePassword, updateAvatar };
