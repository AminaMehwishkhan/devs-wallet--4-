-- Devs Wallet Database Schema (PostgreSQL)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  avatar_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'PKR',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit','withdraw','transfer_in','transfer_out','bill_payment','package_purchase')),
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  balance_after NUMERIC(14,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('pending','success','failed')),
  description TEXT,
  reference_id UUID,
  counterparty_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);

CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(120) NOT NULL,
  target_amount NUMERIC(14,2) NOT NULL CHECK (target_amount > 0),
  saved_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  deadline DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(30) NOT NULL CHECK (category IN ('electricity','gas','internet','mobile')),
  provider VARCHAR(100) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','failed')),
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mobile_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  network VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('call','sms','internet','bundle')),
  price NUMERIC(10,2) NOT NULL,
  validity_days INT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS package_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES mobile_packages(id),
  mobile_number VARCHAR(20) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nickname VARCHAR(100) NOT NULL,
  beneficiary_email VARCHAR(150) NOT NULL,
  bank_or_wallet VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, beneficiary_email)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed some mobile packages
INSERT INTO mobile_packages (name, network, type, price, validity_days, description)
SELECT * FROM (VALUES
  ('Weekly Call Bundle','Jazz','call',150.00,7,'500 mins on-net + 100 off-net'),
  ('Monthly Internet 10GB','Zong','internet',999.00,30,'10GB high speed internet'),
  ('SMS Pack 1000','Ufone','sms',50.00,7,'1000 SMS all networks'),
  ('Super Bundle','Telenor','bundle',499.00,30,'1000 mins + 5GB + 500 SMS')
) AS v(name, network, type, price, validity_days, description)
WHERE NOT EXISTS (SELECT 1 FROM mobile_packages);
