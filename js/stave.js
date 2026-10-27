/**
 * Motor de Pentagrama Interactivo para Lenguaje Musical 1
 * Renderizado en SVG puro, sin dependencias externas.
 */

const NOTE_NAMES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
const SEMITONE_OFFSETS = [0, 2, 4, 5, 7, 9, 11]; // Do=0, Re=2, Mi=4, Fa=5, Sol=7, La=9, Si=11

// Posiciones reglamentarias de alteraciones en armadura de clave de Sol (steps diatónicos)
const KEY_SHARP_STEPS = [10, 7, 11, 8, 5, 9, 6]; // Fa5, Do5, Sol5, Re5, La4, Mi5, Si4
const KEY_FLAT_STEPS  = [6, 9, 5, 8, 4, 7, 3];   // Si4, Mi5, La4, Re5, Sol4, Do5, Fa4

class InteractiveStave {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Contenedor #${containerId} no encontrado.`);
    }

    this.options = Object.assign({
      width: 680,
      height: 260,
      topY: 80,
      lineSpacing: 20,
      minStep: -2,  // La3 (2 líneas adicionales inferiores)
      maxStep: 14,  // Do6 (2 líneas adicionales superiores)
      onChange: null // Callback cuando cambia la nota interactiva
    }, options);

    this.mode = 'view'; // 'view', 'interactive', 'scale-identify', 'scale-build'
    this.fixedNotes = []; // Notas mostradas por la pregunta [{step, accidental, label, color}]
    this.interactiveNote = null; // Nota seleccionada por el usuario {step, accidental}
    this.currentAccidental = ''; // '', '#', 'b'
    this.ghostStep = null; // Posición de hover
    this.isHovering = false;
    this.keySignature = { type: '#', count: 0 }; // Armadura de clave activa

    // G-Clef SVG Path oficial (centrado en línea 2 de clave de Sol)
    this.gClefPath = "M 2002,7851 C 1941,7868 1886,7906 1835,7964 C 1784,8023 1759,8088 1759,8158 C 1759,8202 1774,8252 1803,8305 C 1832,8359 1876,8398 1933,8423 C 1952,8427 1961,8437 1961,8451 C 1961,8456 1954,8461 1937,8465 C 1846,8442 1771,8393 1713,8320 C 1655,8246 1625,8162 1623,8066 C 1626,7963 1657,7867 1716,7779 C 1776,7690 1853,7627 1947,7590 L 1878,7235 C 1724,7363 1599,7496 1502,7636 C 1405,7775 1355,7926 1351,8089 C 1353,8162 1368,8233 1396,8301 C 1424,8370 1466,8432 1522,8489 C 1635,8602 1782,8661 1961,8667 C 2022,8663 2087,8652 2157,8634 L 2002,7851 z M 2074,7841 L 2230,8610 C 2384,8548 2461,8413 2461,8207 C 2452,8138 2432,8076 2398,8021 C 2365,7965 2321,7921 2265,7889 C 2209,7857 2146,7841 2074,7841 z M 1869,6801 C 1902,6781 1940,6746 1981,6697 C 2022,6649 2062,6592 2100,6528 C 2139,6463 2170,6397 2193,6330 C 2216,6264 2227,6201 2227,6143 C 2227,6118 2225,6093 2220,6071 C 2216,6035 2205,6007 2186,5988 C 2167,5970 2143,5960 2113,5960 C 2053,5960 1999,5997 1951,6071 C 1914,6135 1883,6211 1861,6297 C 1838,6384 1825,6470 1823,6557 C 1828,6656 1844,6737 1869,6801 z M 1806,6859 C 1761,6697 1736,6532 1731,6364 C 1732,6256 1743,6155 1764,6061 C 1784,5967 1813,5886 1851,5816 C 1888,5746 1931,5693 1979,5657 C 2022,5625 2053,5608 2070,5608 C 2083,5608 2094,5613 2104,5622 C 2114,5631 2127,5646 2143,5666 C 2262,5835 2322,6039 2322,6277 C 2322,6390 2307,6500 2277,6610 C 2248,6719 2205,6823 2148,6920 C 2090,7018 2022,7103 1943,7176 L 2024,7570 C 2068,7565 2098,7561 2115,7561 C 2191,7561 2259,7577 2322,7609 C 2385,7641 2439,7684 2483,7739 C 2527,7793 2561,7855 2585,7925 C 2608,7995 2621,8068 2621,8144 C 2621,8262 2590,8370 2528,8467 C 2466,8564 2373,8635 2248,8681 C 2256,8730 2270,8801 2291,8892 C 2311,8984 2326,9057 2336,9111 C 2346,9165 2350,9217 2350,9268 C 2350,9347 2331,9417 2293,9479 C 2254,9541 2202,9589 2136,9623 C 2071,9657 1999,9674 1921,9674 C 1811,9674 1715,9643 1633,9582 C 1551,9520 1507,9437 1503,9331 C 1506,9284 1517,9240 1537,9198 C 1557,9156 1584,9122 1619,9096 C 1653,9069 1694,9055 1741,9052 C 1780,9052 1817,9063 1852,9084 C 1886,9106 1914,9135 1935,9172 C 1955,9209 1966,9250 1966,9294 C 1966,9353 1946,9403 1906,9444 C 1866,9485 1815,9506 1754,9506 L 1731,9506 C 1770,9566 1834,9597 1923,9597 C 1968,9597 2014,9587 2060,9569 C 2107,9550 2146,9525 2179,9493 C 2212,9461 2234,9427 2243,9391 C 2260,9350 2268,9293 2268,9222 C 2268,9174 2263,9126 2254,9078 C 2245,9031 2231,8968 2212,8890 C 2193,8813 2179,8753 2171,8712 C 2111,8727 2049,8735 1984,8735 C 1875,8735 1772,8713 1675,8668 C 1578,8623 1493,8561 1419,8481 C 1346,8401 1289,8311 1248,8209 C 1208,8108 1187,8002 1186,7892 C 1190,7790 1209,7692 1245,7600 C 1281,7507 1327,7419 1384,7337 C 1441,7255 1500,7180 1561,7113 C 1623,7047 1704,6962 1806,6859 z";

    this.initDOM();
  }

  // Conversión entre paso diatónico y posición Y en el SVG
  // Step 10 = Fa5 (Línea 5 superior) => topY
  // Step 2  = Mi4 (Línea 1 inferior) => topY + 4 * lineSpacing
  // Step 0  = Do4 (Línea adicional inferior) => topY + 5 * lineSpacing
  stepToY(step) {
    const halfSpace = this.options.lineSpacing / 2;
    return this.options.topY + (10 - step) * halfSpace;
  }

  // Conversión inversa: de posición Y del ratón al paso diatónico más cercano
  yToStep(y) {
    const halfSpace = this.options.lineSpacing / 2;
    const rawStep = 10 - (y - this.options.topY) / halfSpace;
    const rounded = Math.round(rawStep);
    return Math.max(this.options.minStep, Math.min(this.options.maxStep, rounded));
  }

  // Obtener info musical de un paso (Nombre, Octava, Posición teórica)
  static stepInfo(step) {
    const octOffset = Math.floor(step / 7);
    const octave = 4 + octOffset;
    const index = ((step % 7) + 7) % 7;
    return {
      name: NOTE_NAMES[index],
      octave: octave,
      step: step,
      diatonicIndex: index
    };
  }

  // Inicializar SVG y listeners
  initDOM() {
    this.container.innerHTML = '';

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
    this.svg.setAttribute('class', 'stave-svg');

    // Capas ordenadas
    this.staveLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.staveLayer.setAttribute('class', 'stave-lines-layer');

    this.clefLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.clefLayer.setAttribute('class', 'clef-layer');

    this.keySignatureLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.keySignatureLayer.setAttribute('class', 'key-signature-layer');

    this.scaleDotsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.scaleDotsLayer.setAttribute('class', 'scale-dots-layer');

    this.notesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.notesLayer.setAttribute('class', 'notes-layer');

    this.ghostLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.ghostLayer.setAttribute('class', 'ghost-layer');

    this.interactionLayer = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.interactionLayer.setAttribute('x', '0');
    this.interactionLayer.setAttribute('y', '0');
    this.interactionLayer.setAttribute('width', this.options.width);
    this.interactionLayer.setAttribute('height', this.options.height);
    this.interactionLayer.setAttribute('fill', 'transparent');
    this.interactionLayer.setAttribute('class', 'interaction-overlay');

    this.svg.appendChild(this.staveLayer);
    this.svg.appendChild(this.clefLayer);
    this.svg.appendChild(this.keySignatureLayer);
    this.svg.appendChild(this.scaleDotsLayer);
    this.svg.appendChild(this.notesLayer);
    this.svg.appendChild(this.ghostLayer);
    this.svg.appendChild(this.interactionLayer);
    this.container.appendChild(this.svg);

    this.bindEvents();
    this.renderBaseStave();
  }

  bindEvents() {
    const getSvgCoords = (e) => {
      const rect = this.svg.getBoundingClientRect();
      const scaleX = this.options.width / rect.width;
      const scaleY = this.options.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    this.interactionLayer.addEventListener('mousemove', (e) => {
      if (this.mode !== 'interactive') return;
      const coords = getSvgCoords(e);
      // La nota interactiva se coloca en x = 340 (segunda nota)
      this.ghostStep = this.yToStep(coords.y);
      this.isHovering = true;
      this.renderGhost();
    });

    this.interactionLayer.addEventListener('mouseleave', () => {
      if (this.mode !== 'interactive') return;
      this.isHovering = false;
      this.renderGhost();
    });

    this.interactionLayer.addEventListener('click', (e) => {
      if (this.mode !== 'interactive') return;
      const coords = getSvgCoords(e);
      const step = this.yToStep(coords.y);
      this.setInteractiveNote(step, this.currentAccidental);
    });

    // Soporte táctil para móviles / tablets
    this.interactionLayer.addEventListener('touchstart', (e) => {
      if (this.mode !== 'interactive') return;
      const touch = e.touches[0];
      const coords = getSvgCoords(touch);
      const step = this.yToStep(coords.y);
      this.setInteractiveNote(step, this.currentAccidental);
      e.preventDefault();
    }, { passive: false });
  }

  // Dibuja las 5 líneas fijas del pentagrama y la clave de Sol
  renderBaseStave() {
    this.staveLayer.innerHTML = '';
    const { topY, lineSpacing, width } = this.options;
    const startX = 30;
    const endX = width - 30;

    // 5 líneas del pentagrama (de arriba hacia abajo: Línea 5 a Línea 1)
    for (let i = 0; i < 5; i++) {
      const lineY = topY + i * lineSpacing;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', startX);
      line.setAttribute('y1', lineY);
      line.setAttribute('x2', endX);
      line.setAttribute('y2', lineY);
      line.setAttribute('stroke', '#334155');
      line.setAttribute('stroke-width', '1.5');
      this.staveLayer.appendChild(line);
    }

    // Barra de compás inicial y final
    const barStart = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    barStart.setAttribute('x1', startX);
    barStart.setAttribute('y1', topY);
    barStart.setAttribute('x2', startX);
    barStart.setAttribute('y2', topY + 4 * lineSpacing);
    barStart.setAttribute('stroke', '#334155');
    barStart.setAttribute('stroke-width', '2');
    this.staveLayer.appendChild(barStart);

    const barEnd = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    barEnd.setAttribute('x1', endX);
    barEnd.setAttribute('y1', topY);
    barEnd.setAttribute('x2', endX);
    barEnd.setAttribute('y2', topY + 4 * lineSpacing);
    barEnd.setAttribute('stroke', '#334155');
    barEnd.setAttribute('stroke-width', '2');
    this.staveLayer.appendChild(barEnd);

    // Clave de Sol (G-clef) centrada matemáticamente en la línea 2 (Sol4, y = topY + 3*lineSpacing)
    this.clefLayer.innerHTML = '';
    const clefG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const yLine2 = topY + 3 * lineSpacing;
    const clefX = 60;
    const scale = (lineSpacing / 590.5) * 1.05;

    clefG.setAttribute('transform', `translate(${clefX}, ${yLine2}) scale(${scale}) translate(-1900, -8149)`);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', this.gClefPath);
    path.setAttribute('fill', '#0f172a');
    clefG.appendChild(path);
    this.clefLayer.appendChild(clefG);
  }

  // Dibuja una nota completa (cabeza, plica, líneas adicionales, alteración)
  drawNote(group, { x, step, accidental = '', color = '#0f172a', opacity = 1.0, isGhost = false }) {
    const y = this.stepToY(step);
    const { topY, lineSpacing } = this.options;
    const noteG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    if (opacity < 1.0) {
      noteG.setAttribute('opacity', opacity.toString());
    }

    // 1. Líneas adicionales (Ledger lines)
    // Hacia abajo: step <= 0 (Do4, Si3, La3...)
    if (step <= 0) {
      // Líneas pares: 0 (Do4), -2 (La3), etc.
      const lowestEven = (step % 2 === 0) ? step : (step + 1);
      for (let s = 0; s >= lowestEven; s -= 2) {
        const ly = this.stepToY(s);
        const lLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        lLine.setAttribute('x1', x - 18);
        lLine.setAttribute('y1', ly);
        lLine.setAttribute('x2', x + 18);
        lLine.setAttribute('y2', ly);
        lLine.setAttribute('stroke', color);
        lLine.setAttribute('stroke-width', '1.8');
        if (isGhost) lLine.setAttribute('stroke-dasharray', '4 2');
        noteG.appendChild(lLine);
      }
    }
    // Hacia arriba: step >= 12 (La5, Si5, Do6...)
    if (step >= 12) {
      const highestEven = (step % 2 === 0) ? step : (step - 1);
      for (let s = 12; s <= highestEven; s += 2) {
        const ly = this.stepToY(s);
        const lLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        lLine.setAttribute('x1', x - 18);
        lLine.setAttribute('y1', ly);
        lLine.setAttribute('x2', x + 18);
        lLine.setAttribute('y2', ly);
        lLine.setAttribute('stroke', color);
        lLine.setAttribute('stroke-width', '1.8');
        if (isGhost) lLine.setAttribute('stroke-dasharray', '4 2');
        noteG.appendChild(lLine);
      }
    }

    // 2. Cabeza de la nota (elipse inclinada -20°)
    const head = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    head.setAttribute('cx', x);
    head.setAttribute('cy', y);
    head.setAttribute('rx', '9.0');
    head.setAttribute('ry', '6.5');
    head.setAttribute('transform', `rotate(-20 ${x} ${y})`);
    head.setAttribute('fill', color);
    noteG.appendChild(head);

    // 3. Plica (Stem)
    const stem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const stemLength = 44;
    if (step < 6) {
      stem.setAttribute('x1', x + 8.0);
      stem.setAttribute('y1', y - 1);
      stem.setAttribute('x2', x + 8.0);
      stem.setAttribute('y2', y - stemLength);
    } else {
      stem.setAttribute('x1', x - 8.0);
      stem.setAttribute('y1', y + 1);
      stem.setAttribute('x2', x - 8.0);
      stem.setAttribute('y2', y + stemLength);
    }
    stem.setAttribute('stroke', color);
    stem.setAttribute('stroke-width', '2.0');
    noteG.appendChild(stem);

    // 4. Alteración gráfica (Accidental)
    if (accidental) {
      this.drawAccidental(noteG, x - 26, y, accidental, color);
    }

    group.appendChild(noteG);
  }

  // Dibuja la alteración musical (♯, ♭, ♮) mediante vectores precisos
  drawAccidental(parentGroup, x, y, accidental, color) {
    const accG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    if (accidental === '#') {
      // Sostenido ♯
      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line1.setAttribute('x1', x - 5.5); line1.setAttribute('y1', y - 17);
      line1.setAttribute('x2', x - 5.5); line1.setAttribute('y2', y + 17);
      line1.setAttribute('stroke', color); line1.setAttribute('stroke-width', '1.8');

      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line2.setAttribute('x1', x + 5.5); line2.setAttribute('y1', y - 15);
      line2.setAttribute('x2', x + 5.5); line2.setAttribute('y2', y + 19);
      line2.setAttribute('stroke', color); line2.setAttribute('stroke-width', '1.8');

      const bar1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      bar1.setAttribute('x1', x - 11); bar1.setAttribute('y1', y - 2);
      bar1.setAttribute('x2', x + 11); bar1.setAttribute('y2', y - 7);
      bar1.setAttribute('stroke', color); bar1.setAttribute('stroke-width', '3.4');

      const bar2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      bar2.setAttribute('x1', x - 11); bar2.setAttribute('y1', y + 7);
      bar2.setAttribute('x2', x + 11); bar2.setAttribute('y2', y + 2);
      bar2.setAttribute('stroke', color); bar2.setAttribute('stroke-width', '3.4');

      accG.appendChild(line1);
      accG.appendChild(line2);
      accG.appendChild(bar1);
      accG.appendChild(bar2);
    } else if (accidental === 'b') {
      // Bemol ♭
      const stem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      stem.setAttribute('x1', x - 5); stem.setAttribute('y1', y - 22);
      stem.setAttribute('x2', x - 5); stem.setAttribute('y2', y + 8);
      stem.setAttribute('stroke', color); stem.setAttribute('stroke-width', '2.0');

      const belly = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      belly.setAttribute('d', `M ${x - 5} ${y + 8} C ${x + 6} ${y + 7} ${x + 7} ${y - 1} ${x + 2} ${y - 6} C ${x - 2} ${y - 10} ${x - 5} ${y - 6} ${x - 5} ${y - 6} Z`);
      belly.setAttribute('fill', color);
      belly.setAttribute('stroke', color);
      belly.setAttribute('stroke-width', '0.6');

      accG.appendChild(stem);
      accG.appendChild(belly);
    } else if (accidental === 'n') {
      // Becuadro ♮
      const v1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      v1.setAttribute('x1', x - 5); v1.setAttribute('y1', y - 18);
      v1.setAttribute('x2', x - 5); v1.setAttribute('y2', y + 8);
      v1.setAttribute('stroke', color); v1.setAttribute('stroke-width', '2.0');

      const v2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      v2.setAttribute('x1', x + 5); v2.setAttribute('y1', y - 8);
      v2.setAttribute('x2', x + 5); v2.setAttribute('y2', y + 18);
      v2.setAttribute('stroke', color); v2.setAttribute('stroke-width', '2.0');

      const h1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      h1.setAttribute('x1', x - 5); h1.setAttribute('y1', y - 6);
      h1.setAttribute('x2', x + 5); h1.setAttribute('y2', y - 3);
      h1.setAttribute('stroke', color); h1.setAttribute('stroke-width', '2.8');

      const h2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      h2.setAttribute('x1', x - 5); h2.setAttribute('y1', y + 5);
      h2.setAttribute('x2', x + 5); h2.setAttribute('y2', y + 8);
      h2.setAttribute('stroke', color); h2.setAttribute('stroke-width', '2.8');

      accG.appendChild(v1);
      accG.appendChild(v2);
      accG.appendChild(h1);
      accG.appendChild(h2);
    }

    parentGroup.appendChild(accG);
  }

  // Renderizar las notas fijas del pentagrama
  renderNotes() {
    this.notesLayer.innerHTML = '';

    // Dibujar notas fijas
    this.fixedNotes.forEach(note => {
      this.drawNote(this.notesLayer, {
        x: note.x || 240,
        step: note.step,
        accidental: note.accidental || '',
        color: note.color || '#0f172a'
      });
    });

    // Dibujar nota colocada por el usuario (si existe)
    if (this.interactiveNote !== null) {
      this.drawNote(this.notesLayer, {
        x: 420,
        step: this.interactiveNote.step,
        accidental: this.interactiveNote.accidental,
        color: '#2563eb' // Azul distintivo para la nota del estudiante
      });
    }
  }

  // Renderizar la "Nota Fantasma" que acompaña al ratón
  renderGhost() {
    this.ghostLayer.innerHTML = '';
    if (!this.isHovering || this.ghostStep === null || this.mode !== 'interactive') {
      return;
    }

    this.drawNote(this.ghostLayer, {
      x: 420,
      step: this.ghostStep,
      accidental: this.currentAccidental,
      color: '#3b82f6',
      opacity: 0.45,
      isGhost: true
    });
  }

  // Configurar para modo 'view' (Pregunta 1.1: Clasificar)
  setViewMode(notes) {
    this.mode = 'view';
    this.fixedNotes = notes || [];
    this.interactiveNote = null;
    this.ghostStep = null;
    this.isHovering = false;
    this.clearScaleDots();
    this.clearKeySignature();
    this.interactionLayer.style.cursor = 'default';
    this.renderNotes();
    this.renderGhost();
  }

  // Configurar para modo 'interactive' (Pregunta 1.2: Completar)
  setInteractiveMode(baseNote, defaultAnswer = null) {
    this.mode = 'interactive';
    this.fixedNotes = [Object.assign({ x: 240, color: '#0f172a' }, baseNote)];
    this.interactiveNote = defaultAnswer ? Object.assign({}, defaultAnswer) : null;
    this.currentAccidental = defaultAnswer ? (defaultAnswer.accidental || '') : '';
    this.ghostStep = null;
    this.isHovering = false;
    this.clearScaleDots();
    this.clearKeySignature();
    this.interactionLayer.style.cursor = 'pointer';
    this.renderNotes();
    this.renderGhost();

    if (this.options.onChange) {
      this.options.onChange(this.interactiveNote);
    }
  }

  // Configurar para modo 2.1: Identificar Escala Mayor
  setScaleIdentifyMode(keySignature) {
    this.mode = 'scale-identify';
    this.fixedNotes = [];
    this.interactiveNote = null;
    this.ghostStep = null;
    this.isHovering = false;
    this.clearScaleDots();
    this.setKeySignature(keySignature ? keySignature.type : '#', keySignature ? keySignature.count : 0);
    this.interactionLayer.style.cursor = 'default';
    this.renderNotes();
    this.renderGhost();
  }

  // Configurar para modo 2.2: Construir Armadura de Clave
  setScaleBuildMode(type = '#', count = 0) {
    this.mode = 'scale-build';
    this.fixedNotes = [];
    this.interactiveNote = null;
    this.ghostStep = null;
    this.isHovering = false;
    this.clearScaleDots();
    this.setKeySignature(type, count);
    this.interactionLayer.style.cursor = 'default';
    this.renderNotes();
    this.renderGhost();
  }

  // ==================== GESTIÓN DE ARMADURAS DE CLAVE ====================

  setKeySignature(type = '#', count = 0) {
    this.keySignature = {
      type: type === 'b' ? 'b' : '#',
      count: Math.max(0, Math.min(7, count))
    };
    this.renderKeySignature();
    return this.keySignature;
  }

  addKeyAccidental() {
    if (this.keySignature.count < 7) {
      this.keySignature.count++;
      this.renderKeySignature();
    }
    return this.keySignature;
  }

  removeKeyAccidental() {
    if (this.keySignature.count > 0) {
      this.keySignature.count--;
      this.renderKeySignature();
    }
    return this.keySignature;
  }

  clearKeySignature() {
    this.keySignature.count = 0;
    this.renderKeySignature();
    return this.keySignature;
  }

  renderKeySignature() {
    this.keySignatureLayer.innerHTML = '';
    if (!this.keySignature || this.keySignature.count <= 0) return;

    const steps = this.keySignature.type === '#' ? KEY_SHARP_STEPS : KEY_FLAT_STEPS;
    const count = this.keySignature.count;
    const startX = 110;
    const dx = 15;

    for (let i = 0; i < count; i++) {
      const x = startX + i * dx;
      const step = steps[i];
      const y = this.stepToY(step);
      this.drawAccidental(this.keySignatureLayer, x, y, this.keySignature.type, '#0f172a');
    }
  }

  getKeySignature() {
    return Object.assign({}, this.keySignature);
  }

  // ==================== PUNTOS NEGROS DE ESCALA (2.1) ====================

  showScaleDots(baseStep = 0) {
    this.scaleDotsLayer.innerHTML = '';
    const startX = 230;
    const endX = 610;
    const dx = (endX - startX) / 7;

    for (let i = 0; i < 8; i++) {
      const step = baseStep + i;
      const x = startX + i * dx;
      const y = this.stepToY(step);
      const dotG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      // Líneas adicionales necesarias
      if (step <= 0) {
        const lowestEven = (step % 2 === 0) ? step : (step + 1);
        for (let s = 0; s >= lowestEven; s -= 2) {
          const ly = this.stepToY(s);
          const lLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          lLine.setAttribute('x1', x - 13);
          lLine.setAttribute('y1', ly);
          lLine.setAttribute('x2', x + 13);
          lLine.setAttribute('y2', ly);
          lLine.setAttribute('stroke', '#0f172a');
          lLine.setAttribute('stroke-width', '1.8');
          dotG.appendChild(lLine);
        }
      }
      if (step >= 12) {
        const highestEven = (step % 2 === 0) ? step : (step - 1);
        for (let s = 12; s <= highestEven; s -= 2) {
          const ly = this.stepToY(s);
          const lLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          lLine.setAttribute('x1', x - 13);
          lLine.setAttribute('y1', ly);
          lLine.setAttribute('x2', x + 13);
          lLine.setAttribute('y2', ly);
          lLine.setAttribute('stroke', '#0f172a');
          lLine.setAttribute('stroke-width', '1.8');
          dotG.appendChild(lLine);
        }
      }

      // Punto negro sólido (sin figura estándar)
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '6.5');
      circle.setAttribute('fill', '#0f172a');
      dotG.appendChild(circle);

      // Nombre de la nota debajo para claridad pedagógica
      const info = InteractiveStave.stepInfo(step);
      const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelText.setAttribute('x', x);
      labelText.setAttribute('y', '215');
      labelText.setAttribute('font-size', '12');
      labelText.setAttribute('font-weight', '700');
      labelText.setAttribute('text-anchor', 'middle');
      labelText.setAttribute('fill', '#475569');
      labelText.textContent = info.name;
      dotG.appendChild(labelText);

      this.scaleDotsLayer.appendChild(dotG);
    }
  }

  clearScaleDots() {
    if (this.scaleDotsLayer) {
      this.scaleDotsLayer.innerHTML = '';
    }
  }

  // Fijar la alteración activa para la nota del usuario
  setAccidental(acc) {
    this.currentAccidental = acc;
    if (this.interactiveNote) {
      this.interactiveNote.accidental = acc;
      this.renderNotes();
      if (this.options.onChange) {
        this.options.onChange(this.interactiveNote);
      }
    }
    if (this.isHovering) {
      this.renderGhost();
    }
  }

  // Fijar la nota colocada por el usuario
  setInteractiveNote(step, accidental = '') {
    this.interactiveNote = {
      step: step,
      accidental: accidental
    };
    this.renderNotes();
    if (this.options.onChange) {
      this.options.onChange(this.interactiveNote);
    }
  }

  // Borrar nota interactiva
  clearInteractiveNote() {
    this.interactiveNote = null;
    this.renderNotes();
    if (this.options.onChange) {
      this.options.onChange(null);
    }
  }

  // Obtener la respuesta actual del usuario
  getUserAnswer() {
    return this.interactiveNote;
  }
}
