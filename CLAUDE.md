# Block and Site: project rules

Marketing site for Block and Site, a two-partner web design studio (Brendan Nussenblatt and Tarun Bhamidipati) serving local small businesses in Carmel / Fishers, Indiana.

## Content rules (non-negotiable)

1. **Never invent facts.** No made-up statistics, years in business, client counts, awards, certifications, guarantees, response times, or prices.
2. **Never invent reviews, testimonials, client names, logos, or results.** Before/after examples and results may only use real projects the client has approved in writing.
3. **Mark every unconfirmed detail with [brackets]**, e.g. `[PRICE]`, `[PACKAGE 1]`, `[Bio: ...]`. Brackets stay visible on the page until a partner confirms the real value. Search the repo for `[` before launch.
4. Business details live in `src/config/site.ts`; HubSpot IDs live in `src/config/hubspot.ts`. Don't hardcode them in components.
6. Internal links and asset paths go through `withBase()` / `absoluteUrl()` (`src/lib/paths.ts`). The site is served from a subpath on GitHub Pages, so a bare `/` link breaks.
5. The privacy policy (`src/pages/privacy.astro`) must stay accurate. If you add a new form field, a new third-party script, analytics, or a cookie, update the policy in the same change.

## Performance rules (keep pages fast)

- Target Lighthouse 90+ on Performance, Accessibility, Best Practices, and SEO (mobile). Check before merging visual changes.
- No UI frameworks or component libraries. Astro components + plain CSS + small vanilla TS scripts only.
- One self-hosted font file (`src/assets/fonts/outfit.woff2`, bundled by Vite so it works under any base path). Don't add Google Fonts links or more font files.
- Images: use real photos only, compressed WebP/AVIF, with explicit `width`/`height` and `loading="lazy"` below the fold.
- Third-party scripts load after page load (see the HubSpot loader in `src/layouts/Base.astro`). Don't add new ones without a reason.

## Accessibility rules

- Every input has a visible `<label>`; errors show next to the field and are announced.
- Keep visible focus styles, 4.5:1 text contrast, 44px minimum tap targets, and `prefers-reduced-motion` support.

## Design system

Theme: pure black base; blue, red and yellow are the building blocks. Tokens are in `src/styles/global.css`.
- Backgrounds: `#000000` (page), `#0B0B0B` (alternate sections, footer), `#141414` / `#222222` (cards, inactive blocks).
- Text: `#FFFFFF`, muted `#B5B5B5`.
- Blue `#43A4F4` = actions (buttons, links). Red `#F4434C` and yellow `#F4EB43` = block accents only (logo, hero, package stacks, process steps, section markers). Don't use them for body text or large fills.
- Text on blue/red/yellow is always black; white text on these colors fails contrast. These colors fail on white backgrounds, so keep the site black.
- Form errors use the softer `#FF9A9E`, not brand red. Focus rings are yellow.
- Outfit for everything: headings 700 with -0.03em tracking, body 400.
- Sentence case. No all-caps labels, no arrows on buttons. Numbered markers only for real sequences (the process).
- The block motif carries meaning (package size, process steps); don't add decorative blocks elsewhere.

### Logo

- Mark: two overlapping rounded squares, blue (top left) and yellow (bottom right), with the overlap in red. Wordmark: "Block and Site" in Outfit 700, -0.02em.
- Files in `public/brand/`: `logo-on-dark.svg` (white text), `logo-on-light.svg` (black text), `mark.svg`, `app-icon.svg` / `app-icon-512.png` (mark on a black tile). Wordmark text is outlined, so the files work without the font installed.
- Regenerate with `tools/make-logo.py` instead of editing the SVG paths by hand. Don't recolor, rotate, stretch, or add effects to the mark.

## HubSpot

- Custom form posts to `https://api.hsforms.com/submissions/v3/integration/submit/{PORTAL_ID}/{FORM_ID}` (`src/scripts/hubspot-form.ts`).
- Field names must match HubSpot internal names exactly: `firstname, lastname, email, phone, company, website, message`.
- Context sends `pageUri`, `pageName`, and `hutk` (when the tracking cookie exists).
- Never use the default HubSpot embed.

## Commands

- `npm run dev`: local dev server
- `npm run build`: static build to `dist/`. Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.
- `npm run preview`: serve the built site
