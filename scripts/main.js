const html = document.documentElement;
const controls = document.querySelector('.site-controls');

/* ---------- Theme toggle ---------- */
/* Order: 'auto' (follow system) -> 'light' -> 'dark'. 'auto' is the absence
   of both the data-theme attribute and the localStorage entry. */
const THEMES = ['auto', 'light', 'dark'];
const LABELS = { auto: 'Theme: auto', light: 'Theme: light', dark: 'Theme: dark' };
const THEME_COLORS = { light: '#f6f8fa', dark: '#0d1117' };

/* Keep the theme-color metas in sync with a manual override: mobile browser
   chrome otherwise keeps following the OS scheme even after a forced theme. */
function syncThemeColor(theme) {
  for (const scheme of ['light', 'dark']) {
    const meta = document.querySelector(`meta[name="theme-color"][media*="${scheme}"]`);
    if (!meta) continue;
    meta.content = theme === 'auto' ? THEME_COLORS[scheme] : THEME_COLORS[theme];
  }
}

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
  syncThemeColor(theme);
}

function initTheme() {
  let current = 'auto';
  try {
    const saved = localStorage.getItem('theme');
    if (THEMES.includes(saved)) current = saved;
  } catch (e) {}
  syncThemeColor(current);

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
  empty.setAttribute('role', 'status');
  empty.hidden = true;
  document.querySelector('main').append(empty);

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    let anyVisible = false;
    for (const section of sections) {
      let sectionVisible = false;
      for (const card of section.querySelectorAll('.card')) {
        const haystack = (card.textContent + ' ' + (card.dataset.tags || '')).replace(/\s+/g, ' ').toLowerCase();
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
