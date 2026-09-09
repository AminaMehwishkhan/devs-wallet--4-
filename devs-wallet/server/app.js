require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Accept requests from the configured CLIENT_URL (your stable production domain)
// AND from any *.vercel.app origin. Vercel gives every deployment its own unique
// preview URL (e.g. project-name-<hash>-<team>.vercel.app) in addition to the
// stable domain, and CLIENT_URL can only ever match one exact string — this
// callback avoids having to update CLIENT_URL every time a new preview URL shows
// up (e.g. after every redeploy, or when an evaluator opens a non-production link).
const corsOptions = {
  origin: (origin, callback) => {
    const allowedExact = process.env.CLIENT_URL;
    const isAllowedVercelPreview = origin && /\.vercel\.app$/.test(origin);
    if (!origin || origin === allowedExact || isAllowedVercelPreview) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));
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
