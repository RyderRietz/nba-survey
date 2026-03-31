# Working Notes — NBA Fandom & Team Building Strategy Survey

> **Internal document — not public-facing.**
> Update this file at the end of every working session before closing the project.
> Commit it alongside your code changes.

---

## How to Use This File (For AI Assistants)

1. **Read this entire file first** before writing any code or making suggestions.
2. **Read `README.md`** for the public-facing project overview, setup instructions, and tech stack rationale.
3. **Do not change the folder structure or file naming conventions** without discussing it first — the pnpm monorepo layout is load-bearing.
4. **Follow all conventions exactly** as described in the Conventions section below. Do not introduce new patterns without flagging them.
5. **Do not suggest anything listed in "What Was Tried and Rejected"** — those paths have already been explored and abandoned for documented reasons.
6. **Ask before making any large structural changes** — this includes adding routing libraries, swapping the database client, or introducing a backend server.
7. **This project was AI-assisted.** Refactor conservatively. Prefer small, targeted edits over wholesale rewrites. If a file is working correctly, do not rewrite it to match a different style.

---

## Current State

**Last Updated:** 2026-03-31

The application is fully built and functional end-to-end. All three pages render correctly, survey submissions write to Supabase, and the Results page reads live data and renders all charts. TypeScript type-checks clean, production build passes, and the Azure routing config is in place. The project is in a deployable state pending the user running the Supabase SQL setup and configuring their deployment target.

### What Is Working

- [x] Home page (`/`) with welcome copy, "Take the Survey" and "View Results" CTAs, and footer
- [x] Survey page (`/survey`) — all 5 questions with correct input types, labels, required validation, inline errors, loading state, Supabase insert, thank-you screen with answer summary
- [x] Results page (`/results`) — live Supabase fetch, total count, Q1 vertical bar chart, Q2 horizontal bar chart (sorted descending), Q4 donut chart, Q5 recent suggestions list (up to 10)
- [x] WCAG 2.1 AA accessibility: labelled inputs, `aria-invalid`, `aria-describedby` on every individual control, `role="alert"` errors, focus-jump to first invalid field on submit
- [x] Slugified option IDs (no spaces in DOM `id` attributes)
- [x] Wouter routing with `<WouterRouter base={...}>` reading `import.meta.env.BASE_URL`
- [x] Supabase singleton client reading `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [x] `public/staticwebapp.config.json` for Azure Static Web Apps SPA fallback routing
- [x] `pnpm run build` and `pnpm run typecheck` pass with zero errors
- [x] `vite.config.ts` uses safe defaults for `PORT` and `BASE_PATH` (no hard-throw)

### What Is Partially Built

- [ ] Q3 (management interests checkboxes) data is collected and stored but **not visualized** on the Results page — a grouped bar or word-frequency breakdown is still missing
- [ ] The player dropdown has 5 named players + "Other" but no write-in field — responses marked "Other" are not further broken down

### What Is Not Started

- [ ] CSV/JSON data export from Results page
- [ ] Admin view for reading individual raw responses
- [ ] Rate limiting or CAPTCHA on survey submission
- [ ] Demographic follow-up questions (age range, region)
- [ ] Supabase Edge Function for weekly summary email digest

---

## Current Task

The survey app reached a complete, approved state on 2026-03-31. README.md and WORKING_NOTES.md were the final deliverables for the session. No code changes are in progress — the next working session should focus on deploying to Azure Static Web Apps or adding the Q3 management interests visualization to the Results page.

**Single next step:** Run the Supabase SQL setup script (in `README.md`) to create the `survey_responses` table and RLS policies, then deploy via `pnpm run build` and push `dist/public/` to Azure Static Web Apps.

---

## Architecture and Tech Stack

| Technology | Version | Why It Was Chosen |
|---|---|---|
| React | 18 (catalog) | Component model; required by the monorepo scaffold |
| TypeScript | 5 (catalog) | Type safety for survey schema and Recharts data shapes |
| Vite | 7 (catalog) | Fast HMR in dev; clean static build output for Azure deployment |
| Tailwind CSS | 4 (catalog) | Utility-first; avoids a separate stylesheet; works well with inline accent colors |
| Wouter | 3.3.5 | Lightweight (~2 kB) client router; no React context overhead; Link renders as `<a>` directly |
| Supabase JS | 2.x | Direct browser-to-Postgres via RLS; no backend server needed; anon key is safe with row-level policies |
| Recharts | 2.15.2 | Composable React chart primitives; easy to map Supabase row arrays to chart data |
| pnpm workspaces | 10.x | Monorepo tooling already in place; avoids npm/yarn |

---

## Project Structure Notes

```
/                                  ← monorepo root
├── artifacts/
│   └── nba-survey/                ← the only artifact worked on
│       ├── public/
│       │   └── staticwebapp.config.json   ← Azure SPA routing — do not delete
│       ├── src/
│       │   ├── lib/
│       │   │   └── supabase.ts            ← singleton; import this everywhere
│       │   ├── pages/
│       │   │   ├── home.tsx               ← no state; pure presentational
│       │   │   ├── survey.tsx             ← all form state lives here; no lifting needed
│       │   │   ├── results.tsx            ← fetches on mount; no caching layer
│       │   │   └── not-found.tsx          ← simple fallback; no UI library
│       │   ├── types/
│       │   │   └── survey.ts              ← source of truth for option lists and types
│       │   ├── App.tsx                    ← router only; no global state
│       │   ├── index.css                  ← Tailwind import + body reset only
│       │   └── main.tsx                   ← React DOM entry
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── README.md
└── WORKING_NOTES.md
```

**Non-obvious decisions:**

- `survey.ts` holds both the TypeScript interface **and** the option constant arrays. Keeping them co-located means adding a new answer option is a single-file change that TypeScript propagates everywhere.
- `App.tsx` has zero state and zero data fetching. It is a router wrapper only — keep it that way.
- The Vite `base` is set from `import.meta.env.BASE_URL` at runtime (injected by Vite from `BASE_PATH` env var). This allows sub-path deployment on Azure without hardcoding a path.
- `index.css` is intentionally minimal — only `@import "tailwindcss"` and a body reset. All colors are applied as Tailwind utilities or inline `style` props using the `#CE1141` hex directly.

**Files that must not be changed without discussion:**

- `public/staticwebapp.config.json` — removing or altering this breaks direct URL access on Azure
- `src/lib/supabase.ts` — the singleton pattern prevents multiple GoTrueClient instances; do not instantiate Supabase elsewhere
- `src/types/survey.ts` — option arrays are `as const` and used as type constraints; do not widen them to `string[]`
- `vite.config.ts` — the `base` and `server.allowedHosts: true` settings are required for the Replit proxy preview to work

---

## Data / Database

**Supabase project:** `aldsrooifgqrwydhmvxp.supabase.co`
**Table:** `survey_responses`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | auto | `gen_random_uuid()` default; primary key |
| `created_at` | `timestamptz` | auto | `now()` default; used to sort results descending |
| `fandom_tenure` | `text` | yes | One of `FANDOM_TENURE_OPTIONS` values |
| `favorite_player` | `text` | yes | One of `FAVORITE_PLAYER_OPTIONS` values |
| `management_interests` | `text[]` | yes | Array; one or more of `MANAGEMENT_INTEREST_OPTIONS` |
| `rockets_trajectory` | `text` | yes | One of `ROCKETS_TRAJECTORY_OPTIONS` values |
| `gm_priority` | `text` | yes | Free-text; minimum 1 non-whitespace character |

**RLS policies in effect:**
- `anon` role: INSERT allowed unconditionally (public survey)
- `anon` role: SELECT allowed unconditionally (public results)
- No UPDATE or DELETE policies — responses are immutable once submitted

**Credentials location:** Environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. These are set in the Replit Secrets panel and are prefixed with `VITE_` so Vite injects them into the browser bundle. The anon key is safe to expose because RLS enforces all access rules on the Supabase side.

---

## Conventions

### Naming Conventions

- React component files: `kebab-case.tsx` (e.g., `not-found.tsx`)
- Exported component functions: `PascalCase` matching the file's conceptual name
- Constants: `SCREAMING_SNAKE_CASE` for option arrays (e.g., `FANDOM_TENURE_OPTIONS`)
- TypeScript interfaces: `PascalCase` (e.g., `SurveyResponse`, `FormErrors`, `ThankYouData`)
- CSS: Tailwind utility classes only; no custom CSS classes except in `index.css` body reset
- IDs in the DOM: always use `toSlug(option)` when building IDs from option label strings — never interpolate raw label text

### Code Style

- Functional components only; no class components
- `useState` and `useEffect` from React; no external state library
- Inline `style` props for the Rockets Red accent color (`#CE1141`) — do not create a CSS variable for it; it is intentionally explicit
- All event handlers defined as named functions inside the component (not anonymous arrow functions passed inline) for readability
- `async/await` for all Supabase calls; never `.then()/.catch()`
- No optional chaining on Supabase `data` before checking `error` first

### Framework Patterns

- Wouter `<Link>` renders as `<a>` — never nest a `<button>` or `<a>` inside `<Link>`; apply `className` directly to `<Link>`
- Route component props passed as `component={PageComponent}` to `<Route>`, not as JSX children
- `useId()` for all form field ID prefixes — never hardcode an ID string that could collide across React tree instances
- Recharts: always wrap in `<ResponsiveContainer width="100%" height={N}>` — never set a fixed pixel width

### Git Commit Style

```
type: short imperative description (50 chars max)

Body if needed (72 chars per line).
```

Types used: `feat`, `fix`, `a11y`, `refactor`, `chore`, `docs`

---

## Decisions and Tradeoffs

- **No backend server.** All Supabase calls are made from the browser using the anon key + RLS. This means there is no server-side validation layer — the option values in submitted rows are trusted as-is. Do not suggest adding an Express/Hono/etc. backend unless the project scope explicitly changes.
- **No global state manager.** Each page fetches its own data independently. The Results page re-fetches every time it mounts. This is intentional — the survey is low-traffic and simplicity wins over caching complexity.
- **Inline accent color (`#CE1141`) instead of a CSS custom property.** This was chosen to keep the CSS file minimal (no `:root {}` block) and make color usage explicit and grep-able. Do not suggest extracting it to a variable.
- **`management_interests` stored as a PostgreSQL `text[]` array.** This avoids a separate junction table for what is a simple multi-select. Querying for individual option frequency requires iterating in JavaScript (done on the Results page) rather than SQL `GROUP BY`. Acceptable for expected data volumes.
- **`recharts` in `dependencies` (not `devDependencies`).** Charts are rendered at runtime in the browser bundle. Moving it to `devDependencies` caused a code review flag — it stays in `dependencies`.
- **Slugified DOM IDs for radio/checkbox options.** Option labels contain spaces and special characters (e.g., `"1–3 years"`, `"Alperen Şengün"`). Using raw label text in `id` attributes violates HTML5 validity. The `toSlug()` helper in `survey.tsx` normalizes them to `[a-z0-9-]`.

---

## What Was Tried and Rejected

- **Nesting `<button>` or `<a>` inside wouter `<Link>`.** Wouter renders `<Link>` as an `<a>` element, so nesting another anchor or button inside it produces invalid HTML and browser console warnings. Fixed by applying `className` directly to `<Link>`. Do not suggest this pattern again.
- **Hard-throwing in `vite.config.ts` if `PORT` or `BASE_PATH` are not set.** This broke `pnpm run build` in any environment that did not pre-set those variables (CI, Azure build pipelines). Replaced with safe defaults (`5173` and `/`). Do not suggest making these required again.
- **Keeping the full shadcn/ui scaffold (55 component files).** The monorepo template installed ~55 Radix UI component files, hooks, and a `utils.ts`. None were used by the survey pages. They were deleted entirely. Do not suggest re-adding shadcn/ui components — the survey uses plain HTML inputs with Tailwind classes instead.
- **`@tanstack/react-query` in `App.tsx`.** Was included in the scaffold but nothing used it. Removed from both `App.tsx` and `package.json`. Do not suggest adding it back for this project's current scope.
- **`clsx` + `tailwind-merge` (`cn()` helper).** Included in the original scaffold via `src/lib/utils.ts`. No component in this project uses `cn()`. The file was deleted and the packages removed. Do not suggest using them — inline `className` strings are sufficient here.
- **`@workspace/api-client-react` dependency.** The scaffold included it as a devDependency. The survey connects to Supabase directly, not through the workspace API server. Removed.
- **Importing `tw-animate-css` and `@tailwindcss/typography` in `index.css`.** These were present in the generated CSS file. Neither is needed for the survey UI. Removing them and simplifying `index.css` to just `@import "tailwindcss"` fixed a production build failure.

---

## Known Issues and Workarounds

**Bundle size warning (Recharts)**
- **Problem:** `vite build` warns that the output JS chunk exceeds 500 kB (minified ~814 kB, gzipped ~228 kB). Recharts accounts for the majority of this.
- **Workaround:** None currently. The warning is cosmetic and does not break the build or deployment.
- **Resolution path:** Lazy-load the Results page with `React.lazy()` and `<Suspense>` so Recharts is only loaded when the user navigates to `/results`. This has not been implemented yet.
- **Do not remove** the warning suppression note — if you set `chunkSizeWarningLimit` to silence it, document that explicitly.

**Q3 management interests not charted**
- **Problem:** The `management_interests` `text[]` column is collected and stored but has no corresponding visualization on the Results page. The `countManagementInterests()` helper function that was written during development was deleted when it was found to be unused.
- **Workaround:** None. The data is in Supabase and can be queried at any time.
- **Do not add** a Q3 chart without also adding the `countManagementInterests()` helper back and verifying the chart renders correctly with multi-select array data.

**No rate limiting on survey submissions**
- **Problem:** The Supabase anon INSERT policy has no per-IP or per-session limit. A script could flood the `survey_responses` table.
- **Workaround:** None currently. For a class project with limited distribution, this is an acceptable risk.
- **Do not remove** or weaken the RLS SELECT policy to try to address this — it would break the Results page.

---

## Browser / Environment Compatibility

### Frontend

| Browser | Status |
|---|---|
| Chrome 120+ | Tested and working |
| Firefox 120+ | Tested and working |
| Safari 17+ | Expected to work; not explicitly tested |
| Edge 120+ | Expected to work (Chromium-based) |
| Mobile Chrome (Android) | Responsive layout tested in dev tools |
| Mobile Safari (iOS) | Expected to work; not explicitly tested |

- `accentColor` CSS property used for radio/checkbox tinting — supported in all modern browsers; gracefully ignored in older ones (controls fall back to default system colors)
- `useId()` requires React 18+ — do not downgrade React

### Backend / Build Environment

- **OS:** Linux (NixOS on Replit)
- **Node.js:** 18+ required (`globalThis.crypto` used by Supabase client)
- **pnpm:** 10.x (managed by Replit; do not switch to npm or yarn)
- **Environment variables required at build time:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Environment variables optional:** `PORT` (default `5173`), `BASE_PATH` (default `/`)

---

## Open Questions

- **Should the Results page auto-refresh?** Currently it fetches once on mount. For a live survey collecting responses in real time during a class presentation, a polling interval (e.g., every 30 seconds) or Supabase Realtime subscription would be valuable. Not implemented yet — decide before the presentation date.
- **What is the exact deployment target on Azure?** Static Web Apps Free tier? Deployment from GitHub Actions or Azure CLI? The `staticwebapp.config.json` is in place, but the workflow file and build settings need to be configured in the Azure portal.
- **Should Q5 (GM priority) responses be moderated?** Currently all submitted text appears verbatim on the public Results page. For a class survey this is likely fine, but confirm with the instructor whether open-text responses need any filtering.
- **Is there a submission deadline?** If the survey closes after a specific date, the Submit button on `/survey` should be disabled or hidden, and the home page copy should reflect the closed state.

---

## Session Log

### 2026-03-31

**Accomplished:**
- Built all three pages (Home, Survey, Results) from scratch
- Integrated Supabase JS client for anonymous INSERT and SELECT
- Implemented full inline form validation with WCAG 2.1 AA accessibility attributes
- Added three Recharts visualizations (vertical bar Q1, horizontal bar Q2, donut Q4)
- Fixed wouter nested `<Link>` anti-pattern throughout
- Fixed `vite.config.ts` hard-throw on missing env vars
- Removed ~55 unused shadcn/ui scaffold files and pruned `package.json` to only needed deps
- Simplified `index.css` (removed `tw-animate-css` and `@tailwindcss/typography` imports)
- Added slugified DOM IDs for radio/checkbox option inputs
- Added `aria-describedby` on individual inputs (not just fieldset wrappers)
- Fixed first-error focus to target the first option in radio/checkbox groups
- Moved `recharts` from `devDependencies` to `dependencies`
- Wrote `README.md` and `WORKING_NOTES.md`

**Left incomplete:**
- Q3 management interests chart not added to Results page
- No lazy-loading of Recharts (bundle size warning unresolved)
- Azure deployment not configured end-to-end

**Decisions made:**
- No backend server — Supabase RLS handles all access control
- No state manager — each page is self-contained
- Plain HTML inputs with Tailwind instead of shadcn/ui components

**Next step:** User runs Supabase SQL setup, then deploys to Azure Static Web Apps via `pnpm run build` → upload `dist/public/`.

---

## Useful References

- [Supabase JavaScript Client v2 docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Row Level Security guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Recharts API reference](https://recharts.org/en-US/api)
- [Wouter v3 README](https://github.com/molefrog/wouter/blob/main/README.md) — critical for understanding `<Link>` rendering behavior
- [Vite environment variables guide](https://vite.dev/guide/env-and-mode) — explains `VITE_` prefix injection
- [Azure Static Web Apps SPA routing](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#fallback-routes)
- [WCAG 2.1 technique for grouping form controls](https://www.w3.org/WAI/WCAG21/Techniques/html/H71) — fieldset + legend pattern used here
- [shields.io badge generator](https://shields.io/badges) — used for README badges

**AI tools used:**
- Replit Agent (Anthropic Claude) — primary development assistant for all code generation, accessibility review, dependency pruning, and documentation
