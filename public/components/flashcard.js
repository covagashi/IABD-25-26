import { getFlashcardProgress, saveFlashcardProgress } from './progress.js';

export function renderFlashcards(data) {
  if (data.flashcards.length === 0) {
    return `<div>
      <a href="#/${data.subject}" class="back">${data.subject}</a>
      <h2>Tarjetas</h2>
      <p class="sub">Aún no hay tarjetas. Ejecuta el script de Gemini para generarlas.</p>
    </div>`;
  }

  return `<div>
    <a href="#/${data.subject}" class="back">${data.subject}</a>
    <h2>Tarjetas</h2>
    <div class="chips" style="margin-bottom:1rem">
      <button class="chip on" id="fc-all">Todas</button>
      <button class="chip" id="fc-review">Repasar</button>
      <button class="chip" id="fc-shuffle">Barajar</button>
    </div>
    <div class="fc-count" id="fc-count"></div>
    <div class="fc-wrap">
      <div class="fc" id="fc">
        <div class="fc-face fc-front" id="fc-f"></div>
        <div class="fc-face fc-back" id="fc-b"></div>
      </div>
    </div>
    <div class="fc-actions" id="fc-act" style="display:none">
      <button class="btn-yes" id="fc-yes">Lo sé</button>
      <button class="btn-no" id="fc-no">Repasar</button>
    </div>
    <div class="fc-nav">
      <button class="btn btn-ghost" id="fc-prev">Anterior</button>
      <button class="btn btn-dark" id="fc-next">Siguiente</button>
    </div>
  </div>`;
}

export function initFlashcards(data) {
  const progress = getFlashcardProgress(data.subject);
  let cards = [...data.flashcards];
  let idx = 0;
  let reviewOnly = false;

  function active() {
    return reviewOnly ? cards.filter(c => !progress.known.includes(c.id)) : cards;
  }

  function render() {
    const a = active();
    if (!a.length) {
      document.getElementById('fc-count').textContent = 'Todas dominadas';
      document.getElementById('fc').style.display = 'none';
      document.getElementById('fc-act').style.display = 'none';
      return;
    }
    if (idx >= a.length) idx = 0;
    if (idx < 0) idx = a.length - 1;
    document.getElementById('fc-count').textContent = `${idx + 1} / ${a.length}`;
    document.getElementById('fc-f').textContent = a[idx].front;
    document.getElementById('fc-b').textContent = a[idx].back;
    document.getElementById('fc').classList.remove('flipped');
    document.getElementById('fc-act').style.display = 'none';
    document.getElementById('fc').style.display = '';
  }

  document.getElementById('fc')?.addEventListener('click', () => {
    const el = document.getElementById('fc');
    el.classList.toggle('flipped');
    if (el.classList.contains('flipped')) document.getElementById('fc-act').style.display = 'flex';
  });

  document.getElementById('fc-next')?.addEventListener('click', () => { idx++; render(); });
  document.getElementById('fc-prev')?.addEventListener('click', () => { idx--; render(); });

  document.getElementById('fc-yes')?.addEventListener('click', () => {
    const a = active();
    if (a[idx] && !progress.known.includes(a[idx].id)) progress.known.push(a[idx].id);
    saveFlashcardProgress(data.subject, progress);
    idx++; render();
  });

  document.getElementById('fc-no')?.addEventListener('click', () => {
    const a = active();
    if (a[idx]) progress.known = progress.known.filter(id => id !== a[idx].id);
    saveFlashcardProgress(data.subject, progress);
    idx++; render();
  });

  document.getElementById('fc-all')?.addEventListener('click', () => { reviewOnly = false; idx = 0; render(); });
  document.getElementById('fc-review')?.addEventListener('click', () => { reviewOnly = true; idx = 0; render(); });
  document.getElementById('fc-shuffle')?.addEventListener('click', () => {
    for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
    idx = 0; render();
  });

  document.addEventListener('keydown', function kh(e) {
    if (!document.getElementById('fc')) { document.removeEventListener('keydown', kh); return; }
    if (e.key === 'ArrowRight') { idx++; render(); }
    if (e.key === 'ArrowLeft') { idx--; render(); }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const el = document.getElementById('fc');
      el.classList.toggle('flipped');
      if (el.classList.contains('flipped')) document.getElementById('fc-act').style.display = 'flex';
    }
  });

  render();
}
