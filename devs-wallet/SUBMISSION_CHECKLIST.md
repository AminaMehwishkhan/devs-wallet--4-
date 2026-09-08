# Devs Wallet — Submission Checklist

## Core submission requirements (U Devs internship)

- [ ] GitHub repository is public (or U Devs has been granted access) and the link works
- [ ] `README.md` is complete and renders correctly on GitHub (check the Mermaid link, table formatting)
- [ ] Live deployment is up and reachable — test the exact URL you're submitting, not just `localhost`
- [ ] Demo video is uploaded somewhere accessible (YouTube unlisted, Google Drive with link sharing, etc.) and the link in the README works
- [ ] `docs/ERD.md` is included and its Mermaid diagram renders on GitHub
- [ ] `docs/API_DOCUMENTATION.md` is included and matches the actual routes (spot-check a few endpoints against `server/routes/`)
- [ ] `database/devs_wallet_backup.sql` is included
- [ ] `docs/DEMO_PRESENTATION.md` is included (or you've built slides from it separately)

## Security — do this before making the repo public

- [ ] `server/.env` and `client/.env` are **not** committed (only `.env.example` files should be)
- [ ] `node_modules/` is **not** committed in either `server/` or `client/`
- [ ] `.gitignore` exists at the repo root and actually excludes the above (verify with `git status` after a fresh clone — nothing sensitive should show as untracked-but-present)
- [ ] `database/devs_wallet_backup.sql` contains **zero rows** of real user data — re-verify if you regenerate this file (see `database/README.md`'s security check section)
- [ ] No real password, API key, or personal email is hardcoded anywhere in the source (search the repo for your own name/email/password as a sanity check)
- [ ] `JWT_SECRET` used in the live deployment is a real random string, not the placeholder from `.env.example`

## Functionality verification

- [ ] Fresh clone + `npm install` + `npm run migrate` + `npm run dev` (both `server/` and `client/`) works from a clean checkout — not just your existing local setup
- [ ] Register → Login → Logout works
- [ ] Deposit, Withdraw, and Transfer (to a second test account) all work and update balances correctly
- [ ] Transaction history filters (type, date, search) return correct results
- [ ] Create a Savings Goal, contribute to it, confirm wallet balance decreases and goal progress increases
- [ ] Pay a bill and buy a mobile package — both appear in their respective history views
- [ ] Add a beneficiary, edit it, delete it
- [ ] Update profile info, change password, upload an avatar — confirm avatar actually displays (skip this check if deployed to Vercel serverless — see README's Known Limitations)
- [ ] Promote a test account to `role = 'admin'` via SQL and confirm the Admin section appears and all three admin pages (Users, Transactions, Reports) load data
- [ ] Submit obviously-invalid input (negative amount, malformed email) on at least one form and confirm a clean validation error appears — not a crash or a blank page

## Responsive UI check

- [ ] Test the live deployment (not just local dev) at a mobile width (~375px) and tablet width (~768px) using browser DevTools device toolbar
- [ ] Sidebar collapses to a hamburger menu on mobile and opens/closes correctly
- [ ] Login/Register pages are usable on a small screen (no cut-off fields or buttons)
- [ ] Transactions table and Admin tables scroll horizontally on mobile rather than breaking the page layout
- [ ] Dialogs (deposit/withdraw/transfer, add beneficiary, create savings goal) are usable on a small screen

## Documentation accuracy (self-audit)

- [ ] Every feature claimed in `README.md`'s Features section actually works in the deployed app
- [ ] `README.md`'s installation commands match `server/package.json` and `client/package.json` scripts exactly
- [ ] `docs/ERD.md` table/column names match `server/migrations/schema.sql` exactly
- [ ] `docs/API_DOCUMENTATION.md` endpoint list matches `server/routes/*.js` exactly (no invented endpoints, none missing)
- [ ] Demo Credentials section in the README has real (but dedicated demo-only) values filled in, not left as blank placeholders
- [ ] Live Demo / Deployment URLs in the README are filled in and correct

## Final package — what to actually send U Devs

- [ ] GitHub repository URL
- [ ] Live deployment URL (frontend)
- [ ] Demo video link
- [ ] Anything else U Devs specifically asked for in their submission instructions (check for a submission form or email requirements you may have received separately — this checklist covers the internship brief's stated list, but confirm nothing else was requested)
