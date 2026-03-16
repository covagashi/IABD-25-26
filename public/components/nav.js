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
      <strong>Examen (${data.examInfo.time}):</strong> ${data.examInfo.description}
      ${data.subject === 'MIA' ? '<br><br><em>En MIA solo 2 de 11 preguntas son tipo test. Las tarjetas te ayudan más que el test para preparar las 9 preguntas de desarrollo, que es donde está el grueso de la nota.</em>' : ''}
      ${data.subject === 'SAA' ? '<br><br><em>Única asignatura con puntuación negativa en test (-0.5). Practica hasta dominar los ejercicios de Bayes, KNN y matriz de confusión.</em>' : ''}
      ${data.subject === 'BDA' ? '<br><br><em>El examen es en papel. Practica escribir código MapReduce, HQL y PySpark a mano. El test es solo una parte — prepara también las definiciones de conceptos.</em>' : ''}
      ${data.subject === 'PIA' ? '<br><br><em>El test solo cubre temas 1,2,8,9 (4pts). Los otros 6 puntos son prácticas de código basadas en las tareas del curso (temas 3-7). Repasa las tarjetas para cubrir ambas partes.</em>' : ''}
      ${data.subject === 'SBD' ? '<br><br><em>No hay supuestos prácticos. Son preguntas concretas de los apuntes — las tarjetas son tu mejor herramienta aquí. Puedes adjuntar dibujos en el examen.</em>' : ''}
    </div>
  </div>`;
}
