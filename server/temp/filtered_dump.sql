SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
SET default_tablespace = '';
SET default_table_access_method = heap;
CREATE TABLE public.pages (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    content jsonb,
    slug character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.pages OWNER TO kopfolio;
CREATE TABLE public.settings (
    id integer NOT NULL,
    site_title character varying(100) DEFAULT 'Kopfolio'::character varying NOT NULL,
    accent_color character varying(7) DEFAULT '#2196f3'::character varying NOT NULL,
    font character varying(50) DEFAULT 'Inter'::character varying NOT NULL,
    logo character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.settings OWNER TO kopfolio;
CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.users OWNER TO kopfolio;
ALTER TABLE ONLY public.pages ALTER COLUMN id SET DEFAULT nextval('public.pages_id_seq'::regclass);
ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
COPY public.pages (id, title, content, slug, created_at, updated_at) FROM stdin;
COPY public.settings (id, site_title, accent_color, font, logo, created_at, updated_at) FROM stdin;
COPY public.users (id, username, password, created_at) FROM stdin;
SELECT pg_catalog.setval('public.pages_id_seq', 1, true);
SELECT pg_catalog.setval('public.settings_id_seq', 1, true);
SELECT pg_catalog.setval('public.users_id_seq', 1, true);
ALTER TABLE ONLY public.pages
ALTER TABLE ONLY public.pages
ALTER TABLE ONLY public.settings
ALTER TABLE ONLY public.users
ALTER TABLE ONLY public.users