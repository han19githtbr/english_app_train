// ─── LINGUA PRO v2.1 — Main Application ─────────────────────────────────────
// TTS: per-button play/pause/stop, single active source, visual state feedback

const App = (() => {

  // ─── STATE ─────────────────────────────────────────────────────────────────
  let state = {
    data: null,
    currentSection: null,
    currentLesson: 0,
    quiz: {
      questions: [],
      current: 0,
      score: 0,
      answered: false,
      sectionColor: '#00D4FF',
      title: ''
    },
    totalScore: 0,
    quizzesDone: 0
  };

  // ─── SPEECH SYNTHESIS ENGINE ───────────────────────────────────────────────
  // One active "player" at a time. Each TTS button has a unique data-tts-id.
  // State machine: idle → playing → paused → idle (or stopped → idle)
  const TTS = (() => {
    const SUPPORTED = 'speechSynthesis' in window;
    const SS        = SUPPORTED ? window.speechSynthesis : null;

    let voiceList     = [];
    let selectedVoice = null;
    let rate          = 0.9;
    let pitch         = 1.0;

    // Active player tracking
    let activeId  = null;   // data-tts-id of button currently playing/paused
    let activeUtt = null;   // current SpeechSynthesisUtterance
    let isPaused  = false;

    // ── Voice loading ─────────────────────────────────────────────────────────
    function loadVoices() {
      if (!SUPPORTED) return;
      const all = SS.getVoices();
      const eng = all.filter(v => v.lang.startsWith('en'));
      voiceList = eng.length ? eng : all;
      _populateSelect();
    }

    function _populateSelect() {
      const sel = document.getElementById('voice-select');
      if (!sel || !voiceList.length) return;
      const prevName = selectedVoice ? selectedVoice.name : null;
      sel.innerHTML  = '';

      voiceList.forEach((v, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${v.name} (${v.lang})`;
        sel.appendChild(opt);
      });

      let idx = voiceList.findIndex(v => v.name === prevName);
      if (idx < 0) idx = voiceList.findIndex(v => v.lang === 'en-US');
      if (idx < 0) idx = voiceList.findIndex(v => v.lang === 'en-GB');
      if (idx < 0) idx = 0;
      sel.value     = idx;
      selectedVoice = voiceList[idx];
      sel.onchange  = () => { selectedVoice = voiceList[parseInt(sel.value)]; };
    }

    // ── Core toggle: play / pause / resume for a given button ─────────────────
    function toggle(btnEl, id, text) {
      if (!SUPPORTED) {
        alert('Speech synthesis is not supported. Try Chrome or Edge.');
        return;
      }

      // ── Same button clicked again → pause or resume ───────────────────────
      if (activeId === id) {
        if (isPaused) {
          SS.resume();
          isPaused = false;
          _setBtnState(btnEl, 'playing');
        } else {
          SS.pause();
          isPaused = true;
          _setBtnState(btnEl, 'paused');
        }
        return;
      }

      // ── Different button clicked → stop current, start new ────────────────
      _cancelActive();

      const clean  = _cleanText(text);
      activeId     = id;
      isPaused     = false;
      activeUtt    = new SpeechSynthesisUtterance(clean);

      if (selectedVoice)   activeUtt.voice = selectedVoice;
      activeUtt.rate  = rate;
      activeUtt.pitch = pitch;
      activeUtt.lang  = selectedVoice ? selectedVoice.lang : 'en-US';

      activeUtt.onstart = () => _setBtnState(btnEl, 'playing');

      activeUtt.onend = () => {
        activeId = null; activeUtt = null; isPaused = false;
        _setBtnState(btnEl, 'idle');
      };

      activeUtt.onerror = (e) => {
        if (e.error === 'interrupted') return;
        activeId = null; activeUtt = null; isPaused = false;
        _setBtnState(btnEl, 'idle');
      };

      _setBtnState(btnEl, 'playing');
      SS.speak(activeUtt);
    }

    // ── Stop everything (called on screen changes) ─────────────────────────
    function stopAll() {
      if (!SUPPORTED) return;
      _cancelActive();
    }

    // ── Internal: cancel active utterance and reset its button ────────────
    function _cancelActive() {
      if (activeId) {
        const prevBtn = document.querySelector(`[data-tts-id="${activeId}"]`);
        if (prevBtn) _setBtnState(prevBtn, 'idle');
      }
      SS.cancel();
      activeId = null; activeUtt = null; isPaused = false;
    }

    // ── Button visual state: 'idle' | 'playing' | 'paused' ────────────────
    function _setBtnState(btn, s) {
      if (!btn) return;
      btn.classList.remove('tts-playing', 'tts-paused');

      const iconEl  = btn.querySelector('.tts-icon');
      const labelEl = btn.querySelector('.tts-label');

      if (s === 'playing') {
        btn.classList.add('tts-playing');
        btn.title = 'Pause';
        if (iconEl) iconEl.textContent = '⏸';
        if (labelEl) labelEl.textContent = 'Pause';
      } else if (s === 'paused') {
        btn.classList.add('tts-paused');
        btn.title = 'Resume';
        if (iconEl) iconEl.textContent = '▶';
        if (labelEl) labelEl.textContent = 'Resume';
      } else {
        btn.title = btn.dataset.ttsLabel || 'Listen';
        if (iconEl)  iconEl.textContent  = '🔊';
        if (labelEl) labelEl.textContent = btn.dataset.ttsLabel || '';
      }
    }

    // ── Remove emoji and junk from text before speaking ───────────────────
    function _cleanText(t) {
      return t
        .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
        .replace(/[→←↗↘↙↖]/g, '')
        .replace(/\*\*/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function setRate(v)  { rate  = parseFloat(v); }
    function setPitch(v) { pitch = parseFloat(v); }

    return { toggle, stopAll, loadVoices, setRate, setPitch };
  })();

  // ─── FACTORY: create a TTS toggle button (DOM element) ────────────────────
  // opts.id      : unique string — data-tts-id
  // opts.text    : text to speak
  // opts.label   : optional visible text label (e.g. "Listen to lesson")
  // opts.classes : extra CSS classes
  function makeTTSBtn(opts) {
    const { id, text, label = '', classes = '' } = opts;
    const btn = document.createElement('button');
    btn.className       = `tts-btn ${classes}`.trim();
    btn.dataset.ttsId   = id;
    btn.dataset.ttsText = text;
    btn.dataset.ttsLabel = label;
    btn.title = label || 'Listen';

    btn.innerHTML = label
      ? `<span class="tts-icon">🔊</span><span class="tts-label">${label}</span>`
      : `<span class="tts-icon">🔊</span>`;

    btn.addEventListener('click', e => {
      e.stopPropagation();
      TTS.toggle(btn, btn.dataset.ttsId, btn.dataset.ttsText);
    });
    return btn;
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────
  async function init() {
    try {
      const res = await fetch('database/data.json');
      if (!res.ok) throw new Error('Network error');
      state.data = await res.json();
      renderHome();
      showScreen('home-screen');
      initVoiceSettings();
      if (window.speechSynthesis) {
        TTS.loadVoices();
        window.speechSynthesis.onvoiceschanged = TTS.loadVoices;
      }
    } catch (e) {
      document.getElementById('app').innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;
                    flex-direction:column;gap:16px;color:#7A8CA3;font-family:'DM Sans',sans-serif;">
          <div style="font-size:48px">⚠️</div>
          <div style="font-size:18px;color:#E8EDF5;font-weight:600">Failed to load application data</div>
          <div style="font-size:14px">Make sure
            <code style="background:#0D1B2E;padding:4px 8px;border-radius:6px;color:#00D4FF">database/data.json</code>
            exists and the server is running.</div>
        </div>`;
    }
  }

  // ─── VOICE SETTINGS ───────────────────────────────────────────────────────
  function initVoiceSettings() {
    const rateInput    = document.getElementById('voice-rate');
    const pitchInput   = document.getElementById('voice-pitch');
    const rateDisplay  = document.getElementById('rate-display');
    const pitchDisplay = document.getElementById('pitch-display');

    rateInput?.addEventListener('input', () => {
      TTS.setRate(rateInput.value);
      if (rateDisplay) rateDisplay.textContent = parseFloat(rateInput.value).toFixed(1) + 'x';
    });
    pitchInput?.addEventListener('input', () => {
      TTS.setPitch(pitchInput.value);
      if (pitchDisplay) pitchDisplay.textContent = parseFloat(pitchInput.value).toFixed(1);
    });
  }

  function openVoiceSettings()  { document.getElementById('voice-modal').classList.add('active'); }
  function closeVoiceSettings() { document.getElementById('voice-modal').classList.remove('active'); }

  function testVoice() {
    const btn = document.getElementById('test-voice-btn');
    if (!btn) return;
    TTS.toggle(btn, 'test-voice',
      'Hello! This is a test of the Lingua Pro voice. Adjust the speed and pitch sliders and press Test Voice again to hear the difference.');
  }

  // ─── SCREEN MANAGEMENT ────────────────────────────────────────────────────
  function showScreen(id) {
    TTS.stopAll();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─── RENDER HOME ──────────────────────────────────────────────────────────
  function renderHome() {
    updateHeaderScore();
    document.getElementById('sections-grid').innerHTML =
      state.data.sections.map(sec => `
        <div class="section-card" style="--section-color:${sec.color}" onclick="App.openSection('${sec.id}')">
          <span class="card-icon">${sec.icon}</span>
          <div class="card-tag" style="color:${sec.color}">${sec.title}</div>
          <h3>${sec.title}</h3>
          <p>${sec.description}</p>
          <div class="card-footer">
            <span class="card-meta">${sec.lessons.length} lesson${sec.lessons.length > 1 ? 's' : ''} · 1 quiz</span>
            <div class="card-arrow">→</div>
          </div>
        </div>`).join('');
  }

  function updateHeaderScore() {
    const el = document.getElementById('header-score');
    if (el) el.textContent = state.totalScore;
  }

  // ─── OPEN SECTION ─────────────────────────────────────────────────────────
  function openSection(sectionId) {
    const sec = state.data.sections.find(s => s.id === sectionId);
    if (!sec) return;
    state.currentSection = sec;
    state.currentLesson  = 0;
    renderSection(sec);
    showScreen('section-screen');
  }

  function renderSection(sec) {
    const container = document.getElementById('section-screen');
    container.querySelector('.section-header-tag').textContent = sec.title;
    container.querySelector('.section-header-tag').style.color = sec.color;
    container.querySelector('.section-header h2').textContent  = sec.title;
    container.querySelector('.section-header p').textContent   = sec.description;

    // ── Tabs ─────────────────────────────────────────────────────────────────
    document.getElementById('lesson-tabs').innerHTML =
      sec.lessons.map((l, i) => `
        <button class="lesson-tab ${i === 0 ? 'active' : ''}"
                style="--tab-color:${sec.color}"
                onclick="App.switchLesson(${i})">${l.title}</button>`).join('');

    // ── Lesson content (DOM-built to allow proper TTS button references) ──────
    const contentEl = document.getElementById('lessons-container');
    contentEl.innerHTML = '';

    sec.lessons.forEach((lesson, li) => {
      const lessonDiv = document.createElement('div');
      lessonDiv.className = `lesson-content${li === 0 ? ' active' : ''}`;
      lessonDiv.id = `lesson-${li}`;

      // Title row + "Listen to lesson" button
      const titleRow = document.createElement('div');
      titleRow.className = 'lesson-title-row';
      const titleEl = document.createElement('div');
      titleEl.className = 'lesson-title';
      titleEl.textContent = lesson.title;

      let fullLessonText = `Lesson: ${lesson.title}. `;
      lesson.content.forEach(b => {
        fullLessonText += `${b.subtitle}. ${b.explanation}. `;
        b.examples.forEach(ex => { fullLessonText += ex + '. '; });
        fullLessonText += `Tip: ${b.tip}. `;
      });

      titleRow.appendChild(titleEl);
      titleRow.appendChild(makeTTSBtn({ id: `lesson-${li}`, text: fullLessonText, label: 'Listen to lesson', classes: 'tts-lesson' }));
      lessonDiv.appendChild(titleRow);

      // Content blocks
      lesson.content.forEach((block, bi) => {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'content-block';
        blockDiv.style.setProperty('--block-color', sec.color);
        blockDiv.id = `block-${li}-${bi}`;

        // Block header: subtitle + section listen button
        const blockHeader = document.createElement('div');
        blockHeader.className = 'block-header';
        const h4 = document.createElement('h4');
        h4.textContent = block.subtitle;
        const blockText = `${block.subtitle}. ${block.explanation}. Examples: ${block.examples.join('. ')}. Tip: ${block.tip}`;
        blockHeader.appendChild(h4);
        blockHeader.appendChild(makeTTSBtn({ id: `block-${li}-${bi}`, text: blockText, label: 'Listen to section', classes: 'tts-block' }));
        blockDiv.appendChild(blockHeader);

        // Explanation
        const expl = document.createElement('p');
        expl.className = 'explanation';
        expl.textContent = block.explanation;
        blockDiv.appendChild(expl);

        // Examples list — each example has its own play/pause button
        const ul = document.createElement('ul');
        ul.className = 'examples-list';
        block.examples.forEach((ex, ei) => {
          const li_el = document.createElement('li');
          const spanText = document.createElement('span');
          spanText.className = 'example-text';
          spanText.textContent = ex;
          li_el.appendChild(spanText);
          li_el.appendChild(makeTTSBtn({ id: `ex-${li}-${bi}-${ei}`, text: ex, classes: 'tts-example' }));
          ul.appendChild(li_el);
        });
        blockDiv.appendChild(ul);

        // Tip box — has its own play/pause button
        const tipBox = document.createElement('div');
        tipBox.className = 'tip-box';
        const tipSpan = document.createElement('span');
        tipSpan.className = 'tip-text';
        tipSpan.textContent = block.tip;
        tipBox.appendChild(tipSpan);
        tipBox.appendChild(makeTTSBtn({ id: `tip-${li}-${bi}`, text: `Tip: ${block.tip}`, classes: 'tts-tip' }));
        blockDiv.appendChild(tipBox);

        lessonDiv.appendChild(blockDiv);
      });

      contentEl.appendChild(lessonDiv);
    });

    // ── Quiz CTA ─────────────────────────────────────────────────────────────
    const quizCta = container.querySelector('.quiz-cta');
    quizCta.style.setProperty('--section-color', sec.color);
    quizCta.querySelector('h3').textContent = 'Ready to test your knowledge?';
    quizCta.querySelector('p').textContent  = sec.quiz.description;
    quizCta.querySelector('.btn-primary').onclick = () => startQuiz(sec);
  }

  function switchLesson(index) {
    TTS.stopAll();
    state.currentLesson = index;
    document.querySelectorAll('.lesson-tab').forEach((t, i)     => t.classList.toggle('active', i === index));
    document.querySelectorAll('.lesson-content').forEach((c, i) => c.classList.toggle('active', i === index));
    document.getElementById('section-screen').scrollTop = 0;
  }

  // ─── QUIZ ──────────────────────────────────────────────────────────────────
  function startQuiz(sec) {
    state.quiz = {
      questions:    shuffleArray([...sec.quiz.questions]),
      current:      0,
      score:        0,
      answered:     false,
      sectionColor: sec.color,
      title:        sec.quiz.title
    };
    document.getElementById('quiz-screen').style.setProperty('--quiz-color', sec.color);
    renderQuestion();
    showScreen('quiz-screen');
  }

  function renderQuestion() {
    TTS.stopAll();
    const q        = state.quiz;
    const question = q.questions[q.current];
    const total    = q.questions.length;

    document.getElementById('quiz-title').textContent = q.title;
    document.getElementById('quiz-counter').innerHTML =
      `Question <span>${q.current + 1}</span> of <span>${total}</span>`;
    document.getElementById('quiz-progress-fill').style.width = `${(q.current / total) * 100}%`;

    // ── Question text + TTS button ───────────────────────────────────────────
    const qWrap = document.getElementById('question-text-wrap');
    qWrap.innerHTML = '';

    const qTextEl = document.createElement('div');
    qTextEl.id = 'question-text';
    qTextEl.className = 'question-text';
    qTextEl.textContent = question.question;

    const qNumEl = document.createElement('div');
    qNumEl.id = 'question-number';
    qNumEl.className = 'question-number';
    qNumEl.textContent = `Question ${q.current + 1}`;

    // Insert question number before the wrap
    const questionCard = document.querySelector('.question-card');
    const existingNum  = document.getElementById('question-number');
    if (existingNum) existingNum.textContent = `Question ${q.current + 1}`;

    qWrap.appendChild(qTextEl);
    qWrap.appendChild(makeTTSBtn({ id: 'quiz-question', text: question.question, classes: 'tts-question' }));

    // ── Options ──────────────────────────────────────────────────────────────
    const optLetters = ['A', 'B', 'C', 'D'];
    const optionsEl  = document.getElementById('options-list');
    optionsEl.innerHTML = '';

    question.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className   = 'option-btn';
      btn.dataset.index = i;

      const letterSpan = document.createElement('span');
      letterSpan.className = 'opt-letter';
      letterSpan.textContent = optLetters[i];

      const textSpan = document.createElement('span');
      textSpan.className = 'opt-text';
      textSpan.textContent = opt;

      const optTtsBtn = makeTTSBtn({ id: `opt-${q.current}-${i}`, text: opt, classes: 'tts-option' });

      btn.appendChild(letterSpan);
      btn.appendChild(textSpan);
      btn.appendChild(optTtsBtn);
      btn.addEventListener('click', () => selectOption(i));
      optionsEl.appendChild(btn);
    });

    // ── Reset feedback + next button ─────────────────────────────────────────
    const fb = document.getElementById('feedback-box');
    fb.className = 'feedback-box';
    fb.innerHTML = '';

    const nextBtn = document.getElementById('btn-next');
    nextBtn.className   = 'btn-next';
    const isLast        = q.current === total - 1;
    nextBtn.textContent = isLast ? '📊 See Results' : 'Next Question →';
    nextBtn.onclick     = isLast ? showResults : nextQuestion;

    q.answered = false;
  }

  function selectOption(selectedIndex) {
    if (state.quiz.answered) return;
    TTS.stopAll();
    state.quiz.answered = true;

    const question  = state.quiz.questions[state.quiz.current];
    const correct   = question.correct;
    const isCorrect = selectedIndex === correct;
    if (isCorrect) state.quiz.score++;

    // Style options
    document.querySelectorAll('.option-btn').forEach((btn, i) => {
      btn.disabled = true;
      if (i === correct)                         btn.classList.add('correct');
      else if (i === selectedIndex && !isCorrect) btn.classList.add('wrong');
    });

    // ── Build feedback box ───────────────────────────────────────────────────
    const feedbackText = isCorrect
      ? `Correct! Well done. ${question.explanation}`
      : `Incorrect. The correct answer is: ${question.options[correct]}. ${question.explanation}`;

    const fb = document.getElementById('feedback-box');
    fb.className = `feedback-box show ${isCorrect ? 'correct-fb' : 'wrong-fb'}`;
    fb.innerHTML = '';

    const iconSpan = document.createElement('span');
    iconSpan.className   = 'feedback-icon';
    iconSpan.textContent = isCorrect ? '✅' : '❌';

    const textDiv = document.createElement('div');
    textDiv.className = 'feedback-text';
    const strong = document.createElement('strong');
    strong.textContent = isCorrect
      ? 'Correct! Well done.'
      : `Incorrect. The correct answer is: ${question.options[correct]}`;
    const explP = document.createElement('p');
    explP.textContent = question.explanation;
    textDiv.appendChild(strong);
    textDiv.appendChild(explP);

    const fbTtsBtn = makeTTSBtn({ id: 'feedback', text: feedbackText, classes: 'tts-feedback' });

    fb.appendChild(iconSpan);
    fb.appendChild(textDiv);
    fb.appendChild(fbTtsBtn);

    document.getElementById('btn-next').classList.add('visible');

    // Auto-play feedback explanation
    TTS.toggle(fbTtsBtn, 'feedback', feedbackText);
  }

  function nextQuestion() {
    state.quiz.current++;
    renderQuestion();
  }

  function showResults() {
    TTS.stopAll();
    const q     = state.quiz;
    const total = q.questions.length;
    const pct   = Math.round((q.score / total) * 100);

    state.totalScore += q.score;
    state.quizzesDone++;
    updateHeaderScore();

    let grade, emoji;
    if      (pct >= 90) { grade = "Outstanding! You're ready for the real exam.";    emoji = '🏆'; }
    else if (pct >= 75) { grade = "Great work! Keep pushing to reach 90% plus.";     emoji = '🎯'; }
    else if (pct >= 60) { grade = "Good effort! Review the incorrect answers.";      emoji = '📈'; }
    else                { grade = "Keep studying! Re-read the lessons and try again."; emoji = '📚'; }

    const resultText = `Quiz complete. You scored ${q.score} out of ${total}, which is ${pct} percent. ${grade}`;

    const resultsEl = document.getElementById('results-screen');
    resultsEl.style.setProperty('--quiz-color', q.sectionColor);
    resultsEl.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'results-card';
    card.innerHTML = `
      <div class="result-score-circle" style="--score-percent:${pct * 3.6}deg">
        <div class="score-num">${pct}%</div>
        <div class="score-total">${q.score}/${total}</div>
      </div>
      <div style="font-size:36px;margin-bottom:8px">${emoji}</div>
      <h2>${q.title}</h2>
      <p class="result-msg">${grade}</p>
      <div class="results-summary">
        <div class="result-stat">
          <span class="rs-num" style="color:var(--accent-green)">${q.score}</span>
          <span class="rs-label">Correct</span>
        </div>
        <div class="result-stat">
          <span class="rs-num" style="color:#FF4757">${total - q.score}</span>
          <span class="rs-label">Incorrect</span>
        </div>
        <div class="result-stat">
          <span class="rs-num" style="color:var(--quiz-color)">${pct}%</span>
          <span class="rs-label">Score</span>
        </div>
      </div>`;

    const resultTtsBtn = makeTTSBtn({ id: 'result-summary', text: resultText, label: 'Listen to result', classes: 'tts-result' });
    card.appendChild(resultTtsBtn);

    const actions = document.createElement('div');
    actions.className = 'results-actions';
    actions.innerHTML = `
      <button class="btn-primary"
              onclick="App.startQuiz(App.getCurrentSection())"
              style="background:linear-gradient(135deg,${q.sectionColor},#7B2FBE)">
        🔄 Try Again
      </button>
      <button class="btn-secondary" onclick="App.goSection()">← Back to Lessons</button>
      <button class="btn-secondary" onclick="App.goHome()">🏠 Home</button>`;
    card.appendChild(actions);
    resultsEl.appendChild(card);

    showScreen('results-screen');
    setTimeout(() => TTS.toggle(resultTtsBtn, 'result-summary', resultText), 400);
  }

  // ─── NAVIGATION ───────────────────────────────────────────────────────────
  function goHome()            { showScreen('home-screen'); }
  function goSection()         { showScreen('section-screen'); }
  function getCurrentSection() { return state.currentSection; }

  // ─── UTILS ────────────────────────────────────────────────────────────────
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────────────
  return {
    init,
    openSection,
    switchLesson,
    startQuiz,
    nextQuestion,
    showResults,
    goHome,
    goSection,
    getCurrentSection,
    openVoiceSettings,
    closeVoiceSettings,
    testVoice
  };
})();

document.addEventListener('DOMContentLoaded', App.init);
