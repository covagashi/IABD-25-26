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
  // Modes adapted per subject
  let modes = '';

  // Resumen for all
  if (data.summaries?.length) {
    modes += `<a href="#/${data.subject}/resumen" class="mode">Resumen (${data.summaries.length} temas)</a>`;
  }

  // Test for all (but de-emphasized for MIA)
  modes += `<a href="#/${data.subject}/quiz" class="mode">Test (${data.questions.length})</a>`;

  // Flashcards for all
  if (data.flashcards?.length) {
    modes += `<a href="#/${data.subject}/flashcards" class="mode">Tarjetas (${data.flashcards.length})</a>`;
  }

  // Code examples for BDA
  if (data.codeExamples?.length) {
    modes += `<a href="#/${data.subject}/codigo" class="mode">Código (${data.codeExamples.length})</a>`;
  }

  // Commands reference for BDA
  if (data.commands?.length) {
    const cmdCount = data.commands.reduce((s, c) => s + c.items.length, 0);
    modes += `<a href="#/${data.subject}/comandos" class="mode">Comandos (${cmdCount})</a>`;
  }

  // Development questions for MIA
  if (data.devQuestions?.length) {
    modes += `<a href="#/${data.subject}/desarrollo" class="mode">Desarrollo (${data.devQuestions.length})</a>`;
  }

  modes += `<a href="#/${data.subject}/history" class="mode">Historial</a>`;

  const tips = {
    BDA: 'El examen es en papel. Practica escribir código MapReduce, HQL y PySpark a mano. El test es solo una parte — prepara también las definiciones de conceptos.',
    MIA: 'En MIA solo 2 de 11 preguntas son tipo test. Usa "Desarrollo" y las tarjetas para preparar las 9 preguntas de respuesta corta, que es donde está el grueso de la nota.',
    PIA: 'El test solo cubre temas 1,2,8,9 (4pts). Los otros 6 puntos son prácticas de código basadas en las tareas del curso (temas 3-7). Repasa las tarjetas para cubrir ambas partes.',
    SAA: 'Única asignatura con puntuación negativa en test (-0.5). Practica hasta dominar los ejercicios de Bayes, KNN y matriz de confusión.',
    SBD: 'No hay supuestos prácticos. Son preguntas concretas de los apuntes — las tarjetas y el resumen son tu mejor herramienta aquí. Puedes adjuntar dibujos en el examen.',
  };

  return `<div>
    <a href="#/" class="back">Volver</a>
    <h1>${data.subject}</h1>
    <p class="sub">${data.name}</p>
    <div class="modes">${modes}</div>
    <div class="exam-note">
      <strong>Examen (${data.examInfo.time}):</strong> ${data.examInfo.description}
      <br><br><em>${tips[data.subject] || ''}</em>
    </div>
  </div>`;
}
