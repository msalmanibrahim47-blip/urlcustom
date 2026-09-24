# White-Label Platform

A white-label website customization platform. Paste any customer's website URL, customize its
presentation with overlays, a CTA button, and a WhatsApp button, then publish it at a unique
public URL — without touching the customer's original site.

## Features

- **Admin dashboard** — stats (total/active/published projects, total views), recent projects.
- **Project CRUD** — create, edit, duplicate, publish/unpublish, delete. Search, filter, sort.
- **Live preview editor** — desktop/tablet/mobile preview, refresh, open-original, fullscreen.
- **Embeddability detection** — checks `X-Frame-Options` / `Content-Security-Policy` headers
  server-side *and* a client-side load timeout, so sites that block iframes get a clean
  "Open Website" fallback instead of a broken blank frame. **This app never attempts to bypass
  or strip a site's security headers.**
- **Customization panel** — Branding (logo, favicon, brand name, theme, colors), Appearance
  (border radius, frame size, default device), Overlays (announcement bar, contact/call
  buttons, custom text/image/badge — each with position, size, opacity, radius, font, animation),
  a dedicated CTA button, and a dedicated WhatsApp button (auto-builds the `wa.me` link).
- **Autosave** — debounced, with a Saving.../Saved/Save failed indicator in the toolbar.
- **Public URLs** — `/p/your-slug` renders only the customized customer experience, no admin UI.
- **White-label platform settings** — your own platform name, logo, colors, footer — not tied
  to any single customer, and not hard-coded.
- **Domains** — add custom domains per project or platform-wide; the page documents the actual
  Netlify DNS/SSL steps rather than faking DNS verification.
- **Analytics** — page views, device type, referrers, per-project breakdown. No IP addresses are
  stored.
- **Auth** — Supabase email/password, protected admin routes, public routes stay open.
- **Dark / light / system theme**, responsive throughout, toasts, skeletons, empty states,
  confirm modals, custom 404/500 pages.

## Tech Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth) · deployed on
Netlify via `@netlify/plugin-nextjs`.

## Known iframe limitations

Many sites (banking, SaaS dashboards, some e-commerce, anything behind login) block iframe
embedding on purpose, via `X-Frame-Options`, `Content-Security-Policy: frame-ancestors`, or
JavaScript frame-busting. This app **detects** that and shows a fallback — it does **not** and
will not attempt to circumvent it. For blocked sites, either accept the "Open Website" fallback,
or set a project's **Advanced → When embedding is blocked** option to redirect visitors straight
to the original site.

## Security considerations

- Row Level Security is enabled on every table; the anon key can only read *published* projects
  and insert analytics events for them — nothing else.
- The Supabase service-role key is never imported into client code or committed; it's not
  currently used by the app (kept as an env var for future admin scripts only).
- All URLs are validated and normalized; only `http(s)://` is ever accepted (no `javascript:`,
  `data:`, etc.) for website URLs, CTA links, and overlay links.
- Iframes use a restrictive `sandbox` attribute and `referrerPolicy="no-referrer"`.
- Auth-protected routes are enforced in `src/middleware.ts`; public `/p/*` routes are explicitly
  excluded from the auth check.

---

## Setup

### STEP 1 — Install dependencies

```bash
npm install
```

### STEP 2 — Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project.
2. Once it's provisioned, go to **Project Settings → API** and copy:
   - Project URL
   - `anon` `public` key
   - `service_role` key (keep this secret)
3. Go to **Authentication → Providers** and make sure **Email** is enabled.
4. Create your admin login: **Authentication → Users → Add user** (set an email + password —
   this is what you'll use to sign in to `/login`). You can add more admin users the same way.

### STEP 3 — Run the SQL schema

1. In Supabase, open the **SQL Editor**.
2. Paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and run it.
   It's safe to re-run — tables, policies, and triggers are all created with `IF NOT EXISTS` /
   `DROP ... IF EXISTS` guards.

### STEP 4 — Environment variables

Copy `.env.example` to `.env.local` and fill in the values from Step 2:

```bash
cp .env.example .env.local
```

| Variable | Where it's used | Public? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | reserved for future server-only scripts | **No — never expose** |
| `NEXT_PUBLIC_SITE_URL` | building the public URL shown in the editor | Yes |

### STEP 5 — Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/login`. Sign in with the user you
created in Step 2.

### STEP 6 — Deploy to Netlify

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Build settings are already defined in `netlify.toml` (`npm run build`, publish `.next`,
   `@netlify/plugin-nextjs` plugin) — Netlify should auto-detect them.
4. Add the same environment variables from Step 4 under **Site configuration → Environment
   variables**. Set `NEXT_PUBLIC_SITE_URL` to your Netlify URL (e.g.
   `https://your-site.netlify.app`) or your custom domain once you've set one up.
5. Deploy.

### STEP 7 — Connect your own domain

1. In your Netlify site: **Domain management → Add a domain**, enter your domain.
2. Point DNS at Netlify (either delegate to Netlify DNS, or add the CNAME/A record Netlify
   shows you at your registrar).
3. Netlify auto-provisions SSL once DNS is verified.
4. Update `NEXT_PUBLIC_SITE_URL` to the new domain and redeploy (or trigger a redeploy — env var
   changes require one).
5. Optionally log the domain in the app's **Domains** page for your own reference — that page is
   a record-keeping/instructional UI, not a DNS control plane (Netlify remains the source of
   truth for verification and SSL status).

### STEP 8 — Create a customer project

1. Sign in → **Create Project**.
2. Fill in Project Name, Customer Name, the customer's website URL, and status.
3. You land in the editor: preview the site, add overlays/CTA/WhatsApp, adjust branding and
   appearance. Everything autosaves.
4. Click **Publish**.

### STEP 9 — How the customer receives their public URL

Every project gets a slug-based URL: `https://your-domain.com/p/project-slug` (shown and
copyable from **Advanced** in the editor, or via the copy-URL button on the Projects list).
Once published, opening that URL shows only the customized customer experience — no dashboard,
no admin UI — with your saved overlays, CTA, and WhatsApp button applied automatically.

## Troubleshooting

- **"Invalid URL" on create** — the URL must include a valid domain with a TLD (e.g.
  `example.com`, not `localhost`).
- **Public page 404s** — the project must be `published`, not `draft`/`unpublished`; RLS blocks
  reads of unpublished projects from the anon key by design.
- **Iframe stuck loading** — the target site is slow or the health-check timed out; a 7-second
  client-side timeout will fall back to the "Open Website" screen automatically.
- **Build fails on Netlify with a Supabase error** — double-check the three `NEXT_PUBLIC_*` /
  service-role env vars are set in Netlify's environment variables, not just locally.
