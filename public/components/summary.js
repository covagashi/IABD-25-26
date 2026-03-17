export function renderSummary(data) {
  if (!data.summaries?.length) {
    return `<div>
      <a href="#/${data.subject}" class="back">Volver a ${data.subject}</a>
      <h2>Resumen</h2>
      <p class="sub">Aún no hay resúmenes generados.</p>
    </div>`;
  }

  const sections = data.summaries.map(s => {
    const html = s.summary
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    return `<section class="summary-section">
      <h3>${s.module} — ${s.title}</h3>
      <div class="summary-text">${html}</div>
    </section>`;
  }).join('');

  return `<div>
    <a href="#/${data.subject}" class="back">Volver a ${data.subject}</a>
    <h2>Resumen — ${data.subject}</h2>
    <p class="sub">${data.summaries.length} temas</p>
    ${sections}
  </div>`;
}

export function renderCode(data) {
  if (!data.codeExamples?.length) {
    return `<div>
      <a href="#/${data.subject}" class="back">Volver a ${data.subject}</a>
      <h2>Código</h2>
      <p class="sub">No hay ejemplos de código para esta asignatura.</p>
    </div>`;
  }

  const items = data.codeExamples.map(c => `
    <div class="code-block">
      <div class="code-title">${esc(c.title)} <span class="code-lang">${c.language}</span></div>
      <pre><code>${esc(c.code)}</code></pre>
      ${c.explanation ? `<div class="code-explain">${esc(c.explanation)}</div>` : ''}
    </div>
  `).join('');

  return `<div>
    <a href="#/${data.subject}" class="back">Volver a ${data.subject}</a>
    <h2>Código — ${data.subject}</h2>
    <p class="sub">${data.codeExamples.length} ejemplos del temario</p>
    ${items}
  </div>`;
}

export function renderDev(data) {
  if (!data.devQuestions?.length) {
    return `<div>
      <a href="#/${data.subject}" class="back">Volver a ${data.subject}</a>
      <h2>Desarrollo</h2>
      <p class="sub">No hay preguntas de desarrollo para esta asignatura.</p>
    </div>`;
  }

  return `<div>
    <a href="#/${data.subject}" class="back">Volver a ${data.subject}</a>
    <h2>Desarrollo — ${data.subject}</h2>
    <p class="sub">${data.devQuestions.length} preguntas. Toca una para ver la respuesta.</p>
    <div id="dev-list">
      ${data.devQuestions.map((q, i) => `
        <div class="dev-q" data-i="${i}">
          <div class="dev-question">${esc(q.question)}</div>
          <div class="dev-answer" id="dev-a-${i}" style="display:none">${esc(q.answer)}</div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

export function initDev() {
  document.querySelectorAll('.dev-q').forEach(el => {
    el.addEventListener('click', () => {
      const ans = el.querySelector('.dev-answer');
      ans.style.display = ans.style.display === 'none' ? 'block' : 'none';
    });
  });
}

export function renderCommands(data) {
  if (!data.commands?.length) {
    return `<div>
      <a href="#/${data.subject}" class="back">Volver a ${data.subject}</a>
      <h2>Comandos</h2>
      <p class="sub">No hay comandos disponibles.</p>
    </div>`;
  }

  const totalItems = data.commands.reduce((s, c) => s + c.items.length, 0);

  const sections = data.commands.map(cat => {
    const items = cat.items.map(item => {
      const examplesHtml = item.examples.length
        ? item.examples.map(ex => `<pre><code>${esc(ex)}</code></pre>`).join('')
        : '';
      return `<div class="cmd-item">
        <div class="cmd-name">${esc(item.name)}</div>
        <div class="cmd-desc">${esc(item.desc)}</div>
        <pre><code>${esc(item.syntax)}</code></pre>
        ${examplesHtml ? `<div class="cmd-examples"><span class="cmd-ex-label">Ejemplo:</span>${examplesHtml}</div>` : ''}
      </div>`;
    }).join('');

    return `<section class="cmd-category">
      <h3>${esc(cat.category)}</h3>
      ${cat.intro ? `<p class="cmd-intro">${esc(cat.intro)}</p>` : ''}
      ${items}
    </section>`;
  }).join('');

  return `<div>
    <a href="#/${data.subject}" class="back">Volver a ${data.subject}</a>
    <h2>Comandos — ${data.subject}</h2>
    <p class="sub">${totalItems} comandos en ${data.commands.length} categorías</p>
    ${sections}
  </div>`;
}

function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
