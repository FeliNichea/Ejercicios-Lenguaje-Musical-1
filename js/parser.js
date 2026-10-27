/**
 * Parser de Notación Musical y Preguntas para Lenguaje Musical 1
 * Convierte nomenclatura musical amigable (ej: "Do4", "Fa#4", "Reb4")
 * a coordenadas y pasos internos del pentagrama.
 */

const DIATONIC_NAME_MAP = {
  'do': 0, 'c': 0,
  're': 1, 'd': 1,
  'mi': 2, 'e': 2,
  'fa': 3, 'f': 3,
  'sol': 4, 'g': 4,
  'la': 5, 'a': 5,
  'si': 6, 'b': 6
};

const STANDARD_NAMES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

class NoteParser {
  /**
   * Parsea una nota dada como objeto o string:
   * Ejemplos: "Do4", "Mi#4", "Reb5", { pitch: "Fa4", accidental: "#" }, { step: 2, accidental: "b" }
   */
  static parse(input) {
    if (!input) return null;

    // Si ya viene como step numérico
    if (typeof input.step === 'number') {
      const step = input.step;
      const acc = this.normalizeAccidental(input.accidental);
      const info = InteractiveStave.stepInfo(step);
      return {
        step: step,
        accidental: acc,
        octave: info.octave,
        name: info.name,
        label: `${info.name}${acc === '#' ? '♯' : (acc === 'b' ? '♭' : '')}${info.octave}`,
        x: input.x
      };
    }

    let pitchStr = '';
    let explicitAcc = '';

    if (typeof input === 'string') {
      pitchStr = input.trim();
    } else if (typeof input === 'object') {
      pitchStr = (input.pitch || input.note || '').trim();
      explicitAcc = input.accidental || '';
    }

    // Regex para capturar: Nombre de nota + posible alteración + posible octava
    // Ej: "Do4", "Sol#4", "Mib5", "Fa", "Re#", "Sib3"
    const match = pitchStr.match(/^([a-zA-ZáéíóúÁÉÍÓÚ]+)(#|♯|b|♭|n|♮)?(\d)?$/i);
    if (!match) {
      console.warn(`[NoteParser] No se pudo parsear la nota: "${pitchStr}". Usando Do4 por defecto.`);
      return { step: 0, accidental: '', octave: 4, name: 'Do', label: 'Do4' };
    }

    const rawName = match[1].toLowerCase();
    const embeddedAcc = match[2] || '';
    const rawOctave = match[3] !== undefined ? parseInt(match[3], 10) : 4;

    const diatonicIndex = DIATONIC_NAME_MAP[rawName];
    if (diatonicIndex === undefined) {
      console.warn(`[NoteParser] Nombre de nota no reconocido: "${rawName}". Usando Do.`);
      return { step: 0, accidental: '', octave: 4, name: 'Do', label: 'Do4' };
    }

    // La alteración explícita tiene prioridad sobre la embebida
    const accidental = this.normalizeAccidental(explicitAcc || embeddedAcc);
    const octave = rawOctave;

    // Calcular paso diatónico en el pentagrama (Do4 = 0)
    const step = (octave - 4) * 7 + diatonicIndex;
    const standardName = STANDARD_NAMES[diatonicIndex];
    const accSymbol = accidental === '#' ? '♯' : (accidental === 'b' ? '♭' : '');
    const label = `${standardName}${accSymbol}${octave}`;

    return {
      step: step,
      accidental: accidental,
      octave: octave,
      name: standardName,
      label: label,
      x: input.x
    };
  }

  /**
   * Normaliza caracteres de alteraciones a '', '#' o 'b'
   */
  static normalizeAccidental(acc) {
    if (!acc) return '';
    const clean = acc.toString().trim().toLowerCase();
    if (clean === '#' || clean === '♯' || clean === 's' || clean === 'sharp' || clean === 'sostenido') {
      return '#';
    }
    if (clean === 'b' || clean === '♭' || clean === 'flat' || clean === 'bemol') {
      return 'b';
    }
    if (clean === 'n' || clean === '♮' || clean === 'natural' || clean === 'becuadro') {
      return '';
    }
    return '';
  }

  /**
   * Normaliza una pregunta cargada desde JSON
   */
  static normalizeQuestion(q, index) {
    const id = q.id !== undefined ? q.id : (index + 1);
    const type = (q.type || 'classify').toLowerCase();
    const category = q.category || (type === 'classify' ? '1.1 Clasificar' : '1.2 Completar');

    if (type === 'classify') {
      const rawNotes = q.notes || [];
      const note1 = this.parse(rawNotes[0] || { pitch: 'Do4' });
      const note2 = this.parse(rawNotes[1] || { pitch: 'Mi4' });
      note1.x = 240;
      note2.x = 420;

      const options = q.options && q.options.length ? q.options : ['2da m', '2da M', '3ra m', '3ra M', '4ta J'];
      const correctAnswer = q.correctAnswer || options[0];

      return {
        id: id,
        type: 'classify',
        category: category,
        title: q.title || 'Clasifica el intervalo mostrado en el pentagrama',
        prompt: q.prompt || 'Observa las dos notas e indica qué intervalo forman:',
        instruction: q.instruction || '',
        notes: [note1, note2],
        options: options,
        correctAnswer: correctAnswer,
        explanation: q.explanation || 'Respuesta correcta.'
      };
    } else if (type === 'complete') {
      // 1.2 Completar
      const baseNote = this.parse(q.baseNote || { pitch: 'Do4' });
      baseNote.x = 240;

      const targetSolution = this.parse(q.targetSolution || { pitch: 'Mi4' });

      return {
        id: id,
        type: 'complete',
        category: category,
        title: q.title || 'Completa el intervalo en el pentagrama',
        prompt: q.prompt || `Construye el intervalo pedido a partir de <strong>${baseNote.label}</strong>.`,
        instruction: q.instruction || 'Haz clic en el pentagrama para situar la nota y selecciona la alteración adecuada.',
        baseNote: baseNote,
        targetInterval: q.targetInterval || 'intervalo',
        targetSolution: targetSolution,
        explanation: q.explanation || 'Respuesta correcta.'
      };
    } else if (type === 'scale-identify') {
      // 2.1 Identificar Escala Mayor a partir de Armadura
      const keySig = q.keySignature || { type: '#', count: 0 };
      const expectedScale = q.expectedScale || 'Do Mayor';
      const canonical = this.normalizeScaleName(expectedScale);
      const baseStep = q.baseStep !== undefined ? q.baseStep : this.inferScaleBaseStep(canonical);

      return {
        id: id,
        type: 'scale-identify',
        category: q.category || '2.1 Escalas Mayores',
        title: q.title || 'Identifica la escala mayor a partir de su armadura',
        prompt: q.prompt || 'Observa la armadura de clave en el pentagrama y escribe el nombre de la escala mayor correspondiente:',
        instruction: q.instruction || 'Escribe el nombre de la escala (ejemplo: "La Mayor", "La sostenido mayor" o "La bemol mayor").',
        keySignature: {
          type: (keySig.type === 'b' ? 'b' : '#'),
          count: parseInt(keySig.count, 10) || 0
        },
        expectedScale: expectedScale,
        canonicalExpected: canonical,
        baseStep: baseStep,
        explanation: q.explanation || `Corresponde a la escala de ${expectedScale}.`
      };
    } else if (type === 'scale-build') {
      // 2.2 Construir Armadura de Clave para una Escala
      const targetSig = q.targetKeySignature || { type: '#', count: 0 };
      const targetScale = q.targetScale || 'Do Mayor';

      return {
        id: id,
        type: 'scale-build',
        category: q.category || '2.2 Construir Armadura',
        title: q.title || 'Construye la armadura de clave de la escala',
        prompt: q.prompt || `Construye la armadura de clave correspondiente a <strong>${targetScale}</strong>:`,
        instruction: q.instruction || 'Selecciona si la armadura lleva sostenidos o bemoles y utiliza los botones para agregar o quitar alteraciones.',
        targetScale: targetScale,
        targetKeySignature: {
          type: (targetSig.type === 'b' ? 'b' : '#'),
          count: parseInt(targetSig.count, 10) || 0
        },
        explanation: q.explanation || `La armadura de ${targetScale} lleva ${targetSig.count} ${targetSig.type === '#' ? 'sostenidos' : 'bemoles'}.`
      };
    }
  }

  /**
   * Normaliza el texto ingresado por el usuario para nombres de escalas
   * Admite: "la mayor", "la sostenido mayor", "la bemol mayor", "La#", "Lab Mayor", etc.
   */
  static normalizeScaleName(str) {
    if (!str) return '';
    return str
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos/tildes
      .toLowerCase()
      .replace(/escala\s+(de\s+)?/gi, '')
      .replace(/mayor(es)?/gi, '')
      .replace(/sostenid[oa]s?/gi, '#')
      .replace(/sharp/gi, '#')
      .replace(/bemol(es)?/gi, 'b')
      .replace(/flat/gi, 'b')
      .replace(/\s+/g, '')
      .trim();
  }

  /**
   * Deduce el paso diatónico de la tónica en el pentagrama para dibujar las notas
   */
  static inferScaleBaseStep(canonical) {
    if (canonical.startsWith('do')) return 0;  // Do4
    if (canonical.startsWith('re')) return 1;  // Re4
    if (canonical.startsWith('mi')) return 2;  // Mi4
    if (canonical.startsWith('fa')) return 3;  // Fa4
    if (canonical.startsWith('sol')) return 4; // Sol4
    if (canonical.startsWith('la')) return 5;  // La4
    if (canonical.startsWith('si')) return -1; // Si3
    return 0;
  }

  /**
   * Normaliza un banco de preguntas completo
   */
  static parseBank(jsonData) {
    if (!jsonData || !Array.isArray(jsonData.questions)) {
      throw new Error('El archivo JSON debe contener una propiedad "questions" de tipo lista/array.');
    }

    const title = jsonData.title || 'Banco de Preguntas';
    const description = jsonData.description || '';
    const normalizedQuestions = jsonData.questions.map((q, idx) => this.normalizeQuestion(q, idx));

    return {
      title: title,
      description: description,
      version: jsonData.version || '1.0',
      questions: normalizedQuestions
    };
  }
}

window.NoteParser = NoteParser;
