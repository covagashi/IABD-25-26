export function renderResults(result, details, subject) {
  const pct = (result.correct / result.totalQuestions * 100).toFixed(0);
  const pass = result.score >= 5;
  const m = Math.floor(result.elapsed / 60);
  const s = Math.floor(result.elapsed % 60);

  const wrong = details.filter(d => d.answered && !d.correct);
  const blank = details.filter(d => !d.answered);

  let html = `<div>
    <a href="#/${subject}/quiz" class="back">Nuevo test</a>
    <h2>${result.examMode ? 'Simulación' : 'Resultado'}</h2>
    <div class="score-big ${pass ? 'pass' : 'fail'}">${result.score.toFixed(1)}</div>
    <div class="stats-row">
      <span><strong>${result.correct}</strong> bien</span>
      <span><strong>${result.wrong}</strong> mal</span>
      <span><strong>${result.unanswered}</strong> sin resp.</span>
      <span>${m}:${String(s).padStart(2, '0')}</span>
    </div>
    <div class="btn-row">
      <a href="#/${subject}/quiz" class="btn btn-dark">Repetir</a>
      <a href="#/${subject}" class="btn btn-ghost">${subject}</a>
    </div>`;

  if (wrong.length || blank.length) {
    html += `<div class="review"><h2>Errores (${wrong.length + blank.length})</h2>`;
    for (const d of wrong) {
      const cor = d.question.options.find(o => o.correct);
      html += `<div class="review-q">
        <div class="text">${esc(d.question.question)}</div>
        <div class="yours">Tu: ${esc(d.selectedText || '—')}</div>
        <div class="right">Correcta: ${esc(cor?.text || '—')}</div>
      </div>`;
    }
    for (const d of blank) {
      const cor = d.question.options.find(o => o.correct);
      html += `<div class="review-q">
        <div class="text">${esc(d.question.question)}</div>
        <div class="yours">Sin responder</div>
        <div class="right">Correcta: ${esc(cor?.text || '—')}</div>
      </div>`;
    }
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
