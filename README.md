# India Election Live Tracker

Next.js 14 live dashboard for **Assembly Elections 2026** (counting day **May 4**): West Bengal, Tamil Nadu, Kerala, Assam, and Puducherry (**824 seats**).

- **Primary data:** [News18 Elections API](https://elections-v3-api.news18.com/api/en/analytic-data) (`analytic-data` JSON, aggregated constituency-wise).
- **Fallback:** NDTV elections HTML parse (best-effort; may be blocked by Akamai from some IPs).
- **Cache:** [Vercel KV](https://vercel.com/docs/storage/vercel-kv) (120s TTL). In-memory fallback if KV env vars are absent (local dev).
- **Refresh:** Vercel Cron hits `GET /api/cron/refresh` every minute. The UI polls `GET /api/results` every **20s** when live.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first request to `/api/results` will fetch upstream if the cache is empty.

## Environment variables (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `KV_REST_API_URL` | Recommended | From Vercel KV / Upstash |
| `KV_REST_API_TOKEN` | Recommended | KV write token |
| `KV_REST_API_READ_ONLY_TOKEN` | Optional | For read-only clients |
| `CRON_SECRET` | **Yes (prod)** | Random string. Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. Without it, production cron returns **401**. |

In the Vercel dashboard: **Storage → Create KV**, link to the project (env auto-filled). Then **Settings → Environment Variables** add `CRON_SECRET`.

## Deploy on Vercel

1. Push this repo to GitHub (or connect the monorepo folder).
2. **New Project** → import repo.
3. Set **Root Directory** to `India-Election-Results/india-election-live-tracker` (if the repo contains other folders).
4. Framework preset: **Next.js** (auto).
5. Add **Vercel KV** and `CRON_SECRET`.
6. Deploy. Cron runs per [`vercel.json`](vercel.json) (`* * * * *` = every minute).

### Smoke test after deploy

- `GET /api/health` — last fetch time, source, parser version.
- `GET /api/results` — full JSON snapshot.
- Open `/` and `/state/WB` (etc.) and confirm numbers move as counting progresses.

### Manual refresh (dev)

With `NODE_ENV=development`, `GET /api/cron/refresh` works without `Authorization`. In production, use:

```bash
curl -sS -H "Authorization: Bearer $CRON_SECRET" "https://<your-domain>/api/cron/refresh"
```

## Official results

Use the [Election Commission of India](https://results.eci.gov.in/) for authoritative results. This app is an unofficial aggregator.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server locally |
| `npm run lint` | ESLint |

## Troubleshooting

### `npm error ENOTEMPTY` when renaming `node_modules/next`

Usually caused by a **partial or interrupted** `npm install`. Fix:

```bash
rm -rf node_modules
rm -f package-lock.json
npm install
```

Then `npm run build` again.
