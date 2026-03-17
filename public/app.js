import { renderHome, renderSubject } from './components/nav.js';
import { renderQuizSetup, initQuizSetup } from './components/quiz.js';
import { renderFlashcards, initFlashcards } from './components/flashcard.js';
import { renderHistory, initHistory } from './components/progress.js';
import { renderSummary, renderCode, renderDev, initDev, renderCommands } from './components/summary.js';

const app = document.getElementById('app');
const SUBJECTS = ['BDA', 'MIA', 'PIA', 'SAA', 'SBD'];
const cache = {};

async function loadManifest() {
  if (cache.manifest) return cache.manifest;
  cache.manifest = await (await fetch('data/manifest.json')).json();
  return cache.manifest;
}

async function loadSubject(code) {
  if (cache[code]) return cache[code];
  cache[code] = await (await fetch(`data/${code}.json`)).json();
  return cache[code];
}

async function route() {
  const parts = (location.hash.slice(1) || '/').split('/').filter(Boolean);

  try {
    if (parts.length === 0) {
      app.innerHTML = renderHome(await loadManifest());
    } else if (parts.length === 1 && SUBJECTS.includes(parts[0])) {
      app.innerHTML = renderSubject(await loadSubject(parts[0]));
    } else if (parts.length === 2 && SUBJECTS.includes(parts[0])) {
      const data = await loadSubject(parts[0]);
      if (parts[1] === 'quiz') {
        app.innerHTML = renderQuizSetup(data);
        initQuizSetup(data, app);
      } else if (parts[1] === 'flashcards') {
        app.innerHTML = renderFlashcards(data);
        initFlashcards(data);
      } else if (parts[1] === 'history') {
        app.innerHTML = renderHistory(parts[0]);
        initHistory(parts[0]);
      } else if (parts[1] === 'resumen') {
        app.innerHTML = renderSummary(data);
      } else if (parts[1] === 'codigo') {
        app.innerHTML = renderCode(data);
      } else if (parts[1] === 'desarrollo') {
        app.innerHTML = renderDev(data);
        initDev();
      } else if (parts[1] === 'comandos') {
        app.innerHTML = renderCommands(data);
      }
    }
  } catch (err) {
    console.error(err);
    app.innerHTML = `<p style="color:var(--red)">Error: ${err.message}</p>`;
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (a && a.getAttribute('href') === location.hash) { e.preventDefault(); route(); }
});
route();
