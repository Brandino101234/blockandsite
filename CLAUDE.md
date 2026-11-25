# Block and Site: project rules

Marketing site for Block and Site, a two-partner web design studio (Brendan Nussenblatt and Tarun Bhamidipati) serving local small businesses in Carmel / Fishers, Indiana.

## Content rules (non-negotiable)

1. **Never invent facts.** No made-up statistics, years in business, client counts, awards, certifications, guarantees, response times, or prices.
2. **Never invent reviews, testimonials, client names, logos, or results.** Before/after examples and results may only use real projects the client has approved in writing.
3. **Mark every unconfirmed detail with [brackets]**, e.g. `[PRICE]`, `[PACKAGE 1]`, `[Bio: ...]`. Brackets stay visible on the page until a partner confirms the real value. Search the repo for `[` before launch.
4. Business details live in `src/config/site.ts`; HubSpot IDs live in `src/config/hubspot.ts`. Don't hardcode them in components.
5. The privacy policy (`src/pages/privacy.astro`) must stay accurate. If you add a new form field, a new third-party script, analytics, or a cookie, update the policy in the same change.

## Performance rules (keep pages fast)

- Target Lighthouse 90+ on Performance, Accessibility, Best Practices, and SEO (mobile). Check before merging visual changes.
- No UI frameworks or component libraries. Astro components + plain CSS + small vanilla TS scripts only.
- One self-hosted font file (`public/fonts/archivo-wdth.woff2`). Don't add Google Fonts links or more font files.
- Images: use real photos only, compressed WebP/AVIF, with explicit `width`/`height` and `loading="lazy"` below the fold.
- Third-party scripts load after page load (see the HubSpot loader in `src/layouts/Base.astro`). Don't add new ones without a reason.

## Accessibility rules

- Every input has a visible `<label>`; errors show next to the field and are announced.
- Keep visible focus styles, 4.5:1 text contrast, 44px minimum tap targets, and `prefers-reduced-motion` support.

## Design system

Concept: Indiana limestone + blueprints. Tokens are in `src/styles/global.css`.
- Ink `#14213D`, Paper `#F7F8FA`, Limestone `#E3E2DC`, Signal Yellow `#FFC21A` (CTAs/accents only, always with Ink text), Steel `#2F5D8A` (links/focus).
- Archivo variable: headings 800 weight at ~118% width; body 400 at normal width.
- Sentence case. No all-caps labels, no arrows on buttons. Numbered markers only for real sequences (the process).
- The block motif carries meaning (package size, process steps); don't add decorative blocks elsewhere.

## HubSpot

- Custom form posts to `https://api.hsforms.com/submissions/v3/integration/submit/{PORTAL_ID}/{FORM_ID}` (`src/scripts/hubspot-form.ts`).
- Field names must match HubSpot internal names exactly: `firstname, lastname, email, phone, company, website, message`.
- Context sends `pageUri`, `pageName`, and `hutk` (when the tracking cookie exists).
- Never use the default HubSpot embed.

## Commands

- `npm run dev`: local dev server
- `npm run build`: static build to `dist/` (Cloudflare Pages: build command `npm run build`, output `dist`)
- `npm run preview`: serve the built site
