# Devs Wallet

A full-stack digital wallet web application built with PostgreSQL, Express, React, and Node.js (PERN), inspired by consumer digital wallet platforms like JazzCash and NayaPay.

> **U Devs | Full Stack PERN Internship Project**
> Project: Devs Wallet | Assigned by Usama Aslam, Founder & CEO, U Devs

---

## Overview

Devs Wallet allows users to register, maintain a wallet balance, deposit, withdraw, and transfer money to other users. Users can also pay simulated utility bills, purchase simulated mobile packages, create savings goals, manage beneficiaries, and update their profile and security settings.

The application includes an admin panel for managing users, viewing platform-wide transactions, and monitoring aggregate reports. The backend provides a REST API with JWT authentication and role-based access control, while the frontend is a React single-page application built with Material UI.

## Features

* **Authentication:** Register, Login, Forgot Password, and Reset Password with JWT-based sessions
* **Dashboard:** Current balance, 6-month cash flow chart, spending-type pie chart, and five most recent transactions
* **Wallet:** Deposit, withdraw, and transfer money to another Devs Wallet user by email, with database transactions and row locking for balance consistency
* **Transactions:** Paginated transaction history with type, status, date range, and text search filters
* **Savings Goals:** Create, edit, delete, and contribute funds to savings goals with automatic progress tracking
* **Bill Payments:** Simulated Electricity, Gas, Internet, and Mobile bill payments
* **Mobile Packages:** Browse the seeded mobile package catalog and simulate package purchases
* **Beneficiaries:** Add, edit, and delete saved recipients who have existing Devs Wallet accounts
* **Profile & Security:** Update name and phone number, change password, and upload an avatar image
* **Admin Panel:** Manage users, suspend or activate accounts, view platform-wide transactions, and access aggregate reports
* **Validation:** Server-side input validation using `express-validator`
* **Responsive UI:** Responsive grid layouts, collapsible mobile navigation, and scrollable data tables for smaller screens

## Demo

* **Live App:** https://devs-wallet-4-oifq.vercel.app/

## Tech Stack

| Layer          | Technology                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------ |
| Frontend       | React 18 (Vite), Material UI (`@mui/material`, `@mui/icons-material`), React Router, Axios |
| Frontend State | Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) for authentication and session state     |
| Charts         | Recharts                                                                                   |
| Backend        | Node.js, Express.js                                                                        |
| Authentication | JSON Web Tokens (`jsonwebtoken`), `bcrypt` password hashing                                |
| Validation     | `express-validator`                                                                        |
| File Upload    | `multer` for avatar images                                                                 |
| Database       | PostgreSQL (`pg` driver, raw parameterized SQL, no ORM)                                    |

## Architecture

```text
Browser (React SPA)
        |
        | Axios, JWT in Authorization header
        v
Express REST API
    |-- middleware: JWT auth, role guard, express-validator, multer, error handler
    |-- controllers: business logic per module
    |-- routes: /api/{auth,wallet,transactions,savings-goals,bills,packages,beneficiaries,profile,admin}
        |
        | pg (node-postgres), parameterized SQL, transactions with row locks
        v
PostgreSQL
```

* The project does not use an ORM. Database operations use raw parameterized SQL.
* Money-moving endpoints, including deposit, withdraw, transfer, bill payment, package purchase, and savings contributions, run inside PostgreSQL transactions with `SELECT ... FOR UPDATE` row locks to maintain balance consistency during concurrent requests.
* The Express application is separated into `server/app.js`, `server/server.js`, and `server/api/index.js`. The same routes and controllers are used for local, traditional server, and Vercel serverless deployments.

## Project Structure

```text
devs-wallet/
├── server/
│   ├── app.js              Express app (middleware + routes)
│   ├── server.js           Local/traditional entry point
│   ├── api/index.js        Vercel serverless entry point
│   ├── vercel.json         Vercel routing configuration
│   ├── config/             db.js, migrate.js
│   ├── controllers/        Business logic for each module
│   ├── middleware/         auth, role, validate, upload, errorHandler
│   ├── validators/         express-validator rule sets
│   ├── routes/             REST endpoint definitions
│   └── migrations/schema.sql
├── client/
│   └── src/
│       ├── components/     Sidebar, Navbar, ProtectedRoute, AdminRoute, StatCard
│       ├── layouts/        MainLayout, AuthLayout
│       ├── pages/          Application pages and admin pages
│       ├── redux/          store.js, authSlice.js
│       ├── services/       Axios service files
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

The complete Entity Relationship Diagram, including the application's tables, columns, and relationships, is available here:

[docs/ERD.md](./docs/ERD.md)

## API Documentation

Documentation for the application's REST API, including endpoints, request and response structures, and authentication requirements, is available here:

[docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

## Installation

### 1. Clone and set up the database

```bash
git clone https://github.com/AminaMehwishkhan/devs-wallet--4-.git
cd devs-wallet--4-
createdb devs_wallet
```

### 2. Backend

```bash
cd server
cp .env.example .env

# Set DATABASE_URL and JWT_SECRET in .env

npm install
npm run migrate
npm run dev
```

The backend runs locally at:

```text
http://localhost:5000
```

Alternatively, restore the included PostgreSQL backup instead of running the migration. See:

[database/README.md](./database/README.md)

### 3. Frontend

Open a separate terminal:

```bash
cd client
cp .env.example .env

npm install
npm run dev
```

For local development, set:

```env
VITE_API_URL=http://localhost:5000/api
```

The frontend runs locally at:

```text
http://localhost:5173
```

### 4. Verify

Open:

```text
http://localhost:5000/api/health
```

A successful response confirms that the backend is running.

Then open:

```text
http://localhost:5173
```

Register an account and log in to access the application.

## Environment Variables

### `server/.env`

See `server/.env.example`.

| Variable         | Required               | Purpose                                  |
| ---------------- | ---------------------- | ---------------------------------------- |
| `PORT`           | No, defaults to `5000` | Port used by the Express server          |
| `DATABASE_URL`   | Yes                    | PostgreSQL connection string             |
| `JWT_SECRET`     | Yes                    | Secret used to sign JWTs                 |
| `JWT_EXPIRES_IN` | No, defaults to `7d`   | JWT lifetime                             |
| `CLIENT_URL`     | Yes for production     | Allowed frontend origin for CORS         |
| `DB_SSL`         | No                     | Controls SSL for the database connection |

### `client/.env`

See `client/.env.example`.

| Variable       | Required | Purpose                                       |
| -------------- | -------- | --------------------------------------------- |
| `VITE_API_URL` | Yes      | Base URL of the deployed or local backend API |

Example for local development:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, `VITE_API_URL` should point to the deployed backend API.

No real credentials are committed to the repository. The `.env.example` files contain configuration templates only.

## Authentication & Security

* Passwords are hashed using `bcrypt` with 10 salt rounds. Plaintext passwords are not stored.
* JWTs are used for authenticated sessions.
* The authenticated user is retrieved from the database on protected requests, allowing suspended accounts to be rejected immediately.
* Role-based access control in `middleware/role.js` restricts `/api/admin/*` routes to users with the `admin` role.
* Write endpoints validate input on the server using `express-validator`.
* Money-moving operations use PostgreSQL transactions and `SELECT ... FOR UPDATE` row locks to maintain wallet balance consistency.
* The forgot-password endpoint returns the same general response regardless of whether an email is registered, reducing user enumeration risk.

## Admin Panel

The Admin section is available to authenticated users with the `admin` role.

### Manage Users

Administrators can search and paginate registered users and suspend or reactivate accounts.

### All Transactions

Administrators can view platform-wide transaction records and filter them by type and status.

### Reports

The reports section includes:

* Total users
* Active users
* Total wallet balance
* Total transactions
* Transaction totals by type
* Six-month transaction volume
* Six-month new-user trend

## Responsive Design

* The sidebar uses a permanent drawer on tablet and desktop layouts and a hamburger-triggered temporary drawer on mobile devices.
* Navbar dimensions and spacing adapt using Material UI breakpoints.
* Transaction, bill history, admin user, and admin transaction tables use `TableContainer` to support horizontal scrolling on smaller screens.
* Application page grids use Material UI `xs`, `sm`, and `md` breakpoint properties.
* Authentication pages use reduced spacing on extra-small screens.

## Deployment

The project supports both traditional Node.js hosting and Vercel serverless deployment.

### Option A: Traditional Server

Set the root directory to:

```text
server
```

Use:

```text
Build command: npm install
Start command: npm start
```

Configure the required environment variables and run:

```bash
npm run migrate
```

Alternatively, restore:

```text
database/devs_wallet_backup.sql
```

### Option B: Vercel Serverless

Set the root directory to `server`.

Vercel uses `server/api/index.js` as the serverless entry point. The `server/vercel.json` configuration routes incoming requests to the Express application.

A hosted PostgreSQL database with connection pooling is recommended for the serverless deployment.

Persistent avatar storage requires an external storage service such as Cloudinary or Amazon S3 because files written to the Vercel serverless filesystem do not persist between invocations.

### Frontend Deployment

The React frontend can be deployed to a static hosting platform such as Vercel or Netlify.

The production environment must define:

```env
VITE_API_URL=https://YOUR-BACKEND-DOMAIN/api
```

### Live Deployment

* **App:** https://devs-wallet-4-oifq.vercel.app/
* **Repository:** https://github.com/AminaMehwishkhan/devs-wallet--4-

## Testing

Automated testing is not currently included. The main application flows can be verified manually:

1. Register two user accounts.
2. Deposit funds into the sender's wallet and confirm that the wallet balance and transaction history update.
3. Create a savings goal and contribute funds to it.
4. Pay a simulated utility bill and purchase a mobile package.
5. Add the second account as a beneficiary and transfer money to it.
6. Promote an account to the `admin` role, log in, and verify access to Manage Users, All Transactions, and Reports.
7. Submit invalid input, such as a negative amount or malformed email, and verify that validation errors are returned.

## Known Limitations

* Automated testing is not currently included.
* Forgot Password does not send an email. The reset token is returned through the API for demonstration purposes.
* Rate limiting is not currently implemented on authentication endpoints.
* Avatar files uploaded to a Vercel serverless deployment are not persistent. Persistent avatar storage requires an external storage service.
* The `notifications` table exists in the database schema but does not currently have a corresponding API or user interface.

## Internship Project

**U Devs | Full Stack PERN Internship Project**

**Project:** Devs Wallet (Digital Wallet Web Application)
**Assigned By:** Usama Aslam, Founder & CEO, U Devs
