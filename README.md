# JunglePet AI

> Your AI jungle companion for climbing the rift.

[![License: MIT](https://img.shields.io/badge/license-MIT-gold.svg)](LICENSE)
[![Built with React](https://img.shields.io/badge/built_with-React_18-149eca?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/bundler-Vite-646cff?logo=vite&logoColor=white)](https://vite.dev)
[![TypeScript](https://img.shields.io/badge/typed-TypeScript-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/styled_with-Tailwind-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Deploy: GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-181717?logo=github&logoColor=white)](https://pages.github.com)

JunglePet AI analyzes a League of Legends player's recent ranked match history and gives them concrete, actionable coaching feedback through a conversational chatbot. Drop a Riot ID — get a real read.

> **Live demo:** https://albuhrrito.github.io/League-Match-History-Analyzer/

---

## Features

- **Real-time match-history analysis.** Last 20 ranked games → aggregate stats (win rate, KDA, CS/min, vision, champion pool, streaks, role).
- **AI-driven coaching** via Google Gemini 2.0 Flash with structured JSON output. The model writes prose around the numbers; the numbers themselves are deterministic.
- **Streaming follow-up answers** — click a suggested question, watch the response stream in token-by-token.
- **Demo mode** with curated sample data for showcasing without API keys.
- **Rule-based fallback** when AI is unavailable, so the app always produces something useful.
- **Free to run.** Riot dev key + Gemini free tier + Cloudflare Workers free tier + GitHub Pages.

## How it works

```
   Browser                      Cloudflare Worker              Upstream
┌────────────┐  GET /proxy   ┌───────────────────┐  HTTPS    ┌──────────────┐
│ JunglePet  │ ───────────▶  │ allow-list filter │ ──────▶   │ Riot API     │
│ React app  │               │  CORS pass-thru   │           │ Gemini API   │
└────────────┘  ◀───────────  │ no key storage    │  ◀──────  └──────────────┘
                              └───────────────────┘
```

API keys live in the user's `localStorage`, never on a server. The worker is a stateless forwarder with a destination + origin allow-list.

## Tech stack

| Layer       | Choice                        | Why                                  |
| ----------- | ----------------------------- | ------------------------------------ |
| Build       | Vite                          | Fast dev loop, GitHub Pages friendly |
| UI          | React 18 + TypeScript         | Type-safe, modern                    |
| Styling     | Tailwind CSS + custom palette | Designed-in, no CSS files to manage  |
| Animation   | Framer Motion                 | Chat reveal + streaming UI           |
| Icons       | lucide-react                  | Clean, tree-shakeable                |
| Lint/format | ESLint + Prettier             | Industry standard                    |
| Hosting     | GitHub Pages                  | Free, zero-config via Actions        |
| CORS proxy  | Cloudflare Worker             | Free, stateless, no key storage      |
| AI          | Gemini 2.0 Flash (free tier)  | 15 RPM, 1M tokens/day                |

## Quick start (local, demo only)

Requires **Node 20+** and **npm 10+** (see `.nvmrc`).

```bash
git clone https://github.com/Albuhrrito/League-Match-History-Analyzer.git
cd League-Match-History-Analyzer
npm install
npm run dev
```

Opens at <http://localhost:5173>. The app loads in **demo mode** with curated sample data (`Albruh#VAL`). No API keys required.

## Going live

Live mode needs three free things:

| #   | What                       | Where                                       | Time   |
| --- | -------------------------- | ------------------------------------------- | ------ |
| 1   | Riot dev API key (24h TTL) | https://developer.riotgames.com             | 5 min  |
| 2   | Gemini API key             | https://aistudio.google.com/apikey          | 3 min  |
| 3   | Cloudflare Worker          | `cd worker && npm i && npx wrangler deploy` | 10 min |

Then open the deployed app, click the gear icon, paste all three values, toggle **Demo mode** off, **Save**.

The worker is a 100-line stateless CORS forwarder — see [`worker/README.md`](worker/README.md) for the deploy walkthrough.

## Deploy to GitHub Pages

The `.github/workflows/deploy.yml` workflow builds and deploys on every push to `main`. To enable it:

1. Fork or push this repo to GitHub.
2. **Settings → Pages → Source: GitHub Actions**.
3. Push to `main` → site goes live at `https://<user>.github.io/<repo>/`.

The base path is auto-derived from the repo name, so renaming the repo won't break links.

## Available scripts

```bash
npm run dev             # local dev server
npm run build           # production build to ./dist
npm run preview         # serve ./dist locally
npm run typecheck       # tsc --noEmit
npm run lint            # ESLint
npm run format          # Prettier --write
npm run format:check    # Prettier --check
npm run worker:dev      # local Cloudflare Worker (port 8787)
npm run worker:deploy   # deploy worker to *.workers.dev
```

## Project structure

```
.
├── .github/workflows/deploy.yml   GitHub Pages auto-deploy
├── public/
│   └── favicon.svg                JunglePet leaf icon
├── src/
│   ├── components/                React UI (Hero, ChatBot, SettingsPanel, …)
│   ├── lib/
│   │   ├── types.ts               Player / Match / Issue type definitions
│   │   ├── secureStore.ts         Settings + localStorage
│   │   ├── transport.ts           HTTP layer (web → worker)
│   │   ├── riotApi.ts             Typed Riot client (Account, League, Match v5)
│   │   ├── transform.ts           Riot v5 schema → internal types
│   │   ├── livePlayer.ts          Orchestrator with localStorage match cache
│   │   ├── analyzer.ts            Deterministic stats + rule-based fallback
│   │   ├── aiCoach.ts             Gemini structured output + streaming
│   │   ├── responses.ts           Static deep-dive content (offline fallback)
│   │   ├── mockData.ts            Curated demo player
│   │   └── cn.ts                  className merge helper
│   ├── App.tsx                    State machine: landing → loading → analyzed
│   ├── main.tsx                   React entry
│   └── index.css                  Tailwind + utility layers
├── worker/
│   ├── src/index.ts               Cloudflare Worker (CORS pass-through)
│   ├── wrangler.toml              Worker config
│   └── README.md                  Worker deploy walkthrough
├── eslint.config.js               Flat ESLint config (TypeScript + React)
├── .prettierrc / .prettierignore  Prettier + tailwind plugin
├── .editorconfig                  Cross-editor whitespace
├── .nvmrc                         Pinned Node version (20)
├── tailwind.config.js             Custom JunglePet palette
├── tsconfig.{json,app,node}.json  TypeScript project refs
├── vite.config.ts                 Vite + alias + GH Pages base path
└── LICENSE                        MIT
```

## Customizing

- **Coaching voice** — `SYSTEM_ANALYSIS` and `SYSTEM_FOLLOWUP` in `src/lib/aiCoach.ts`.
- **Detection thresholds** (rule-based fallback) — `CS_TARGET`, `VISION_TARGET`, and the `detect*` functions in `src/lib/analyzer.ts`.
- **Color palette** — `tailwind.config.js` → `theme.extend.colors` (`jungle`, `gold`, `arcane`, `ember`).
- **Mascot** — `src/components/MascotLogo.tsx` is a hand-drawn SVG.
- **Worker allow-list** — `ALLOWED_HOSTS` and `ALLOWED_ORIGIN_PATTERNS` in `worker/src/index.ts`.

## Costs

Everything in the recommended setup is **free for personal use**:

- **Riot API** — free dev key, rotates every 24 h
- **Gemini 2.0 Flash** — 15 RPM, 1M tokens/day (≈5,000 analyses/day for one user)
- **Cloudflare Workers** — 100k requests/day (≈4,000 analyses/day)
- **GitHub Pages** — unlimited bandwidth on public repos

For public distribution at scale you'd want a Riot **production** API key (free, but ~weeks lead time).

## Disclaimer

JunglePet AI is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.

## License

[MIT](LICENSE) © Albuhrrito
