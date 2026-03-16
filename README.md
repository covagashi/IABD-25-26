# IABD 25-26 — Herramienta de estudio

App web para preparar los exámenes finales del **Curso de Especialización en IA y Big Data (2025-26)**.

## Asignaturas

| Asignatura | Preguntas test | Tarjetas | Examen |
|-----------|:-:|:-:|--------|
| **BDA** — Big Data Aplicado | 148 | 62 | 12:30–14:00. 10-15 test + 5 definiciones + prácticas MapReduce/HQL/Spark. En papel |
| **MIA** — Modelos de IA | 148 | 33 | 10:45–12:15. 11 preguntas sobre caso práctico (2 test + 9 desarrollo) |
| **PIA** — Programación de IA | 220 | 110 | 10:45–12:15. Temas 1,2,8,9 test (4pts) + temas 3-7 prácticas (1.5pts c/u) |
| **SAA** — Sistemas de Aprendizaje Automático | 119 | 59 | 9:00–10:30. ~15 test (suman 1, **restan 0.5**) + ejercicios Bayes/KNN/confusión + desarrollo |
| **SBD** — Sistemas de Big Data | 142 | 72 | 9:00–10:30. 7 preguntas concretas de apuntes (1-2pts). Sin supuestos prácticos |

## Cómo usarla

Entra en la web desplegada y elige una asignatura. Tienes tres modos:

- **Test**: preguntas tipo test configurables (elige módulos, cantidad, tiempo). El modo "Simular examen" aplica las condiciones reales (90 min, todas las preguntas barajadas).
- **Tarjetas**: flashcards extraídas directamente de los PDFs del curso. Toca para voltear, marca "Lo sé" o "Repasar". Usa las flechas del teclado para navegar.
- **Historial**: registro de tus intentos para ver tu progreso.

## Recomendaciones por asignatura

**BDA**: El test es solo una parte del examen. Dedica tiempo a practicar código MapReduce, consultas HQL (Hive) y PySpark a mano — el examen es en papel sin dispositivos.

**MIA**: Solo 2 de 11 preguntas son tipo test. Las tarjetas te ayudan más que el test para las 9 preguntas de desarrollo, que es donde está el grueso de la nota. Se valora ortografía y redacción.

**PIA**: El test cubre temas 1,2,8,9 (4pts). Los otros 6 puntos son prácticas de código basadas en las tareas del curso (temas 3-7). Repasa las tarjetas para ambas partes.

**SAA**: Única asignatura con puntuación negativa en test (-0.5). Si no estás seguro, mejor no contestar. Practica hasta dominar los ejercicios de Bayes, KNN y matriz de confusión — son 5.5-6 puntos del examen.

**SBD**: No hay supuestos prácticos. Son preguntas muy concretas sacadas de los apuntes. Las tarjetas son tu mejor herramienta. Puedes adjuntar dibujos en el examen.

## Datos

Las preguntas test vienen del banco de preguntas del curso (`iabd.json`). Las tarjetas fueron extraídas de los PDFs de contenido de cada unidad usando Gemini. Todo el contenido viene exclusivamente de la documentación del curso — no se ha añadido información externa.

El historial de intentos se guarda en `localStorage` del navegador (no se envía a ningún servidor).

## Stack

HTML + CSS + JS vanilla. Sin frameworks. Netlify sirve la carpeta `public/` como sitio estático.

Los scripts en `scripts/` solo se usan localmente para generar los JSON de datos a partir de los PDFs del curso (requieren Node.js y API key de Gemini).
