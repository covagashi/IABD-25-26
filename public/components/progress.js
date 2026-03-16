const KEY = 'estudio_iabd';

function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }

export function saveAttempt(subject, result) {
  const s = load();
  if (!s.attempts) s.attempts = {};
  if (!s.attempts[subject]) s.attempts[subject] = [];
  s.attempts[subject].push(result);
  if (s.attempts[subject].length > 50) s.attempts[subject] = s.attempts[subject].slice(-50);
  save(s);
}

export function getAttempts(subject) { return load().attempts?.[subject] || []; }

export function getFlashcardProgress(subject) {
  const s = load();
  return s.flashcards?.[subject] || { known: [] };
}

export function saveFlashcardProgress(subject, progress) {
  const s = load();
  if (!s.flashcards) s.flashcards = {};
  s.flashcards[subject] = progress;
  save(s);
}

export function renderHistory(subject) {
  const attempts = getAttempts(subject);

  if (!attempts.length) {
    return `<div>
      <a href="#/${subject}" class="back">${subject}</a>
      <h2>Historial</h2>
      <p class="sub">Sin intentos todavía.</p>
    </div>`;
  }

  const rows = [...attempts].reverse().map(a => {
    const d = new Date(a.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const color = a.score >= 5 ? 'var(--green)' : 'var(--red)';
    return `<div class="hist-row">
      <span><span class="hist-score" style="color:${color}">${a.score.toFixed(1)}</span> — ${a.correct}/${a.totalQuestions}</span>
      <span class="hist-date">${d}</span>
    </div>`;
  }).join('');

  return `<div>
    <a href="#/${subject}" class="back">${subject}</a>
    <h2>Historial</h2>
    <p class="sub">${attempts.length} intentos</p>
    ${rows}
    <div class="btn-row">
      <button class="btn btn-ghost" id="clear-hist">Borrar historial</button>
    </div>
  </div>`;
}

export function initHistory(subject) {
  document.getElementById('clear-hist')?.addEventListener('click', () => {
    if (confirm(`¿Borrar historial de ${subject}?`)) {
      const s = load();
      if (s.attempts) delete s.attempts[subject];
      save(s);
      location.reload();
    }
  });
}
