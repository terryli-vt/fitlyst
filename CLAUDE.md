# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Run production server
npm run lint      # Run ESLint
```

Database migrations are managed with Drizzle Kit. Schema changes require generating and applying migrations via `drizzle-kit`.

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `OPENAI_API_KEY` — OpenAI API key
- `AUTH_SECRET` — NextAuth secret
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth credentials

## Architecture

**Fitlyst** is a Next.js 16 (App Router) full-stack web app for AI-powered nutrition planning.

### Stack
- **Auth:** NextAuth v5 beta with Google OAuth, JWT sessions
- **Database:** Neon (serverless PostgreSQL) + Drizzle ORM
- **AI:** OpenAI GPT-4o-mini for meal idea generation
- **Styling:** Tailwind CSS v4

### Key directories
- `src/app/` — App Router pages and API routes
- `src/features/onboarding/` — Onboarding questionnaire (components, hooks, config, types, utils)
- `src/features/profile/` — Profile dashboard components
- `src/db/schema.ts` — Drizzle schema (users, accounts, userProfiles, nutritionResults, mealIdeas)
- `src/lib/` — Shared utilities: unit conversion, OpenAI client, meal generation rate limiting
- `drizzle/` — Generated SQL migrations

### User flow
1. Google OAuth login → NextAuth creates user in `users` table
2. Onboarding: 7-step questionnaire (height, weight, age, gender, activity level, goal, priority)
3. `calculateNutrition` utility computes BMR (Mifflin-St Jeor) → TDEE → daily calories & macros; stored in `userProfiles` + `nutritionResults`
4. Meal ideas generated via OpenAI (POST `/api/generate-meal-ideas`), rate-limited to 5/day per user, stored as JSON in `mealIdeas`
5. Profile page (`/profile`) shows nutrition results and saved meal ideas

### API routes
| Route | Methods | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/profile` | GET, POST, PATCH | Fetch/save/update profile & nutrition |
| `/api/generate-meal-ideas` | POST | AI meal generation (rate-limited) |
| `/api/meal-ideas` | GET | Fetch saved meals |

### Path alias
`@/*` resolves to `./src/*`.
