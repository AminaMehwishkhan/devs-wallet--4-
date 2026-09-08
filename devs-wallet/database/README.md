# Devs Wallet — Database Backup

## What's included

`devs_wallet_backup.sql` in this folder is a `pg_dump` export of the Devs Wallet schema, generated from a freshly-migrated database (i.e. `schema.sql` applied, then dumped immediately — no test data added). It contains:

- All 9 tables (`users`, `wallets`, `transactions`, `savings_goals`, `bills`, `mobile_packages`, `package_purchases`, `beneficiaries`, `notifications`), with their constraints, foreign keys, and indexes
- The 4 seeded rows in `mobile_packages` (the same seed data `schema.sql` inserts)
- **Zero rows** in every other table — no user accounts, no password hashes, no emails, no transaction history. This was verified before inclusion (row-counted every table in the dump).

This means it is safe to commit to a public repository as-is.

## Restoring it

```bash
createdb devs_wallet
psql -d devs_wallet -f database/devs_wallet_backup.sql
```

Or against a remote/hosted database (e.g. Neon, Render Postgres):

```bash
psql "<your-connection-string>" -f database/devs_wallet_backup.sql
```

This is functionally equivalent to running `cd server && npm run migrate` — both produce the same schema and seed data. Use whichever is more convenient; they're not meant to be run one after the other.

## Regenerating this backup yourself

If you want to produce a fresh version of this file (e.g. after a schema change), run this against your local `devs_wallet` database:

```bash
pg_dump -d devs_wallet --no-owner --no-privileges --clean --if-exists > database/devs_wallet_backup.sql
```

- `--no-owner --no-privileges` — omits `OWNER TO`/`GRANT` statements tied to your local Postgres role, so the dump restores cleanly on any host regardless of username.
- `--clean --if-exists` — makes the dump idempotent (drops existing objects before recreating them if you restore into a non-empty database).

If your `DATABASE_URL` isn't the default local `postgres` role, use the full connection string instead of `-d devs_wallet`:

```bash
pg_dump "postgresql://user:password@host:port/devs_wallet" --no-owner --no-privileges --clean --if-exists > database/devs_wallet_backup.sql
```

## Before committing any future backup — security check

**Never commit a dump taken from a database that has real user data in it.** Before replacing this file, check what you're about to commit:

```bash
grep -c "COPY public.users" database/devs_wallet_backup.sql   # should show the COPY line exists
```

Then open the file and look at the block right after `COPY public.users (...) FROM stdin;` — if there are real rows before the closing `\.`, **do not commit it**. Password hashes (bcrypt output), even hashed, plus real emails, are not something to publish. Two safe options if you need a backup from a database that has test data in it:

1. **Preferred:** spin up a throwaway local database, run `npm run migrate` against it (schema + seed only, no test users), and dump that instead — exactly how this file was produced.
2. If you specifically want to demonstrate populated data, dump only the safe tables explicitly (e.g. `pg_dump -d devs_wallet -t mobile_packages ...`), or manually delete the `COPY public.users ... \.` block's contents (and every other table with personal data) from the dump file before committing.
