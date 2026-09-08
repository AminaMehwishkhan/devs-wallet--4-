require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  /^https:\/\/devs-wallet-4-[a-z0-9]+\.vercel\.app$/, // any preview deploy
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // same-origin / curl / server-to-server
    const ok = allowedOrigins.some(o =>
      o instanceof RegExp ? o.test(origin) : o === origin
    );
    callback(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  credentials: true,
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NOTE: avatar uploads are written to local disk via multer (see middleware/upload.js).
// This works fine on a traditional server (Render, a VPS, local dev) but NOT on Vercel's
// serverless functions, whose filesystem is ephemeral and read-only outside /tmp. If you
// deploy to Vercel, avatar upload will not persist between requests. Swapping multer's
// disk storage for a cloud storage provider (e.g. Cloudinary, S3) is the fix — flagged
// here rather than silently broken.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Devs Wallet API' }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
