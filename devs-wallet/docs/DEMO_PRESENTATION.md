# Devs Wallet — Demo Presentation Outline

Ten slides, each with slide text, a recommended visual, and short presenter notes. Every claim below is backed by functionality that actually exists in the codebase — cross-reference [docs/API_DOCUMENTATION.md](./API_DOCUMENTATION.md) and [ERD.md](./ERD.md) if you want to double-check anything while building the deck.

---

### Slide 1 — Devs Wallet

**Slide text:**
Devs Wallet
Digital Wallet Web Application
U Devs — Full Stack PERN Internship Project

**Recommended visual:** App logo/name on the login screen background, or the Dashboard page as a hero shot.

**Presenter notes:** Introduce yourself, the internship, and that this is a full-stack PERN (PostgreSQL, Express, React, Node.js) application built to the assigned specification.

---

### Slide 2 — Problem & Objective

**Slide text:**
- Digital wallets (JazzCash, NayaPay) are now everyday financial infrastructure in Pakistan
- Objective: build a professional digital wallet clone using only the mandatory PERN stack
- No Firebase, MongoDB, Next.js, Tailwind, or TypeScript — deliberately constrained to React + MUI + Express + PostgreSQL

**Recommended visual:** A simple two-column comparison graphic — "Required stack" vs "Excluded technologies."

**Presenter notes:** Frame this as a constrained engineering exercise, not just "build an app" — part of the assignment was proving competence with the specific mandated stack, not the easiest tool available.

---

### Slide 3 — Solution Overview

**Slide text:**
- 10 core modules: Auth, Dashboard, Wallet, Transactions, Savings Goals, Bill Payments, Mobile Packages, Beneficiaries, Profile & Security, Admin Panel
- REST API backend with JWT auth and role-based access
- React SPA frontend with Material UI throughout

**Recommended visual:** Sidebar navigation screenshot showing all the module links in one glance.

**Presenter notes:** Walk through the sidebar as a literal table of contents for the rest of the demo — every link you see is a working page backed by a real API.

---

### Slide 4 — Tech Stack / PERN Architecture

**Slide text:**
- **Frontend:** React 18 (Vite), Material UI, React Router, Axios, Redux Toolkit, Recharts
- **Backend:** Node.js, Express.js, JWT, bcrypt, express-validator, multer
- **Database:** PostgreSQL — raw parameterized SQL, no ORM
- Architecture: Browser → Axios → Express REST API → PostgreSQL

**Recommended visual:** A simple layered architecture diagram (Browser → API → Database), or just list the stack as a clean bullet slide with tech logos.

**Presenter notes:** Mention explicitly that there's no ORM — every SQL query is hand-written and parameterized, which was a deliberate choice for full visibility into what's actually running against the database.

---

### Slide 5 — Core User Features

**Slide text:**
- Register / Login / Forgot Password (JWT sessions)
- Dashboard: balance, 6-month cash flow chart, spending breakdown, recent activity
- Deposit, Withdraw, Transfer to another user
- Transaction history with filters (type, status, date, search) and pagination

**Recommended visual:** Dashboard screenshot with the charts visible, or a quick screen-recording clip of the deposit flow.

**Presenter notes:** This is a good place to actually click through a live deposit or transfer if presenting live — it's more convincing than a static screenshot for demonstrating the balance updates in real time.

---

### Slide 6 — Wallet & Transaction Flow

**Slide text:**
- Every money movement runs inside a PostgreSQL transaction with row-level locking (`SELECT ... FOR UPDATE`)
- Transfers write two linked ledger rows (`transfer_out` / `transfer_in`) atomically
- Savings Goals, Bill Payments, and Mobile Packages all debit the wallet the same safe way
- `balance_after` is snapshotted on every transaction row — no recomputing history

**Recommended visual:** A simple sequence diagram: Request → Lock wallet row → Check balance → Update → Write transaction → Commit.

**Presenter notes:** This slide is where you demonstrate backend engineering maturity — explain briefly why row locking matters (prevents two simultaneous requests from double-spending the same balance).

---

### Slide 7 — Database / ERD

**Slide text:**
- 9 tables: Users, Wallets, Transactions, SavingsGoals, Bills, MobilePackages, PackagePurchases, Beneficiaries, Notifications
- One wallet per user (1:1), created atomically at registration
- Full referential integrity via foreign keys

**Recommended visual:** The Mermaid ERD from `docs/ERD.md`, rendered as an image (GitHub renders it natively, or export via mermaid.live).

**Presenter notes:** If asked, be upfront that the `notifications` table exists in the schema but has no API built on it yet — it's a planned-but-not-implemented feature, not something to claim as working.

---

### Slide 8 — Security & Authentication

**Slide text:**
- Passwords hashed with bcrypt (10 salt rounds) — never stored in plaintext
- Stateless JWT sessions; user status re-checked on every request (instant suspension enforcement)
- Role-based access control gates the entire admin API
- Every write endpoint validated server-side with express-validator — independent of the frontend

**Recommended visual:** A short code snippet of the `authenticate` middleware, or a screenshot of a `422` validation error response from Postman/curl.

**Presenter notes:** Emphasize "independent of the frontend" — the API rejects bad input even if called directly, not just when the React forms happen to prevent it.

---

### Slide 9 — Admin Panel

**Slide text:**
- Manage Users: search, paginate, suspend/reactivate any account
- All Transactions: platform-wide feed, filterable by type and status
- Reports: total users, active users, total wallet balance, transaction totals by type, 6-month trends

**Recommended visual:** Admin Reports page screenshot showing the bar/line charts.

**Presenter notes:** Demonstrate suspending a test account live, then show that the suspended account's JWT immediately stops working on the next request — ties back to the "user status re-checked on every request" security point from Slide 8.

---

### Slide 10 — Demo, Deployment & Conclusion

**Slide text:**
- Live demo: _add your URL_
- Deployment: frontend + backend, database on [Neon/Render/your provider — fill in]
- Recap: all 10 modules implemented and working end-to-end
- Next steps: automated tests, real email for password reset, rate limiting

**Recommended visual:** QR code or clickable link to the live demo; screen recording of the full user journey (register → deposit → transfer → admin view) if not demoing live.

**Presenter notes:** Close by being honest about the "Known Limitations" from the README (no automated tests, demo-mode password reset) — evaluators generally respond better to accurate self-assessment than to a claim of "100% complete, no gaps."
