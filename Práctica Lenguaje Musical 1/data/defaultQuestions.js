/**
 * Respaldo directo en JavaScript para compatibilidad con file:///
 * Si se ejecuta desde un servidor HTTP, la app carga data/questions.json directamente.
 */
window.DEFAULT_QUESTIONS_DATA = {
  "title": "Lenguaje Musical 1 - Banco de Intervalos",
  "description": "Práctica y repaso de intervalos (2das, 3ras y 4tas) en Clave de Sol",
  "version": "1.0",
  "questions": [
    {
      "id": 1,
      "type": "classify",
      "category": "1.1 Clasificar",
      "title": "Clasifica el intervalo mostrado en el pentagrama",
      "prompt": "Observa las dos notas en clave de sol e indica qué intervalo forman:",
      "notes": [
        { "pitch": "Do4", "accidental": "" },
        { "pitch": "Mi4", "accidental": "" }
      ],
      "options": ["2da m", "2da M", "3ra m", "3ra M", "4ta J"],
      "correctAnswer": "3ra M",
      "explanation": "¡Correcto! De Do4 a Mi4 hay una distancia de 3ra (Do - Re - Mi) y está compuesta por 2 tonos completos (4 semitonos). Por lo tanto, es una 3ra Mayor."
    },
    {
      "id": 2,
      "type": "classify",
      "category": "1.1 Clasificar",
      "title": "Clasifica el intervalo mostrado en el pentagrama",
      "prompt": "Observa las dos notas en clave de sol e indica qué intervalo forman:",
      "notes": [
        { "pitch": "Mi4", "accidental": "" },
        { "pitch": "Fa4", "accidental": "" }
      ],
      "options": ["2da m", "2da M", "3ra m", "3ra M", "4ta J"],
      "correctAnswer": "2da m",
      "explanation": "¡Correcto! De Mi4 a Fa4 hay una 2da (grados conjuntos inmediatos) con distancia de 1 semitono diatónico natural. Por lo tanto, es una 2da menor."
    },
    {
      "id": 3,
      "type": "classify",
      "category": "1.1 Clasificar",
      "title": "Clasifica el intervalo mostrado en el pentagrama",
      "prompt": "Observa las dos notas en clave de sol e indica qué intervalo forman:",
      "notes": [
        { "pitch": "Do4", "accidental": "" },
        { "pitch": "Mi4", "accidental": "b" }
      ],
      "options": ["2da m", "2da M", "3ra m", "3ra M", "4ta J"],
      "correctAnswer": "3ra m",
      "explanation": "¡Correcto! De Do4 a Mi♭4 abarca 3 nombres de notas (Do - Re - Mi) y tiene una distancia de 1 tono y medio (3 semitonos). Es una 3ra menor."
    },
    {
      "id": 4,
      "type": "classify",
      "category": "1.1 Clasificar",
      "title": "Clasifica el intervalo mostrado en el pentagrama",
      "prompt": "Observa las dos notas en clave de sol e indica qué intervalo forman:",
      "notes": [
        { "pitch": "Sol4", "accidental": "" },
        { "pitch": "Do5", "accidental": "" }
      ],
      "options": ["2da m", "2da M", "3ra m", "3ra M", "4ta J"],
      "correctAnswer": "4ta J",
      "explanation": "¡Correcto! De Sol4 a Do5 abarca 4 notas (Sol - La - Si - Do) con una distancia de 2 tonos y medio (5 semitonos). Es una 4ta Justa."
    },
    {
      "id": 5,
      "type": "classify",
      "category": "1.1 Clasificar",
      "title": "Clasifica el intervalo mostrado en el pentagrama",
      "prompt": "Observa las dos notas en clave de sol e indica qué intervalo forman:",
      "notes": [
        { "pitch": "Re4", "accidental": "" },
        { "pitch": "Mi4", "accidental": "" }
      ],
      "options": ["2da m", "2da M", "3ra m", "3ra M", "4ta J"],
      "correctAnswer": "2da M",
      "explanation": "¡Correcto! De Re4 a Mi4 es una 2da diatónica con distancia de 1 tono (2 semitonos). Es una 2da Mayor."
    },
    {
      "id": 6,
      "type": "complete",
      "category": "1.2 Completar",
      "title": "Completa el intervalo en el pentagrama",
      "prompt": "A partir de <strong>Do4</strong> (primera nota fija), coloca en el pentagrama una <strong>3ra Mayor ascendente</strong>.",
      "instruction": "Haz clic en la línea o espacio correspondiente para ubicar la nota. Puedes usar la barra de alteraciones si la nota requiere sostenido o bemol.",
      "baseNote": { "pitch": "Do4", "accidental": "" },
      "targetInterval": "3ra Mayor ascendente",
      "targetSolution": { "pitch": "Mi4", "accidental": "" },
      "explanation": "Para una 3ra Mayor ascendente desde Do4: contamos 3 notas (Do - Re - Mi), por lo que debe situarse en la 1ra línea (Mi). La distancia requerida es de 2 tonos (4 semitonos), lo que corresponde a Mi natural (Mi4)."
    },
    {
      "id": 7,
      "type": "complete",
      "category": "1.2 Completar",
      "title": "Completa el intervalo en el pentagrama",
      "prompt": "A partir de <strong>Do4</strong>, coloca en el pentagrama una <strong>2da menor ascendente</strong>.",
      "instruction": "Haz clic en el pentagrama para situar la nota y selecciona la alteración adecuada (♮, ♯, ♭).",
      "baseNote": { "pitch": "Do4", "accidental": "" },
      "targetInterval": "2da menor ascendente",
      "targetSolution": { "pitch": "Re4", "accidental": "b" },
      "explanation": "Para una 2da menor ascendente desde Do4: debe ser la nota siguiente inmediata (Re) a distancia de 1 semitono. Por eso la solución correcta es Re bemol (Re♭4). ¡Recuerda que no puede ser Do♯ porque el intervalo de 2da exige cambiar de nombre de nota!"
    },
    {
      "id": 8,
      "type": "complete",
      "category": "1.2 Completar",
      "title": "Completa el intervalo en el pentagrama",
      "prompt": "A partir de <strong>Re4</strong>, coloca en el pentagrama una <strong>3ra menor ascendente</strong>.",
      "instruction": "Haz clic en el pentagrama para ubicar la nota y selecciona la alteración si corresponde.",
      "baseNote": { "pitch": "Re4", "accidental": "" },
      "targetInterval": "3ra menor ascendente",
      "targetSolution": { "pitch": "Fa4", "accidental": "" },
      "explanation": "Para una 3ra menor ascendente desde Re4: contamos 3 notas (Re - Mi - Fa), en el 1er espacio. La distancia entre Re y Fa es de 1 tono y medio (3 semitonos), por lo que Fa natural (Fa4) es la respuesta correcta."
    },
    {
      "id": 9,
      "type": "complete",
      "category": "1.2 Completar",
      "title": "Completa el intervalo en el pentagrama",
      "prompt": "A partir de <strong>Sol4</strong>, coloca en el pentagrama una <strong>4ta Justa ascendente</strong>.",
      "instruction": "Haz clic en el pentagrama para ubicar la nota y confirma tu respuesta.",
      "baseNote": { "pitch": "Sol4", "accidental": "" },
      "targetInterval": "4ta Justa ascendente",
      "targetSolution": { "pitch": "Do5", "accidental": "" },
      "explanation": "Para una 4ta Justa ascendente desde Sol4: contamos 4 notas (Sol - La - Si - Do), situándose en el 3er espacio (Do5). La distancia entre Sol y Do es de 2 tonos y medio (5 semitonos), lo que corresponde a Do natural (Do5)."
    },
    {
      "id": 10,
      "type": "complete",
      "category": "1.2 Completar",
      "title": "Completa el intervalo en el pentagrama",
      "prompt": "A partir de <strong>Re4</strong>, coloca en el pentagrama una <strong>3ra Mayor ascendente</strong>.",
      "instruction": "Haz clic en el pentagrama para situar la nota y selecciona la alteración requerida.",
      "baseNote": { "pitch": "Re4", "accidental": "" },
      "targetInterval": "3ra Mayor ascendente",
      "targetSolution": { "pitch": "Fa4", "accidental": "#" },
      "explanation": "Para una 3ra Mayor ascendente desde Re4: contamos 3 notas (Re - Mi - Fa). Como Re a Fa natural solo tiene 1 tono y medio, necesitamos agregar un sostenido para alcanzar los 2 tonos (4 semitonos). La respuesta es Fa sostenido (Fa♯4)."
    }
  ]
};
