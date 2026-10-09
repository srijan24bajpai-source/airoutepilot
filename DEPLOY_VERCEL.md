# Deploy to Vercel

Node `>=20.9` (built/tested on Node 24, npm 11). Build: `npm run build`. Start: `npm start`. Framework: Next.js (auto-detected). No `vercel.json` is required.

## Preflight checklist

- [ ] `npm install && npm test && npm run typecheck && npm run build` pass locally.
- [ ] Supabase **staging** and **production** projects created (separate keys).
- [ ] Migration applied: `supabase db push` (or paste `supabase/migrations/0001_init.sql` in the SQL editor); then run `supabase/tests/rls_negative.sql` on staging.
- [ ] Supabase Auth: enable email confirmations; set Site URL = your production origin; add Redirect URLs: `https://YOUR-DOMAIN/auth/callback` and `com.example.routepilot://auth/callback` (your real app scheme).
- [ ] Google: create an OAuth client (Web) in Google Cloud; paste client id/secret into **Supabase → Auth → Providers → Google** (never in this repo); add Supabase's callback URL as an authorised redirect URI in Google.
- [ ] Upstash Redis created; Turnstile site created (hostname = your domain).
- [ ] Privacy/Terms placeholders completed (`src/app/privacy`, `src/app/terms`, `src/config/brand.ts`).
- [ ] Decide launch mode: demo/search-only is the only supported mode today (see `BUILD_STATUS.md`). **Do not set `STORE_DRIVER=memory-unsafe` in production** except for a throwaway demo; bookings are disabled anyway without a live adapter.

## Path 1: import from Git

1. Push the source (unzip `routepilot-ai-source.zip`) to a private GitHub repo. Confirm `.env*` is not committed.
2. Vercel → *Add New → Project* → import the repo. Framework preset: Next.js.
3. *Settings → Environment Variables*: add every variable from `.env.example` (Production and Preview separately). `NEXT_PUBLIC_*` are public by design; `SUPABASE_SERVICE_ROLE_KEY` and all other secrets must **not** be exposed to the browser. Set `APP_ORIGIN=https://YOUR-DOMAIN`.
4. Deploy. Verify: `GET /api/health` returns `{"ok":true,...}` with `auth: true`, `distributedRateLimit: true`, `botChallenge: true`; search works; sign-up email arrives; login works; `/dashboard` redirects/denies when signed out.
5. *Settings → Domains*: add your domain, set DNS as instructed, wait for the certificate.

## Path 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link                 # from the project root
vercel env add NAME preview # repeat per variable, per environment (values entered interactively)
vercel env add NAME production
vercel deploy               # preview deployment
vercel deploy --prod        # production deployment
```

## After deploy

- Production must clearly state which features are unavailable. The UI shows "Demo data" banners and "In-app booking is not available…" automatically; keep them.
- Set spend/error alerts (Vercel, Supabase, Upstash, LLM provider). Use `DISABLED_PROVIDERS` / `LLM_ENABLED=false` as kill switches (redeploy or env change takes effect on next deploy).
- Schedule a reconciliation job (Vercel Cron → a protected route you add) once a live booking provider exists. **Not implemented yet.**
