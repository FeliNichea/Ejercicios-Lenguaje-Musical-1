/**
 * Lógica principal del Cuestionario de Lenguaje Musical 1
 */

class QuizApp {
  constructor() {
    this.bankTitle = 'Lenguaje Musical 1';
    this.questions = [];
    this.filteredQuestions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.answersLog = [];
    this.activeFilter = 'all'; // 'all', 'classify', 'complete'
    this.stave = null;
    this.currentQuestionAnswered = false;

    this.cacheDOM();
    this.initStave();
    this.bindEvents();
    this.loadInitialBank();
  }

  cacheDOM() {
    // Encabezado y acciones de archivo
    this.loadJsonBtn = document.getElementById('load-json-btn');
    this.jsonFileInput = document.getElementById('json-file-input');
    this.bankTagEl = document.getElementById('bank-tag');

    // Encabezado y progreso
    this.questionCounterEl = document.getElementById('question-counter');
    this.scoreCounterEl = document.getElementById('score-counter');
    this.progressBarEl = document.getElementById('progress-bar-fill');
    this.categoryBadgeEl = document.getElementById('category-badge');

    // Pregunta
    this.questionTitleEl = document.getElementById('question-title');
    this.questionPromptEl = document.getElementById('question-prompt');
    this.questionInstructionEl = document.getElementById('question-instruction');

    // Paneles de interacción Tipo 1 (Intervalos)
    this.optionsContainerEl = document.getElementById('options-container');
    this.interactiveControlsEl = document.getElementById('interactive-controls');
    this.selectedNoteInfoEl = document.getElementById('selected-note-info');
    this.confirmBtnEl = document.getElementById('confirm-answer-btn');

    // Paneles de interacción Tipo 2.1 (Identificar Escala)
    this.scaleIdentifyControlsEl = document.getElementById('scale-identify-controls');
    this.scaleNameInputEl = document.getElementById('scale-name-input');
    this.checkScaleBtnEl = document.getElementById('check-scale-btn');
    this.scaleFormEl = document.getElementById('scale-form');

    // Paneles de interacción Tipo 2.2 (Construir Armadura)
    this.scaleBuildControlsEl = document.getElementById('scale-build-controls');
    this.keyTypeButtons = document.querySelectorAll('.key-type-btn');
    this.addKeyAccBtn = document.getElementById('add-key-acc-btn');
    this.removeKeyAccBtn = document.getElementById('remove-key-acc-btn');
    this.clearKeyAccBtn = document.getElementById('clear-key-acc-btn');
    this.armaduraStatusTextEl = document.getElementById('armadura-status-text');
    this.confirmArmaduraBtnEl = document.getElementById('confirm-armadura-btn');
    this.userKeySig = { type: '#', count: 0 };

    // Botones de alteraciones
    this.accidentalButtons = document.querySelectorAll('.accidental-btn');

    // Feedback y siguiente
    this.feedbackContainerEl = document.getElementById('feedback-container');
    this.feedbackBadgeEl = document.getElementById('feedback-badge');
    this.feedbackTextEl = document.getElementById('feedback-text');
    this.nextBtnEl = document.getElementById('next-question-btn');

    // Pantalla de resultados
    this.quizCardEl = document.getElementById('quiz-card');
    this.resultsCardEl = document.getElementById('results-card');
    this.resultsScoreEl = document.getElementById('results-score');
    this.resultsPercentEl = document.getElementById('results-percent');
    this.resultsMessageEl = document.getElementById('results-message');
    this.restartBtnEl = document.getElementById('restart-btn');

    // Selector de modo / filtro
    this.filterButtons = document.querySelectorAll('.filter-pill');

    // Botones de zoom lateral del pentagrama
    this.zoomInBtn = document.getElementById('zoom-in-btn');
    this.zoomOutBtn = document.getElementById('zoom-out-btn');
    this.zoomScales = [0.75, 0.9, 1.05, 1.25, 1.5, 1.8];
    this.currentZoomIndex = 2; // Default: 1.05 (aprox. 714px)

    const savedZoom = localStorage.getItem('staveZoomIndex');
    if (savedZoom !== null) {
      const parsed = parseInt(savedZoom, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < this.zoomScales.length) {
        this.currentZoomIndex = parsed;
      }
    }
    this.applyStaveZoom();
  }

  async loadInitialBank() {
    // Intentar cargar data/questions.json vía fetch (cuando hay servidor HTTP)
    try {
      const response = await fetch('data/questions.json');
      if (response.ok) {
        const data = await response.json();
        this.setQuestionBank(data);
        return;
      }
    } catch (e) {
      // Entorno file:// o fetch no disponible; se usa respaldo local
    }

    // Respaldo para doble clic directo en index.html
    if (window.DEFAULT_QUESTIONS_DATA) {
      this.setQuestionBank(window.DEFAULT_QUESTIONS_DATA);
    } else if (typeof SAMPLE_QUESTIONS !== 'undefined') {
      this.setQuestionBank({
        title: 'Lenguaje Musical 1',
        questions: SAMPLE_QUESTIONS
      });
    }
  }

  setQuestionBank(rawBank) {
    try {
      const bank = NoteParser.parseBank(rawBank);
      this.bankTitle = bank.title;
      this.questions = bank.questions;

      if (this.bankTagEl) {
        this.bankTagEl.textContent = bank.title;
        this.bankTagEl.title = `${bank.title} (${bank.questions.length} preguntas)`;
      }

      this.updateFilterPills();
      this.setFilter(this.activeFilter);
    } catch (err) {
      console.error('Error al configurar el banco:', err);
      alert(`Error al procesar el banco de preguntas: ${err.message}`);
    }
  }

  updateFilterPills() {
    const total = this.questions.length;
    const classifyCount = this.questions.filter(q => q.type === 'classify').length;
    const completeCount = this.questions.filter(q => q.type === 'complete').length;
    const scaleIdentifyCount = this.questions.filter(q => q.type === 'scale-identify').length;
    const scaleBuildCount = this.questions.filter(q => q.type === 'scale-build').length;

    this.filterButtons.forEach(btn => {
      const filter = btn.dataset.filter;
      if (filter === 'all') {
        btn.textContent = `Todas (${total})`;
      } else if (filter === 'classify') {
        btn.textContent = `1.1 Clasificar (${classifyCount})`;
        btn.style.display = classifyCount > 0 ? '' : 'none';
      } else if (filter === 'complete') {
        btn.textContent = `1.2 Completar (${completeCount})`;
        btn.style.display = completeCount > 0 ? '' : 'none';
      } else if (filter === 'scale-identify') {
        btn.textContent = `2.1 Identificar Escala (${scaleIdentifyCount})`;
        btn.style.display = scaleIdentifyCount > 0 ? '' : 'none';
      } else if (filter === 'scale-build') {
        btn.textContent = `2.2 Construir Armadura (${scaleBuildCount})`;
        btn.style.display = scaleBuildCount > 0 ? '' : 'none';
      }
    });
  }

  handleFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        this.setQuestionBank(json);
      } catch (err) {
        alert(`Error al leer el archivo JSON: ${err.message}`);
      }
    };
    reader.onerror = () => {
      alert('No se pudo leer el archivo seleccionado.');
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  initStave() {
    this.stave = new InteractiveStave('stave-container', {
      onChange: (note) => this.handleStaveChange(note)
    });
  }

  bindEvents() {
    // Botones de alteraciones
    this.accidentalButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.currentQuestionAnswered) return;
        const acc = btn.dataset.accidental;
        this.accidentalButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.stave.setAccidental(acc);
      });
    });

    // Botón confirmar respuesta interactiva
    this.confirmBtnEl.addEventListener('click', () => {
      if (this.currentQuestionAnswered) return;
      this.evaluateInteractiveAnswer();
    });

    // Botón siguiente pregunta
    this.nextBtnEl.addEventListener('click', () => {
      this.goToNextQuestion();
    });

    // Botón reiniciar
    this.restartBtnEl.addEventListener('click', () => {
      this.restartQuiz();
    });

    // Tipo 2.1: Comprobar escala ingresada
    if (this.checkScaleBtnEl) {
      this.checkScaleBtnEl.addEventListener('click', () => {
        if (this.currentQuestionAnswered) return;
        this.evaluateScaleIdentifyAnswer();
      });
    }
    if (this.scaleFormEl) {
      this.scaleFormEl.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.currentQuestionAnswered) return;
        this.evaluateScaleIdentifyAnswer();
      });
    }

    // Tipo 2.2: Construir armadura
    this.keyTypeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.currentQuestionAnswered) return;
        const type = btn.dataset.type;
        this.keyTypeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Al cambiar de tipo, se reinicia la armadura creada anteriormente
        this.userKeySig = { type: type, count: 0 };
        this.stave.setKeySignature(type, 0);
        this.updateArmaduraStatusText();
      });
    });

    if (this.addKeyAccBtn) {
      this.addKeyAccBtn.addEventListener('click', () => {
        if (this.currentQuestionAnswered) return;
        if (this.userKeySig.count < 7) {
          this.userKeySig.count++;
          this.stave.setKeySignature(this.userKeySig.type, this.userKeySig.count);
          this.updateArmaduraStatusText();
        }
      });
    }

    if (this.removeKeyAccBtn) {
      this.removeKeyAccBtn.addEventListener('click', () => {
        if (this.currentQuestionAnswered) return;
        if (this.userKeySig.count > 0) {
          this.userKeySig.count--;
          this.stave.setKeySignature(this.userKeySig.type, this.userKeySig.count);
          this.updateArmaduraStatusText();
        }
      });
    }

    if (this.clearKeyAccBtn) {
      this.clearKeyAccBtn.addEventListener('click', () => {
        if (this.currentQuestionAnswered) return;
        this.userKeySig.count = 0;
        this.stave.clearKeySignature();
        this.updateArmaduraStatusText();
      });
    }

    if (this.confirmArmaduraBtnEl) {
      this.confirmArmaduraBtnEl.addEventListener('click', () => {
        if (this.currentQuestionAnswered) return;
        this.evaluateScaleBuildAnswer();
      });
    }

    // Carga de archivo JSON
    if (this.loadJsonBtn && this.jsonFileInput) {
      this.loadJsonBtn.addEventListener('click', () => {
        this.jsonFileInput.click();
      });

      this.jsonFileInput.addEventListener('change', (e) => {
        this.handleFileSelect(e);
      });
    }

    // Filtros de tipo de ejercicio
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        this.setFilter(filter);
      });
    });

    // Botones de zoom para agrandar y achicar el pentagrama
    if (this.zoomInBtn && this.zoomOutBtn) {
      this.zoomInBtn.addEventListener('click', () => {
        if (this.currentZoomIndex < this.zoomScales.length - 1) {
          this.currentZoomIndex++;
          this.applyStaveZoom();
        }
      });

      this.zoomOutBtn.addEventListener('click', () => {
        if (this.currentZoomIndex > 0) {
          this.currentZoomIndex--;
          this.applyStaveZoom();
        }
      });
    }
  }

  applyStaveZoom() {
    const scale = this.zoomScales[this.currentZoomIndex];
    document.documentElement.style.setProperty('--stave-scale', scale.toString());

    if (this.zoomOutBtn) {
      this.zoomOutBtn.disabled = (this.currentZoomIndex === 0);
      this.zoomOutBtn.title = `Achicar pentagrama (${Math.round(scale * 100)}%)`;
    }
    if (this.zoomInBtn) {
      this.zoomInBtn.disabled = (this.currentZoomIndex === this.zoomScales.length - 1);
      this.zoomInBtn.title = `Agrandar pentagrama (${Math.round(scale * 100)}%)`;
    }

    try {
      localStorage.setItem('staveZoomIndex', this.currentZoomIndex.toString());
    } catch (e) {
      // Ignorar en caso de restricciones de almacenamiento local
    }
  }

  setFilter(filter) {
    this.activeFilter = filter;
    this.filterButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.filter === filter);
    });

    if (filter === 'all') {
      this.filteredQuestions = [...this.questions];
    } else {
      this.filteredQuestions = this.questions.filter(q => q.type === filter);
    }

    this.restartQuiz();
  }

  restartQuiz() {
    this.currentIndex = 0;
    this.score = 0;
    this.answersLog = [];
    this.quizCardEl.classList.remove('hidden');
    this.resultsCardEl.classList.add('hidden');
    this.loadQuestion(0);
  }

  loadQuestion(index) {
    if (!this.filteredQuestions || this.filteredQuestions.length === 0) {
      this.questionTitleEl.textContent = 'No hay preguntas disponibles';
      this.questionPromptEl.innerHTML = 'El banco seleccionado no tiene preguntas que coincidan con este filtro.';
      this.questionInstructionEl.style.display = 'none';
      this.optionsContainerEl.classList.add('hidden');
      this.interactiveControlsEl.classList.add('hidden');
      this.feedbackContainerEl.classList.add('hidden');
      this.nextBtnEl.classList.add('hidden');
      this.questionCounterEl.textContent = '0 de 0';
      this.progressBarEl.style.width = '0%';
      return;
    }

    this.currentIndex = index;
    this.currentQuestionAnswered = false;
    const q = this.filteredQuestions[index];

    // Actualizar encabezado
    this.questionCounterEl.textContent = `Pregunta ${index + 1} de ${this.filteredQuestions.length}`;
    this.scoreCounterEl.textContent = `Puntaje: ${this.score}`;
    const progressPct = ((index) / this.filteredQuestions.length) * 100;
    this.progressBarEl.style.width = `${progressPct}%`;

    // Cargar textos
    this.categoryBadgeEl.textContent = q.category;
    this.questionTitleEl.textContent = q.title;
    this.questionPromptEl.innerHTML = q.prompt;
    this.questionInstructionEl.innerHTML = q.instruction || '';
    this.questionInstructionEl.style.display = q.instruction ? 'block' : 'none';

    // Ocultar feedback y siguiente
    this.feedbackContainerEl.classList.add('hidden');
    this.feedbackContainerEl.classList.remove('correct', 'incorrect');
    this.nextBtnEl.classList.add('hidden');

    // Reset de botones de alteración
    this.accidentalButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.accidental === '');
    });

    if (q.type === 'classify') {
      // Modo Clasificar (1.1)
      this.optionsContainerEl.classList.remove('hidden');
      this.interactiveControlsEl.classList.add('hidden');

      this.stave.setViewMode(q.notes);
      this.renderMultipleChoiceOptions(q.options, q.correctAnswer);
    } else if (q.type === 'complete') {
      // Modo Completar (1.2)
      this.optionsContainerEl.classList.add('hidden');
      this.interactiveControlsEl.classList.remove('hidden');

      this.confirmBtnEl.disabled = true;
      this.updateSelectedNoteLabel(null);
      this.stave.setInteractiveMode(q.baseNote);
    }
  }

  renderMultipleChoiceOptions(options, correctAnswer) {
    this.optionsContainerEl.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        if (this.currentQuestionAnswered) return;
        this.evaluateClassifyAnswer(opt, correctAnswer, btn);
      });
      this.optionsContainerEl.appendChild(btn);
    });
  }

  evaluateClassifyAnswer(selectedOption, correctAnswer, clickedBtn) {
    this.currentQuestionAnswered = true;
    const isCorrect = (selectedOption === correctAnswer);
    const q = this.filteredQuestions[this.currentIndex];

    // Marcar botones
    const allBtns = this.optionsContainerEl.querySelectorAll('.option-btn');
    allBtns.forEach(btn => {
      btn.disabled = true;
      if (btn.textContent === correctAnswer) {
        btn.classList.add('correct');
      } else if (btn === clickedBtn && !isCorrect) {
        btn.classList.add('incorrect');
      }
    });

    if (isCorrect) {
      this.score += 10;
      this.scoreCounterEl.textContent = `Puntaje: ${this.score}`;
      this.showFeedback(true, q.explanation);
    } else {
      this.showFeedback(false, `Seleccionaste <strong>${selectedOption}</strong>. La opción correcta es <strong>${correctAnswer}</strong>.<br>${q.explanation}`);
    }

    this.answersLog.push({ questionId: q.id, isCorrect });
    this.nextBtnEl.classList.remove('hidden');
  }

  handleStaveChange(note) {
    if (!note) {
      this.confirmBtnEl.disabled = true;
      this.updateSelectedNoteLabel(null);
      return;
    }

    this.confirmBtnEl.disabled = false;
    this.updateSelectedNoteLabel(note);
  }

  updateSelectedNoteLabel(note) {
    if (!note) {
      this.selectedNoteInfoEl.innerHTML = 'Nota colocada: <span class="placeholder">Ninguna (haz clic en el pentagrama)</span>';
      return;
    }

    const info = InteractiveStave.stepInfo(note.step);
    let accSym = '';
    if (note.accidental === '#') accSym = ' ♯ (sostenido)';
    else if (note.accidental === 'b') accSym = ' ♭ (bemol)';
    else if (note.accidental === 'n') accSym = ' ♮ (natural)';

    // Explicación de ubicación (línea o espacio)
    let posDesc = '';
    if (note.step === 0) posDesc = '1ra línea adicional inferior';
    else if (note.step === 1) posDesc = 'espacio inferior';
    else if (note.step === 2) posDesc = '1ra línea';
    else if (note.step === 3) posDesc = '1er espacio';
    else if (note.step === 4) posDesc = '2da línea';
    else if (note.step === 5) posDesc = '2do espacio';
    else if (note.step === 6) posDesc = '3ra línea';
    else if (note.step === 7) posDesc = '3er espacio';
    else if (note.step === 8) posDesc = '4ta línea';
    else if (note.step === 9) posDesc = '4to espacio';
    else if (note.step === 10) posDesc = '5ta línea';
    else if (note.step === 11) posDesc = 'espacio superior';
    else if (note.step >= 12) posDesc = 'línea adicional superior';

    this.selectedNoteInfoEl.innerHTML = `Nota colocada: <strong>${info.name}${note.octave}${accSym}</strong> <span class="pos-badge">(${posDesc})</span>`;
  }

  evaluateInteractiveAnswer() {
    this.currentQuestionAnswered = true;
    const userAnswer = this.stave.getUserAnswer();
    const q = this.filteredQuestions[this.currentIndex];
    const target = q.targetSolution;

    this.confirmBtnEl.disabled = true;

    // Normalizar accidental (vacío equivale a natural)
    const userAcc = (userAnswer.accidental === 'n' || !userAnswer.accidental) ? '' : userAnswer.accidental;
    const targetAcc = (target.accidental === 'n' || !target.accidental) ? '' : target.accidental;

    const stepMatches = (userAnswer.step === target.step);
    const accidentalMatches = (userAcc === targetAcc);
    const isCorrect = stepMatches && accidentalMatches;

    const userNoteInfo = InteractiveStave.stepInfo(userAnswer.step);
    const userFullLabel = `${userNoteInfo.name}${userAcc === '#' ? '♯' : (userAcc === 'b' ? '♭' : '')}${userNoteInfo.octave}`;

    if (isCorrect) {
      this.score += 10;
      this.scoreCounterEl.textContent = `Puntaje: ${this.score}`;
      this.showFeedback(true, `¡Excelente! Colocaste <strong>${target.label}</strong> correctamente.<br>${q.explanation}`);
    } else {
      let pedagogicalDetail = '';
      if (!stepMatches) {
        pedagogicalDetail = `Colocaste la nota en <strong>${userFullLabel}</strong> (posición diatónica incorrecta). Para formar el intervalo pedido (${q.targetInterval}), la nota debe llamarse <strong>${target.label}</strong>.`;
      } else if (!accidentalMatches) {
        pedagogicalDetail = `Ubicaste la nota en la altura correcta (${userNoteInfo.name}), pero la alteración no es la adecuada. Colocaste <strong>${userFullLabel}</strong> en lugar de <strong>${target.label}</strong>.`;
      }
      this.showFeedback(false, `${pedagogicalDetail}<br><br>${q.explanation}`);
    }

    this.answersLog.push({ questionId: q.id, isCorrect });
    this.nextBtnEl.classList.remove('hidden');
  }

  showFeedback(isCorrect, message) {
    this.feedbackContainerEl.classList.remove('hidden', 'correct', 'incorrect');
    this.feedbackContainerEl.classList.add(isCorrect ? 'correct' : 'incorrect');

    this.feedbackBadgeEl.textContent = isCorrect ? '¡Correcto!' : 'Respuesta incorrecta';
    this.feedbackBadgeEl.className = `feedback-badge ${isCorrect ? 'badge-success' : 'badge-danger'}`;
    this.feedbackTextEl.innerHTML = message;
  }

  goToNextQuestion() {
    if (this.currentIndex + 1 < this.filteredQuestions.length) {
      this.loadQuestion(this.currentIndex + 1);
    } else {
      this.showFinalResults();
    }
  }

  showFinalResults() {
    this.quizCardEl.classList.add('hidden');
    this.resultsCardEl.classList.remove('hidden');

    const total = this.filteredQuestions.length;
    const correctCount = this.answersLog.filter(a => a.isCorrect).length;
    const percentage = Math.round((correctCount / total) * 100);

    this.resultsScoreEl.textContent = `${correctCount} de ${total}`;
    this.resultsPercentEl.textContent = `${percentage}%`;

    let msg = '';
    if (percentage === 100) {
      msg = '¡Puntaje perfecto! Dominas con precisión tanto la clasificación como la construcción de intervalos en clave de Sol.';
    } else if (percentage >= 70) {
      msg = '¡Muy buen trabajo! Tienes una sólida comprensión de las 2das, 3ras y 4tas. Sigue practicando los semitonos y alteraciones.';
    } else {
      msg = 'Buen intento. Te recomendamos repasar las distancias en tonos y semitonos (especialmente los semitonos diatónicos naturales Mi-Fa y Si-Do) y volver a intentarlo.';
    }
    this.resultsMessageEl.textContent = msg;
    this.progressBarEl.style.width = '100%';
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.quizApp = new QuizApp();
});
