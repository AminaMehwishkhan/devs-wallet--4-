const { Pool } = require('pg');
require('dotenv').config();

// Hosted Postgres providers (Neon, Render, Supabase, etc.) require SSL and
// use certificates not in Node's default trust store. Local development
// (plain "localhost" connections) doesn't need this. Toggle it explicitly
// with DB_SSL=true if a provider needs SSL but isn't auto-detected below.
const isLocalDb = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '');
const useSsl = process.env.DB_SSL === 'true' || (!isLocalDb && process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error', err);
  process.exit(1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};
