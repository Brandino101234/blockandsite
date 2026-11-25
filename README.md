# Block and Site website

Astro static site. See `CLAUDE.md` for content, performance, and design rules.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs dist/
```

## Deploy (Cloudflare Pages)

- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variable: `NODE_VERSION` = `22` (or newer)

## Before launch

1. Fill every `[placeholder]`. Find them with `grep -rn "\[" src public --include=*.astro --include=*.ts --include=*.txt`.
2. Set `PORTAL_ID` and `FORM_ID` in `src/config/hubspot.ts`.
3. Set the real domain in `src/config/site.ts` and `public/robots.txt`.
