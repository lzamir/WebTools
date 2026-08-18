# WebTools Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the React/webpack toolchain with a zero-dependency, buildless static site (semantic HTML + modern CSS + one vanilla ES module) with refreshed content, deployed unchanged on GitHub Pages.

**Architecture:** All content lives directly in `index.html` as semantic markup (readable with JS disabled). One stylesheet holds design tokens and light/dark theming via `light-dark()`. One ES module adds progressive enhancements only: a theme toggle and an instant search filter, both injected by JS so no dead UI exists without it.

**Tech Stack:** HTML5, modern CSS (custom properties, `light-dark()`, grid, `clamp()`, nesting), vanilla ES modules. **No npm, no bundler, no CDN, no test framework — verification is manual with exact commands/checks given per task.**

**Spec:** `docs/superpowers/specs/2026-08-18-webtools-modernization-design.md`

## Global Constraints

- Zero runtime dependencies: no `package.json`, no CDN URLs anywhere in the site.
- Site must be fully readable with JavaScript disabled.
- Canonical URL is exactly `https://lzamir.github.io/WebTools/`.
- Google verification must survive: keep `google495d7671daf7707d.html` AND the `<meta name="google-site-verification" content="wDnyUyfWp4Zb92IrhpNKFXzGH2bplOFMC6W_rPElc6g" />` tag.
- All external links: `target="_blank" rel="noopener noreferrer"`.
- **Do not `git push` until Task 8.** Intermediate commits would break the live GitHub Pages site.
- Working directory for all commands: `d:\source\LZamir-GitHub-Repo\WebTools`.

## Local dev server (used by several tasks)

ES modules do not load from `file://`, so serve the repo root. Prefer:

```
python -m http.server 8080
```

If Python is not installed, save this throwaway script as `serve.ps1` in the **scratchpad directory** (never commit it) and run it from the repo root with `pwsh -File <scratchpad>\serve.ps1`:

```powershell
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://localhost:8080/')
$listener.Start()
$root = (Get-Location).Path
$mime = @{ '.html'='text/html'; '.css'='text/css'; '.js'='text/javascript';
           '.svg'='image/svg+xml'; '.png'='image/png'; '.xml'='application/xml';
           '.txt'='text/plain'; '.ico'='image/x-icon' }
Write-Host "Serving $root at http://localhost:8080/ (Ctrl+C to stop)"
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
  if ($rel -eq '') { $rel = 'index.html' }
  $path = Join-Path $root $rel
  if (Test-Path $path -PathType Leaf) {
    $bytes = [IO.File]::ReadAllBytes($path)
    $ext = [IO.Path]::GetExtension($path).ToLower()
    $ctx.Response.ContentType = $mime[$ext] ?? 'application/octet-stream'
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else { $ctx.Response.StatusCode = 404 }
  $ctx.Response.Close()
}
```

---

### Task 1: Remove the legacy toolchain

**Files:**
- Delete: `app.tsx`, `app.js`, `app.js.map`, `dist/app-bundle.js`, `dist/app-bundle.js.map`, `package.json`, `package-lock.json`, `webpack-config.js`, `tsconfig.json`, `server.js`, `MyNodejsWebApp.njsproj`, `_config.yml`, `styles/general.css`
- Keep untouched: `google495d7671daf7707d.html`, `.github/workflows/codeql-analysis.yml`, `SECURITY.md`, `index.html` (rewritten in Task 2), `README.md` (rewritten in Task 7)

**Interfaces:**
- Consumes: nothing.
- Produces: a repo with no build tooling; Task 2 rewrites `index.html` from scratch.

- [ ] **Step 1: Delete the legacy files**

```bash
git rm app.tsx app.js app.js.map dist/app-bundle.js dist/app-bundle.js.map \
  package.json package-lock.json webpack-config.js tsconfig.json \
  server.js MyNodejsWebApp.njsproj _config.yml styles/general.css
```

- [ ] **Step 2: Verify only expected files remain**

Run: `git ls-files`
Expected output contains ONLY: `.github/workflows/codeql-analysis.yml`, `README.md`, `SECURITY.md`, `google495d7671daf7707d.html`, `index.html`, `docs/superpowers/...` files. No `dist/`, no `*.json` manifests, no `*.ts*`.

- [ ] **Step 3: Commit**

```bash
git commit -m "Remove legacy React/webpack/Express toolchain"
```

---

### Task 2: Rewrite index.html with full refreshed content

**Files:**
- Rewrite: `index.html`

**Interfaces:**
- Consumes: nothing.
- Produces: the DOM contract used by Tasks 3–4:
  - `header.site-header` containing `div.site-controls` (empty; JS injects controls here)
  - `main#main` containing `section.category` elements, each with `ul.cards > li.card[data-tags]`
  - Class names: `.skip-link`, `.site-title`, `.tagline`, `.card-title`, `.card-desc`, `.card-host`, `.site-footer`, `.visually-hidden`
  - References `styles/main.css` (Task 3), `scripts/main.js` (Task 4), `assets/favicon.svg` and `assets/og-image.png` (Task 5)

- [ ] **Step 1: Write the complete file**

Write `index.html` with exactly this content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WebTools — Curated Web Development Tools</title>
  <meta name="description" content="A curated directory of free online tools for web developers: CSS generators, color palettes, gradients, layout builders, animation and typography helpers." />
  <link rel="canonical" href="https://lzamir.github.io/WebTools/" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="WebTools — Curated Web Development Tools" />
  <meta property="og:description" content="A curated directory of free online tools for web developers: CSS generators, color palettes, gradients, layout builders, animation and typography helpers." />
  <meta property="og:url" content="https://lzamir.github.io/WebTools/" />
  <meta property="og:image" content="https://lzamir.github.io/WebTools/assets/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f6f8fa" />
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0d1117" />
  <meta name="google-site-verification" content="wDnyUyfWp4Zb92IrhpNKFXzGH2bplOFMC6W_rPElc6g" />
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="styles/main.css" />
  <script>
    /* Theme bootstrap: apply saved override before first paint to avoid a flash. */
    try {
      var t = localStorage.getItem('theme');
      if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
    } catch (e) {}
  </script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header">
    <h1 class="site-title">WebTools</h1>
    <p class="tagline">Curated web development tools, hand-picked by Lior Zamir.</p>
    <div class="site-controls"></div>
  </header>

  <main id="main">
    <section class="category" id="general" aria-labelledby="general-title">
      <h2 id="general-title">General Tools &amp; Collections</h2>
      <ul class="cards">
        <li class="card" data-tags="css generator shadow gradient text effects">
          <a href="https://css3gen.com" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">CSS3 Gen</strong>
            <span class="card-desc">Generators for shadows, gradients, text effects and more.</span>
            <span class="card-host">css3gen.com</span>
          </a>
        </li>
        <li class="card" data-tags="css generator reference collection">
          <a href="https://www.cssportal.com" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">CSS Portal</strong>
            <span class="card-desc">Large collection of CSS generators and references.</span>
            <span class="card-host">cssportal.com</span>
          </a>
        </li>
        <li class="card" data-tags="toolbox open source triangle gradient shadow svg">
          <a href="https://omatsuri.app" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Omatsuri</strong>
            <span class="card-desc">Open-source browser toolbox: triangles, gradients, shadows, SVG.</span>
            <span class="card-host">omatsuri.app</span>
          </a>
        </li>
        <li class="card" data-tags="toolbox css text image code converter">
          <a href="https://10015.io" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">10015 Tools</strong>
            <span class="card-desc">All-in-one toolbox for CSS, text, images and code.</span>
            <span class="card-host">10015.io</span>
          </a>
        </li>
        <li class="card" data-tags="svg optimizer minify compress">
          <a href="https://jakearchibald.github.io/svgomg/" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">SVGOMG</strong>
            <span class="card-desc">Optimize SVG files right in the browser.</span>
            <span class="card-host">jakearchibald.github.io</span>
          </a>
        </li>
      </ul>
    </section>

    <section class="category" id="colors" aria-labelledby="colors-title">
      <h2 id="colors-title">Colors &amp; Palettes</h2>
      <ul class="cards">
        <li class="card" data-tags="color palette scheme generator export">
          <a href="https://coolors.co" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Coolors</strong>
            <span class="card-desc">Fast color palette generator with export options.</span>
            <span class="card-host">coolors.co</span>
          </a>
        </li>
        <li class="card" data-tags="color palette curated gallery">
          <a href="https://colorhunt.co" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Color Hunt</strong>
            <span class="card-desc">Curated gallery of hand-picked color palettes.</span>
            <span class="card-host">colorhunt.co</span>
          </a>
        </li>
        <li class="card" data-tags="color font preview live page">
          <a href="https://www.realtimecolors.com" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Realtime Colors</strong>
            <span class="card-desc">Preview palettes and fonts on a realistic page in real time.</span>
            <span class="card-host">realtimecolors.com</span>
          </a>
        </li>
        <li class="card" data-tags="color picker oklch wide gamut converter">
          <a href="https://oklch.com" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">OKLCH Color Picker</strong>
            <span class="card-desc">Picker and converter for the modern OKLCH color space.</span>
            <span class="card-host">oklch.com</span>
          </a>
        </li>
      </ul>
    </section>

    <section class="category" id="gradients" aria-labelledby="gradients-title">
      <h2 id="gradients-title">Gradient Generators</h2>
      <ul class="cards">
        <li class="card" data-tags="gradient editor photoshop css">
          <a href="https://www.colorzilla.com/gradient-editor" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">ColorZilla Gradient Editor</strong>
            <span class="card-desc">Classic Photoshop-like gradient editor with CSS output.</span>
            <span class="card-host">colorzilla.com</span>
          </a>
        </li>
        <li class="card" data-tags="gradient background designer css">
          <a href="https://cssgradient.io" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">CSS Gradient</strong>
            <span class="card-desc">Simple gradient designer with copy-ready CSS.</span>
            <span class="card-host">cssgradient.io</span>
          </a>
        </li>
        <li class="card" data-tags="gradient wide gamut oklch modern css">
          <a href="https://gradient.style" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">gradient.style</strong>
            <span class="card-desc">Modern CSS gradients in wide-gamut color spaces.</span>
            <span class="card-host">gradient.style</span>
          </a>
        </li>
        <li class="card" data-tags="gradient tool veteran">
          <a href="https://westciv.com/tools/gradients" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Westciv Gradients</strong>
            <span class="card-desc">Veteran gradient building tool.</span>
            <span class="card-host">westciv.com</span>
          </a>
        </li>
      </ul>
    </section>

    <section class="category" id="buttons" aria-labelledby="buttons-title">
      <h2 id="buttons-title">Buttons &amp; UI Elements</h2>
      <ul class="cards">
        <li class="card" data-tags="button generator css">
          <a href="https://cssbuttoncreator.com" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">CSS Button Creator</strong>
            <span class="card-desc">Visual CSS button designer.</span>
            <span class="card-host">cssbuttoncreator.com</span>
          </a>
        </li>
        <li class="card" data-tags="button generator css">
          <a href="https://www.bestcssbuttongenerator.com" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Best CSS Button Generator</strong>
            <span class="card-desc">Quick CSS button generator with presets.</span>
            <span class="card-host">bestcssbuttongenerator.com</span>
          </a>
        </li>
        <li class="card" data-tags="button generator css">
          <a href="https://css3gen.com/button-generator" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">CSS3 Gen Button Generator</strong>
            <span class="card-desc">Button generator from the CSS3 Gen suite.</span>
            <span class="card-host">css3gen.com</span>
          </a>
        </li>
        <li class="card" data-tags="ui elements open source buttons cards loaders community">
          <a href="https://uiverse.io" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Uiverse</strong>
            <span class="card-desc">Thousands of open-source UI elements in pure CSS.</span>
            <span class="card-host">uiverse.io</span>
          </a>
        </li>
      </ul>
    </section>

    <section class="category" id="layout" aria-labelledby="layout-title">
      <h2 id="layout-title">Layout &amp; Grid</h2>
      <ul class="cards">
        <li class="card" data-tags="grid layout builder visual css">
          <a href="https://grid.layoutit.com" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">LayoutIt Grid</strong>
            <span class="card-desc">Visual CSS grid builder with code export.</span>
            <span class="card-host">grid.layoutit.com</span>
          </a>
        </li>
        <li class="card" data-tags="grid generator visual css">
          <a href="https://cssgrid-generator.netlify.app" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">CSS Grid Generator</strong>
            <span class="card-desc">Drag-and-drop CSS grid generator.</span>
            <span class="card-host">cssgrid-generator.netlify.app</span>
          </a>
        </li>
        <li class="card" data-tags="flexbox learn game practice">
          <a href="https://flexboxfroggy.com" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Flexbox Froggy</strong>
            <span class="card-desc">Learn flexbox by playing a game.</span>
            <span class="card-host">flexboxfroggy.com</span>
          </a>
        </li>
        <li class="card" data-tags="grid learn game practice">
          <a href="https://cssgridgarden.com" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Grid Garden</strong>
            <span class="card-desc">Learn CSS grid by playing a game.</span>
            <span class="card-host">cssgridgarden.com</span>
          </a>
        </li>
      </ul>
    </section>

    <section class="category" id="effects" aria-labelledby="effects-title">
      <h2 id="effects-title">Effects &amp; Backgrounds</h2>
      <ul class="cards">
        <li class="card" data-tags="shadow box-shadow smooth layered generator">
          <a href="https://shadows.brumm.af" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Smooth Shadow</strong>
            <span class="card-desc">Layered, natural box-shadow generator.</span>
            <span class="card-host">shadows.brumm.af</span>
          </a>
        </li>
        <li class="card" data-tags="neumorphism soft ui shadow generator">
          <a href="https://neumorphism.io" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Neumorphism.io</strong>
            <span class="card-desc">Soft-UI (neumorphism) shadow generator.</span>
            <span class="card-host">neumorphism.io</span>
          </a>
        </li>
        <li class="card" data-tags="glassmorphism blur transparency generator">
          <a href="https://css.glass" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">css.glass</strong>
            <span class="card-desc">Glassmorphism CSS generator.</span>
            <span class="card-host">css.glass</span>
          </a>
        </li>
        <li class="card" data-tags="svg background shapes waves blobs generator">
          <a href="https://haikei.app" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Haikei</strong>
            <span class="card-desc">SVG background and shape generator.</span>
            <span class="card-host">haikei.app</span>
          </a>
        </li>
        <li class="card" data-tags="svg waves background generator">
          <a href="https://getwaves.io" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Get Waves</strong>
            <span class="card-desc">SVG wave generator for section dividers.</span>
            <span class="card-host">getwaves.io</span>
          </a>
        </li>
        <li class="card" data-tags="svg blob organic shapes generator">
          <a href="https://www.blobmaker.app" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Blobmaker</strong>
            <span class="card-desc">Organic SVG blob generator.</span>
            <span class="card-host">blobmaker.app</span>
          </a>
        </li>
      </ul>
    </section>

    <section class="category" id="animation" aria-labelledby="animation-title">
      <h2 id="animation-title">Animation &amp; Easing</h2>
      <ul class="cards">
        <li class="card" data-tags="animation css library keyframes generator">
          <a href="https://animista.net" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Animista</strong>
            <span class="card-desc">On-demand CSS animation library and playground.</span>
            <span class="card-host">animista.net</span>
          </a>
        </li>
        <li class="card" data-tags="easing curve bezier timing function editor">
          <a href="https://cubic-bezier.com" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">cubic-bezier.com</strong>
            <span class="card-desc">Visual easing curve editor.</span>
            <span class="card-host">cubic-bezier.com</span>
          </a>
        </li>
        <li class="card" data-tags="easing functions cheat sheet reference">
          <a href="https://easings.net" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Easings.net</strong>
            <span class="card-desc">Easing function cheat sheet with previews.</span>
            <span class="card-host">easings.net</span>
          </a>
        </li>
      </ul>
    </section>

    <section class="category" id="typography" aria-labelledby="typography-title">
      <h2 id="typography-title">Typography</h2>
      <ul class="cards">
        <li class="card" data-tags="type scale modular font size calculator">
          <a href="https://typescale.com" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Type Scale</strong>
            <span class="card-desc">Modular type scale calculator.</span>
            <span class="card-host">typescale.com</span>
          </a>
        </li>
        <li class="card" data-tags="font stacks system fonts no webfont">
          <a href="https://modernfontstacks.com" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Modern Font Stacks</strong>
            <span class="card-desc">System font stacks that work on every platform.</span>
            <span class="card-host">modernfontstacks.com</span>
          </a>
        </li>
        <li class="card" data-tags="font pairing generator machine learning">
          <a href="https://fontjoy.com" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Fontjoy</strong>
            <span class="card-desc">Font pairing generator.</span>
            <span class="card-host">fontjoy.com</span>
          </a>
        </li>
        <li class="card" data-tags="fluid type space scale clamp responsive calculator">
          <a href="https://utopia.fyi" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Utopia</strong>
            <span class="card-desc">Fluid type and space scale calculator.</span>
            <span class="card-host">utopia.fyi</span>
          </a>
        </li>
      </ul>
    </section>
  </main>

  <footer class="site-footer">
    <p>Maintained by Lior Zamir · <a href="https://github.com/lzamir/WebTools" target="_blank" rel="noopener noreferrer">Source on GitHub</a> · Last updated August 2026</p>
  </footer>

  <script type="module" src="scripts/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify it renders (unstyled)**

Start the local server (see "Local dev server" above), open `http://localhost:8080/` in a browser.
Expected: all 8 category headings and 34 tool links visible as plain HTML. Browser console shows only three 404s (`styles/main.css`, `scripts/main.js`, `assets/favicon.svg` — created in Tasks 3–5) and no other errors.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Rewrite index.html: semantic content-in-HTML with refreshed tool directory"
```

---

### Task 3: Stylesheet with design tokens and light/dark theming

**Files:**
- Create: `styles/main.css`

**Interfaces:**
- Consumes: DOM contract from Task 2 (class names listed there).
- Produces: styles for JS-injected elements Task 4 creates: `button.theme-toggle`, `label.search > input`, `p.no-results`, plus `.visually-hidden` utility.

- [ ] **Step 1: Write the complete stylesheet**

Write `styles/main.css` with exactly this content:

```css
/* ---------- Design tokens ---------- */
:root {
  color-scheme: light dark;

  --bg: light-dark(#f6f8fa, #0d1117);
  --surface: light-dark(#ffffff, #161b22);
  --text: light-dark(#1f2328, #e6edf3);
  --muted: light-dark(#59636e, #9198a1);
  --accent: light-dark(#0969da, #4493f8);
  --border: light-dark(#d1d9e0, #3d444d);
  --shadow: light-dark(rgb(31 35 40 / 0.08), rgb(0 0 0 / 0.4));

  --space-1: 0.375rem;
  --space-2: 0.75rem;
  --space-3: 1.25rem;
  --space-4: 2rem;
  --radius: 10px;

  --font-body: system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Manual theme override (set by scripts/main.js on <html>). Forcing
   color-scheme makes every light-dark() token resolve to that scheme. */
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"] { color-scheme: dark; }

/* ---------- Reset ---------- */
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; }
img, svg { max-width: 100%; }

/* ---------- Base ---------- */
body {
  font-family: var(--font-body);
  font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  line-height: 1.6;
  background: var(--bg);
  color: var(--text);
}

a { color: var(--accent); }

/* ---------- Accessibility helpers ---------- */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.skip-link {
  position: absolute;
  top: -100%;
  left: var(--space-2);
  padding: var(--space-1) var(--space-2);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  z-index: 10;

  &:focus { top: var(--space-2); }
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* ---------- Header ---------- */
.site-header {
  padding: var(--space-4) var(--space-3);
  text-align: center;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.site-title {
  margin: 0;
  font-size: clamp(1.75rem, 1.4rem + 1.75vw, 2.75rem);
  letter-spacing: -0.02em;
}

.tagline {
  margin: var(--space-1) 0 0;
  color: var(--muted);
}

.site-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
  margin-top: var(--space-3);

  &:empty { display: none; }
}

.search input {
  padding: var(--space-1) var(--space-2);
  font: inherit;
  color: var(--text);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  min-width: min(20rem, 80vw);
}

.theme-toggle {
  padding: var(--space-1) var(--space-2);
  font: inherit;
  color: var(--text);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;

  &:hover { border-color: var(--accent); }
}

/* ---------- Main layout ---------- */
main {
  max-width: min(72rem, 100% - 2 * var(--space-3));
  margin-inline: auto;
  padding-block: var(--space-4);
}

.category > h2 {
  font-size: clamp(1.25rem, 1.1rem + 0.75vw, 1.6rem);
  margin: var(--space-4) 0 var(--space-2);
}

.category:first-child > h2 { margin-top: 0; }

/* ---------- Cards ---------- */
.cards {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: var(--space-2);
}

.card > a {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  height: 100%;
  padding: var(--space-3);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-decoration: none;
  color: inherit;
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &:hover {
    border-color: var(--accent);
    box-shadow: 0 4px 12px var(--shadow);
  }
}

.card-title { color: var(--accent); }
.card-desc { color: var(--text); font-size: 0.925em; }
.card-host { color: var(--muted); font-size: 0.85em; margin-top: auto; }

.no-results {
  text-align: center;
  color: var(--muted);
  padding: var(--space-4);
}

/* ---------- Footer ---------- */
.site-footer {
  border-top: 1px solid var(--border);
  padding: var(--space-3);
  text-align: center;
  color: var(--muted);
  font-size: 0.9em;
}

/* ---------- Motion ---------- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; }
}
```

- [ ] **Step 2: Verify layout and both themes**

With the local server running, open `http://localhost:8080/` and check:
1. Cards render in a responsive grid (resize window: 1 column at ~360px width, 3–4 columns at desktop).
2. In DevTools → Rendering → "Emulate CSS prefers-color-scheme", flip between light and dark: background, cards, and text all change; contrast remains readable in both.
3. No horizontal scrollbar at 360px width.

- [ ] **Step 3: Commit**

```bash
git add styles/main.css
git commit -m "Add modern stylesheet: design tokens, light-dark theming, card grid"
```

---

### Task 4: ES module — theme toggle and search filter

**Files:**
- Create: `scripts/main.js`

**Interfaces:**
- Consumes: DOM contract from Task 2 (`.site-controls`, `.category`, `.card[data-tags]`, `main#main`); CSS classes from Task 3 (`.theme-toggle`, `.search`, `.no-results`, `.visually-hidden`); the inline head bootstrap from Task 2 (same `localStorage` key `theme`, same `data-theme` attribute).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Write the complete module**

Write `scripts/main.js` with exactly this content:

```js
const html = document.documentElement;
const controls = document.querySelector('.site-controls');

/* ---------- Theme toggle ---------- */
/* Order: 'auto' (follow system) -> 'light' -> 'dark'. 'auto' is the absence
   of both the data-theme attribute and the localStorage entry. */
const THEMES = ['auto', 'light', 'dark'];
const LABELS = { auto: 'Theme: auto', light: 'Theme: light', dark: 'Theme: dark' };

function applyTheme(theme) {
  try {
    if (theme === 'auto') {
      delete html.dataset.theme;
      localStorage.removeItem('theme');
    } else {
      html.dataset.theme = theme;
      localStorage.setItem('theme', theme);
    }
  } catch (e) { /* storage unavailable: theme still applies for this page */ }
}

function initTheme() {
  let current = 'auto';
  try {
    const saved = localStorage.getItem('theme');
    if (THEMES.includes(saved)) current = saved;
  } catch (e) {}

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle';
  button.textContent = LABELS[current];
  button.addEventListener('click', () => {
    current = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
    applyTheme(current);
    button.textContent = LABELS[current];
  });
  controls.append(button);
}

/* ---------- Search filter ---------- */
function initSearch() {
  const label = document.createElement('label');
  label.className = 'search';
  const hint = document.createElement('span');
  hint.className = 'visually-hidden';
  hint.textContent = 'Search tools';
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Search tools…';
  label.append(hint, input);
  controls.append(label);

  const sections = [...document.querySelectorAll('.category')];
  const empty = document.createElement('p');
  empty.className = 'no-results';
  empty.textContent = 'No matching tools.';
  empty.hidden = true;
  document.querySelector('main').append(empty);

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    let anyVisible = false;
    for (const section of sections) {
      let sectionVisible = false;
      for (const card of section.querySelectorAll('.card')) {
        const haystack = (card.textContent + ' ' + (card.dataset.tags || '')).toLowerCase();
        const match = query === '' || haystack.includes(query);
        card.hidden = !match;
        if (match) sectionVisible = true;
      }
      section.hidden = !sectionVisible;
      if (sectionVisible) anyVisible = true;
    }
    empty.hidden = anyVisible;
  });
}

initTheme();
initSearch();
```

- [ ] **Step 2: Verify theme toggle behavior**

With the local server running, open `http://localhost:8080/`:
1. A "Theme: auto" button and a search box appear in the header.
2. Click the button twice: label cycles to "Theme: light" then "Theme: dark"; page colors follow each state regardless of OS setting.
3. Reload while on "Theme: dark": page loads dark with NO flash of light theme, button shows "Theme: dark".
4. Click once more ("Theme: auto"): page follows the OS/emulated scheme again; `localStorage.getItem('theme')` in the console returns `null`.

- [ ] **Step 3: Verify search behavior**

1. Type `gradient`: only gradient-related cards remain; categories with zero matches disappear entirely.
2. Type `zzzzzz`: all sections hidden, "No matching tools." appears.
3. Clear the input: all 8 categories and 34 cards return, message hidden.
4. Type `oklch` (a data-tags-only term for gradient.style): both OKLCH Color Picker and gradient.style cards match — proves tags are searched, not just visible text.

- [ ] **Step 4: Verify JS-disabled experience**

DevTools → Settings → Debugger → "Disable JavaScript", reload.
Expected: full directory visible and usable; NO search box, NO theme button, NO empty gaps (`.site-controls:empty` collapses).

- [ ] **Step 5: Commit**

```bash
git add scripts/main.js
git commit -m "Add ES module: theme toggle and instant search filter"
```

---

### Task 5: Assets and auxiliary files

**Files:**
- Create: `assets/favicon.svg`, `assets/og-image.png`, `404.html`, `robots.txt`, `sitemap.xml`, `.nojekyll`

**Interfaces:**
- Consumes: `styles/main.css` (404 page reuses it); URLs already referenced by Task 2's `<head>`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Write `assets/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0969da"/>
  <text x="32" y="44" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="bold" text-anchor="middle" fill="#fff">{ }</text>
</svg>
```

- [ ] **Step 2: Generate `assets/og-image.png` (1200×630)**

Run this throwaway PowerShell from the repo root (do not commit the script itself):

```powershell
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap(1200, 630)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAliasGridFit'
$g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(13,17,23))), 0, 0, 1200, 630)
$g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(9,105,218))), 0, 610, 1200, 20)
$titleFont = New-Object System.Drawing.Font('Segoe UI', 64, [System.Drawing.FontStyle]::Bold)
$subFont = New-Object System.Drawing.Font('Segoe UI', 28)
$g.DrawString('WebTools', $titleFont, [System.Drawing.Brushes]::White, 80, 220)
$g.DrawString('Curated web development tools', $subFont, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(145,152,161))), 84, 350)
$g.Dispose()
if (-not (Test-Path assets)) { New-Item -ItemType Directory assets | Out-Null }
$bmp.Save("$PWD/assets/og-image.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
```

Verify: open `assets/og-image.png` — dark card, white "WebTools" title, gray subtitle, blue bottom bar, 1200×630.

- [ ] **Step 3: Write `404.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Page not found — WebTools</title>
  <meta name="robots" content="noindex" />
  <link rel="icon" href="/WebTools/assets/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/WebTools/styles/main.css" />
</head>
<body>
  <header class="site-header">
    <h1 class="site-title">Page not found</h1>
    <p class="tagline">That page doesn't exist here.</p>
  </header>
  <main id="main">
    <p class="no-results"><a href="/WebTools/">Back to the WebTools directory</a></p>
  </main>
</body>
</html>
```

Note: `404.html` uses absolute `/WebTools/...` paths because GitHub Pages serves it for any missing URL at any depth — relative paths would break.

- [ ] **Step 4: Write `robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://lzamir.github.io/WebTools/sitemap.xml
```

- [ ] **Step 5: Write `sitemap.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://lzamir.github.io/WebTools/</loc>
    <lastmod>2026-08-18</lastmod>
  </url>
</urlset>
```

- [ ] **Step 6: Create empty `.nojekyll`**

```bash
touch .nojekyll
```

- [ ] **Step 7: Verify**

1. `http://localhost:8080/` — favicon appears in the browser tab; console shows zero 404s.
2. Confirm `assets/og-image.png` exists and Windows Explorer shows dimensions 1200×630.

- [ ] **Step 8: Commit**

```bash
git add assets/favicon.svg assets/og-image.png 404.html robots.txt sitemap.xml .nojekyll
git commit -m "Add favicon, OG image, 404 page, robots.txt, sitemap, .nojekyll"
```

---

### Task 6: Link verification sweep

**Files:**
- Modify: `index.html` (only if dead links are found or bot-blocked originals are confirmed alive)

**Interfaces:**
- Consumes: card markup from Task 2.
- Produces: final verified link list.

- [ ] **Step 1: Run the curl pre-filter over every href**

From the repo root (bash):

```bash
grep -o 'href="https\?://[^"]*"' index.html | sed 's/href="//; s/"$//' | sort -u | \
while read -r url; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 15 -A "Mozilla/5.0" "$url")
  echo "$code  $url"
done
```

Expected: mostly `200`. Codes `403`/`406`/`429` mean bot-blocking — check those in a real browser before judging. `000` or `404`/`5xx` after a browser check means dead.

- [ ] **Step 2: Browser-check every non-200 URL**

Open each non-200 URL in a real browser. For each one that fails in the browser too: delete its entire `<li class="card">...</li>` block from `index.html`. A category dropping below 3 links is acceptable; a category dropping to 0 links must be removed entirely (its whole `<section>`).

- [ ] **Step 3: Browser-check the three bot-blocked links from the original site**

These were in the 2019 site and returned bot-block codes in the spec's curl sweep. Check each in a real browser; for each that loads and still works as a tool, add its ready-made card:

If `https://css3generator.com` works, append to the `#general` section's `<ul class="cards">`:

```html
        <li class="card" data-tags="css generator classic">
          <a href="https://css3generator.com" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">CSS3 Generator</strong>
            <span class="card-desc">Classic CSS3 snippet generator.</span>
            <span class="card-host">css3generator.com</span>
          </a>
        </li>
```

If `https://www.css3maker.com` works, append to the `#general` section's `<ul class="cards">`:

```html
        <li class="card" data-tags="css generator maker classic">
          <a href="https://www.css3maker.com" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">CSS3 Maker</strong>
            <span class="card-desc">Classic CSS3 generator suite.</span>
            <span class="card-host">css3maker.com</span>
          </a>
        </li>
```

If `https://loading.io/button/generator` works, append to the `#buttons` section's `<ul class="cards">`:

```html
        <li class="card" data-tags="button loader animation generator">
          <a href="https://loading.io/button/generator" target="_blank" rel="noopener noreferrer">
            <strong class="card-title">Loading.io Button Generator</strong>
            <span class="card-desc">Animated button and loader generator.</span>
            <span class="card-host">loading.io</span>
          </a>
        </li>
```

- [ ] **Step 4: Verify the page still renders correctly**

Reload `http://localhost:8080/` — no broken layout, all remaining/added cards render, search still filters the new cards (type a word from an added card's tags).

- [ ] **Step 5: Commit (only if index.html changed)**

```bash
git add index.html
git commit -m "Verify tool links: prune dead, restore surviving originals"
```

---

### Task 7: README rewrite and full verification pass

**Files:**
- Rewrite: `README.md`

**Interfaces:**
- Consumes: everything built in Tasks 1–6.
- Produces: the release candidate for Task 8.

- [ ] **Step 1: Rewrite `README.md`**

```markdown
# WebTools

A curated directory of free online tools for web developers —
CSS generators, color palettes, gradients, layout builders,
animation and typography helpers.

**Live site:** https://lzamir.github.io/WebTools/

## How it works

Buildless by design. No npm, no bundler, no framework, no CDN:

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
```

- [ ] **Step 2: HTML validation (W3C Nu checker)**

```bash
curl -s -H "Content-Type: text/html; charset=utf-8" \
  --data-binary @index.html "https://validator.w3.org/nu/?out=json"
```

Expected: `{"messages":[]}`. Fix any reported errors in `index.html` and re-run until empty. Repeat for `404.html`.

- [ ] **Step 3: CSS validation**

```bash
curl -s -H "Content-Type: text/css; charset=utf-8" \
  --data-binary @styles/main.css "https://validator.w3.org/nu/?css=yes&out=json"
```

Expected: `{"messages":[]}`. Note: if the validator does not yet know `light-dark()` or nesting, "unknown value" **warnings** for exactly those features are acceptable; genuine syntax **errors** are not.

- [ ] **Step 4: Lighthouse**

In Edge/Chrome on `http://localhost:8080/`: DevTools → Lighthouse → run all four categories, mobile.
Expected: Performance 100, Accessibility 100, Best Practices 100, SEO ≥ 90 (SEO checks that need the public URL, like canonical resolution, are re-verified after deploy).
Fix anything below target before proceeding.

- [ ] **Step 5: Manual checklist**

1. Keyboard-only pass: Tab from address bar — first stop is the skip link; Enter jumps to `#main`; every card and control shows a visible focus ring.
2. Mobile 360px: single-column cards, no horizontal scroll.
3. Both forced themes and auto, persistence across reload (repeat of Task 4 checks — must still pass after Task 6 edits).
4. JS disabled: full content, no dead UI.

- [ ] **Step 6: Commit**

```bash
git add README.md index.html styles/main.css
git commit -m "Rewrite README; validation fixes from verification pass"
```

(If validation required no fixes, commit README.md alone.)

---

### Task 8: Deploy and post-deploy verification

**Files:** none (push only)

**Interfaces:**
- Consumes: all previous commits on `master`.
- Produces: the live site.

- [ ] **Step 1: Confirm with the user before pushing**

Pushing to `master` immediately replaces the live public site. Get explicit confirmation.

- [ ] **Step 2: Push**

```bash
git push origin master
```

- [ ] **Step 3: Post-deploy verification (wait ~2 minutes for Pages to rebuild)**

1. `https://lzamir.github.io/WebTools/` — new site loads, favicon shows, both themes work.
2. `https://lzamir.github.io/WebTools/robots.txt` and `.../sitemap.xml` return content.
3. `https://lzamir.github.io/WebTools/no-such-page` shows the styled 404 page (CSS loaded, link back home works).
4. `https://lzamir.github.io/WebTools/assets/og-image.png` loads.
5. Paste the site URL into a social-preview checker (e.g. opengraph.xyz) — title, description, and image render.
6. Re-run Lighthouse against the live URL — SEO now 100.

- [ ] **Step 4: Done**

Report results to the user, including any links pruned in Task 6.
