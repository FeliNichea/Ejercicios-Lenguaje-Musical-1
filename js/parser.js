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

const MAJOR_SCALES = [
  { name: 'Do Mayor', tonic: 'Do', alt: '', type: '#', count: 0, steps: [0, 1, 2, 3, 4, 5, 6, 7], accidentalsText: 'Ninguna (0 alteraciones)' },
  // Sostenidos
  { name: 'Sol Mayor', tonic: 'Sol', alt: '', type: '#', count: 1, steps: [4, 5, 6, 7, 8, 9, 10, 11], accidentalsText: '1 sostenido (Fa♯)' },
  { name: 'Re Mayor', tonic: 'Re', alt: '', type: '#', count: 2, steps: [1, 2, 3, 4, 5, 6, 7, 8], accidentalsText: '2 sostenidos (Fa♯, Do♯)' },
  { name: 'La Mayor', tonic: 'La', alt: '', type: '#', count: 3, steps: [5, 6, 7, 8, 9, 10, 11, 12], accidentalsText: '3 sostenidos (Fa♯, Do♯, Sol♯)' },
  { name: 'Mi Mayor', tonic: 'Mi', alt: '', type: '#', count: 4, steps: [2, 3, 4, 5, 6, 7, 8, 9], accidentalsText: '4 sostenidos (Fa♯, Do♯, Sol♯, Re♯)' },
  { name: 'Si Mayor', tonic: 'Si', alt: '', type: '#', count: 5, steps: [-1, 0, 1, 2, 3, 4, 5, 6], accidentalsText: '5 sostenidos (Fa♯, Do♯, Sol♯, Re♯, La♯)' },
  { name: 'Fa sostenido Mayor', tonic: 'Fa', alt: '#', type: '#', count: 6, steps: [3, 4, 5, 6, 7, 8, 9, 10], accidentalsText: '6 sostenidos (Fa♯, Do♯, Sol♯, Re♯, La♯, Mi♯)' },
  { name: 'Do sostenido Mayor', tonic: 'Do', alt: '#', type: '#', count: 7, steps: [0, 1, 2, 3, 4, 5, 6, 7], accidentalsText: '7 sostenidos (Fa♯, Do♯, Sol♯, Re♯, La♯, Mi♯, Si♯)' },
  // Bemoles
  { name: 'Fa Mayor', tonic: 'Fa', alt: '', type: 'b', count: 1, steps: [3, 4, 5, 6, 7, 8, 9, 10], accidentalsText: '1 bemol (Si♭)' },
  { name: 'Si bemol Mayor', tonic: 'Si', alt: 'b', type: 'b', count: 2, steps: [-1, 0, 1, 2, 3, 4, 5, 6], accidentalsText: '2 bemoles (Si♭, Mi♭)' },
  { name: 'Mi bemol Mayor', tonic: 'Mi', alt: 'b', type: 'b', count: 3, steps: [2, 3, 4, 5, 6, 7, 8, 9], accidentalsText: '3 bemoles (Si♭, Mi♭, La♭)' },
  { name: 'La bemol Mayor', tonic: 'La', alt: 'b', type: 'b', count: 4, steps: [5, 6, 7, 8, 9, 10, 11, 12], accidentalsText: '4 bemoles (Si♭, Mi♭, La♭, Re♭)' },
  { name: 'Re bemol Mayor', tonic: 'Re', alt: 'b', type: 'b', count: 5, steps: [1, 2, 3, 4, 5, 6, 7, 8], accidentalsText: '5 bemoles (Si♭, Mi♭, La♭, Re♭, Sol♭)' },
  { name: 'Sol bemol Mayor', tonic: 'Sol', alt: 'b', type: 'b', count: 6, steps: [4, 5, 6, 7, 8, 9, 10, 11], accidentalsText: '6 bemoles (Si♭, Mi♭, La♭, Re♭, Sol♭, Do♭)' },
  { name: 'Do bemol Mayor', tonic: 'Do', alt: 'b', type: 'b', count: 7, steps: [0, 1, 2, 3, 4, 5, 6, 7], accidentalsText: '7 bemoles (Si♭, Mi♭, La♭, Re♭, Sol♭, Do♭, Fa♭)' }
];

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
   * Normaliza un texto de nombre de escala mayor para comparación flexible:
   * "La Mayor", "la mayor", "la sostenido mayor", "la bemol mayor", "La M", "Fa#", etc.
   */
  static normalizeScaleString(str) {
    if (!str) return '';
    let s = str.toString().toLowerCase().trim();
    // Quitar marcas diacríticas/tildes
    s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Normalizar símbolos
    s = s.replace(/♯/g, ' sostenido ').replace(/#/g, ' sostenido ');
    s = s.replace(/♭/g, ' bemol ');
    // Abreviaturas como "sib" -> "si bemol", "mib" -> "mi bemol", "lab" -> "la bemol", etc.
    s = s.replace(/\b(do|re|mi|fa|sol|la|si)b\b/g, '$1 bemol');
    s = s.replace(/\b(do|re|mi|fa|sol|la|si)s\b/g, '$1 sostenido');
    // Quitar palabras auxiliares
    s = s.replace(/\bescala\b/g, '').replace(/\bde\b/g, '').replace(/\bmayor\b/g, '').replace(/\bm\b/g, '');
    // Normalizar espacios
    s = s.replace(/\s+/g, ' ').trim();
    return s;
  }

  /**
   * Busca una escala mayor en el diccionario por nombre o armadura
   */
  static findScale(query) {
    if (!query) return null;
    if (typeof query === 'object') {
      if (query.type !== undefined && query.count !== undefined) {
        return MAJOR_SCALES.find(s => s.type === query.type && s.count === query.count) || null;
      }
      if (query.name) {
        query = query.name;
      }
    }
    const norm = this.normalizeScaleString(query.toString());
    return MAJOR_SCALES.find(s => this.normalizeScaleString(s.name) === norm) || null;
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
      // 1.2: Completar intervalo
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
    } else if (type === 'scale_name' || type === 'scale_identify' || type === 'nombrar_escala') {
      // 2.1: Nombrar escala a partir de armadura
      const keySig = q.keySignature || { type: '#', count: 1 };
      const resolvedScale = this.findScale(q.targetScale || keySig) || MAJOR_SCALES[1];
      const targetName = q.targetScale || resolvedScale.name;
      const scaleSteps = q.scaleSteps || resolvedScale.steps;

      return {
        id: id,
        type: 'scale_name',
        category: q.category || '2.1 Nombrar escala',
        title: q.title || 'Identifica la escala mayor a partir de la armadura',
        prompt: q.prompt || 'Observa la armadura de clave en el pentagrama y escribe el nombre de la escala mayor:',
        instruction: q.instruction || 'Escribe el nombre de la escala (ej: "La Mayor", "Si bemol Mayor", "Fa sostenido Mayor"). No importa si usas mayúsculas o minúsculas.',
        keySignature: {
          type: (keySig.type === 'b' || keySig.type === '♭') ? 'b' : '#',
          count: parseInt(keySig.count, 10) || 0
        },
        targetScale: targetName,
        scaleSteps: scaleSteps,
        explanation: q.explanation || `¡Correcto! La armadura tiene ${resolvedScale.accidentalsText}, correspondiente a la escala de ${resolvedScale.name}.`
      };
    } else if (type === 'scale_build' || type === 'scale_construct' || type === 'construir_armadura') {
      // 2.2: Construir armadura para una escala mayor dada
      const scaleName = q.scaleName || q.targetScale || 'Mi Mayor';
      const resolvedScale = this.findScale(scaleName) || MAJOR_SCALES[4];
      const targetKeySig = q.targetKeySignature || { type: resolvedScale.type, count: resolvedScale.count };
      const scaleSteps = q.scaleSteps || resolvedScale.steps;

      return {
        id: id,
        type: 'scale_build',
        category: q.category || '2.2 Construir armadura',
        title: q.title || 'Construye la armadura de clave de la escala',
        prompt: q.prompt || `Construye la armadura de clave para la escala de <strong>${resolvedScale.name}</strong>:`,
        instruction: q.instruction || 'Selecciona si lleva sostenidos o bemoles y coloca la cantidad exacta en la armadura.',
        scaleName: resolvedScale.name,
        targetKeySignature: targetKeySig,
        scaleSteps: scaleSteps,
        explanation: q.explanation || `¡Correcto! ${resolvedScale.name} lleva ${resolvedScale.accidentalsText}.`
      };
    }
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

NoteParser.MAJOR_SCALES = MAJOR_SCALES;
window.NoteParser = NoteParser;
