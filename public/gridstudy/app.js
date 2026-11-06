/* Image grid study: static client. No third-party code, no trackers.
 * Configuration: paste the Google Apps Script web-app URL below (see SETUP.md). Leave '' to run offline
 * (answers are then only kept in this browser and in the "Download my answers" file). */
'use strict';
const ENDPOINT = '';
const CONTACT = '';                 // optional contact e-mail shown on the consent page
const STORE_KEY = 'gridstudy_v4_state';
const SEND_EVERY = 10;              // also send unsent rows every N trials (besides the end of each block)

/* ---------------- pure helpers (also used by the node test) ---------------- */
function newPid() {
  const a = new Uint8Array(8);
  (globalThis.crypto || require('crypto').webcrypto).getRandomValues(a);
  return 'p' + Array.from(a, b => b.toString(16).padStart(2, '0')).join('');   // 'p' keeps spreadsheets from reading it as a number
}
function rngFrom(pid, salt) {             // mulberry32 seeded by the participant id
  let h = 2166136261 >>> 0;
  const s = pid + '|' + salt;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  let t = h;
  return function () {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function randomForm(n) {
  const a = new Uint32Array(1);
  (globalThis.crypto || require('crypto').webcrypto).getRandomValues(a);
  return a[0] % n;
}
function buildPlan(data, pid, form) {
  const f = data.forms[form];
  const r1 = rngFrom(pid, 'pair'), r2 = rngFrom(pid, 'count'), r3 = rngFrom(pid, 'swap');
  const pair = shuffle(f.pair, r1), count = shuffle(f.count, r2);
  const swap = {};
  pair.forEach(id => { swap[id] = r3() < 0.5; });
  return { pair, count, swap };
}
/* groups: {tileIndex: letter}; colour: {letter: letter}. Returns letters relabelled A, B, ... by first tile position. */
function normalizeGroups(groups, colour) {
  const tiles = Object.keys(groups).map(Number).sort((a, b) => a - b);
  const map = {}; let next = 0;
  tiles.forEach(t => { const g = groups[t]; if (!(g in map)) map[g] = String.fromCharCode(65 + next++); });
  const g2 = {}; tiles.forEach(t => { g2[t] = map[groups[t]]; });
  const c2 = {};
  Object.keys(colour || {}).forEach(k => { if (k in map && colour[k] in map && map[colour[k]] < map[k]) c2[map[k]] = map[colour[k]]; });
  return { groups: g2, colour: c2, nGroups: next };
}
function layoutGroups(nGroups, colour) {   // groups after merging "same except colour" links (union-find)
  const par = {}; const find = x => (par[x] === undefined || par[x] === x) ? x : (par[x] = find(par[x]));
  for (let i = 0; i < nGroups; i++) par[String.fromCharCode(65 + i)] = String.fromCharCode(65 + i);
  Object.keys(colour).forEach(k => { const a = find(k), b = find(colour[k]); if (a !== b) par[a] = b; });
  return new Set(Object.keys(par).map(find)).size;
}
if (typeof module !== 'undefined') module.exports = { rngFrom, shuffle, buildPlan, normalizeGroups, layoutGroups, newPid, randomForm };

/* ---------------- browser app ---------------- */
if (typeof window !== 'undefined') (function () {
  const $ = id => document.getElementById(id);
  const app = $('app');
  let DATA = null, S = null, busy = false, keyHandler = null;

  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* private mode: no resume */ } }
  function load() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { return null; } }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function nTotal() { return S ? S.plan.pair.length + S.plan.count.length : 1; }
  function nDone() { return S ? S.idx.pair + S.idx.count : 0; }
  function progress() {
    const p = S && S.plan ? Math.round(100 * nDone() / nTotal()) : 0;
    $('bar').style.width = p + '%';
    $('ptext').textContent = S && S.plan ? `${nDone()} / ${nTotal()}` : '';
  }
  function setKeys(fn) { keyHandler = fn; }
  document.addEventListener('keydown', e => {
    if (!$('lightbox').classList.contains('hidden')) { if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') { closeLB(); e.preventDefault(); } return; }
    if (keyHandler && !(e.target && /^(SELECT|INPUT|TEXTAREA)$/.test(e.target.tagName))) keyHandler(e);
  });
  function openLB(src) { $('lbimg').src = src; $('lightbox').classList.remove('hidden'); }
  function closeLB() { $('lightbox').classList.add('hidden'); $('lbimg').removeAttribute('src'); }
  $('lightbox').addEventListener('click', closeLB);

  /* ---------- data transport ---------- */
  function addRow(row) {
    S.rows.push(Object.assign({ participant_id: S.pid, form: S.form, client_ts: new Date().toISOString() }, row));
    save();
  }
  function flush() {
    if (!ENDPOINT || !S) return;
    const rows = S.rows.slice(S.sent);
    if (!rows.length) return;
    const upto = S.rows.length;
    const body = JSON.stringify({ study: 'v4', participant_id: S.pid, rows });
    fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', keepalive: body.length < 60000, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body })
      .then(() => { if (S.sent < upto) { S.sent = upto; save(); } })
      .catch(() => { /* offline: rows stay unsent and are retried at the next flush */ });
  }
  window.addEventListener('pagehide', flush);
  function download() {
    const blob = new Blob([JSON.stringify({ study: 'v4', participant_id: S.pid, form: S.form, rows: S.rows }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `answers_${S.pid}.json`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  async function assignForm(n) {
    if (ENDPOINT) {
      try {
        const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 5000);
        const r = await fetch(ENDPOINT + '?action=assign', { signal: ctl.signal });
        clearTimeout(tm);
        const j = await r.json();
        if (Number.isInteger(j.n) && j.n >= 0) return { form: j.n % n, source: 'counter' };
      } catch (e) { /* fall through */ }
    }
    return { form: randomForm(n), source: 'random' };
  }

  /* ---------- screens ---------- */
  function consent() {
    progress(); setKeys(null);
    app.innerHTML = `<div class="narrow"><h1>Image grid study</h1>
      <div class="card">
      <p>Thank you for your interest. In this short study you look at sets of images made by text-to-image generators and tell us
      which images show the text they were made from, and how many genuinely different images a set offers.</p>
      <ul><li>It is short: the bar at the top shows how far you are. A computer works best (a phone works, but images are small).</li>
      <li>Participation is voluntary and unpaid. You can stop at any time; answers given until then may be used.</li>
      <li>We do not ask for your name, e-mail or any personal information. You get a random code; your answers are stored under it.</li>
      <li>Answers are used only for research, reported in aggregate, and may be published as an anonymous data set.</li>
      <li>The images are AI-generated test images of everyday scenes and objects.</li>
      <li>You must be 18 or older to take part.</li></ul>
      ${CONTACT ? `<p class="muted">Questions: ${esc(CONTACT)}</p>` : ''}
      </div>
      <div class="row"><button class="btn primary" id="yes">I agree, start</button><button class="btn" id="no">No, thanks</button></div>
      <div class="err" id="err"></div></div>`;
    $('no').onclick = () => { app.innerHTML = '<div class="narrow card"><p>No problem. Thank you for your time. You can close this tab.</p></div>'; };
    $('yes').onclick = async () => {
      $('yes').disabled = true;
      const pid = newPid();
      const { form, source } = await assignForm(DATA.n_forms);
      S = { v: 'v4', pid, form, form_source: source, stage: 'instr', plan: buildPlan(DATA, pid, form), idx: { pair: 0, count: 0 }, rows: [], sent: 0, t_start: Date.now() };
      addRow({ block: 'meta', trial_id: 'consent', response: JSON.stringify({ form_source: source, vw: window.innerWidth, vh: window.innerHeight,
        touch: ('ontouchstart' in window), lang: navigator.language || '' }), rt_ms: '' });
      flush(); instructions();
    };
  }

  function exampleGrid(ex, upto) {   // upto: 1 = ticks only, 2 = ticks + groups
    return `<div class="cgrid example">` + ex.images.map((src, i) => {
      const ok = ex.correct.includes(i);
      return `<div class="tile ${ok ? 'ok' : ''}"><img src="${src}" alt="example image ${i + 1}"><span class="num">${i + 1}</span>
        ${ok ? '<span class="tick">&#10003;</span>' : ''}${ok && upto >= 2 ? `<span class="grp">${ex.groups[i]}</span>` : ''}</div>`;
    }).join('') + `</div>`;
  }
  function definitions() {
    return `<h2>Two words we use</h2>
      <p><b>Correct</b>: the image shows everything the text asks for. Every named object is there and recognisable; counts are
      exact ("four chairs" means exactly four); colours named in the text are right; positions named in the text are right
      ("a dog left of a cup"). Image quality and style do not matter unless they make an object unrecognisable.</p>
      <p><b>Genuinely different</b>: two correct images are genuinely different if a person choosing an image would see them as
      two real alternatives: a different arrangement or position of the objects, a clearly different viewpoint or framing,
      a different setting or style, or a different colour of something whose colour the text leaves open. Two images are
      <b>near-duplicates</b> if they are basically the same picture: same arrangement, same colours, similar look.</p>`;
  }
  function instructions() {
    S.stage = 'instr'; save(); progress(); setKeys(null);
    const ex = DATA.example;
    app.innerHTML = `<div class="narrow"><h1>Instructions</h1>
      <p>Each screen shows the <b>text</b> that someone typed into an image generator, and images generated for it.
      Imagine you typed that text and want to pick an image from what the generator gives you.</p>
      ${definitions()}
      <h2>Part 1: which set offers more?</h2>
      <p>You see two sets of 8 images for the same text. Choose the set that offers <b>more genuinely different images that
      correctly show the text</b>, or "about the same". Keys: <kbd>&larr;</kbd> set 1, <kbd>&rarr;</kbd> set 2,
      <kbd>space</kbd> about the same. Click an image to enlarge it. Your first impression is fine: about 10 seconds per screen.</p>
      <h2>Part 2: count the different correct images</h2>
      <p>You see one set of 8 images. (1) Click every image that is correct. (2) Put the correct images into groups: images that
      are near-duplicates get the same letter, genuinely different images get different letters. (3) If two groups differ
      <i>only</i> in colour, mark it.</p>
      ${ex ? `<h2>Worked example</h2><p class="prompt">Text: <b>&ldquo;${esc(ex.prompt)}&rdquo;</b></p>${exampleGrid(ex, 2)}
      <ul class="notes">${ex.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
      <p class="muted">A few screens are simple checks of attention. There are no right or wrong answers about taste.</p>
      <div class="row"><button class="btn primary" id="go">Start part 1</button></div></div>`;
    $('go').onclick = () => { S.stage = 'pair'; save(); window.scrollTo(0, 0); next(); };
  }

  function preload(id) {
    const t = id && DATA.trials[id]; if (!t) return;
    t.grids.forEach(g => g.forEach(src => { const im = new Image(); im.src = src; }));
  }
  function whenLoaded(imgs, cb) {
    let left = imgs.length; const done = () => { if (--left === 0) cb(); };
    imgs.forEach(im => { if (im.complete && im.naturalWidth) done(); else { im.addEventListener('load', done, { once: true }); im.addEventListener('error', done, { once: true }); } });
    if (!imgs.length) cb();
  }

  function pairTrial() {
    const i = S.idx.pair, id = S.plan.pair[i], t = DATA.trials[id];
    const swap = S.plan.swap[id];
    const shown = swap ? [t.grids[1], t.grids[0]] : [t.grids[0], t.grids[1]];
    progress(); window.scrollTo(0, 0);
    app.innerHTML = `<p class="prompt">Text: <b>&ldquo;${esc(t.prompt)}&rdquo;</b></p>
      <p class="q">Which set offers more genuinely different images that correctly show the text?</p>
      <div class="pairwrap">${shown.map((g, s) => `<div class="set"><div class="setlabel">Set ${s + 1}</div><div class="g4">${g.map(src => `<img src="${src}" alt="">`).join('')}</div></div>`).join('')}</div>
      <div class="row choices center"><button class="btn" id="c0">&larr; Set 1</button><button class="btn" id="cs">About the same (space)</button><button class="btn" id="c1">Set 2 &rarr;</button></div>
      <p class="muted" style="text-align:center">Screen ${i + 1} of ${S.plan.pair.length} in part 1. Click an image to enlarge it.</p>`;
    app.querySelectorAll('.g4 img').forEach(im => im.addEventListener('click', () => openLB(im.src)));
    const tShow = performance.now(); let tLoad = null;
    whenLoaded(Array.from(app.querySelectorAll('.g4 img')), () => { tLoad = performance.now(); });
    preload(S.plan.pair[i + 1]);
    const answer = side => {
      if (busy) return; busy = true;
      const now = performance.now();
      const canon = side === 'same' ? 'same' : ((side === 'left') !== swap ? 'g0' : 'g1');
      addRow({ block: 'pair', trial_id: id, response: canon, side, swap: swap ? 1 : 0, rt_ms: Math.round(now - (tLoad || tShow)), rt_total_ms: Math.round(now - tShow), n_in_block: i + 1 });
      S.idx.pair++; save();
      if (S.idx.pair % SEND_EVERY === 0) flush();
      setTimeout(() => { busy = false; next(); }, 120);
    };
    $('c0').onclick = () => answer('left'); $('c1').onclick = () => answer('right'); $('cs').onclick = () => answer('same');
    setKeys(e => {
      if (e.key === 'ArrowLeft') { answer('left'); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { answer('right'); e.preventDefault(); }
      else if (e.key === ' ' || e.code === 'Space') { answer('same'); e.preventDefault(); }
    });
  }

  function countIntro() {
    S.stage = 'count_intro'; save(); progress(); setKeys(null); flush();
    const ex = DATA.example;
    app.innerHTML = `<div class="narrow"><h1>Part 2: count the different correct images</h1>
      <p>Part 1 is done, thank you. In part 2 you see one set of 8 images per screen (${S.plan.count.length} screens).</p>
      <ol><li><b>Tick</b>: click every image that correctly shows the text (click again to undo).</li>
      <li><b>Group</b>: choose a letter, then click the images that belong to it. Near-duplicates share a letter; genuinely different images get different letters.</li>
      <li><b>Colour</b>: if a group is the same picture as an earlier group <i>except for colour</i>, say so.</li></ol>
      ${definitions()}
      ${ex ? `<details><summary>Show the worked example again</summary><p class="prompt">Text: <b>&ldquo;${esc(ex.prompt)}&rdquo;</b></p>${exampleGrid(ex, 2)}
      <ul class="notes">${ex.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul></details>` : ''}
      <div class="row" style="margin-top:12px"><button class="btn primary" id="go">Start part 2</button></div></div>`;
    $('go').onclick = () => { S.stage = 'count'; save(); next(); };
  }

  function countTrial() {
    const i = S.idx.count, id = S.plan.count[i], t = DATA.trials[id], imgs = t.grids[0];
    progress(); window.scrollTo(0, 0);
    const st = { step: 1, ok: new Set(), groups: {}, cur: 'A', colour: {}, tShow: performance.now(), tLoad: null, steps: [] };
    const letters = 'ABCDEFGH'.split('');
    function render() {
      const usedL = Array.from(new Set(Object.values(st.groups))).sort();
      app.innerHTML = `<p class="prompt">Text: <b>&ldquo;${esc(t.prompt)}&rdquo;</b></p>
        <div class="steps"><span class="${st.step === 1 ? 'on' : ''}">1 Tick correct</span><span class="${st.step === 2 ? 'on' : ''}">2 Group</span><span class="${st.step === 3 ? 'on' : ''}">3 Colour</span>
          <span class="muted" style="border:0">Screen ${i + 1} of ${S.plan.count.length}</span></div>
        <p class="q">${st.step === 1 ? 'Click every image that correctly shows the text.' :
          st.step === 2 ? 'Choose a letter, then click images to put them in that group. Near-duplicates share a letter.' :
          'Does any group show the same picture as an earlier group, except for colour?'}</p>
        ${st.step === 2 ? `<div class="palette">${letters.slice(0, Math.max(1, Math.min(8, st.ok.size))).map(L => `<button class="btn ${st.cur === L ? 'on' : ''}" data-l="${L}">${L}</button>`).join('')}
          <button class="btn" id="alldiff">All different</button><button class="btn" id="allsame">All one group</button></div>` : ''}
        <div class="cgrid">${imgs.map((src, k) => {
          const ok = st.ok.has(k); const dim = st.step >= 2 && !ok;
          return `<div class="tile ${ok ? 'ok' : ''} ${dim ? 'dim' : ''}" data-k="${k}"><img src="${src}" alt="image ${k + 1}" draggable="false"><span class="num">${k + 1}</span>
            ${ok ? '<span class="tick">&#10003;</span>' : ''}${ok && st.step >= 2 && st.groups[k] ? `<span class="grp">${st.groups[k]}</span>` : ''}
            <button class="zoom" data-z="${k}" title="enlarge" aria-label="enlarge image">zoom</button></div>`;
        }).join('')}</div>
        ${st.step === 3 ? `<div class="card links">${usedL.slice(1).map((L, q) => `<div>Group <b>${L}</b> is the same picture as
          <select data-g="${L}"><option value="">no other group</option>${usedL.slice(0, q + 1).map(P => `<option value="${P}" ${st.colour[L] === P ? 'selected' : ''}>group ${P}</option>`).join('')}</select>
          except for colour</div>`).join('')}</div>` : ''}
        <div class="err" id="err"></div>
        <div class="row">${st.step > 1 ? '<button class="btn" id="back">Back</button>' : ''}
          <button class="btn primary" id="nextb">${st.step === 1 ? (st.ok.size ? 'Next: group them' : 'None is correct: next screen') : st.step === 2 && usedL.length >= 2 ? 'Next: colour' : 'Save and continue'}</button></div>`;
      app.querySelectorAll('.zoom').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); openLB(imgs[+b.dataset.z]); }));
      app.querySelectorAll('.tile').forEach(el => el.addEventListener('click', () => {
        const k = +el.dataset.k;
        if (st.step === 1) { st.ok.has(k) ? st.ok.delete(k) : st.ok.add(k); st.steps.push(['t', k, Math.round(performance.now() - st.tShow)]); render(); }
        else if (st.step === 2 && st.ok.has(k)) { if (st.groups[k] === st.cur) delete st.groups[k]; else st.groups[k] = st.cur; render(); }
      }));
      app.querySelectorAll('.palette [data-l]').forEach(b => b.addEventListener('click', () => { st.cur = b.dataset.l; render(); }));
      if ($('alldiff')) $('alldiff').onclick = () => { st.groups = {}; Array.from(st.ok).sort((a, b) => a - b).forEach((k, q) => { st.groups[k] = letters[Math.min(q, 7)]; }); render(); };
      if ($('allsame')) $('allsame').onclick = () => { st.groups = {}; st.ok.forEach(k => { st.groups[k] = 'A'; }); render(); };
      app.querySelectorAll('select[data-g]').forEach(s => s.addEventListener('change', () => { if (s.value) st.colour[s.dataset.g] = s.value; else delete st.colour[s.dataset.g]; }));
      if ($('back')) $('back').onclick = () => { st.step--; render(); };
      $('nextb').onclick = advance;
      if (st.tLoad === null) whenLoaded(Array.from(app.querySelectorAll('.cgrid img')), () => { if (st.tLoad === null) st.tLoad = performance.now(); });
    }
    function advance() {
      if (st.step === 1) {
        if (!st.ok.size) return finish();
        Object.keys(st.groups).forEach(k => { if (!st.ok.has(+k)) delete st.groups[k]; });
        if (st.ok.size === 1) { st.groups = {}; st.groups[Array.from(st.ok)[0]] = 'A'; return finish(); }
        st.step = 2; st.cur = 'A'; return render();
      }
      if (st.step === 2) {
        const miss = Array.from(st.ok).filter(k => !st.groups[k]);
        if (miss.length) { $('err').textContent = `Please give a letter to every ticked image (missing: ${miss.map(k => k + 1).join(', ')}).`; return; }
        const n = normalizeGroups(st.groups, {});
        st.groups = n.groups;
        st.colour = normalizeGroups(st.groups, st.colour).colour;
        if (n.nGroups < 2) return finish();
        st.step = 3; return render();
      }
      finish();
    }
    function finish() {
      if (busy) return; busy = true;
      const now = performance.now();
      const n = normalizeGroups(st.groups, st.colour);
      const resp = { correct: Array.from(st.ok).sort((a, b) => a - b), groups: n.groups, colour: n.colour,
        n_correct: st.ok.size, n_groups: n.nGroups, n_layout_groups: layoutGroups(n.nGroups, n.colour) };
      addRow({ block: 'count', trial_id: id, response: JSON.stringify(resp), rt_ms: Math.round(now - (st.tLoad || st.tShow)), rt_total_ms: Math.round(now - st.tShow), n_in_block: i + 1 });
      S.idx.count++; save();
      if (S.idx.count % SEND_EVERY === 0) flush();
      setTimeout(() => { busy = false; next(); }, 120);
    }
    setKeys(e => { if (e.key === 'Enter') { e.preventDefault(); advance(); } });
    preload(S.plan.count[i + 1]);
    render();
  }

  function done() {
    S.stage = 'done';
    if (!S.done_logged) { addRow({ block: 'meta', trial_id: 'end', response: JSON.stringify({ minutes: Math.round((Date.now() - S.t_start) / 600) / 100 }), rt_ms: '' }); S.done_logged = true; }
    save(); flush(); progress(); setKeys(null);
    app.innerHTML = `<div class="narrow"><h1>Thank you!</h1>
      <div class="card"><p>You have finished. Your answers ${ENDPOINT ? 'have been sent' : 'are saved in this browser'}.</p>
      <p>Your participant code is <b>${S.pid}</b>. If you want your answers removed later, send us this code.</p>
      <p class="muted">If something went wrong with the connection, please download your answers and send the file to the person who invited you.</p>
      <div class="row"><button class="btn" id="dl">Download my answers</button></div></div>
      <p class="muted">You can close this tab now. Please do not discuss the images with others who may still take part.</p></div>`;
    $('dl').onclick = download;
  }

  function next() {
    if (S.stage === 'pair') { if (S.idx.pair < S.plan.pair.length) return pairTrial(); flush(); return countIntro(); }
    if (S.stage === 'count_intro') return countIntro();
    if (S.stage === 'count') { if (S.idx.count < S.plan.count.length) return countTrial(); flush(); return done(); }
    if (S.stage === 'instr') return instructions();
    return done();
  }

  function resumeScreen() {
    progress();
    app.innerHTML = `<div class="narrow card"><h1>Welcome back</h1><p>You have answered ${nDone()} of ${nTotal()} screens. Continue where you stopped?</p>
      <div class="row"><button class="btn primary" id="cont">Continue</button><button class="btn" id="dl">Download my answers</button></div>
      <p class="muted" style="margin-top:14px">Not the person who started this? <a href="#" id="restart">Start a new session</a></p></div>`;
    $('cont').onclick = () => { flush(); next(); };
    $('dl').onclick = download;
    $('restart').onclick = e => { e.preventDefault(); if (confirm('Start a new session? The answers of the old one stay saved only if they were sent.')) { try { localStorage.removeItem(STORE_KEY); } catch (x) { /* ignore */ } S = null; consent(); } };
  }

  fetch('trials.json', { cache: 'no-cache' }).then(r => r.json()).then(d => {
    DATA = d;
    const old = load();
    if (old && old.v === 'v4' && old.plan && DATA.forms[old.form] && old.plan.pair.concat(old.plan.count).every(id => DATA.trials[id])) { S = old; return old.stage === 'done' ? done() : resumeScreen(); }
    consent();
  }).catch(() => { app.innerHTML = '<p class="err">Could not load the study files. Please reload the page.</p>'; });
})();
