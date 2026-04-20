/* search-palette.js — Ctrl-K / Cmd-K client-side search modal.
 *
 *   index     : section titles, glyph rows (glyph + alias + meaning), defined terms
 *   matching  : lower-case substring + prefix boost + whole-word boost
 *   scope     : same-page only (per-page index built at load)
 *
 * No third-party deps; ~180 lines. Index is built once on first Ctrl-K,
 * then cached. Arrow keys navigate; Enter jumps + closes; Esc closes.
 */
(function () {
  'use strict';

  var palette, input, results, backdrop;
  var entries = null;
  var active = 0;
  var open = false;

  function build() {
    var items = [];
    // sections with id
    document.querySelectorAll('section[id]').forEach(function (s) {
      var h = s.querySelector('h2, h3');
      if (!h) return;
      items.push({
        kind: 'section',
        title: h.textContent.replace(/¶$/, '').trim(),
        id: s.id,
        snippet: (s.querySelector('p') || {}).textContent || '',
      });
    });
    // glyph-table rows
    document.querySelectorAll('.glyph-table tbody tr, #glyph-table tbody tr').forEach(function (tr) {
      var cells = tr.querySelectorAll('td');
      if (cells.length < 4) return;
      var glyph = cells[0].textContent.trim();
      var alias = cells[1].textContent.trim();
      var meaning = cells[3].textContent.trim();
      items.push({
        kind: 'glyph',
        title: glyph + '  ' + alias,
        id: tr.closest('section') ? tr.closest('section').id + '::' + glyph : glyph,
        snippet: meaning,
        anchor: (tr.closest('section') || {}).id || 'glyph-system',
      });
    });
    // headings with ids (defined terms like "tatpurusha")
    document.querySelectorAll('dt, strong, em, code').forEach(function (el) {
      var txt = el.textContent.trim();
      if (!txt || txt.length < 3 || txt.length > 60) return;
      var sec = el.closest('section');
      if (!sec || !sec.id) return;
      // dedupe simple case
      if (!/^[A-Za-zÀ-ÿāīūṭḍṇṛṁḥśṣñ§.⊗@'-]+$/.test(txt)) return;
      items.push({
        kind: 'term',
        title: txt,
        id: sec.id + '::' + txt,
        snippet: (sec.querySelector('h2, h3') || {}).textContent || '',
        anchor: sec.id,
      });
    });
    // dedupe by (title + anchor)
    var seen = {};
    return items.filter(function (it) {
      var k = (it.title + '|' + (it.anchor || it.id)).toLowerCase();
      if (seen[k]) return false;
      seen[k] = 1;
      return true;
    });
  }

  function score(item, q) {
    var t = item.title.toLowerCase();
    var s = (item.snippet || '').toLowerCase();
    var idx = t.indexOf(q);
    var sidx = s.indexOf(q);
    if (idx === -1 && sidx === -1) return -1;
    var sc = 0;
    if (idx === 0) sc += 500;
    else if (idx > 0) sc += Math.max(0, 200 - idx * 4);
    if (t.indexOf(' ' + q) !== -1 || t.indexOf('-' + q) !== -1) sc += 120;
    if (sidx !== -1) sc += Math.max(0, 80 - sidx);
    if (item.kind === 'section') sc += 30;
    if (item.kind === 'glyph') sc += 10;
    return sc;
  }

  function search(q) {
    q = (q || '').trim().toLowerCase();
    if (!q) return [];
    var out = [];
    for (var i = 0; i < entries.length; i++) {
      var sc = score(entries[i], q);
      if (sc > 0) out.push({ item: entries[i], score: sc });
    }
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, 40).map(function (r) { return r.item; });
  }

  function render(list) {
    results.innerHTML = '';
    if (!list.length) {
      results.innerHTML = '<li class="sp-empty">no matches</li>';
      return;
    }
    list.forEach(function (it, i) {
      var li = document.createElement('li');
      li.className = 'sp-item' + (i === active ? ' active' : '');
      li.dataset.index = i;
      li.innerHTML =
        '<span class="sp-kind">' + escapeHtml(it.kind) + '</span>' +
        '<span class="sp-title">' + escapeHtml(it.title) + '</span>' +
        (it.snippet ? '<span class="sp-snippet">' + escapeHtml(it.snippet.slice(0, 120)) + '</span>' : '');
      li.addEventListener('mouseenter', function () { setActive(i); });
      li.addEventListener('click', function () { go(list[i]); });
      results.appendChild(li);
    });
  }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function setActive(i) {
    var els = results.querySelectorAll('.sp-item');
    active = Math.max(0, Math.min(els.length - 1, i));
    els.forEach(function (el, idx) { el.classList.toggle('active', idx === active); });
    var cur = els[active];
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  }

  function go(item) {
    var anchor = item.anchor || item.id.split('::')[0];
    close();
    var tgt = document.getElementById(anchor);
    if (tgt) {
      history.replaceState(null, '', '#' + anchor);
      tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
      tgt.classList.add('sp-target-flash');
      setTimeout(function () { tgt.classList.remove('sp-target-flash'); }, 1400);
    }
  }

  function ensureUI() {
    if (palette) return;
    backdrop = document.createElement('div');
    backdrop.id = 'sp-backdrop';
    backdrop.addEventListener('click', close);

    palette = document.createElement('div');
    palette.id = 'search-palette';
    palette.setAttribute('role', 'dialog');
    palette.setAttribute('aria-label', 'Search');
    palette.innerHTML =
      '<div class="sp-input-wrap">' +
      '  <input id="sp-input" type="search" autocomplete="off" spellcheck="false"' +
      '         placeholder="search  (sections, glyphs, terms) &hellip;"' +
      '         aria-label="Search the page">' +
      '  <kbd class="sp-hint">Esc</kbd>' +
      '</div>' +
      '<ul id="sp-results" role="listbox"></ul>' +
      '<div class="sp-footer"><kbd>↑</kbd> <kbd>↓</kbd> navigate · <kbd>Enter</kbd> jump · <kbd>Esc</kbd> close</div>';
    document.body.appendChild(backdrop);
    document.body.appendChild(palette);

    input = document.getElementById('sp-input');
    results = document.getElementById('sp-results');
    input.addEventListener('input', function () {
      active = 0;
      render(search(input.value));
    });
    input.addEventListener('keydown', function (e) {
      var list = search(input.value);
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        if (list[active]) go(list[active]);
      }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
  }

  function openPalette() {
    if (!entries) entries = build();
    ensureUI();
    open = true;
    backdrop.classList.add('open');
    palette.classList.add('open');
    input.value = '';
    render([]);
    input.focus();
  }
  function close() {
    open = false;
    if (backdrop) backdrop.classList.remove('open');
    if (palette) palette.classList.remove('open');
  }

  document.addEventListener('keydown', function (e) {
    var combo = (e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K');
    if (combo) { e.preventDefault(); open ? close() : openPalette(); }
  });
})();
