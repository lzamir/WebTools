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
