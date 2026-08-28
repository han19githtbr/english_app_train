// ═══════════════════════════════════════════════════════════════════════════
// LINGUA PRO — Photo Phrases (visual learning module)
// Shows a themed photo with an English sentence below it. Every sentence has
// its own play/pause audio button, plus a toggle to reveal the Portuguese
// translation. Self-contained module injected into the App namespace,
// following the same pattern as pronounce.js and simulator.js.
// ═══════════════════════════════════════════════════════════════════════════

(function () {

  // ─── STATE ─────────────────────────────────────────────────────────────────
  let categories   = [];      // [{id, label, pt, icon, tag}]
  let items        = [];      // [{id, category, imageUrl, imageAlt, sentence, translation}]
  let activeCat    = 'all';
  let loaded       = false;

  // Simple local TTS toggle (independent of the main App TTS engine, but uses
  // the same underlying speechSynthesis, so App.goHome() / showScreen() still
  // stops it via speechSynthesis.cancel()).
  const TTS_SUPPORTED = 'speechSynthesis' in window;
  let activeId  = null;
  let activeUtt = null;
  let isPaused  = false;

  // ─── DATA LOADING ──────────────────────────────────────────────────────────
  async function ensureData() {
    if (loaded) return;
    try {
      const res  = await fetch('database/data.json');
      const data = await res.json();
      const pp   = data.photoPhrases || {};
      categories = Array.isArray(pp.categories) ? pp.categories : [];
      items      = Array.isArray(pp.items) ? pp.items : [];
      loaded     = true;
    } catch (e) {
      categories = [];
      items      = [];
    }
  }

  // ─── SCREEN ENTRY ──────────────────────────────────────────────────────────
  async function openPhotoPhrases() {
    await ensureData();
    renderCats();
    renderGrid();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('photophrases-screen').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─── CATEGORY CHIPS ────────────────────────────────────────────────────────
  function renderCats() {
    const wrap = document.getElementById('pp-cats');
    if (!wrap) return;

    const allChip = `
      <button class="pp-cat-chip ${activeCat === 'all' ? 'active' : ''}" data-cat="all">
        <span class="pp-chip-emoji">✨</span> All
      </button>`;

    const chips = categories.map(c => `
      <button class="pp-cat-chip ${activeCat === c.id ? 'active' : ''}" data-cat="${c.id}">
        <span class="pp-chip-emoji">${c.icon}</span> ${c.label}
      </button>`).join('');

    wrap.innerHTML = allChip + chips;

    wrap.querySelectorAll('.pp-cat-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCat = btn.dataset.cat;
        renderCats();
        renderGrid();
      });
    });
  }

  // ─── GRID OF PHOTO CARDS ───────────────────────────────────────────────────
  function renderGrid() {
    const grid = document.getElementById('pp-grid');
    if (!grid) return;
    stopAll();

    const filtered = activeCat === 'all'
      ? items
      : items.filter(it => it.category === activeCat);

    if (!filtered.length) {
      grid.innerHTML = `<div class="pp-empty">No photo phrases in this category yet.</div>`;
      return;
    }

    grid.innerHTML = '';
    filtered.forEach(item => grid.appendChild(buildCard(item)));
  }

  function catMeta(catId) {
    return categories.find(c => c.id === catId) || { icon: '📷', label: catId };
  }

  function buildCard(item) {
    const meta = catMeta(item.category);

    const card = document.createElement('div');
    card.className = 'pp-card';

    // ── Image ──────────────────────────────────────────────────────────────
    const imgWrap = document.createElement('div');
    imgWrap.className = 'pp-img-wrap';

    const skeleton = document.createElement('div');
    skeleton.className = 'pp-img-skeleton';

    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.alt = item.imageAlt || item.sentence;
    img.loading = 'lazy';
    img.addEventListener('load', () => img.classList.add('loaded'));
    img.addEventListener('error', () => { skeleton.style.display = 'none'; });

    const badge = document.createElement('div');
    badge.className = 'pp-cat-badge';
    badge.innerHTML = `<span>${meta.icon}</span><span>${meta.label}</span>`;

    imgWrap.appendChild(img);
    imgWrap.appendChild(skeleton);
    imgWrap.appendChild(badge);

    // ── Body ───────────────────────────────────────────────────────────────
    const body = document.createElement('div');
    body.className = 'pp-card-body';

    const sentence = document.createElement('div');
    sentence.className = 'pp-sentence';
    sentence.textContent = item.sentence;

    const translation = document.createElement('div');
    translation.className = 'pp-translation';
    translation.textContent = item.translation;

    const actions = document.createElement('div');
    actions.className = 'pp-card-actions';

    const listenBtn = document.createElement('button');
    listenBtn.className = 'pp-action-btn pp-listen-btn';
    listenBtn.dataset.ttsId = item.id;
    listenBtn.innerHTML = `<span class="pp-listen-icon">🔊</span><span class="pp-listen-label">Listen</span>`;
    listenBtn.addEventListener('click', () => toggleSpeak(listenBtn, item.id, item.sentence));

    const translBtn = document.createElement('button');
    translBtn.className = 'pp-action-btn pp-transl-btn';
    translBtn.innerHTML = `<span>🇧🇷</span><span>Traduzir</span>`;
    translBtn.addEventListener('click', () => {
      const showing = translation.classList.toggle('show');
      translBtn.classList.toggle('active', showing);
      translBtn.querySelector('span:last-child').textContent = showing ? 'Ocultar' : 'Traduzir';
    });

    actions.appendChild(listenBtn);
    actions.appendChild(translBtn);

    body.appendChild(sentence);
    body.appendChild(translation);
    body.appendChild(actions);

    card.appendChild(imgWrap);
    card.appendChild(body);
    return card;
  }

  // ─── LOCAL TTS TOGGLE (play / pause / resume) ─────────────────────────────
  function toggleSpeak(btn, id, text) {
    if (!TTS_SUPPORTED) {
      alert('Speech synthesis is not supported. Try Chrome or Edge.');
      return;
    }
    const SS = window.speechSynthesis;

    if (activeId === id) {
      if (isPaused) { SS.resume(); isPaused = false; setBtnState(btn, 'playing'); }
      else          { SS.pause();  isPaused = true;  setBtnState(btn, 'paused');  }
      return;
    }

    cancelActive();

    activeId  = id;
    isPaused  = false;
    activeUtt = new SpeechSynthesisUtterance(text);
    activeUtt.rate = 0.92;
    activeUtt.pitch = 1.0;
    activeUtt.lang = 'en-US';

    activeUtt.onstart = () => setBtnState(btn, 'playing');
    activeUtt.onend = () => { activeId = null; activeUtt = null; isPaused = false; setBtnState(btn, 'idle'); };
    activeUtt.onerror = (e) => {
      if (e.error === 'interrupted') return;
      activeId = null; activeUtt = null; isPaused = false; setBtnState(btn, 'idle');
    };

    setBtnState(btn, 'playing');
    SS.speak(activeUtt);
  }

  function cancelActive() {
    if (activeId) {
      const prevBtn = document.querySelector(`.pp-listen-btn[data-tts-id="${activeId}"]`);
      if (prevBtn) setBtnState(prevBtn, 'idle');
    }
    if (TTS_SUPPORTED) window.speechSynthesis.cancel();
    activeId = null; activeUtt = null; isPaused = false;
  }

  function stopAll() { cancelActive(); }

  function setBtnState(btn, s) {
    if (!btn) return;
    btn.classList.remove('tts-playing', 'tts-paused');
    const icon  = btn.querySelector('.pp-listen-icon');
    const label = btn.querySelector('.pp-listen-label');
    if (s === 'playing') {
      btn.classList.add('tts-playing');
      if (icon) icon.textContent = '⏸';
      if (label) label.textContent = 'Pause';
    } else if (s === 'paused') {
      btn.classList.add('tts-paused');
      if (icon) icon.textContent = '▶';
      if (label) label.textContent = 'Resume';
    } else {
      if (icon) icon.textContent = '🔊';
      if (label) label.textContent = 'Listen';
    }
  }

  // ─── PUBLIC API ────────────────────────────────────────────────────────────
  Object.assign(App, {
    openPhotoPhrases
  });

})();
