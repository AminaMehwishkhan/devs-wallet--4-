# Devs Wallet

A full-stack digital wallet web application — built with PostgreSQL, Express, React, and Node.js (PERN) — inspired by consumer digital-wallet platforms like JazzCash and NayaPay.

> **U Devs — Full Stack PERN Internship Project**
> Project: Devs Wallet · Assigned by Usama Aslam, Founder & CEO, U Devs

---

## Overview

Devs Wallet lets a user register, hold a wallet balance, deposit/withdraw/transfer money to other users, pay simulated utility bills, buy simulated mobile packages, set savings goals, manage a list of beneficiaries, and manage their profile and security settings. An admin panel gives a platform operator visibility into users, transactions, and aggregate reports. The backend is a REST API with JWT authentication and role-based access; the frontend is a React SPA built with Material UI.

## Features

Only functionality that actually exists in the code is listed here.

- **Authentication** — Register, Login, Forgot Password → Reset Password (JWT-based sessions)
- **Dashboard** — current balance, 6-month cash flow line chart, spending-type pie chart, 5 most recent transactions
- **Wallet** — deposit, withdraw, transfer to another Devs Wallet user (by email) — all balance-safe via database transactions with row locking
- **Transactions** — paginated history with filters (type, status, date range, text search)
- **Savings Goals** — create/edit/delete, contribute from the wallet, automatic progress tracking, auto-completes at target
- **Bill Payments** — Electricity, Gas, Internet, Mobile (*simulated* — no real provider is contacted)
- **Mobile Packages** — browse a seeded catalog and purchase (*simulated*)
- **Beneficiaries** — add/edit/delete saved recipients (must be an existing Devs Wallet user)
- **Profile & Security** — update name/phone, change password, upload an avatar image
- **Admin Panel** — list/suspend/activate users, view all transactions platform-wide, aggregate reports (totals, monthly transaction volume, new users per month)
- **Validation** — every write endpoint validates input server-side with `express-validator`, independent of the frontend
- **Responsive UI** — collapsible mobile navigation, scrollable data tables on small screens, responsive grid layouts throughout

## Screenshots / Demo

- **Live Demo:** _add your deployed frontend URL here_
- **Demo Video:** _add your demo video link here_
- **Screenshots:**

  | Dashboard | Wallet | Admin Reports |
  |---|---|---|
  | _add screenshot_ | _add screenshot_ | _add screenshot_ |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), Material UI (`@mui/material`, `@mui/icons-material`), React Router, Axios |
| Frontend state | Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) — auth/session state |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Authentication | JSON Web Tokens (`jsonwebtoken`), `bcrypt` password hashing |
| Validation | `express-validator` |
| File upload | `multer` (avatar images) |
| Database | PostgreSQL (`pg` driver, raw parameterized SQL — no ORM) |

## Architecture

```
Browser (React SPA)
        │  Axios, JWT in Authorization header
        ▼
Express REST API
   ├─ middleware: JWT auth, role guard, express-validator, multer, error handler
   ├─ controllers: business logic per module
   └─ routes: /api/{auth,wallet,transactions,savings-goals,bills,packages,beneficiaries,profile,admin}
        │  pg (node-postgres), parameterized SQL, transactions with row locks
        ▼
PostgreSQL
```

- No ORM — every query is raw, parameterized SQL, giving full visibility into exactly what runs.
- Money-moving endpoints (deposit, withdraw, transfer, bill payment, package purchase, savings contribution) run inside explicit PostgreSQL transactions with `SELECT ... FOR UPDATE` row locks, preventing race conditions.
- The Express app is factored into `server/app.js` (the app itself) + `server/server.js` (a thin `app.listen()` wrapper for local/traditional hosting) + `server/api/index.js` (a Vercel serverless entry point that re-exports the same app) — the same route/controller code runs unchanged in either deployment model.

## Project Structure

```
devs-wallet/
├── server/
│   ├── app.js              Express app (middleware + routes)
│   ├── server.js           Local/traditional entry point (npm run dev / start)
│   ├── api/index.js        Vercel serverless entry point (same app.js)
│   ├── vercel.json         Vercel routing config for the serverless deployment
│   ├── config/             db.js (pg pool), migrate.js
│   ├── controllers/        one file per module
│   ├── middleware/         auth, role, validate, upload, errorHandler
│   ├── validators/         express-validator rule sets, one file per module
│   ├── routes/             REST endpoint definitions
│   └── migrations/schema.sql
├── client/
│   └── src/
│       ├── components/     Sidebar, Navbar, ProtectedRoute, AdminRoute, StatCard
│       ├── layouts/        MainLayout (app shell), AuthLayout (login/register)
│       ├── pages/          one page per module + pages/admin/*
│       ├── redux/          store.js, authSlice.js
│       ├── services/       one Axios service file per module
│       └── hooks/          useAuth.js
├── docs/
│   ├── ERD.md
│   ├── API_DOCUMENTATION.md
│   └── DEMO_PRESENTATION.md
├── database/
│   ├── devs_wallet_backup.sql
│   └── README.md
├── .gitignore
├── README.md
└── SUBMISSION_CHECKLIST.md
```

## Database Schema

Full ERD with every table, column, and relationship: **[docs/ERD.md](./docs/ERD.md)**

## API Documentation

Every endpoint, with request/response shapes and auth requirements: **[docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)**

## Installation

### 1. Clone and set up the database

```bash
git clone <your-repo-url>
cd devs-wallet
createdb devs_wallet
```

### 2. Backend

```bash
cd server
cp .env.example .env
# edit .env: set DATABASE_URL and JWT_SECRET
npm install
npm run migrate        # creates all tables + seeds mobile packages
npm run dev            # http://localhost:5000
```

Alternatively, restore the included backup instead of running the migration — see [database/README.md](./database/README.md).

### 3. Frontend (separate terminal)

```bash
cd client
cp .env.example .env
# default VITE_API_URL=http://localhost:5000/api is correct if you didn't change PORT
npm install
npm run dev             # http://localhost:5173
```

### 4. Verify

Visit `http://localhost:5000/api/health` — should return a small JSON success response. Then open `http://localhost:5173`, register an account, and you're in.

## Environment Variables

**`server/.env`** (see `server/.env.example`):

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No (defaults to 5000) | Port the Express server listens on |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Signing secret for JWTs — use a long random string |
| `JWT_EXPIRES_IN` | No (defaults to `7d`) | Token lifetime |
| `CLIENT_URL` | Yes for production | Allowed CORS origin — your deployed frontend's URL |
| `DB_SSL` | No | Force SSL on the DB connection; auto-enabled already for any non-`localhost` `DATABASE_URL` |

**`client/.env`** (see `client/.env.example`):

| Variable | Required | Purpose |
|---|---|---|
| `VITE_API_URL` | Yes | Base URL the frontend calls, e.g. `http://localhost:5000/api` or `https://your-backend/api` |

No real credentials are committed anywhere in this repository — only `.env.example` templates with placeholder values.

## Authentication & Security

- Passwords hashed with `bcrypt` (10 salt rounds) — plaintext is never stored or logged.
- Stateless JWT sessions; the current user is re-fetched from the database on every protected request (`middleware/auth.js`), so a suspended account is rejected immediately, not just at next login.
- Role-based access control (`middleware/role.js`) gates the entire `/api/admin/*` namespace to `role: 'admin'` users.
- Every write endpoint validates its input server-side with `express-validator`, returning structured `422` errors — this is enforced independently of what the frontend allows, so the API is safe to call directly.
- Money-moving operations use `SELECT ... FOR UPDATE` row locks inside database transactions to prevent balance races from concurrent requests.
- `forgot-password` returns an identical response regardless of whether the email is registered, avoiding user enumeration.

## Admin Panel

Accessible to any user with `role = 'admin'` (the sidebar's Admin section appears automatically for such accounts). Capabilities:

- **Manage Users** — search/paginate all users, suspend or reactivate any account
- **All Transactions** — platform-wide transaction feed (not scoped to one user), filterable by type/status
- **Reports** — total users, active users, total wallet balance across the platform, total transaction count, totals by transaction type, 6-month transaction volume trend, 6-month new-user trend

## Responsive Design

- Sidebar renders as a permanent drawer on tablet/desktop and a hamburger-triggered temporary drawer on mobile (MUI `Drawer` breakpoint variants).
- Navbar width/margin adapts via MUI `sx` breakpoint objects.
- Data tables (Transactions, Bill history, Admin Users, Admin Transactions) are wrapped in `TableContainer` for horizontal scroll on narrow viewports instead of breaking page layout.
- All page grids use MUI's `xs`/`sm`/`md` breakpoint props.
- Auth pages (Login/Register/Forgot Password) use reduced padding on extra-small screens.

## Deployment

This repository supports two backend deployment models without any code duplication — both run the exact same `server/app.js`:

**Option A — Traditional server (Render, Railway, a VPS, etc.):**
Root directory `server`, build command `npm install`, start command `npm start`. Set the environment variables listed above. Run `npm run migrate` once against the target database (or restore `database/devs_wallet_backup.sql`).

**Option B — Vercel serverless:**
Root directory `server`. Vercel auto-detects `server/api/index.js` as a serverless function; `server/vercel.json` routes every request to it, so the app's own internal routing handles everything unchanged. Use a hosted Postgres provider with connection pooling (e.g. Neon's pooled connection string), since serverless functions open a new DB connection per invocation. **Known limitation:** avatar upload writes to local disk via `multer`, which does not persist on Vercel's ephemeral filesystem — this one feature needs cloud storage (e.g. Cloudinary, S3) to work in a serverless deployment.

The frontend (`client/`) deploys the same way on either path: any static host that runs `npm run build` and serves `client/dist` (Vercel, Netlify, etc.), with `VITE_API_URL` set to the deployed backend's URL + `/api`.

**Live deployment:**
- Frontend: _add your live URL here_
- Backend: _add your live URL here_

## Demo Credentials

No demo accounts are seeded by the migration — only the `mobile_packages` catalog is pre-populated. To create dedicated evaluator accounts:

1. Register a normal account through the app's Sign Up page — this becomes your **USER** demo login.
2. Register (or promote) a second account to admin by running this against your database:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your_admin_demo_email@example.com';
   ```
   This becomes your **ADMIN** demo login.

```
USER:
Email:
Password:

ADMIN:
Email:
Password:
```
_(Fill in only demo credentials created specifically for evaluation — never a real personal account.)_

## Testing

No automated test suite is included (see Known Limitations below). To manually verify the major flows:

1. Register two accounts (e.g. a sender and a recipient).
2. As the sender: deposit funds (Wallet page), confirm the balance updates and a `deposit` row appears in Transactions.
3. Create a savings goal, contribute to it from the wallet, confirm `saved_amount` increases and the wallet balance decreases correspondingly.
4. Pay a bill and purchase a mobile package — confirm both debit the wallet and appear in their respective history tables.
5. Add the recipient as a beneficiary, then transfer money to them by email — confirm the sender's balance decreases and the recipient's increases, with linked `transfer_out`/`transfer_in` transaction rows.
6. Promote one account to `admin` via SQL (see Demo Credentials above), log in, and confirm the Admin section appears with working Manage Users, All Transactions, and Reports pages.
7. Try invalid input on any form (negative amount, malformed email) and confirm a validation error is returned rather than a server crash.

## Known Limitations

- No automated test suite yet (Jest + Supertest for the API; React Testing Library for the frontend, would be the natural next step).
- `forgot-password` does not send a real email — the reset token is returned directly in the API response for demo purposes.
- No rate limiting on auth endpoints yet.
- Avatar upload does not persist if deployed to Vercel's serverless functions (see Deployment section) — works correctly on a traditional server or locally.
- The `notifications` table exists in the schema but has no API or UI built on top of it yet — it's schema-only, not a working feature.

## Internship Project

**U Devs — Full Stack PERN Internship Project**
Project: Devs Wallet (Digital Wallet Web Application)
Assigned By: Usama Aslam, Founder & CEO, U Devs
