/**
 * Extracts flashcards from course PDFs using Gemini.
 * Only generates content based on the actual documentation.
 * Also reads hint files to understand exam format for prioritization.
 */
const fs = require('fs');
const path = require('path');
const { callGemini } = require('./utils/gemini');

const ROOT = path.join(__dirname, '..');
const DOC_ROOT = path.join(process.env.USERPROFILE, 'Documents', '_estudio', 'doc');
const OUTPUT = path.join(ROOT, 'source-data', 'flashcards-generated.json');

// Map of subject -> array of { pdfPath, module }
const SUBJECT_PDFS = {
  BDA: [
    { pdf: 'BDA-Big Data Aplicado/BDA01_Introduccion_Apache_Hadoop.pdf', module: 'BDA01' },
    { pdf: 'BDA-Big Data Aplicado/BDA02_Contenidos.pdf', module: 'BDA02' },
    { pdf: 'BDA-Big Data Aplicado/Ecosistema Hadoop_.pdf', module: 'BDA03' },
    { pdf: 'BDA-Big Data Aplicado/Ecosistema Hadoop_5_.pdf', module: 'BDA05' },
  ],
  MIA: [
    { pdf: 'MIA-Modelos de Inteligencia Artificial/MIA03_Contenidos.pdf', module: 'MIA03' },
    { pdf: 'MIA-Modelos de Inteligencia Artificial/MIA04_Contenidos.pdf', module: 'MIA04' },
    { pdf: 'MIA-Modelos de Inteligencia Artificial/MIA05_Contenidos.pdf', module: 'MIA05' },
  ],
  PIA: [
    { pdf: 'PIA-Programación de Inteligencia Artificial/PIA_01.pdf', module: 'PIA01' },
    { pdf: 'PIA-Programación de Inteligencia Artificial/2Aplicaciones de IA en la nube y servicios API.pdf', module: 'PIA02' },
    { pdf: 'PIA-Programación de Inteligencia Artificial/3Entornos de programación de IA con Python_.pdf', module: 'PIA03' },
    { pdf: 'PIA-Programación de Inteligencia Artificial/UT4.- Librerias de programación de Aprendizaje Automático.pdf', module: 'PIA04' },
    { pdf: 'PIA-Programación de Inteligencia Artificial/5Programación de redes neuronales profundas_.pdf', module: 'PIA05' },
    { pdf: 'PIA-Programación de Inteligencia Artificial/6Ajustes de un modelo de aprendizaje automático_.pdf', module: 'PIA06' },
    { pdf: 'PIA-Programación de Inteligencia Artificial/PIA07_Contenidos.pdf', module: 'PIA07' },
    { pdf: 'PIA-Programación de Inteligencia Artificial/PIA08_Contenidos.pdf', module: 'PIA08' },
    { pdf: 'PIA-Programación de Inteligencia Artificial/PIA09_Contenidos.pdf', module: 'PIA09' },
  ],
  SAA: [
    { pdf: 'SAA-Sistemas de Aprendizaje Automático/SAA01_Contenidos.pdf', module: 'SAA01' },
    { pdf: 'SAA-Sistemas de Aprendizaje Automático/SAA02_Contenidos.pdf', module: 'SAA02' },
    { pdf: 'SAA-Sistemas de Aprendizaje Automático/SAA03_Contenidos.pdf', module: 'SAA03' },
    { pdf: 'SAA-Sistemas de Aprendizaje Automático/SAA04_Contenidos.pdf', module: 'SAA04' },
    { pdf: 'SAA-Sistemas de Aprendizaje Automático/SAA05_Contenidos.pdf', module: 'SAA05' },
  ],
  SBD: [
    { pdf: 'SBD-Sistemas de Big Data/SBD01_Contenidos.pdf', module: 'SBD01' },
    { pdf: 'SBD-Sistemas de Big Data/SBD02_Contenidos.pdf', module: 'SBD02' },
    { pdf: 'SBD-Sistemas de Big Data/SBD03_Contenidos.pdf', module: 'SBD03' },
    { pdf: 'SBD-Sistemas de Big Data/SBD04_Contenidos.pdf', module: 'SBD04' },
    { pdf: 'SBD-Sistemas de Big Data/SBD05_Contenidos.pdf', module: 'SBD05' },
  ],
};

const PROMPT = `Eres un asistente de estudio. Lee este PDF de contenido del curso y genera tarjetas de estudio (flashcards) basándote EXCLUSIVAMENTE en el contenido del documento.

REGLAS ESTRICTAS:
- Solo usa información que aparezca en el documento
- No inventes ni añadas información externa
- Cada tarjeta debe tener un "front" (pregunta concisa) y un "back" (respuesta basada en el documento)
- Genera entre 8 y 15 tarjetas por documento
- Prioriza: definiciones clave, diferencias entre conceptos, características importantes, procesos/pasos descritos
- Las respuestas deben ser concisas pero completas según el documento

Responde SOLO con un array JSON válido con este formato:
[
  {"front": "¿Pregunta?", "back": "Respuesta del documento"},
  ...
]`;

async function main() {
  const allFlashcards = {};

  for (const [subject, pdfs] of Object.entries(SUBJECT_PDFS)) {
    console.log(`\n=== ${subject} ===`);
    allFlashcards[subject] = [];
    let cardCount = 0;

    for (const { pdf, module } of pdfs) {
      const fullPath = path.join(DOC_ROOT, pdf);
      if (!fs.existsSync(fullPath)) {
        console.log(`  [skip] ${pdf} - no existe`);
        continue;
      }

      console.log(`  Procesando: ${module} (${path.basename(pdf)})`);
      const cacheKey = `flashcards_${subject}_${module}`;

      try {
        const cards = await callGemini(PROMPT, fullPath, cacheKey);

        if (Array.isArray(cards)) {
          for (let i = 0; i < cards.length; i++) {
            if (cards[i].front && cards[i].back) {
              cardCount++;
              allFlashcards[subject].push({
                id: `${subject}_FC_${String(cardCount).padStart(3, '0')}`,
                module,
                priority: 'medium',
                front: cards[i].front,
                back: cards[i].back
              });
            }
          }
          console.log(`  ✓ ${cards.length} tarjetas extraídas de ${module}`);
        }
      } catch (err) {
        console.error(`  [error] ${module}: ${err.message}`);
      }
    }

    console.log(`  Total ${subject}: ${allFlashcards[subject].length} tarjetas`);
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(allFlashcards, null, 2), 'utf8');
  console.log(`\n✓ Flashcards guardadas en ${OUTPUT}`);
  console.log('Ejecuta "npm run build:data" para integrarlas en los JSON finales');
}

main().catch(console.error);
