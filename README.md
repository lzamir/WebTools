# WebTools

A curated directory of free online tools for web developers —
CSS generators, color palettes, gradients, layout builders,
animation and typography helpers, plus JavaScript, TypeScript
and React tools.

**Live site:** https://lzamir.github.io/WebTools/

## How it works

Buildless by design. No npm, no bundler, no framework. The only
external request is Google Analytics (gtag.js):

- `index.html` — all content as semantic markup (works with JS disabled)
- `styles/main.css` — design tokens, responsive card grid, automatic
  light/dark theme via `light-dark()` with a manual override
- `scripts/main.js` — one ES module adding progressive enhancements:
  a theme toggle and an instant search filter

Deployed by GitHub Pages straight from the repository root of `master`.

## Adding a tool

Add one `<li class="card">` block inside the right category's
`<ul class="cards">` in `index.html`. Include `data-tags` keywords so
the search finds it. Verify the link opens before committing.
