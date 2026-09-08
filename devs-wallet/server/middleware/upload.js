const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');

// On a traditional server (Render, a VPS, local dev) this directory is writable
// and gets created once here. On Vercel's serverless functions, everything outside
// /tmp is read-only, so this throws — caught here so it doesn't crash the entire
// API on cold start. Avatar upload itself will still fail gracefully per-request
// in that environment (a normal error response, not a function crash) — see the
// README's Known Limitations.
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
  console.warn('Could not create uploads directory (expected on read-only/serverless filesystems):', err.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
  if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (png, jpg, jpeg, webp) are allowed'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

module.exports = upload;
