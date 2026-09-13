# AgroMarket Platform

A directory + marketplace for farming businesses: profiles, a single map with a
Profiles/Sell/Buy switcher, listings, and direct messaging. Built with
Next.js (App Router) + Supabase (Postgres, Auth, Storage, Realtime) +
next-intl (Latvian default, English secondary). See the build plan for the
full architecture and phased roadmap.

## Prerequisites

- Node.js 20+ (this repo was scaffolded with Node 24)
- A [Supabase](https://supabase.com) project (free tier is fine)
- **Git** — not currently installed in this environment. Install
  [Git for Windows](https://git-scm.com/download/win) before this project is
  pushed to GitHub / connected to Vercel for deployment.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase
   project URL + anon key (Project Settings → API in the Supabase dashboard).
3. Apply the schema: paste `supabase/migrations/0001_init.sql` into the
   Supabase SQL editor (or `supabase db push` once the Supabase CLI + a linked
   project are set up).
4. `npm run dev` and open http://localhost:3000 — it redirects to `/lv`
   (default locale); `/en` is also available.

## Project layout

- `src/app/[locale]/` — all pages, locale-prefixed (`lv` default, `en`)
- `src/i18n/` — next-intl routing/navigation/request config
- `messages/{lv,en}.json` — UI translation strings
- `src/lib/supabase/` — browser + server Supabase clients
- `supabase/migrations/` — SQL schema + Row Level Security policies
