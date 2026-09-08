--
-- PostgreSQL database dump
--

\restrict wkdKniSG841plCB5cutjfNYQ6b7aVaiu7mjwUQ9e0etXAaSmzEfcBHBiLVkLKov

-- Dumped from database version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.wallets DROP CONSTRAINT IF EXISTS wallets_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_wallet_id_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_counterparty_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.savings_goals DROP CONSTRAINT IF EXISTS savings_goals_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.package_purchases DROP CONSTRAINT IF EXISTS package_purchases_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.package_purchases DROP CONSTRAINT IF EXISTS package_purchases_transaction_id_fkey;
ALTER TABLE IF EXISTS ONLY public.package_purchases DROP CONSTRAINT IF EXISTS package_purchases_package_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bills DROP CONSTRAINT IF EXISTS bills_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bills DROP CONSTRAINT IF EXISTS bills_transaction_id_fkey;
ALTER TABLE IF EXISTS ONLY public.beneficiaries DROP CONSTRAINT IF EXISTS beneficiaries_user_id_fkey;
DROP INDEX IF EXISTS public.idx_transactions_wallet;
DROP INDEX IF EXISTS public.idx_transactions_type;
DROP INDEX IF EXISTS public.idx_transactions_created;
ALTER TABLE IF EXISTS ONLY public.wallets DROP CONSTRAINT IF EXISTS wallets_user_id_key;
ALTER TABLE IF EXISTS ONLY public.wallets DROP CONSTRAINT IF EXISTS wallets_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.savings_goals DROP CONSTRAINT IF EXISTS savings_goals_pkey;
ALTER TABLE IF EXISTS ONLY public.package_purchases DROP CONSTRAINT IF EXISTS package_purchases_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.mobile_packages DROP CONSTRAINT IF EXISTS mobile_packages_pkey;
ALTER TABLE IF EXISTS ONLY public.bills DROP CONSTRAINT IF EXISTS bills_pkey;
ALTER TABLE IF EXISTS ONLY public.beneficiaries DROP CONSTRAINT IF EXISTS beneficiaries_user_id_beneficiary_email_key;
ALTER TABLE IF EXISTS ONLY public.beneficiaries DROP CONSTRAINT IF EXISTS beneficiaries_pkey;
DROP TABLE IF EXISTS public.wallets;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.savings_goals;
DROP TABLE IF EXISTS public.package_purchases;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.mobile_packages;
DROP TABLE IF EXISTS public.bills;
DROP TABLE IF EXISTS public.beneficiaries;
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: beneficiaries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beneficiaries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    nickname character varying(100) NOT NULL,
    beneficiary_email character varying(150) NOT NULL,
    bank_or_wallet character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: bills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bills (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    category character varying(30) NOT NULL,
    provider character varying(100) NOT NULL,
    account_number character varying(100) NOT NULL,
    amount numeric(14,2) NOT NULL,
    status character varying(20) DEFAULT 'paid'::character varying NOT NULL,
    transaction_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT bills_category_check CHECK (((category)::text = ANY ((ARRAY['electricity'::character varying, 'gas'::character varying, 'internet'::character varying, 'mobile'::character varying])::text[]))),
    CONSTRAINT bills_status_check CHECK (((status)::text = ANY ((ARRAY['paid'::character varying, 'failed'::character varying])::text[])))
);


--
-- Name: mobile_packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mobile_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    network character varying(50) NOT NULL,
    type character varying(20) NOT NULL,
    price numeric(10,2) NOT NULL,
    validity_days integer NOT NULL,
    description text,
    CONSTRAINT mobile_packages_type_check CHECK (((type)::text = ANY ((ARRAY['call'::character varying, 'sms'::character varying, 'internet'::character varying, 'bundle'::character varying])::text[])))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(150) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: package_purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.package_purchases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    package_id uuid NOT NULL,
    mobile_number character varying(20) NOT NULL,
    amount numeric(10,2) NOT NULL,
    transaction_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: savings_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.savings_goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(120) NOT NULL,
    target_amount numeric(14,2) NOT NULL,
    saved_amount numeric(14,2) DEFAULT 0.00 NOT NULL,
    deadline date,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT savings_goals_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT savings_goals_target_amount_check CHECK ((target_amount > (0)::numeric))
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wallet_id uuid NOT NULL,
    type character varying(20) NOT NULL,
    amount numeric(14,2) NOT NULL,
    balance_after numeric(14,2) NOT NULL,
    status character varying(20) DEFAULT 'success'::character varying NOT NULL,
    description text,
    reference_id uuid,
    counterparty_user_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT transactions_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT transactions_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'success'::character varying, 'failed'::character varying])::text[]))),
    CONSTRAINT transactions_type_check CHECK (((type)::text = ANY ((ARRAY['deposit'::character varying, 'withdraw'::character varying, 'transfer_in'::character varying, 'transfer_out'::character varying, 'bill_payment'::character varying, 'package_purchase'::character varying])::text[])))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name character varying(120) NOT NULL,
    email character varying(150) NOT NULL,
    phone character varying(20),
    password_hash character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    avatar_url text,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    reset_token character varying(255),
    reset_token_expires timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying])::text[])))
);


--
-- Name: wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    balance numeric(14,2) DEFAULT 0.00 NOT NULL,
    currency character varying(10) DEFAULT 'PKR'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: beneficiaries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.beneficiaries (id, user_id, nickname, beneficiary_email, bank_or_wallet, created_at) FROM stdin;
\.


--
-- Data for Name: bills; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bills (id, user_id, category, provider, account_number, amount, status, transaction_id, created_at) FROM stdin;
\.


--
-- Data for Name: mobile_packages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mobile_packages (id, name, network, type, price, validity_days, description) FROM stdin;
9c2b5067-bdb2-4957-aa18-4f87ae3c97dd	Weekly Call Bundle	Jazz	call	150.00	7	500 mins on-net + 100 off-net
1d266868-a35a-419a-94cf-bae54466df5f	Monthly Internet 10GB	Zong	internet	999.00	30	10GB high speed internet
bfcdede8-4201-418e-a24f-f4745c291dcd	SMS Pack 1000	Ufone	sms	50.00	7	1000 SMS all networks
386b9c65-75ad-401b-9ccd-c6a1229df33f	Super Bundle	Telenor	bundle	499.00	30	1000 mins + 5GB + 500 SMS
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, title, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: package_purchases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.package_purchases (id, user_id, package_id, mobile_number, amount, transaction_id, created_at) FROM stdin;
\.


--
-- Data for Name: savings_goals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.savings_goals (id, user_id, title, target_amount, saved_amount, deadline, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, wallet_id, type, amount, balance_after, status, description, reference_id, counterparty_user_id, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, full_name, email, phone, password_hash, role, avatar_url, status, reset_token, reset_token_expires, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallets (id, user_id, balance, currency, created_at, updated_at) FROM stdin;
\.


--
-- Name: beneficiaries beneficiaries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beneficiaries
    ADD CONSTRAINT beneficiaries_pkey PRIMARY KEY (id);


--
-- Name: beneficiaries beneficiaries_user_id_beneficiary_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beneficiaries
    ADD CONSTRAINT beneficiaries_user_id_beneficiary_email_key UNIQUE (user_id, beneficiary_email);


--
-- Name: bills bills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_pkey PRIMARY KEY (id);


--
-- Name: mobile_packages mobile_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mobile_packages
    ADD CONSTRAINT mobile_packages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: package_purchases package_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_purchases
    ADD CONSTRAINT package_purchases_pkey PRIMARY KEY (id);


--
-- Name: savings_goals savings_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.savings_goals
    ADD CONSTRAINT savings_goals_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);


--
-- Name: idx_transactions_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_created ON public.transactions USING btree (created_at);


--
-- Name: idx_transactions_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_type ON public.transactions USING btree (type);


--
-- Name: idx_transactions_wallet; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_wallet ON public.transactions USING btree (wallet_id);


--
-- Name: beneficiaries beneficiaries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beneficiaries
    ADD CONSTRAINT beneficiaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bills bills_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- Name: bills bills_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: package_purchases package_purchases_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_purchases
    ADD CONSTRAINT package_purchases_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.mobile_packages(id);


--
-- Name: package_purchases package_purchases_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_purchases
    ADD CONSTRAINT package_purchases_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- Name: package_purchases package_purchases_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_purchases
    ADD CONSTRAINT package_purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: savings_goals savings_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.savings_goals
    ADD CONSTRAINT savings_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_counterparty_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_counterparty_user_id_fkey FOREIGN KEY (counterparty_user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON DELETE CASCADE;


--
-- Name: wallets wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict wkdKniSG841plCB5cutjfNYQ6b7aVaiu7mjwUQ9e0etXAaSmzEfcBHBiLVkLKov

