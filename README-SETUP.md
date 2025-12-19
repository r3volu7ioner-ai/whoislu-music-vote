# WhoIsLu – Neon Music Chooser (Rebuild)

This repo is the exported Famous.ai app, adjusted so it runs against **your own Supabase** (so uploads work and you control everything).

## What you get
- Same UI (landing + voting + admin)
- Supabase Edge Function `whoislu-api` (public actions + admin actions)
- SQL migration to create tables
- Admin can upload **audio** + **cover images** directly into Supabase Storage (via signed upload URLs)

---

## 1) Create a Supabase project
1. Create a new project in Supabase.
2. Create 2 Storage buckets:
   - `audio-tracks` (public)
   - `cover-images` (public)

> Public buckets make it easy for the browser `<audio>` tag to play MP3s without CORS pain.

## 2) Create the database tables
Run the SQL from:
- `supabase/migrations/0001_init.sql`

(You can paste it into Supabase SQL Editor.)

## 3) Deploy the Edge Function
Deploy `supabase/functions/whoislu-api/index.ts`

Set these **function environment variables** in Supabase:
- `SUPABASE_URL` = your project URL
- `SUPABASE_SERVICE_ROLE_KEY` = service role key (Settings → API)
- `ADMIN_PASSWORD` = the password you want for `/admin` (e.g. `lu2024`)

## 4) Run the frontend locally
1. Install Node.js (LTS)
2. In this folder:

```bash
npm install
cp .env.example .env
# edit .env with your Supabase URL + anon key
npm run dev
```

## 5) Deploy (recommended: Vercel)
- Push this repo to GitHub
- Import into Vercel
- Add the same env vars as in `.env`:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

---

## Admin uploads
Open `/admin`, login with your `ADMIN_PASSWORD`.
When editing a track, you can choose a file:
- Cover image → uploads to `cover-images`
- Audio → uploads to `audio-tracks`

After upload, the URL is auto-filled in the form.
