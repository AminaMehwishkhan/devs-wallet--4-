// Vercel treats every file under /api as a serverless function. This one
// simply exports the same Express app used by server.js locally — no route
// or controller logic is duplicated. Combined with vercel.json's rewrite
// (all paths -> this function), the Express app's own internal routing
// (app.use('/api', routes), etc.) handles everything exactly as it does
// when running under `npm run dev` or on Render.
const app = require('../app');

module.exports = app;
