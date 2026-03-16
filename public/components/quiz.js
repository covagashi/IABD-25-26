import { renderResults } from './results.js';
import { saveAttempt } from './progress.js';

const NEGATIVE_SCORING = { PIA: 0.5, SAA: 0.5 };

export function renderQuizSetup(data) {
  const modules = [...new Set(data.questions.map(q => q.module))].sort();
  const hasNeg = data.subject in NEGATIVE_SCORING;

  return `<div>
    <a href="#/${data.subject}" class="back">Volver a ${data.subject}</a>
    <h2>Test</h2>
    ${hasNeg ? `<span class="neg-badge">Resta ${NEGATIVE_SCORING[data.subject]} por error</span>` : ''}
    <div class="setup-section">
      <label>Módulos <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--mid)">(toca para activar/desactivar)</span></label>
      <div class="chips" id="module-checks">
        ${modules.map(m => `<button class="chip on" data-mod="${m}">${m}</button>`).join('')}
      </div>
    </div>
    <div class="setup-section">
      <label>Preguntas</label>
      <input type="number" id="q-count" min="5" max="${data.questions.length}" value="${Math.min(20, data.questions.length)}">
    </div>
    <div class="setup-section">
      <label>Tiempo (min, 0 = sin límite)</label>
      <input type="number" id="timer-min" min="0" max="180" value="0">
    </div>
    <div class="setup-section">
      <label class="check-label"><input type="checkbox" id="shuffle-opts"> Barajar opciones</label>
    </div>
    <div class="btn-row">
      <button class="btn btn-dark" id="start-quiz">Comenzar</button>
      <button class="btn btn-ghost" id="start-exam">Simular examen</button>
    </div>
    <p class="setup-hint"><strong>Comenzar</strong> usa tu configuración. <strong>Simular examen</strong> aplica las condiciones reales: ${
      {BDA:'15 preguntas, 60 min',MIA:'20 preguntas, 60 min',PIA:'15 preguntas, 45 min',SAA:'15 preguntas, 45 min',SBD:'7 preguntas, 90 min'}[data.subject]
    }, opciones barajadas.</p>
  </div>`;
}

export function initQuizSetup(data, app) {
  // Toggle chips
  document.querySelectorAll('.chip[data-mod]').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('on'));
  });

  document.getElementById('start-quiz')?.addEventListener('click', () => {
    const config = getConfig(data);
    if (config.questions.length === 0) return alert('Selecciona al menos un módulo');
    startQuiz(data, config, app);
  });

  document.getElementById('start-exam')?.addEventListener('click', () => {
    const ec = { BDA: { c: 15, t: 60 }, MIA: { c: 20, t: 60 }, PIA: { c: 15, t: 45 }, SAA: { c: 15, t: 45 }, SBD: { c: 7, t: 90 } }[data.subject] || { c: 15, t: 60 };
    // Exam simulation respects selected modules
    const active = [...document.querySelectorAll('.chip.on[data-mod]')].map(c => c.dataset.mod);
    const pool = data.questions.filter(q => active.includes(q.module));
    if (pool.length === 0) return alert('Selecciona al menos un módulo');
    startQuiz(data, { questions: shuffle(pool).slice(0, ec.c), timerMinutes: ec.t, shuffleOptions: true, examMode: true }, app);
  });
}

function getConfig(data) {
  const active = [...document.querySelectorAll('.chip.on[data-mod]')].map(c => c.dataset.mod);
  const count = parseInt(document.getElementById('q-count').value) || 20;
  const timerMinutes = parseInt(document.getElementById('timer-min').value) || 0;
  const shuffleOptions = document.getElementById('shuffle-opts').checked;
  return { questions: shuffle(data.questions.filter(q => active.includes(q.module))).slice(0, count), timerMinutes, shuffleOptions, examMode: false };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz(data, config, app) {
  const optionsPerQ = config.questions.map(q => {
    const opts = q.options.map((o, i) => ({ ...o, origIdx: i }));
    return config.shuffleOptions ? shuffle(opts) : opts;
  });

  const state = {
    questions: config.questions, optionsPerQ,
    current: 0,
    answers: new Array(config.questions.length).fill(null),
    timerMinutes: config.timerMinutes, timerStart: Date.now(),
    examMode: config.examMode, subject: data.subject,
    negativeScoring: NEGATIVE_SCORING[data.subject] || 0,
    timerInterval: null
  };

  renderQ(state, data, app);
}

function renderQ(state, data, app) {
  const q = state.questions[state.current];
  const opts = state.optionsPerQ[state.current];
  const total = state.questions.length;
  const pct = (state.current / total) * 100;
  const answered = state.answers[state.current] !== null;

  app.innerHTML = `<div>
    <a href="#/${data.subject}/quiz" class="back">Abandonar</a>
    <div class="q-header">
      <span>${state.current + 1} / ${total}</span>
      ${state.timerMinutes > 0 ? '<span class="timer" id="qtimer"></span>' : ''}
    </div>
    <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
    <div class="q-text">${esc(q.question)}</div>
    <ul class="options">
      ${opts.map((o, i) => `<li><button class="opt" data-i="${i}" ${answered ? 'disabled' : ''}>${esc(o.text)}</button></li>`).join('')}
    </ul>
    <div id="fb"></div>
    <div class="btn-row" id="qnav">
      ${state.current > 0 ? '<button class="btn btn-ghost" id="prev">Anterior</button>' : ''}
      ${answered ? `<button class="btn btn-dark" id="next">${state.current === total - 1 ? 'Resultados' : 'Siguiente'}</button>` : ''}
    </div>
  </div>`;

  if (answered) applyStyles(opts, state.answers[state.current]);

  if (state.timerMinutes > 0) {
    if (state.timerInterval) clearInterval(state.timerInterval);
    tick(state, data, app);
    state.timerInterval = setInterval(() => tick(state, data, app), 1000);
  }

  if (!answered) {
    app.querySelectorAll('.opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.i);
        state.answers[state.current] = idx;
        app.querySelectorAll('.opt').forEach(b => b.disabled = true);
        applyStyles(opts, idx);
        const nav = document.getElementById('qnav');
        const nb = document.createElement('button');
        nb.className = 'btn btn-dark';
        nb.id = 'next';
        nb.textContent = state.current === total - 1 ? 'Resultados' : 'Siguiente';
        nav.appendChild(nb);
        nb.addEventListener('click', () => advance(state, data, app));
      });
    });
  }

  document.getElementById('next')?.addEventListener('click', () => advance(state, data, app));
  document.getElementById('prev')?.addEventListener('click', () => { state.current--; if (state.timerInterval) clearInterval(state.timerInterval); renderQ(state, data, app); });
}

function applyStyles(opts, idx) {
  document.querySelectorAll('.opt').forEach((btn, i) => {
    if (opts[i].correct) btn.classList.add('correct');
    if (i === idx && !opts[i].correct) btn.classList.add('wrong');
  });
  const fb = document.getElementById('fb');
  if (!fb) return;
  fb.innerHTML = opts[idx]?.correct
    ? '<div class="feedback ok">Correcto</div>'
    : `<div class="feedback nok">Incorrecta. Correcta: ${esc(opts.find(o => o.correct)?.text || '')}</div>`;
}

function advance(state, data, app) {
  if (state.timerInterval) clearInterval(state.timerInterval);
  if (state.current >= state.questions.length - 1) finish(state, data, app);
  else { state.current++; renderQ(state, data, app); }
}

function tick(state, data, app) {
  const rem = Math.max(0, state.timerMinutes * 60 - (Date.now() - state.timerStart) / 1000);
  const el = document.getElementById('qtimer');
  if (el) {
    el.textContent = `${Math.floor(rem / 60)}:${String(Math.floor(rem % 60)).padStart(2, '0')}`;
    if (rem < 60) el.classList.add('warn');
  }
  if (rem <= 0) { clearInterval(state.timerInterval); finish(state, data, app); }
}

function finish(state, data, app) {
  if (state.timerInterval) clearInterval(state.timerInterval);
  const elapsed = (Date.now() - state.timerStart) / 1000;
  let correct = 0, wrong = 0, unanswered = 0;
  const details = [];

  state.questions.forEach((q, i) => {
    const ai = state.answers[i];
    const opts = state.optionsPerQ[i];
    if (ai === null) { unanswered++; details.push({ question: q, correct: false, answered: false }); }
    else {
      const ok = opts[ai].correct;
      if (ok) correct++; else wrong++;
      details.push({ question: q, correct: ok, answered: true, selectedText: opts[ai].text });
    }
  });

  const total = state.questions.length;
  const neg = state.negativeScoring;
  const score = neg > 0 ? Math.max(0, ((correct - wrong * neg) / total) * 10) : (correct / total) * 10;

  const result = { subject: state.subject, date: new Date().toISOString(), totalQuestions: total, correct, wrong, unanswered, negativeScoring: neg, elapsed: Math.round(elapsed), examMode: state.examMode, score };

  saveAttempt(state.subject, result);
  app.innerHTML = renderResults(result, details, state.subject);
}

function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
