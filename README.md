# NBA Fandom & Team Building Strategy Survey

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-CE1141?style=for-the-badge)

## Description

A public, three-page web survey that captures NBA fan opinions on fandom tenure, favorite players, team management priorities, and Houston Rockets trajectory — then visualizes the aggregated results in real time. Built for BAIS:3300 (Spring 2026) at the University of Iowa, the app stores all responses directly in Supabase with no backend server required. It is designed to be fast, accessible (WCAG 2.1 AA), and deployable as a static site on Azure Static Web Apps.

---

## Features

- **Five-question survey** covering NBA fandom duration, favorite player, team management interests, Rockets trajectory rating, and an open-ended GM scenario
- **Real-time results page** that pulls live data from Supabase and renders three Recharts visualizations (vertical bar, horizontal bar, and donut/pie charts)
- **Inline form validation** with accessible error messages linked via `aria-describedby` and automatic focus-jump to the first invalid field
- **Thank-you confirmation screen** that summarizes the respondent's submitted answers immediately after submission
- **No backend required** — all database reads and writes use the Supabase JavaScript client directly from the browser
- **WCAG 2.1 AA accessible** — every input has a label, every error is announced via `role="alert"`, and keyboard focus styles are visible throughout
- **Azure Static Web Apps ready** — includes `staticwebapp.config.json` with SPA fallback routing so direct URL access and page refreshes work correctly
- **Responsive layout** that adapts cleanly from mobile to desktop without a separate mobile stylesheet

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI component framework |
| TypeScript | Type-safe JavaScript |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| Wouter | Lightweight client-side routing (`/`, `/survey`, `/results`) |
| Supabase JS Client | PostgreSQL database access directly from the browser |
| Recharts | Charting library for aggregated results visualizations |
| Azure Static Web Apps | Hosting target with SPA fallback routing config |

---

## Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/installation)
- A [Supabase](https://supabase.com/) project with the `survey_responses` table created (SQL below)

**Supabase table setup** — run this in your Supabase SQL Editor:

```sql
create table survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  fandom_tenure text not null,
  favorite_player text not null,
  management_interests text[] not null,
  rockets_trajectory text not null,
  gm_priority text not null
);

-- Allow public inserts (survey submissions)
alter table survey_responses enable row level security;

create policy "Allow public insert"
  on survey_responses for insert
  to anon
  with check (true);

-- Allow public reads (results page)
create policy "Allow public select"
  on survey_responses for select
  to anon
  using (true);
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ryderrietz/nba-fandom-survey.git
cd nba-fandom-survey
```

2. Install dependencies:

```bash
pnpm install
```

3. Set environment variables — create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Start the development server:

```bash
pnpm --filter @workspace/nba-survey run dev
```

5. Open your browser at `http://localhost:5173`

---

## Usage

| Page | Path | Description |
|---|---|---|
| Home | `/` | Welcome screen with links to take the survey or view results |
| Survey | `/survey` | Five-question form; submits anonymously to Supabase |
| Results | `/results` | Live charts and recent GM suggestions pulled from Supabase |

**To build for production:**

```bash
pnpm --filter @workspace/nba-survey run build
```

The static output is written to `artifacts/nba-survey/dist/public/`. Deploy that folder to Azure Static Web Apps or any static host.

**Environment variables:**

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous (public) API key |
| `PORT` | Dev server port (optional, defaults to `5173`) |
| `BASE_PATH` | Base URL path for sub-path deployments (optional, defaults to `/`) |

---

## Project Structure

```
artifacts/nba-survey/
├── public/
│   └── staticwebapp.config.json   # Azure Static Web Apps SPA fallback routing
├── src/
│   ├── lib/
│   │   └── supabase.ts            # Supabase singleton client
│   ├── pages/
│   │   ├── home.tsx               # Home page — welcome + CTA buttons
│   │   ├── survey.tsx             # Survey page — 5-question form with validation
│   │   ├── results.tsx            # Results page — Recharts charts + Q5 list
│   │   └── not-found.tsx          # 404 fallback page
│   ├── types/
│   │   └── survey.ts              # SurveyResponse type + option constants
│   ├── App.tsx                    # Wouter router — wires /, /survey, /results
│   ├── index.css                  # Global styles (Tailwind + body reset)
│   └── main.tsx                   # React DOM entry point
├── package.json                   # Package manifest (recharts, supabase, wouter)
├── tsconfig.json                  # TypeScript config
└── vite.config.ts                 # Vite config with safe PORT/BASE_PATH defaults
```

---

## Changelog

### v1.0.0 — 2026-03-31

- Initial release
- Home, Survey, and Results pages built with React + Vite
- Supabase integration for anonymous survey submission and live result aggregation
- Three Recharts visualizations: fandom tenure bar, favorite player bar, Rockets trajectory donut
- WCAG 2.1 AA accessibility: labelled inputs, inline errors, focus management
- Azure Static Web Apps routing config included
- All unused scaffold dependencies pruned; production build passing

---

## Known Issues / To-Do

- [ ] The Recharts bundle accounts for ~800 kB gzipped to ~228 kB; code-splitting or lazy-loading the Results page would improve initial load performance
- [ ] Q3 (management interests checkboxes) results are not currently visualized on the Results page — a grouped bar or word-frequency chart could be added
- [ ] There is no rate limiting or CAPTCHA on survey submission; a malicious user could flood the `survey_responses` table with fabricated entries
- [ ] The "Select a player" dropdown option list is hardcoded; adding an "Other (write in)" field would capture fans of players not listed

---

## Roadmap

- **Export results to CSV** — add a download button on the Results page so the researcher can pull raw data without logging into Supabase
- **Admin dashboard** — password-protected view showing all individual responses, with filtering and sorting by question
- **Q3 management interests chart** — visualize checkbox selection frequency with a horizontal grouped bar chart
- **Demographic questions** — optional follow-up questions (age range, region) to enable cross-tab analysis of results
- **Email digest** — weekly automated summary email of new responses sent to the survey owner via Supabase Edge Functions

---

## Contributing

Contributions, bug reports, and feature suggestions are welcome. Please open an issue to discuss significant changes before submitting a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request and describe what you changed and why

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

**Ryder Rietz**
University of Iowa — BAIS:3300, Spring 2026

---

## Contact

GitHub: [@ryderrietz](https://github.com/ryderrietz)

---

## Acknowledgements

- [Supabase Documentation](https://supabase.com/docs) — for clear guides on Row Level Security and the JavaScript client
- [Recharts](https://recharts.org/) — for the composable charting API
- [Tailwind CSS](https://tailwindcss.com/docs) — for the utility-first styling approach
- [Wouter](https://github.com/molefrog/wouter) — for a lightweight React routing alternative
- [shields.io](https://shields.io/) — for the README badge generator
- [Azure Static Web Apps documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/) — for SPA routing configuration guidance
- OpenAI and Anthropic AI assistants — used during development for code review suggestions and accessibility guidance
