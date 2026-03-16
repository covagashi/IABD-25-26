/**
 * Parses iabd.json + BDA2.txt past exam and generates per-subject JSON files
 * in public/data/ ready for the frontend.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'source-data');
const OUT = path.join(ROOT, 'public', 'data');

// Subject metadata — solo info literal de los profesores
const SUBJECTS = {
  BDA: {
    name: 'Big Data Aplicado',
    examInfo: {
      description: '10-15 test + 1 pregunta con 5 términos a definir (3-4 líneas) + 1-3 cuestiones prácticas (MapReduce, HQL/Hive, Spark). En papel, sin dispositivos.',
      time: '12:30 – 14:00 (90 min)'
    }
  },
  MIA: {
    name: 'Modelos de Inteligencia Artificial',
    examInfo: {
      description: '11 preguntas sobre un caso práctico. 2 tipo test (restan 0.25 o 1/3 según pregunta) + 9 desarrollo/respuesta corta (~1pt c/u). Se valora ortografía y redacción.',
      time: '10:45 – 12:15 (90 min)'
    }
  },
  PIA: {
    name: 'Programación de Inteligencia Artificial',
    examInfo: {
      description: 'Temas 1,2,8,9: test (4pts, revisar tests de cada unidad). Temas 3-7: pregunta corta práctica o concepto teórico (1.5pts c/u). Prácticas basadas en las tareas del curso.',
      time: '10:45 – 12:15 (90 min)'
    }
  },
  SAA: {
    name: 'Sistemas de Aprendizaje Automático',
    examInfo: {
      description: '~3 test/tema (suman 1, restan 0.5, total 3pts) + 3 ejercicios: Bayes, KNN, modelo ML o matriz confusión (5.5-6pts) + 1 desarrollo (1-1.5pts).',
      time: '9:00 – 10:30 (90 min)'
    }
  },
  SBD: {
    name: 'Sistemas de Big Data',
    examInfo: {
      description: '7 preguntas (1-2pts), 5 temas, 4 RA. Preguntas concretas de los apuntes. Sin supuestos prácticos. Se pueden adjuntar dibujos.',
      time: '9:00 – 10:30 (90 min)'
    }
  }
};

// Parse iabd.json
const iabd = JSON.parse(fs.readFileSync(path.join(SOURCE, 'iabd.json'), 'utf8'));

// Group questions by subject
const subjectData = {};
for (const subj of Object.keys(SUBJECTS)) {
  subjectData[subj] = { questions: [], flashcards: [], practicalQuestions: [] };
}

for (const [moduleKey, questions] of Object.entries(iabd)) {
  // Determine subject from module key (e.g., "MIA01" -> "MIA", "BDA Ordinaria 2022/2023" -> "BDA")
  let subject = null;
  for (const subj of Object.keys(SUBJECTS)) {
    if (moduleKey.startsWith(subj)) {
      subject = subj;
      break;
    }
  }
  if (!subject) continue;

  // Skip past exams — only reference, not study content
  if (moduleKey.includes('Ordinaria')) continue;

  const moduleName = moduleKey;

  for (let i = 0; i < questions.length; i++) {
    const [questionText, options] = questions[i];
    const qId = `${moduleName}_${String(i + 1).padStart(3, '0')}`;

    subjectData[subject].questions.push({
      id: qId,
      module: moduleName,
      type: 'test',
      source: 'iabd',
      question: questionText,
      options: options.map(([text, correct]) => ({ text, correct }))
    });
  }
}

// BDA2.txt son exámenes anteriores — solo referencia, no se incluyen como contenido

// Load flashcards from Gemini-generated file if it exists
const fcPath = path.join(SOURCE, 'flashcards-generated.json');
if (fs.existsSync(fcPath)) {
  const fcData = JSON.parse(fs.readFileSync(fcPath, 'utf8'));
  for (const [subj, cards] of Object.entries(fcData)) {
    if (subjectData[subj]) {
      subjectData[subj].flashcards = cards;
    }
  }
  console.log('✓ Flashcards loaded from flashcards-generated.json');
}

// Load extra questions from Gemini-extracted PDFs if they exist
const extraPath = path.join(SOURCE, 'extra-questions.json');
if (fs.existsSync(extraPath)) {
  const extraData = JSON.parse(fs.readFileSync(extraPath, 'utf8'));
  for (const [subj, questions] of Object.entries(extraData)) {
    if (subjectData[subj]) {
      subjectData[subj].questions.push(...questions);
    }
  }
  console.log('✓ Extra questions loaded from extra-questions.json');
}

// Write output files
fs.mkdirSync(OUT, { recursive: true });

const manifest = {
  generated: new Date().toISOString(),
  subjects: {}
};

for (const [subj, meta] of Object.entries(SUBJECTS)) {
  const data = {
    subject: subj,
    name: meta.name,
    examInfo: meta.examInfo,
    questions: subjectData[subj].questions,
    flashcards: subjectData[subj].flashcards,
    practicalQuestions: subjectData[subj].practicalQuestions
  };

  const outPath = path.join(OUT, `${subj}.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');

  manifest.subjects[subj] = {
    name: meta.name,
    questionCount: data.questions.length,
    flashcardCount: data.flashcards.length,
    practicalCount: data.practicalQuestions.length,
    modules: [...new Set(data.questions.map(q => q.module))].sort()
  };

  console.log(`✓ ${subj}: ${data.questions.length} questions, ${data.flashcards.length} flashcards`);
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log('\n✓ manifest.json generated');
console.log('✓ All data files written to public/data/');
