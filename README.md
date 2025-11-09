# Sheldon Simkus Social Dashboard

A React + Vite dashboard for Sheldon Simkus that showcases public-facing campaign stats while exposing a gated admin area for updating live data in Supabase. The UI pulls audience splits, KPIs, and top-performing content directly from Supabase tables/edge functions so marketing stakeholders always see the latest metrics.

## Project Links
- **Production**: https://sheldon-social-media.vercel.app
- **Lovable project**: https://lovable.dev/projects/bdf643ad-290d-438c-ba2c-38a826a4baec
- **Repository**: https://github.com/eatherlincoln/sheldon-social-media

## Tech Stack
- React 18 with Vite 4
- Tailwind CSS + shadcn/ui primitives
- Supabase (database, auth, edge functions)
- Recharts for data viz

## Local Development
1. Clone the repo  
   `git clone https://github.com/eatherlincoln/sheldon-social-media.git`
2. Install dependencies  
   `npm install`
3. Copy `.env.example` → `.env` (or create `.env`) and set:
   ```sh
   VITE_SUPABASE_URL=<project-url>
   VITE_SUPABASE_ANON_KEY=<anon-key>
   ```
4. Start the Vite dev server  
   `npm run dev`

The public dashboard lives at `/`, the email-magic-link auth page at `/auth`, and the gated admin editor at `/admin`.

## Supabase Notes
- `platform_stats`, `audience`, and `top_posts` tables feed the public site.
- Edge function `refresh-social-stats` (see `supabase/functions`) refreshes metrics by calling ViewStats + custom scrapers, guarded by Supabase auth/role checks.
- Admin writes are routed through Supabase Row-Level Security policies; use the provided forms to keep schema constraints intact.
