/* Image study: static client (PREREG amendment A5). No third-party code, no trackers.
 * Configuration: the Google Apps Script web-app URL (see SETUP.md). Set ENDPOINT to '' to run offline
 * (answers are then only kept in this browser and in the "Download my answers" file). */
'use strict';
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxJIPlLYNSy-oEFBxlKCGwv-lI8ditmuXLhQSzc4pkTrNckW8zX-JxVWtu_UHXeWUmC/exec';
const CONTACT = 'imad.marouf97@gmail.com';                 // contact e-mail shown on the first page
const DURATION_TEXT = 'About <b>10&ndash;15 minutes</b>';
const STORE_KEY = 'gridstudy_v4a5_state';
const VERSION = 'v4a5';
const SEND_EVERY = 5;               // also send unsent rows every N screens (besides the end of each part)
const SMALL_SCREEN = 700;           // px: below this width a short tip about larger screens is shown
const PRELOAD_AHEAD = 2;            // screens whose images are fetched in advance

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
/* Grouping by anchors: list of groups (arrays of tile indices, the first one is the group's anchor) -> {tile: letter}. */
function groupsToLetters(list) {
  const g = {}; list.forEach((grp, i) => grp.forEach(k => { g[k] = String.fromCharCode(65 + i); })); return g;
}
if (typeof module !== 'undefined') module.exports = { rngFrom, shuffle, buildPlan, normalizeGroups, layoutGroups, newPid, randomForm, groupsToLetters };

/* ---------------- browser app ---------------- */
if (typeof window !== 'undefined') (function () {
  const $ = id => document.getElementById(id);
  const app = $('app');
  let DATA = null, S = null, busy = false, keyHandler = null;

  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* private mode: no resume */ } }
  function load() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { return null; } }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function nTotal() { return S && S.plan ? S.plan.pair.length + S.plan.count.length : 1; }
  function nDone() { return S && S.plan ? S.idx.pair + S.idx.count : 0; }
  function progress() {
    const on = S && S.plan;
    $('bar').style.width = (on ? Math.round(100 * nDone() / nTotal()) : 0) + '%';
    let txt = '';
    if (on && S.stage === 'count') txt = `Part 1 of 2 · ${Math.min(S.idx.count + 1, S.plan.count.length)}/${S.plan.count.length}`;
    if (on && S.stage === 'pair_intro') txt = 'Part 2 of 2';
    if (on && S.stage === 'pair') txt = `Part 2 of 2 · ${Math.min(S.idx.pair + 1, S.plan.pair.length)}/${S.plan.pair.length}`;
    if (on && S.stage === 'done') txt = 'Done';
    $('ptext').textContent = txt;
  }
  function setKeys(fn) { keyHandler = fn; }
  document.addEventListener('keydown', e => {
    if (!$('lightbox').classList.contains('hidden')) { if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') { closeLB(); e.preventDefault(); } return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (keyHandler && !(e.target && /^(SELECT|INPUT|TEXTAREA)$/.test(e.target.tagName))) keyHandler(e);
  });
  function openLB(src) { $('lbimg').src = src; $('lightbox').classList.remove('hidden'); }
  function closeLB() { $('lightbox').classList.add('hidden'); $('lbimg').removeAttribute('src'); }
  $('lightbox').addEventListener('click', closeLB);
  function imgTag(src, alt) { return `<img src="${src}" alt="${alt}" width="384" height="384" decoding="async" draggable="false">`; }
  function promptLine(text) { return `<p class="prompt"><span class="plabel">Description:</span> <b>&ldquo;${esc(text)}&rdquo;</b></p>`; }

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
        const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 6000);
        const r = await fetch(ENDPOINT + '?action=assign&nforms=' + n + '&v=' + encodeURIComponent(DATA.version || ''), { signal: ctl.signal });
        clearTimeout(tm);
        const j = await r.json();
        if (Number.isInteger(j.n) && j.n >= 0) return { form: j.n % n, source: j.mode === 'least' ? 'least' : 'counter' };
      } catch (e) { /* fall through */ }
    }
    return { form: randomForm(n), source: 'random' };
  }

  /* ---------- image loading: the current screen first, then the next PRELOAD_AHEAD screens ---------- */
  const fetched = new Set();
  function preloadIds(ids) {
    ids.forEach(id => {
      const t = id && DATA.trials[id]; if (!t) return;
      t.grids.forEach(g => g.forEach(src => { if (!fetched.has(src)) { fetched.add(src); const im = new Image(); im.decoding = 'async'; im.src = src; } }));
    });
  }
  function upcoming(n) {
    const all = S.plan.count.concat(S.plan.pair);
    const cur = S.stage === 'pair' ? S.plan.count.length + S.idx.pair : S.idx.count;
    return all.slice(cur + 1, cur + 1 + n);
  }
  function whenLoaded(imgs, cb) {
    let left = imgs.length; const done = () => { if (--left === 0) cb(); };
    imgs.forEach(im => { if (im.complete && im.naturalWidth) done(); else { im.addEventListener('load', done, { once: true }); im.addEventListener('error', done, { once: true }); } });
    if (!imgs.length) cb();
  }

  /* ---------- first page ---------- */
  function consent() {
    progress(); setKeys(null);
    const ex = DATA.example;
    const strip = ex ? `<div class="hero-strip">` + ex.images.slice(0, 4).map((src, i) => imgTag(src, `example generated image ${i + 1}`)).join('') + `</div>` : '';
    const small = window.innerWidth < SMALL_SCREEN ? `<p class="tip">Tip: a computer or tablet shows the images larger, but a phone works too.</p>` : '';
    app.innerHTML = `<div class="narrow"><h1>Image study</h1>
      ${strip}
      <div class="card">
      <p class="lead">We study how people compare AI-generated images made for the same description. There are no right or
      wrong answers; we want your own judgement.</p>
      <div class="hero-steps">
        <div class="step"><span class="stepnum">1</span><b>Sort</b> the images that match a description into groups.</div>
        <div class="step"><span class="stepnum">2</span><b>Compare</b> two sets of images.</div>
      </div>
      <p class="time">${DURATION_TEXT}. No sign-up. You can pause and continue later in the same browser.</p>
      ${small}
      <details><summary>Privacy and consent (please read)</summary>
      <ul><li>Participation is voluntary and unpaid. You can stop at any time; answers given until then may be used.</li>
      <li>It is anonymous: we do not ask for your name, e-mail or any personal information. You get a random code; your answers are stored under it.</li>
      <li>Your answers are stored on Google servers (Google Sheets).</li>
      <li>Answers are used only for research, reported in aggregate, and may be published as an anonymous data set.</li>
      <li>If you want your answers removed later, send us the code shown at the end.</li>
      <li>The images are AI-generated test images of everyday scenes and objects.</li>
      <li>You must be 18 or older to take part.</li></ul></details>
      <p class="muted small">By clicking &ldquo;I agree, start&rdquo; you confirm that you have read the privacy and consent
      information above.${CONTACT ? ` Questions: ${esc(CONTACT)}` : ''}</p>
      </div>
      <div class="row"><button class="btn primary" id="yes">I agree, start</button><button class="btn" id="no">No, thanks</button></div>
      <div class="err" id="err"></div></div>`;
    if (ex) ex.images.forEach(src => { const im = new Image(); im.src = src; });
    $('no').onclick = () => { app.innerHTML = '<div class="narrow card"><p>No problem. Thank you for your time. You can close this tab.</p></div>'; };
    $('yes').onclick = async () => {
      $('yes').disabled = true; $('yes').textContent = 'Starting…';
      const pid = newPid();
      const { form, source } = await assignForm(DATA.n_forms);
      S = { v: VERSION, pid, form, form_source: source, stage: 'instr', plan: buildPlan(DATA, pid, form), idx: { pair: 0, count: 0 }, rows: [], sent: 0, t_start: Date.now() };
      addRow({ block: 'meta', trial_id: 'consent', response: JSON.stringify({ version: DATA.version, form_source: source, vw: window.innerWidth, vh: window.innerHeight,
        touch: ('ontouchstart' in window), lang: navigator.language || '' }), rt_ms: '' });
      flush(); instructions();
    };
  }

  /* ---------- instructions: one screen with the worked example ---------- */
  function exampleGrid(ex) {
    return `<div class="cgrid example">` + ex.images.map((src, i) => {
      const ok = ex.correct.includes(i);
      return `<div class="tile ${ok ? 'ok' : 'off'}">${imgTag(src, `example image ${i + 1}`)}<span class="num">${i + 1}</span>
        ${ok ? `<span class="grp">${ex.groups[i]}</span>` : '<span class="nomatch">no match</span>'}</div>`;
    }).join('') + `</div>`;
  }
  function instructions() {
    S.stage = 'instr'; save(); progress(); setKeys(null); window.scrollTo(0, 0);
    const ex = DATA.example, nc = S.plan.count.length, np = S.plan.pair.length;
    app.innerHTML = `<div class="narrow"><h1>How it works</h1>
      <div class="card">
      <p><b>Part 1 &middot; Sort</b> (${nc} screens). You see a <b>description</b> and 8 images made for it.</p>
      <ol class="steps">
        <li><b>Tick</b> the images that match the description: everything it asks for is there (objects, numbers, colours,
        positions). Style and quality do not matter.</li>
        <li><b>Group</b> the ticked images. Imagine you typed the description and are picking one image. Images you would see as
        basically the same picture go in one group; images you would see as different options go in different groups.
        What counts as different is up to you.</li>
        <li>Answer one or two quick questions about colour.</li>
      </ol>
      <p><b>Part 2 &middot; Compare</b> (${np} screens). Two sets of 8 images: pick the set that offers more genuinely different
      images that match the description.</p>
      <p class="muted small">There are no right or wrong answers. A few screens check attention.</p>
      </div>
      ${ex ? `<h2>Example of part 1</h2>${promptLine(ex.prompt)}${exampleGrid(ex)}
        ${ex.caption ? `<p class="muted small">${esc(ex.caption)}</p>` : ''}<ul class="notes">${ex.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
      <div class="row"><button class="btn primary" id="go">Start part 1</button></div></div>`;
    $('go').onclick = () => { S.stage = 'count'; save(); next(); };
    setKeys(e => { if (e.key === 'Enter') { e.preventDefault(); $('go').click(); } });
    preloadIds(S.plan.count.slice(0, PRELOAD_AHEAD));
  }

  /* ---------- part 2 ---------- */
  function pairIntro() {
    S.stage = 'pair_intro'; save(); progress(); setKeys(null); flush(); window.scrollTo(0, 0);
    app.innerHTML = `<div class="narrow"><h1>Part 2 &middot; Compare</h1>
      <div class="card"><p>Part 1 is done, thank you. Now ${S.plan.pair.length} quick screens, each with two sets of 8 images for one
      description. Pick the set that offers <b>more genuinely different images that match the description</b>, or
      &ldquo;about the same&rdquo;.</p>
      <p class="muted small">Keys: <kbd>&larr;</kbd> Set 1 &middot; <kbd>&rarr;</kbd> Set 2 &middot; <kbd>space</kbd> about the same.
      Click an image to enlarge it.</p></div>
      <div class="row"><button class="btn primary" id="go">Start part 2</button></div></div>`;
    $('go').onclick = () => { S.stage = 'pair'; save(); next(); };
    setKeys(e => { if (e.key === 'Enter') { e.preventDefault(); $('go').click(); } });
    preloadIds(S.plan.pair.slice(0, PRELOAD_AHEAD));
  }

  function pairTrial() {
    const i = S.idx.pair, id = S.plan.pair[i], t = DATA.trials[id];
    const swap = S.plan.swap[id];
    const shown = swap ? [t.grids[1], t.grids[0]] : [t.grids[0], t.grids[1]];
    progress(); window.scrollTo(0, 0);
    app.innerHTML = `${promptLine(t.prompt)}
      <p class="q">Which set offers more genuinely different images that match the description?</p>
      <div class="pairwrap">${shown.map((g, s) => `<div class="set"><div class="setlabel">Set ${s + 1}</div><div class="g4">${g.map(src => imgTag(src, '')).join('')}</div></div>`).join('')}</div>
      <div class="actions"><div class="row choices">
        <button class="btn" id="c0"><kbd>&larr;</kbd> Set 1</button><button class="btn" id="cs">About the same <kbd>space</kbd></button><button class="btn" id="c1">Set 2 <kbd>&rarr;</kbd></button>
      </div></div>`;
    app.querySelectorAll('.g4 img').forEach(im => im.addEventListener('click', () => openLB(im.src)));
    const tShow = performance.now(); let tLoad = null;
    whenLoaded(Array.from(app.querySelectorAll('.g4 img')), () => { tLoad = performance.now(); preloadIds(upcoming(PRELOAD_AHEAD)); });
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
      if (e.key === 'ArrowLeft' || e.key === '1') { answer('left'); e.preventDefault(); }
      else if (e.key === 'ArrowRight' || e.key === '2') { answer('right'); e.preventDefault(); }
      else if (e.key === ' ' || e.code === 'Space') { answer('same'); e.preventDefault(); }
    });
  }

  /* ---------- part 1: tick -> group (one anchor image at a time) -> colour ---------- */
  function countTrial() {
    const i = S.idx.count, id = S.plan.count[i], t = DATA.trials[id], imgs = t.grids[0];
    progress(); window.scrollTo(0, 0);
    const st = { step: 1, ok: new Set(), list: [], colour: {}, q1: null, q2: null, bulk: '', tShow: performance.now(), tLoad: null, log: [] };
    const ms = () => Math.round(performance.now() - st.tShow);
    const ticked = () => Array.from(st.ok).sort((a, b) => a - b);
    const groupOf = k => st.list.findIndex(g => g.includes(k));
    const rest = () => ticked().filter(k => groupOf(k) < 0);
    const L = n => String.fromCharCode(65 + n);
    const needQ1 = () => st.list.length >= 2;
    const needQ2 = () => st.list.some(g => g.length >= 2);

    function newGroup() {          // next group starts at the first ungrouped ticked image; false when everything is grouped
      const r = rest();
      if (!r.length) return false;
      st.list.push([r[0]]);
      return !(r.length === 1 && st.list.length > 1);   // a single leftover image is its own group
    }
    function render() {
      const cur = st.list.length - 1, curG = st.list[cur] || [], anchor = curG[0];
      let head = '', extra = '', buttons = '';
      if (st.step === 1) {
        head = `<span class="stepn">Step 1 of 3</span> Click every image that <b>matches the description</b>.`;
        buttons = `<button class="btn" id="all">All match</button>
          <button class="btn primary" id="nextb">${st.ok.size ? 'Next: group them' : 'None match: next screen'}</button>`;
      } else if (st.step === 2) {
        const left = rest().length;
        head = `<span class="stepn">Step 2 of 3</span> Group <b class="gl">${L(cur)}</b>: click every image that is basically the
          <b>same picture</b> as image <b>${anchor + 1}</b> (outlined), then press Next.`;
        extra = left ? `<div class="row shortcuts"><span class="muted small">Or, for the ${left} image${left > 1 ? 's' : ''} without a letter:</span>
          <button class="btn small" id="restsame">all same as ${anchor + 1}</button><button class="btn small" id="restdiff">each one different</button></div>` : '';
        buttons = `<button class="btn" id="back">Back</button><button class="btn primary" id="nextb">${left ? 'Next group' : 'Done'}</button>`;
      } else {
        const yn = (q, v) => `<span class="yn"><button class="btn small ${v === false ? 'on' : ''}" data-q="${q}" data-v="0">No</button><button class="btn small ${v === true ? 'on' : ''}" data-q="${q}" data-v="1">Yes</button></span>`;
        head = `<span class="stepn">Step 3 of 3</span> Colour (there is no preferred answer).`;
        extra = `<div class="card colourq">
          ${needQ1() ? `<div class="cq"><span>Is one of your groups the <b>same picture as another group</b>, except for colour?</span>${yn(1, st.q1)}</div>
            ${st.q1 ? `<div class="links">${st.list.slice(1).map((g, q) => `<div>Group <b>${L(q + 1)}</b> is the same picture as
              <select data-g="${L(q + 1)}"><option value="">no other group</option>${st.list.slice(0, q + 1).map((_, p) => `<option value="${L(p)}" ${st.colour[L(q + 1)] === L(p) ? 'selected' : ''}>group ${L(p)}</option>`).join('')}</select>
              except for colour</div>`).join('')}</div>` : ''}` : ''}
          ${needQ2() ? `<div class="cq"><span>Do some images <b>within one group</b> differ in the colour of something?</span>${yn(2, st.q2)}</div>` : ''}
          </div>`;
        buttons = `<button class="btn" id="back">Back</button><button class="btn primary" id="nextb">Save and continue</button>`;
      }
      app.innerHTML = `${promptLine(t.prompt)}<p class="q">${head}</p>${st.step === 3 ? extra : ''}
        <div class="cgrid${st.step === 3 ? ' compact' : ''}">${imgs.map((src, k) => {
          const ok = st.ok.has(k), gi = groupOf(k);
          let cls = ok ? 'ok' : '';
          if (st.step >= 2) {
            if (!ok) cls += ' off';
            else if (st.step === 2 && gi === cur) cls += k === anchor ? ' anchor' : ' ingrp';
            else if (st.step === 2 && gi >= 0) cls += ' done';
            else if (st.step === 2) cls += ' free';
          }
          return `<div class="tile ${cls}" data-k="${k}">${imgTag(src, `image ${k + 1}`)}<span class="num">${k + 1}</span>
            ${ok && st.step === 1 ? '<span class="tick">&#10003;</span>' : ''}${gi >= 0 && st.step >= 2 ? `<span class="grp">${L(gi)}</span>` : ''}
            <button class="zoom" data-z="${k}" title="enlarge" aria-label="enlarge image ${k + 1}">&#x2922;</button></div>`;
        }).join('')}</div>
        ${st.step === 2 ? extra : ''}
        <div class="err" id="err"></div>
        <div class="actions"><div class="row">${buttons}</div><div class="keys muted small">${st.step === 3 ? 'Keys: <kbd>N</kbd> / <kbd>Y</kbd> answer, <kbd>Enter</kbd> continue.' :
          `Keys: <kbd>1</kbd>&ndash;<kbd>8</kbd> click an image, <kbd>Enter</kbd> next${st.step === 2 ? ', <kbd>Backspace</kbd> back' : ''}. &#x2922; enlarges.`}</div></div>`;
      app.querySelectorAll('.zoom').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); openLB(imgs[+b.dataset.z]); }));
      app.querySelectorAll('.tile').forEach(el => el.addEventListener('click', () => clickTile(+el.dataset.k)));
      if ($('all')) $('all').onclick = () => { for (let k = 0; k < 8; k++) st.ok.add(k); st.log.push(['all', ms()]); render(); };
      if ($('restsame')) $('restsame').onclick = () => bulkRest('same');
      if ($('restdiff')) $('restdiff').onclick = () => bulkRest('diff');
      app.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => answerQ(+b.dataset.q, b.dataset.v === '1')));
      app.querySelectorAll('select[data-g]').forEach(s => s.addEventListener('change', () => {
        if (s.value) st.colour[s.dataset.g] = s.value; else delete st.colour[s.dataset.g];
        st.log.push(['c', s.dataset.g, s.value, ms()]);
      }));
      if ($('back')) $('back').onclick = back;
      $('nextb').onclick = advance;
      if (st.tLoad === null) whenLoaded(Array.from(app.querySelectorAll('.cgrid img')), () => {
        if (st.tLoad === null) { st.tLoad = performance.now(); preloadIds(upcoming(PRELOAD_AHEAD)); }
      });
    }
    function clickTile(k) {
      if (st.step === 1) { st.ok.has(k) ? st.ok.delete(k) : st.ok.add(k); st.log.push(['t', k, ms()]); return render(); }
      if (st.step !== 2 || !st.ok.has(k)) return;
      const cur = st.list[st.list.length - 1], gi = groupOf(k);
      if (gi === st.list.length - 1) { if (k === cur[0]) return; cur.splice(cur.indexOf(k), 1); }
      else if (gi < 0) cur.push(k);
      else { $('err').textContent = `Image ${k + 1} is already in group ${L(gi)}. Use Back to change an earlier group.`; return; }
      st.log.push(['g', k, L(st.list.length - 1), ms()]); render();
    }
    function bulkRest(kind) {
      const r = rest(), first = st.list.length === 1 && (kind === 'same' || st.list[0].length === 1);
      if (kind === 'same') st.list[st.list.length - 1].push(...r); else r.forEach(k => st.list.push([k]));
      if (first) st.bulk = kind === 'same' ? 'allsame' : 'alldiff';
      st.log.push([kind === 'same' ? 'restsame' : 'restdiff', ms()]);
      render();
    }
    function answerQ(q, v) {
      if (q === 1) { st.q1 = v; if (!v) st.colour = {}; } else st.q2 = v;
      st.log.push(['q' + q, v ? 1 : 0, ms()]); render();
    }
    function back() {
      if (st.step === 3) { st.step = 2; st.log.push(['back3', ms()]); return render(); }
      if (st.step === 2) {
        if (st.list.length <= 1) { st.list = []; st.step = 1; st.bulk = ''; }
        else {
          st.list.pop();
          if (st.list.length === 1 && st.list[0].length === 1) st.bulk = '';
        }
        st.log.push(['back', ms()]); return render();
      }
    }
    function advance() {
      $('err').textContent = '';
      if (st.step === 1) {
        if (!st.ok.size) return finish();
        if (st.ok.size === 1) { st.list = [ticked()]; return finish(); }
        st.list = []; st.colour = {}; st.q1 = null; st.q2 = null; st.bulk = '';
        newGroup(); st.step = 2; return render();
      }
      if (st.step === 2) {
        if (rest().length && newGroup()) return render();
        st.step = 3; st.colour = {}; st.q1 = null; st.q2 = null; return render();
      }
      if ((needQ1() && st.q1 === null) || (needQ2() && st.q2 === null)) {
        $('err').textContent = 'Please answer ' + (needQ1() && needQ2() ? 'both colour questions' : 'the colour question') + ' (No or Yes).'; return;
      }
      if (needQ1() && st.q1 && !Object.keys(st.colour).length) { $('err').textContent = 'Please choose which groups differ only in colour, or answer No.'; return; }
      finish();
    }
    function finish() {
      if (busy) return; busy = true;
      const now = performance.now();
      const n = normalizeGroups(groupsToLetters(st.list), st.colour);
      const two = st.ok.size >= 2;
      const resp = { correct: ticked(), groups: n.groups, colour: n.colour,
        colour_merge: two ? (needQ2() ? st.q2 : false) : null, colour_link_q: two && needQ1() ? st.q1 : null,
        n_correct: st.ok.size, n_groups: n.nGroups, n_layout_groups: layoutGroups(n.nGroups, n.colour), bulk: st.bulk, ui: 'A5', log: st.log };
      addRow({ block: 'count', trial_id: id, response: JSON.stringify(resp), rt_ms: Math.round(now - (st.tLoad || st.tShow)), rt_total_ms: Math.round(now - st.tShow), n_in_block: i + 1 });
      S.idx.count++; save();
      if (S.idx.count % SEND_EVERY === 0) flush();
      setTimeout(() => { busy = false; next(); }, 120);
    }
    setKeys(e => {
      if (e.key === 'Enter') { e.preventDefault(); advance(); }
      else if (/^[1-8]$/.test(e.key) && st.step <= 2) { e.preventDefault(); clickTile(+e.key - 1); }
      else if (e.key === 'Backspace' && st.step >= 2) { e.preventDefault(); back(); }
      else if (st.step === 3 && /^[nNyY]$/.test(e.key)) {
        const q = (needQ1() && st.q1 === null) ? 1 : (needQ2() && st.q2 === null) ? 2 : null;
        if (q) { e.preventDefault(); answerQ(q, /[yY]/.test(e.key)); }
      }
    });
    render();
  }

  function done() {
    S.stage = 'done';
    if (!S.done_logged) { addRow({ block: 'meta', trial_id: 'end', response: JSON.stringify({ minutes: Math.round((Date.now() - S.t_start) / 600) / 100 }), rt_ms: '' }); S.done_logged = true; }
    save(); flush(); progress(); setKeys(null); window.scrollTo(0, 0);
    app.innerHTML = `<div class="narrow"><h1>Thank you!</h1>
      <div class="card"><p>You have finished. Your answers ${ENDPOINT ? 'have been sent' : 'are saved in this browser'}.</p>
      <p>Your participant code is <b>${S.pid}</b>. If you want your answers removed later, send us this code.</p>
      <p class="muted small">If something went wrong with the connection, please download your answers and send the file to the person who invited you.</p>
      <div class="row"><button class="btn" id="dl">Download my answers</button></div></div>
      <p class="muted small">You can close this tab now. Please do not discuss the images with others who may still take part.</p></div>`;
    $('dl').onclick = download;
  }

  function next() {
    if (S.stage === 'count') { if (S.idx.count < S.plan.count.length) return countTrial(); return pairIntro(); }
    if (S.stage === 'pair_intro') return pairIntro();
    if (S.stage === 'pair') { if (S.idx.pair < S.plan.pair.length) return pairTrial(); flush(); return done(); }
    if (S.stage === 'instr') return instructions();
    return done();
  }

  function resumeScreen() {
    progress();
    app.innerHTML = `<div class="narrow card"><h1>Welcome back</h1><p>You have answered ${nDone()} of ${nTotal()} screens. Continue where you stopped?</p>
      <div class="row"><button class="btn primary" id="cont">Continue</button><button class="btn" id="dl">Download my answers</button></div>
      <p class="muted small" style="margin-top:14px">Not the person who started this? <a href="#" id="restart">Start a new session</a></p></div>`;
    $('cont').onclick = () => { flush(); next(); };
    $('dl').onclick = download;
    $('restart').onclick = e => { e.preventDefault(); if (confirm('Start a new session? The answers of the old one stay saved only if they were sent.')) { try { localStorage.removeItem(STORE_KEY); } catch (x) { /* ignore */ } S = null; consent(); } };
  }

  fetch('trials.json', { cache: 'no-cache' }).then(r => r.json()).then(d => {
    DATA = d;
    const old = load();
    if (old && old.v === VERSION && old.plan && DATA.forms[old.form] && old.plan.pair.concat(old.plan.count).every(id => DATA.trials[id])) { S = old; return old.stage === 'done' ? done() : resumeScreen(); }
    consent();
  }).catch(() => { app.innerHTML = '<p class="err">Could not load the study files. Please reload the page.</p>'; });
})();
