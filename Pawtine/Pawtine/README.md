# Pawtine MVP

Pawtine is an AI-friendly routine tracker for dog owners. This MVP follows the PRD goals: onboarding flow, daily routine tracker, weekly dashboard, and routine settings - built with Next.js 14, Tailwind CSS, and Supabase.

## Getting Started

1. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase project credentials.

2. Install dependencies (requires Node.js 18+):
   ```bash
   npm install
   ```

3. (Optional) Enable Supabase by filling `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`. Without these keys the app falls back to an in-memory demo dataset so you can browse the UI immediately.

4. (Optional) Add `OPENAI_API_KEY` to enable the Pawtine assistant chatbot widget.

5. Run database migrations:
   ```bash
   supabase db push
   supabase db seed
   ```

   > Need the Supabase CLI? Install via `npm install -g supabase` (or `npm install --save-dev supabase` inside this repo), run `npx supabase login`, then `npx supabase link --project-ref <your-ref>` before pushing migrations.

6. Start the dev server:
   ```bash
   npm run dev
   ```

## App Structure

- `src/app` – App Router routes (`/`, `/onboarding`, `/dashboard`, `/settings`).
- `src/app/actions` – Server actions for routines and onboarding.
- `src/lib` – Supabase client helpers, data utilities, and generated types placeholder.
- `supabase` – SQL migrations and seed data for the MVP schema.

## Feature Highlights

- **Onboarding** captures dog details and bootstraps default routines.
- **Home** dashboard lists today's routines with complete/snooze actions.
- **Weekly dashboard** visualizes progress, streaks, and insights.
- **Settings** lets owners rename, reschedule, pause, or add routines.
- **Profile** tab manages human and dog details with timezone preferences.
- **Chatbot assistant** answers care questions via OpenAI (falls back to guidance when no API key is configured).

## Testing Notes

- Use `NEXT_PUBLIC_DEMO_USER_ID` in `.env.local` to drive demo content without auth.
- Run `npm run lint` before commits.
- Generate typed Supabase definitions with `npm run types` once the project id is set.
- For Supabase CLI workflows ensure the following environment variables are defined when applicable: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_ID`, `OPENAI_API_KEY`, and `OPENAI_MODEL` (defaults to `gpt-4-turbo`).

## Next Steps

- Wire push notifications via Supabase Edge Functions.
- Layer in AI personalization once habit data builds up.
- Add multi-caregiver accounts and cross-device syncing.
