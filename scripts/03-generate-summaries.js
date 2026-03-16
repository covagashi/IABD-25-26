/**
 * Generates reading summaries, code examples, and development questions
 * from course PDFs using Gemini. Content is EXCLUSIVELY from the PDFs.
 */
const fs = require('fs');
const path = require('path');
const { callGemini } = require('./utils/gemini');

const ROOT = path.join(__dirname, '..');
const DOC_ROOT = path.join(process.env.USERPROFILE, 'Documents', '_estudio', 'doc');
const OUTPUT = path.join(ROOT, 'source-data', 'summaries-generated.json');

const SUBJECT_PDFS = {
  BDA: [
    { pdf: 'BDA-Big Data Aplicado/BDA01_Introduccion_Apache_Hadoop.pdf', module: 'BDA01', title: 'Introducción a Apache Hadoop' },
    { pdf: 'BDA-Big Data Aplicado/BDA02_Contenidos.pdf', module: 'BDA02', title: 'Contenidos BDA02' },
    { pdf: 'BDA-Big Data Aplicado/Ecosistema Hadoop_.pdf', module: 'BDA03', title: 'Ecosistema Hadoop' },
    { pdf: 'BDA-Big Data Aplicado/Ecosistema Hadoop_5_.pdf', module: 'BDA05', title: 'Ecosistema Hadoop (cont.)' },
  ],
  MIA: [
    { pdf: 'MIA-Modelos de Inteligencia Artificial/MIA03_Contenidos.pdf', module: 'MIA03', title: 'Contenidos MIA03' },
    { pdf: 'MIA-Modelos de Inteligencia Artificial/MIA04_Contenidos.pdf', module: 'MIA04', title: 'Contenidos MIA04' },
    { pdf: 'MIA-Modelos de Inteligencia Artificial/MIA05_Contenidos.pdf', module: 'MIA05', title: 'Contenidos MIA05' },
  ],
  PIA: [
    { pdf: 'PIA-Programación de Inteligencia Artificial/PIA_01.pdf', module: 'PIA01', title: 'Introducción PIA' },
    { pdf: 'PIA-Programación de Inteligencia Artificial/2Aplicaciones de IA en la nube y servicios API.pdf', module: 'PIA02', title: 'IA en la nube y APIs' },
    { pdf: 'PIA-Programación de Inteligencia Artificial/3Entornos de programación de IA con Python_.pdf', module: 'PIA03', title: 'Entornos de programación IA con Python' },
    { pdf: 'PIA-Programación de Inteligencia Artificial/UT4.- Librerias de programación de Aprendizaje Automático.pdf', module: 'PIA04', title: 'Librerías de Aprendizaje Automático' },
    { pdf: 'PIA-Programación de Inteligencia Artificial/5Programación de redes neuronales profundas_.pdf', module: 'PIA05', title: 'Redes neuronales profundas' },
    { pdf: 'PIA-Programación de Inteligencia Artificial/6Ajustes de un modelo de aprendizaje automático_.pdf', module: 'PIA06', title: 'Ajustes de modelo ML' },
    { pdf: 'PIA-Programación de Inteligencia Artificial/PIA07_Contenidos.pdf', module: 'PIA07', title: 'Contenidos PIA07' },
    { pdf: 'PIA-Programación de Inteligencia Artificial/PIA08_Contenidos.pdf', module: 'PIA08', title: 'Contenidos PIA08' },
    { pdf: 'PIA-Programación de Inteligencia Artificial/PIA09_Contenidos.pdf', module: 'PIA09', title: 'Contenidos PIA09' },
  ],
  SAA: [
    { pdf: 'SAA-Sistemas de Aprendizaje Automático/SAA01_Contenidos.pdf', module: 'SAA01', title: 'Contenidos SAA01' },
    { pdf: 'SAA-Sistemas de Aprendizaje Automático/SAA02_Contenidos.pdf', module: 'SAA02', title: 'Contenidos SAA02' },
    { pdf: 'SAA-Sistemas de Aprendizaje Automático/SAA03_Contenidos.pdf', module: 'SAA03', title: 'Contenidos SAA03' },
    { pdf: 'SAA-Sistemas de Aprendizaje Automático/SAA04_Contenidos.pdf', module: 'SAA04', title: 'Contenidos SAA04' },
    { pdf: 'SAA-Sistemas de Aprendizaje Automático/SAA05_Contenidos.pdf', module: 'SAA05', title: 'Contenidos SAA05' },
  ],
  SBD: [
    { pdf: 'SBD-Sistemas de Big Data/SBD01_Contenidos.pdf', module: 'SBD01', title: 'Contenidos SBD01' },
    { pdf: 'SBD-Sistemas de Big Data/SBD02_Contenidos.pdf', module: 'SBD02', title: 'Contenidos SBD02' },
    { pdf: 'SBD-Sistemas de Big Data/SBD03_Contenidos.pdf', module: 'SBD03', title: 'Contenidos SBD03' },
    { pdf: 'SBD-Sistemas de Big Data/SBD04_Contenidos.pdf', module: 'SBD04', title: 'Contenidos SBD04' },
    { pdf: 'SBD-Sistemas de Big Data/SBD05_Contenidos.pdf', module: 'SBD05', title: 'Contenidos SBD05' },
  ],
};

// Different prompts per subject to adapt to exam format
const SUMMARY_PROMPT = `Lee este PDF del curso y genera un resumen de estudio. REGLAS:
- SOLO usa información del documento, no inventes nada
- Estructura el resumen con los conceptos clave, definiciones importantes y relaciones entre conceptos
- Sé conciso pero completo — esto es para repasar antes del examen
- Si hay listas de características, inclúyelas

Responde con un JSON:
{"title": "Título del tema", "summary": "Resumen en texto plano con saltos de línea (\\n) para separar secciones. Usa ** para negritas en conceptos clave."}`;

const BDA_CODE_PROMPT = `Lee este PDF del curso de Big Data Aplicado y extrae TODOS los ejemplos de código que aparezcan (MapReduce, HQL/Hive, PySpark, Pig, HDFS commands, etc). REGLAS:
- SOLO código que aparezca en el documento
- No inventes código nuevo
- Incluye el contexto de para qué sirve cada ejemplo

Responde con un JSON array:
[{"title": "Descripción del ejemplo", "language": "python|sql|bash|pig", "code": "el código tal cual aparece", "explanation": "breve explicación del documento"}]`;

const MIA_DEV_PROMPT = `Lee este PDF del curso de Modelos de IA y genera preguntas de DESARROLLO (respuesta corta, 3-5 líneas) basándote EXCLUSIVAMENTE en el contenido. El examen de MIA tiene 9 preguntas de desarrollo sobre un caso práctico. REGLAS:
- Solo preguntas cuya respuesta esté en el documento
- Formato: pregunta que requiera explicar, definir, comparar o aplicar un concepto
- Entre 5 y 10 preguntas por documento
- Las respuestas deben ser concisas (3-5 líneas) y fieles al documento

Responde con un JSON array:
[{"question": "¿Pregunta de desarrollo?", "answer": "Respuesta basada en el documento (3-5 líneas)"}]`;

async function main() {
  const result = {};

  for (const [subject, pdfs] of Object.entries(SUBJECT_PDFS)) {
    console.log(`\n=== ${subject} ===`);
    result[subject] = { summaries: [], codeExamples: [], devQuestions: [] };

    for (const { pdf, module, title } of pdfs) {
      const fullPath = path.join(DOC_ROOT, pdf);
      if (!fs.existsSync(fullPath)) { console.log(`  [skip] ${pdf}`); continue; }

      // Summary for all subjects
      console.log(`  Resumen: ${module}`);
      const summary = await callGemini(SUMMARY_PROMPT, fullPath, `summary_${subject}_${module}`);
      if (summary && summary.title) {
        result[subject].summaries.push({ module, ...summary });
      }

      // Code examples for BDA
      if (subject === 'BDA') {
        console.log(`  Código: ${module}`);
        const codes = await callGemini(BDA_CODE_PROMPT, fullPath, `code_${subject}_${module}`);
        if (Array.isArray(codes)) {
          result[subject].codeExamples.push(...codes.map(c => ({ module, ...c })));
          console.log(`  ✓ ${codes.length} ejemplos de código`);
        }
      }

      // Development questions for MIA
      if (subject === 'MIA') {
        console.log(`  Desarrollo: ${module}`);
        const devQs = await callGemini(MIA_DEV_PROMPT, fullPath, `dev_${subject}_${module}`);
        if (Array.isArray(devQs)) {
          result[subject].devQuestions.push(...devQs.map(q => ({ module, ...q })));
          console.log(`  ✓ ${devQs.length} preguntas de desarrollo`);
        }
      }
    }

    const s = result[subject];
    console.log(`  Total ${subject}: ${s.summaries.length} resúmenes, ${s.codeExamples.length} código, ${s.devQuestions.length} desarrollo`);
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n✓ Guardado en ${OUTPUT}`);
}

main().catch(console.error);
