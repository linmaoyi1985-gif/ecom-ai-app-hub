# Ecom AI App Hub - Project Rules (MUST FOLLOW)

## Goal
Build a Next.js App Router "App Hub" for cross-border ecom mini-apps.
All pages require login + whitelist. Only /login and /api/auth/* are public.

## Non-negotiables
- NEVER put any third-party API keys in frontend code.
- All external calls must go through server route: POST /api/n8n/trigger
- Keep dependencies minimal (Next.js + TS + Tailwind preferred).
- Before finalizing, ensure `npm run build` passes (TypeScript must be clean).

## Architecture
- App registry: lib/registry.ts exports allApps + getAppBySlug(slug)
- Each mini-app lives in /apps/<slug>/ (client component when interactive)
- Route pattern:
  - Hub: /
  - App page: /apps/[slug] (loads registry + renders matching component)
- Server APIs:
  - /api/n8n/trigger  { workflow, payload } -> forward to N8N_WEBHOOK_URL (optional secret)
  - Auth.js/NextAuth GitHub OAuth + whitelist:
    - ALLOWED_GITHUB_LOGINS (comma-separated)
    - ALLOWED_EMAIL_DOMAINS (comma-separated, optional)

## Add a new mini-app (Required steps)
1) Create /apps/<slug>/App.tsx (client UI, calls /api/n8n/trigger if needed)
2) Register it:
   - add to lib/registry.ts
   - add to appComponents map in app/apps/[slug]/page.tsx (or equivalent)
3) Add to home hub categories for navigation
4) Provide loading/error states and render JSON output safely

## Input format I will provide
- slug
- title
- category
- inputs
- output format
- n8n workflow name + payload schema
- UI notes (optional)
