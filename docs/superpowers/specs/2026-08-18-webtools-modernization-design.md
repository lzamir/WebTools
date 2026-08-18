# WebTools Modernization — Design Spec

**Date:** 2026-08-18
**Site:** https://lzamir.github.io/WebTools
**Status:** Approved

## Goal

Replace the legacy React 16 / TypeScript 3.1 / webpack 4 toolchain with a
zero-dependency, buildless site built on the modern web platform. The site
remains a curated directory of web-development tools, served statically by
GitHub Pages from the repository root on `master`. No npm, no bundler, no
CDN runtime dependencies.

## Current state (before)

- `index.html` renders an empty `<div id="root">`; content is client-rendered
  by a committed webpack bundle (`dist/app-bundle.js`) built from `app.tsx`.
- Content: 3 categories, 10 links to CSS generator tools (curated ~2019).
- Leftovers: Express dev server (`server.js`), Visual Studio project file
  (`MyNodejsWebApp.njsproj`), Jekyll theme config (`_config.yml`), npm
  manifests, TypeScript/webpack configs.
- Link health (checked 2026-08-18 via curl):
  - **Dead:** `css3.mikeplate.com` (connection failure)
  - **Bot-blocked, verify manually in a browser:** `css3generator.com` (406),
    `www.css3maker.com` (403), `loading.io/button/generator` (403)
  - **Alive:** `css3gen.com`, `colorzilla.com/gradient-editor`,
    `westciv.com/tools/gradients`, `cssbuttoncreator.com`,
    `bestcssbuttongenerator.com`, `css3gen.com/button-generator`

## Scope

### Removed files

`app.tsx`, `app.js`, `app.js.map`, `dist/` (entire directory),
`package.json`, `package-lock.json`, `webpack-config.js`, `tsconfig.json`,
`server.js`, `MyNodejsWebApp.njsproj`, `_config.yml`, `styles/general.css`.

### Kept files

`google495d7671daf7707d.html` (Google Search Console verification),
`.github/workflows/codeql-analysis.yml`, `README.md` (rewritten),
`SECURITY.md`.

### New/rewritten files

```
index.html        — all content in semantic markup
styles/main.css   — design tokens, layout, light/dark themes
scripts/main.js   — single ES module: theme toggle + search filter
assets/favicon.svg
assets/og-image.png  (simple generated card, 1200x630)
404.html          — minimal, links back to home
robots.txt        — allow all, points to sitemap
sitemap.xml       — single URL entry
.nojekyll         — disable Jekyll processing on GitHub Pages
```

## Architecture

**Pure web platform, content-in-HTML.** Tool links live directly in
`index.html` as semantic markup — no runtime data fetching, no client-side
rendering of content. The page is fully readable with JavaScript disabled.
JavaScript is progressive enhancement only.

### index.html

- `<html lang="en">`, UTF-8, responsive viewport.
- `<head>`: title, meta description, canonical URL
  (`https://lzamir.github.io/WebTools/`), Open Graph + Twitter card tags,
  `theme-color` (both schemes), SVG favicon, existing Google site
  verification meta tag carried over.
- `<header>`: site title, tagline, container for the JS-injected search box
  and theme toggle.
- `<main>`: one `<section>` per category. Each section: `<h2>` with an `id`
  (anchor target) and a `<ul>` grid of link cards. Each card is an
  `<li><a>` with the tool name, a one-line description, and
  `data-tags="..."` keywords for search. External links use
  `rel="noopener noreferrer"` and `target="_blank"`.
- `<footer>`: author attribution, link to the GitHub repository, and a
  "last updated" date maintained by hand.
- A visually-hidden "skip to content" link as the first focusable element.

**Adding a tool = adding one `<li>` block.** This is the maintenance story;
no data file, no duplication.

### styles/main.css

- Minimal modern reset.
- Design tokens as custom properties on `:root`: color palette, spacing
  scale, radius, font stacks (system font stack; no webfont requests).
- Theming: `color-scheme: light dark` with `light-dark()` for every color
  token; `[data-theme="light"]` / `[data-theme="dark"]` on `<html>` force an
  explicit scheme via the `color-scheme` property, so `light-dark()` keeps
  working for manual overrides.
- Layout: centered content column (`min()` width), category link-grids via
  `grid-template-columns: repeat(auto-fill, minmax(..., 1fr))`.
- Fluid typography with `clamp()`; native CSS nesting; hover/focus-visible
  card states; `prefers-reduced-motion` disables transitions.

### scripts/main.js

One ES module loaded with `<script type="module">`, no dependencies:

1. **Theme toggle.** Injects a toggle button into the header. Order of
   precedence: `localStorage("theme")` → system preference. Sets
   `data-theme` on `<html>`. Cycles auto → light → dark. Button has an
   accessible label reflecting current state.
2. **Search filter.** Injects a labeled `<input type="search">` into the
   header (so no dead UI exists when JS is off). On input (trimmed,
   case-insensitive): hides cards whose name + description + `data-tags`
   don't match, hides categories with zero visible cards, shows a
   "no matching tools" message when nothing matches. Uses `hidden`
   attribute, no re-rendering.

No other JavaScript. No analytics, no service worker (YAGNI).

## Content plan

Refresh and expand to **6–8 categories, 3–6 links each**. Every link —
existing or new — must be verified reachable in a real browser at
implementation time; the curl sweep is a pre-filter only.

- Existing categories (CSS generators, gradients, buttons) are retained
  where links survive verification; the dead `css3.mikeplate.com` is removed.
- Candidate new categories: color & palettes, layout/grid generators,
  shadows & effects, animation & easing, SVG tools, typography.
- Exact link curation happens during implementation; the acceptance bar is:
  every listed tool is free to use, loads in a browser, and matches its
  category.

## Deployment

Unchanged: GitHub Pages serves the repository root of `master`. The
`.nojekyll` file replaces the deleted `_config.yml` and skips Jekyll
processing. No workflow changes required for deployment.

## Verification checklist (manual, by design — no test framework)

1. Serve locally with any static server and click through.
2. W3C validation: HTML (nu validator) and CSS — zero errors.
3. Lighthouse: Performance / Accessibility / Best Practices / SEO — target
   100 each.
4. Both themes: system-auto, forced light, forced dark; persistence across
   reload.
5. Search: matching, category hiding, empty state, cleared state.
6. JS disabled: full content visible, no broken UI.
7. Keyboard-only pass: skip link, focus visible on all interactive elements.
8. Mobile (360px), tablet, desktop breakpoints.
9. Final link sweep: every external link opens successfully in a browser.

## Out of scope

- Link-checker CI (offered, declined).
- Multiple pages, i18n/RTL, analytics, service worker/offline, webfonts.
- Any build tooling or package manifest.
