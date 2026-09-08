# vishnuvardhan.io

Personal site. Next.js 15 (App Router, TypeScript), static export, no UI framework, no CSS library.
Built by GitHub Actions and served by GitHub Pages at [vishnuvardhan.io](https://vishnuvardhan.io).

## Run it

    npm install
    npm run dev        # http://localhost:3000
    npm run build      # static site in ./out

All copy lives in `content/profile.ts`. The page layout is `app/page.tsx`; the Java card is
`components/CodeCard.tsx`. Fonts are self-hosted in `public/fonts` (Inter, JetBrains Mono).

---

# How to point a custom domain at GitHub Pages

This is the part people get stuck on, so here is the whole picture. Three independent systems have
to agree, and each fails differently when it is wrong.

## First, the words

Before the setup makes sense, four terms:

- **Domain name** — the human-readable address you typed to get here: `vishnuvardhan.io`.
  Computers cannot use it directly. They need a number.
- **IP address** — the actual number a computer connects to, like `185.199.108.153`.
  Every server on the internet has one.
- **DNS** — the phone book that turns a name into a number. Type a name, get an address back.
- **Host header** — when a browser connects, it also says *which name it was looking for*.
  This matters because one server can host many sites, and it needs to know which one you want.

## The three questions

Loading a page from a custom domain answers three questions in order. Each one is handled by a
different system, and each fails in its own recognisable way.

### Question 1 — "Where is vishnuvardhan.io?"

Answered by **DNS**, configured at your DNS provider (Cloudflare here).

You add records that say the name should resolve to GitHub's servers:

| Record | Name | Points to | Why |
|---|---|---|---|
| A | `@` (the bare domain) | 185.199.108.153 | GitHub Pages' address |
| A | `@` | 185.199.109.153 | second server, for redundancy |
| A | `@` | 185.199.110.153 | third |
| A | `@` | 185.199.111.153 | fourth |
| CNAME | `www` | `vishnu-vardhan-d.github.io` | your Pages hostname |

An **A record** maps a name straight to an IP address. A **CNAME record** maps a name to *another
name*, which then gets looked up in turn. The bare domain must use A records — the DNS standard does
not allow a CNAME there — which is why the two rows look different.

*If this is wrong, the browser cannot connect at all: "server not found".*

### Question 2 — "Which site is vishnuvardhan.io?"

Answered by a file in **this repository**: `public/CNAME`, containing one line:

    vishnuvardhan.io

Those four IP addresses are not yours. They serve millions of GitHub Pages sites. So when a request
arrives carrying the Host header `vishnuvardhan.io`, GitHub has to work out whose site to send back.
This file is how a repository claims a domain: "requests for that name belong to me."

Note that the file is named CNAME but has nothing to do with the CNAME record type above. Same word,
unrelated meaning. It is an unfortunate historical name.

*If this is wrong, you reach GitHub and get a 404.*

### Question 3 — "Where are this site's own files?"

Answered at **build time**, by `basePath` in `next.config.ts`.

An HTML page is not one file. It is a page that then asks for a stylesheet, fonts, images. Those
requests use paths written into the HTML when the site was built — so the build has to know, in
advance, where the site will sit.

    Built for a root domain              Built for a subfolder
    basePath = ""                        basePath = "/vishnuvardhan.io"

    served at:  vishnuvardhan.io/        served at:  user.github.io/vishnuvardhan.io/
    asks for:   /_next/.../app.css       asks for:   /vishnuvardhan.io/_next/.../app.css
    file is at: /_next/.../app.css  ✓    file is at: /vishnuvardhan.io/_next/.../app.css  ✓

Use the wrong one and the page still loads — the HTML is fine — but every stylesheet and font request
misses by one folder. The browser shows the text with no styling at all.

*If this is wrong, you get plain unstyled HTML.*

## Putting it together

    You type vishnuvardhan.io
             │
             ▼
    ① DNS says: "that name is at 185.199.108.153"
             │
             ▼
    ② Browser connects there and asks for the page,
       mentioning the name it wanted (the Host header).
       GitHub finds the repo whose public/CNAME claims
       that name, and sends back its index.html
             │
             ▼
    ③ The HTML asks for its stylesheet at the path
       chosen when the site was built. If that path
       matches where the files actually sit, the page
       renders properly.

## Steps

**1. Deploy with Actions.** Set repo Settings → Pages → Source to **GitHub Actions**, and commit
`.github/workflows/deploy.yml` (in this repo). It runs `npm run build` and publishes `out/`.

**2. Claim the domain.** Create `public/CNAME` with one line and nothing else:

    vishnuvardhan.io

Anything in `public/` is copied verbatim into the build output, so the file lands at the root of the
published site. Keep it in the repo rather than relying on the Pages settings field — a workflow
deploy can otherwise overwrite it.

**3. Build for the root.** In `next.config.ts`, `basePath` comes from `NEXT_PUBLIC_BASE_PATH`:

| Serving from | Set | Assets resolve to |
|---|---|---|
| `vishnuvardhan.io` | leave unset | `/_next/...` |
| `user.github.io/repo/` | `/repo` | `/repo/_next/...` |

Anything referenced from `public/` must go through the bundler to pick this up — `next/image` with a
static import for pictures, and CSS `url()` for fonts. A hard-coded `src="/assets/x.png"` will not.

**4. DNS.** At the DNS provider, four `A` records on the apex to GitHub's addresses above, plus a
`CNAME` for `www` to `<user>.github.io`. A CNAME cannot be used on a bare domain, which is why the
apex needs A records and `www` does not. On Cloudflare, set these to **DNS only** (grey cloud) — the
orange-cloud proxy interferes with certificate issuance — and set SSL/TLS to **Full**, not Flexible,
which would loop.

![Cloudflare DNS records: four A records on the apex and a www CNAME, all set to DNS only](docs/cloudflare-dns.png)

**5. Finish.** Settings → Pages → Custom domain → enter the domain → Save, wait for the DNS check to
pass, then tick **Enforce HTTPS** once GitHub has issued the certificate (minutes, sometimes an hour).

![GitHub Pages settings: source set to GitHub Actions, custom domain entered, DNS check successful](docs/pages-settings.png)

## Symptom table

| What you see | Which layer | Fix |
|---|---|---|
| Cannot connect / NXDOMAIN | DNS | records missing or not propagated |
| 404 from GitHub | ownership | `public/CNAME` missing from the build output |
| Plain unstyled HTML | base path | built for the wrong path — check `NEXT_PUBLIC_BASE_PATH` |
| Redirect loop | TLS | Cloudflare SSL/TLS set to Flexible; use Full |
| Certificate warning | TLS | wait for issuance, then enable Enforce HTTPS |

## Optional: visit counter

The count under the location comes from a Cloudflare Worker in `worker/`.

1. `cd worker && npx wrangler kv namespace create VISITS` — paste the id into `wrangler.toml`.
2. `npx wrangler deploy` — note the worker URL.
3. Add repo variable `NEXT_PUBLIC_VISITS_URL` (Settings → Secrets and variables → Actions → Variables).

Without the variable the counter simply does not render.
