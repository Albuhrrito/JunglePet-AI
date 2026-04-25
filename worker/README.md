# JunglePet AI — Cloudflare Worker proxy

Stateless CORS pass-through. Forwards requests to Riot or Gemini if (and only if) the destination is on the allow-list and the origin is allowed.

## Why this exists

Riot's API and Google's Gemini API don't support CORS for browser calls. This worker sits between the GitHub Pages site and those APIs, adding the CORS headers that browsers require. **It does not store API keys** — keys are passed by the client per-request.

## One-time setup

```bash
npm install                      # from this `worker/` directory
npx wrangler login               # opens a browser to authenticate Cloudflare
```

## Deploy

```bash
npm run deploy
```

Wrangler prints something like:

```
Published junglepet-proxy (...)
  https://junglepet-proxy.<your-account>.workers.dev
```

Copy that URL → paste into JunglePet AI's **Settings → Cloudflare Worker URL**.

## Local dev

```bash
npm run dev          # starts on http://localhost:8787
```

In the JunglePet settings, change the worker URL to `http://localhost:8787` for local testing.

## Customization

- **`name`** in `wrangler.toml` controls the subdomain (e.g. rename to `coach-proxy` → URL becomes `coach-proxy.<account>.workers.dev`).
- **`ALLOWED_HOSTS`** in `src/index.ts` is the destination allow-list.
- **`ALLOWED_ORIGIN_PATTERNS`** is the source allow-list — add a custom domain regex if you host the front-end somewhere other than GitHub Pages or localhost.

## Cost

Free tier covers 100,000 requests/day. One JunglePet analysis = ~25 requests (1 account + 20 matches + 1 rank + 4 AI calls). That's **4,000 free analyses per day**.
