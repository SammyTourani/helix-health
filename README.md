# Helix Health

A patient-owned, unified health-record web app. You log your own conditions, medications, visits, labs, imaging, procedures, and vaccinations into a single timeline, control which providers can see them, share read-only links with expiry and view tracking, and generate AI pre-appointment briefs tailored to a specialty.

## Features

- **Unified health timeline** — one chronological view across seven record types: conditions, medications, visits, labs, imaging, procedures, and vaccinations.
- **Records management** — create, edit, and delete records, each with a date, status, optional specialty, notes, and free-form metadata (e.g. dosage and frequency for medications).
- **Providers** — track your care team and set a per-provider access level (`full`, `relevant`, or `summary_only`).
- **Share links** — generate token-based, read-only links to your record. Each link has an access level, an optional expiry, optional specialty filtering, can be revoked, and tracks view count and last-viewed time.
- **AI pre-appointment briefs** — generate a structured, specialty-specific brief (patient summary, relevant conditions, current medications, recent activity, key cautions) from your records using Groq-hosted Llama 3.3 70B. Generated briefs are saved back to your account.
- **Onboarding wizard** — guided first-run flow to set up the basic profile.
- **Settings** — manage profile details.

All patient data is scoped per user through Supabase Postgres row-level security: a signed-in user can only read and write their own records, providers, share links, and AI summaries. Public share pages are the one exception and are gated by an active, unexpired token.

## Tech stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui (Radix primitives), Framer Motion
- **Backend / data / auth:** Supabase (Postgres, Auth, row-level security)
- **AI:** [groq-sdk](https://www.npmjs.com/package/groq-sdk) running `llama-3.3-70b-versatile`
- **Package manager:** pnpm

## Getting started

### Prerequisites

- Node.js and [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) project (Postgres + Auth)
- A [Groq](https://console.groq.com/) API key (only needed for the AI brief feature)

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the example environment file and fill in your own values:

   ```bash
   cp .env.example .env.local
   ```

   See [Environment variables](#environment-variables) for what each one is.

3. Apply the database schema. Run `supabase/migrations/001_initial_schema.sql`
   against your Supabase project (via the Supabase SQL editor or the Supabase
   CLI). It creates the tables, indexes, triggers, row-level-security policies,
   and the `increment_share_view` function.

4. Start the dev server:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Environment variables

The app reads exactly four environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key (client + server) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key, used server-side to render public share pages. Falls back to the anon key if unset. Keep it secret. |
| `GROQ_API_KEY` | Groq API key for AI brief generation |

## Status

This is a working build, not a production deployment. To run it end to end you need a Supabase project (with the migration applied) and, for the AI brief feature, a Groq API key. `src/lib/seed.ts` contains demo seed data for local development.

Some features that an earlier planning doc described are **not** implemented and are intentionally out of scope for this build:

- Google OAuth (auth is email/password via Supabase)
- Two-factor authentication
- PDF / print export of records or briefs
- Document upload to Supabase Storage

The AI brief is informational only and is not medical advice.

## License

[MIT](./LICENSE)
