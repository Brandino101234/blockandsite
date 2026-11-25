# Block and Site website

Astro static site. See `CLAUDE.md` for content, performance, and design rules.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs dist/
```

## Deploy

**Now: GitHub Pages.** Every push to `main` builds and deploys automatically (`.github/workflows/deploy.yml`).
Live at https://brandino101234.github.io/blockandsite/

The site runs under the `/blockandsite` subpath, set by `basePath` in `src/config/site.ts`. Always build links with `withBase()` from `src/lib/paths.ts`, never a bare `/`.

**Later: own domain (Cloudflare Pages or GitHub Pages custom domain).** Set `url` to the domain and `basePath` to `''` in `src/config/site.ts`, and update `public/robots.txt`. For Cloudflare Pages: build command `npm run build`, output `dist`, env `NODE_VERSION` = `24`. (`public/_headers` is only used by Cloudflare.)

## Brand files

Logo files live in `public/brand/` (SVG + PNG, for dark and light backgrounds, plus an app icon). After deploy they're also available at `/brand/...` on the live site.

## Before launch

1. Fill every `[placeholder]`. Find them with `grep -rn "\[" src public --include=*.astro --include=*.ts --include=*.txt`.
2. Set `PORTAL_ID` and `FORM_ID` in `src/config/hubspot.ts`.
3. Set the real domain in `src/config/site.ts` and `public/robots.txt`.
