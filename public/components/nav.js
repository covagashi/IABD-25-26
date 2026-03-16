export function renderHome(manifest) {
  const subjects = manifest.subjects;
  let items = '';

  for (const [code, info] of Object.entries(subjects)) {
    items += `<li><a href="#/${code}">
      <span><span class="code">${code}</span><span class="name">${info.name}</span></span>
      <span class="count">${info.questionCount} preguntas</span>
    </a></li>`;
  }

  return `<div>
    <h1>Estudio IABD</h1>
    <p class="sub">Exámenes finales</p>
    <ul class="subjects">${items}</ul>
  </div>`;
}

export function renderSubject(data) {
  return `<div>
    <a href="#/" class="back">Volver</a>
    <h1>${data.subject}</h1>
    <p class="sub">${data.name}</p>
    <div class="modes">
      <a href="#/${data.subject}/quiz" class="mode">Test (${data.questions.length})</a>
      <a href="#/${data.subject}/flashcards" class="mode">Tarjetas (${data.flashcards.length})</a>
      <a href="#/${data.subject}/history" class="mode">Historial</a>
    </div>
    <div class="exam-note">
      <strong>Examen:</strong> ${data.examInfo.description}
    </div>
  </div>`;
}
