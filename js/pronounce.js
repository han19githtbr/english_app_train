// ═══════════════════════════════════════════════════════════════════════════
// LINGUA PRO — Pronunciation Practice (integrated module)
// Random word/phrase prompts → user speaks → SpeechRecognition checks it →
// green check ✅ if correct, red ✕ if not. Injected into the App namespace.
// ═══════════════════════════════════════════════════════════════════════════

(function () {

  // ─── STATE ─────────────────────────────────────────────────────────────────
  let bank        = [];          // full pronunciation bank from data.json
  let pool        = [];          // filtered-by-category, shuffled working set
  let poolIdx     = 0;
  let current     = null;        // current item {text, category, translation, difficulty}
  let category    = 'All';
  let score       = 0;
  let streak      = 0;
  let bestStreak  = 0;
  let attempts    = 0;
  let listening   = false;
  let recognition = null;
  let voice       = null;

  const SR_SUPPORTED = ('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window);
  const TTS_SUPPORTED = 'speechSynthesis' in window;

  // ─── DATA LOADING ──────────────────────────────────────────────────────────
  async function ensureData() {
    if (bank.length) return;
    try {
      const res  = await fetch('database/data.json');
      const data = await res.json();
      bank = Array.isArray(data.pronunciationBank) ? data.pronunciationBank : [];
    } catch (e) {
      bank = [];
    }
  }

  // ─── VOICE (for "listen to correct pronunciation") ─────────────────────────
  function loadVoice() {
    if (!TTS_SUPPORTED) return;
    const all = speechSynthesis.getVoices();
    const eng = all.filter(v => v.lang.startsWith('en'));
    const list = eng.length ? eng : all;
    let idx = list.findIndex(v => v.lang === 'en-US');
    if (idx < 0) idx = 0;
    voice = list[idx] || null;
  }

  function speak(text) {
    if (!TTS_SUPPORTED) return;
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    if (voice) utt.voice = voice;
    utt.rate = 0.85; utt.pitch = 1.0;
    utt.lang = voice ? voice.lang : 'en-US';
    speechSynthesis.speak(utt);
  }

  // ─── TEXT NORMALIZATION & MATCHING ─────────────────────────────────────────
  function normalize(t) {
    return t
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
      .replace(/[^a-z0-9\s']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Levenshtein distance for fuzzy word-level matching (accent-tolerant)
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[m][n];
  }

  function similarity(a, b) {
    const na = normalize(a), nb = normalize(b);
    if (!na || !nb) return 0;
    if (na === nb) return 1;

    // Word-level comparison for phrases: how many target words were heard
    const targetWords = na.split(' ');
    const heardWords   = nb.split(' ');
    let matched = 0;
    targetWords.forEach(tw => {
      const found = heardWords.some(hw => {
        const dist = levenshtein(tw, hw);
        const maxLen = Math.max(tw.length, hw.length);
        return maxLen > 0 && (dist / maxLen) <= 0.34; // ~65%+ similar per word
      });
      if (found) matched++;
    });
    const wordScore = matched / targetWords.length;

    // Whole-string similarity as a secondary signal (helps single words)
    const dist = levenshtein(na, nb);
    const maxLen = Math.max(na.length, nb.length);
    const charScore = maxLen > 0 ? 1 - (dist / maxLen) : 0;

    return Math.max(wordScore, charScore);
  }

  // ─── POOL MANAGEMENT ────────────────────────────────────────────────────────
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildPool() {
    const filtered = category === 'All' ? bank : bank.filter(b => b.category === category);
    pool = shuffle(filtered.length ? filtered : bank);
    poolIdx = 0;
  }

  function pickNext() {
    if (poolIdx >= pool.length) buildPool();
    current = pool[poolIdx++];
  }

  // ─── RENDER ────────────────────────────────────────────────────────────────
  function getCategories() {
    const set = new Set(bank.map(b => b.category));
    return ['All', ...Array.from(set)];
  }

  function renderCategoryChips() {
    const wrap = document.getElementById('pron-cats');
    if (!wrap) return;
    wrap.innerHTML = getCategories().map(c => `
      <button class="pron-chip ${c === category ? 'active' : ''}" data-cat="${c}">${c}</button>
    `).join('');
    wrap.querySelectorAll('.pron-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        category = btn.dataset.cat;
        renderCategoryChips();
        buildPool();
        pickNext();
        renderCard();
      });
    });
  }

  function renderStats() {
    const scoreEl  = document.getElementById('pron-score');
    const streakEl = document.getElementById('pron-streak');
    const attEl    = document.getElementById('pron-attempts');
    if (scoreEl)  scoreEl.textContent  = score;
    if (streakEl) streakEl.textContent = streak;
    if (attEl)    attEl.textContent    = attempts;
  }

  function renderCard() {
    if (!current) return;
    const textEl  = document.getElementById('pron-text');
    const transEl = document.getElementById('pron-translation');
    const catEl   = document.getElementById('pron-item-cat');
    const diffEl  = document.getElementById('pron-item-diff');
    const fb      = document.getElementById('pron-feedback');
    const heardEl = document.getElementById('pron-heard');

    if (textEl)  textEl.textContent  = current.text;
    if (transEl) transEl.textContent = current.translation || '';
    if (catEl)   catEl.textContent   = current.category;
    if (diffEl) {
      const map = { easy: '● Fácil', medium: '●● Médio', hard: '●●● Difícil' };
      diffEl.textContent = map[current.difficulty] || '';
    }
    if (fb)      { fb.className = 'pron-feedback'; fb.innerHTML = ''; }
    if (heardEl) heardEl.textContent = '';

    const micBtn = document.getElementById('pron-mic-btn');
    if (micBtn) { micBtn.classList.remove('listening'); micBtn.disabled = false; }
  }

  // ─── SPEECH RECOGNITION ─────────────────────────────────────────────────────
  function initRecognition() {
    if (!SR_SUPPORTED) return null;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    return rec;
  }

  function startListening() {
    if (!SR_SUPPORTED) {
      showUnsupported();
      return;
    }
    if (listening) return;

    recognition = initRecognition();
    if (!recognition) { showUnsupported(); return; }

    const micBtn = document.getElementById('pron-mic-btn');
    const fb     = document.getElementById('pron-feedback');
    const heardEl = document.getElementById('pron-heard');

    listening = true;
    if (micBtn) micBtn.classList.add('listening');
    if (fb)     { fb.className = 'pron-feedback listening-state'; fb.innerHTML = '<span class="pron-fb-icon">🎙️</span><span>Ouvindo... fale agora!</span>'; }
    if (heardEl) heardEl.textContent = '';

    recognition.onresult = (event) => {
      const alternatives = Array.from(event.results[0]).map(r => r.transcript);
      let best = { text: alternatives[0] || '', score: -1 };
      alternatives.forEach(alt => {
        const s = similarity(current.text, alt);
        if (s > best.score) best = { text: alt, score: s };
      });
      evaluate(best.text, best.score);
    };

    recognition.onerror = (e) => {
      listening = false;
      if (micBtn) micBtn.classList.remove('listening');
      if (e.error === 'no-speech') {
        if (fb) { fb.className = 'pron-feedback wrong-state'; fb.innerHTML = '<span class="pron-fb-icon">⚠️</span><span>Não ouvi nada. Tente novamente, falando mais perto do microfone.</span>'; }
      } else if (e.error === 'not-allowed' || e.error === 'permission-denied') {
        if (fb) { fb.className = 'pron-feedback wrong-state'; fb.innerHTML = '<span class="pron-fb-icon">🚫</span><span>Permita o acesso ao microfone nas configurações do navegador para usar este recurso.</span>'; }
      } else {
        if (fb) { fb.className = 'pron-feedback wrong-state'; fb.innerHTML = '<span class="pron-fb-icon">⚠️</span><span>Ocorreu um erro. Tente novamente.</span>'; }
      }
    };

    recognition.onend = () => {
      listening = false;
      if (micBtn) micBtn.classList.remove('listening');
    };

    try { recognition.start(); }
    catch (e) { listening = false; if (micBtn) micBtn.classList.remove('listening'); }
  }

  function stopListening() {
    if (recognition && listening) {
      try { recognition.stop(); } catch (e) {}
    }
  }

  function evaluate(heardText, score_) {
    attempts++;
    const fb      = document.getElementById('pron-feedback');
    const heardEl = document.getElementById('pron-heard');
    const isCorrect = score_ >= 0.62;

    if (heardEl) heardEl.textContent = `Você disse: "${heardText}"`;

    if (isCorrect) {
      score++;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
      if (fb) {
        fb.className = 'pron-feedback correct-state';
        fb.innerHTML = '<span class="pron-fb-icon">✅</span><span>Ótima pronúncia! Continue assim.</span>';
      }
    } else {
      streak = 0;
      if (fb) {
        fb.className = 'pron-feedback wrong-state';
        fb.innerHTML = '<span class="pron-fb-icon">❌</span><span>Quase lá — ouça a pronúncia correta e tente de novo.</span>';
      }
    }
    renderStats();
  }

  function showUnsupported() {
    const fb = document.getElementById('pron-feedback');
    if (fb) {
      fb.className = 'pron-feedback wrong-state';
      fb.innerHTML = '<span class="pron-fb-icon">🚫</span><span>Reconhecimento de voz não é suportado neste navegador. Tente usar o Google Chrome no Android ou desktop.</span>';
    }
  }

  // ─── INTERNAL screen switcher (mirrors App's showScreen logic) ────────────
  function _showScreen(id) {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    stopListening();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─── PUBLIC ACTIONS ──────────────────────────────────────────────────────────
  async function openPronounce() {
    await ensureData();
    if (!document.getElementById('pronounce-screen')) return;
    category = 'All';
    buildPool();
    pickNext();
    renderCategoryChips();
    renderStats();
    renderCard();
    _showScreen('pronounce-screen');
  }

  function goPronounceBack() {
    _showScreen('home-screen');
  }

  function pronNext() {
    stopListening();
    pickNext();
    renderCard();
  }

  function pronListen() {
    if (current) speak(current.text);
  }

  function pronMic() {
    if (listening) { stopListening(); return; }
    startListening();
  }

  function pronReset() {
    score = 0; streak = 0; attempts = 0; bestStreak = 0;
    renderStats();
  }

  // Init voices when available
  document.addEventListener('DOMContentLoaded', () => {
    if (TTS_SUPPORTED) {
      loadVoice();
      speechSynthesis.onvoiceschanged = loadVoice;
    }
  });

  // Inject into App namespace
  Object.assign(App, {
    openPronounce,
    goPronounceBack,
    pronNext,
    pronListen,
    pronMic,
    pronReset
  });

})();
