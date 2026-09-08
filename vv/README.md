# vishnuvardhan.io

Personal portfolio. Next.js 15 (App Router, TypeScript), static export, no UI framework.

## Run locally
    npm install
    npm run dev        # http://localhost:3000

## Build
    npm run build      # static site in ./out

## Edit content
All text lives in `content/profile.ts`. Layout is `app/page.tsx`; the code-card hero is `components/CodeCard.tsx`.
Put the public CV at `public/assets/Vishnu_Vardhan_CV.pdf`.

## Deploy — Cloudflare Pages
1. Push this repo to GitHub as `vishnu-vardhan-d/vishnuvardhan.io`.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick the repo.
3. Framework preset: **Next.js (Static HTML Export)**. Build command `npm run build`, output directory `out`.
4. Custom domains → add `vishnuvardhan.io` (and `www`). Cloudflare writes the DNS records itself.

Every push to `main` redeploys; other branches get preview URLs.

## Visit counter (optional)
The number at the bottom of the left column comes from a Cloudflare Worker in `worker/`.
1. `cd worker && npx wrangler kv namespace create VISITS` — paste the printed id into `wrangler.toml`.
2. `npx wrangler deploy` — note the worker URL (e.g. `https://vishnuvardhan-visits.<account>.workers.dev`).
3. In Cloudflare Pages → Settings → Environment variables, add `NEXT_PUBLIC_VISITS_URL` = that URL, then redeploy.
If the variable is absent the counter simply doesn't render.
