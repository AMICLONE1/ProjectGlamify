# Deploying Glamify

This is the Next.js 16 monorepo root. It hosts the marketing site, the business
web dashboard (`/business/*`), and the lead-capture API.

## Stack at a glance

- Next.js 16.2 with Turbopack
- React 19 + TypeScript
- Tailwind v4
- GSAP + Lenis + Motion (marketing animations, gated off `/business`)
- Zustand + Recharts (business dashboard)
- React Hook Form + Zod (forms)
- Vercel Analytics + Speed Insights
- Sentry (opt-in via DSN)

## First-time deploy

1. **Vercel project**: `vercel link` from this directory, or import the repo via the dashboard.
2. **Environment variables**: copy `.env.example` to the Vercel project's Environment Variables and fill in what's available now. Anything tied to Phase C/D/E (Supabase, Razorpay, OpenAI, FCM) can stay empty until those phases ship — every consumer of those vars no-ops when the key is missing.
3. **Build command**: `npm run build` (Next.js default; Vercel auto-detects).
4. **Output directory**: `.next` (auto).
5. **Node version**: 20.x (default on Vercel).

## Production checklist

| Area | Where |
|---|---|
| Sitemap | `/sitemap.xml` — auto-generated from `src/app/sitemap.ts` |
| Robots | `/robots.txt` — auto-generated, allows everything except `/api/` and `/business/` |
| OG image | `/opengraph-image` — dynamic Next OG, no manual upload needed |
| Analytics | `<Analytics />` in `src/app/layout.tsx`. Free on Vercel; auto-instruments page views. Custom events go through `src/lib/track.ts`. |
| Web Vitals | `<SpeedInsights />` in the same layout. |
| Errors | Sentry — set `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` to enable. |

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (type-checks + bundles)
npm run start        # serve the production build locally
```

## Lead capture endpoint

`POST /api/leads` with `{ kind, payload }`:

- `kind: "signup" | "demo" | "contact"`
- Validated by Zod schemas in `src/lib/schemas.ts`
- Returns 201 on success, 422 on validation failure
- Currently logs to console. Wire to Supabase `leads` table in Phase C.

## Known constraints

- The `motion` package (Framer Motion successor) ships ESM-only — keep tree-shaking on. Vercel default is fine.
- GSAP + Lenis + CustomCursor never load on `/business/*` (path-guarded in `src/components/effects/`). Keeps the business dashboard light.
- Sentry config lives in `src/instrumentation.ts` (server/edge) and `src/instrumentation-client.ts` (browser). Both no-op without a DSN.
