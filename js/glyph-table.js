/* glyph-table.js — interactive filter / sort / copy for any glyph table.
 * Works on an existing <table> by adding an ID `glyph-table` and wrapping
 * it with #glyph-filter, #glyph-tiers (pills), #glyph-categories (pills).
 * Copies glyph-text to clipboard on row click with a brief flash highlight.
 * URL state: ?filter=foo&tier=0 → preserved across refresh.
 */
(function () {
  'use strict';

  function init() {
    var tables = document.querySelectorAll('.glyph-table, #glyph-table');
    if (!tables.length) return;

    tables.forEach(wire);
    var filter = document.getElementById('glyph-filter');
    if (filter) {
      // sync initial state from URL
      var params = new URLSearchParams(location.search);
      var qf = params.get('filter') || '';
      if (qf) { filter.value = qf; applyAll(); }
    }
  }

  function wire(table) {
    // each row gets click-to-copy
    var rows = table.tBodies[0] ? table.tBodies[0].querySelectorAll('tr') : [];
    rows.forEach(function (tr) {
      tr.classList.add('glyph-row');
      tr.tabIndex = 0;
      tr.setAttribute('role', 'button');
      tr.setAttribute('aria-label', 'copy glyph');
      tr.addEventListener('click', function () { copyCell(tr); });
      tr.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === 'c' || e.key === ' ') {
          e.preventDefault(); copyCell(tr);
        }
      });
    });
  }

  function copyCell(tr) {
    var cell = tr.querySelector('.glyph-cell') || tr.querySelector('td');
    if (!cell) return;
    var txt = (cell.textContent || '').trim();
    if (!txt) return;
    function flash() {
      tr.classList.add('copied');
      setTimeout(function () { tr.classList.remove('copied'); }, 800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(flash, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = txt;
      ta.style.position = 'fixed'; ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); flash(); } catch (e) {}
      document.body.removeChild(ta);
    }
  }

  function applyAll() {
    var filter = document.getElementById('glyph-filter');
    var q = filter ? filter.value.trim().toLowerCase() : '';
    var tier = document.querySelector('.glyph-tier-pill.active');
    var tierVal = tier ? tier.dataset.tier : 'all';
    document.querySelectorAll('.glyph-table, #glyph-table').forEach(function (t) {
      var rows = t.tBodies[0] ? t.tBodies[0].querySelectorAll('tr') : [];
      rows.forEach(function (tr) {
        var text = tr.textContent.toLowerCase();
        var matchQ = !q || text.indexOf(q) !== -1;
        var rowTier = tr.dataset.tier || t.dataset.tier || '0';
        var matchT = tierVal === 'all' || rowTier === tierVal;
        tr.hidden = !(matchQ && matchT);
      });
    });
    // update URL (without adding history entries)
    var url = new URL(location.href);
    if (q) url.searchParams.set('filter', q); else url.searchParams.delete('filter');
    if (tierVal !== 'all') url.searchParams.set('tier', tierVal); else url.searchParams.delete('tier');
    history.replaceState(null, '', url.toString());
  }

  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'glyph-filter') applyAll();
  });
  document.addEventListener('click', function (e) {
    var p = e.target.closest('.glyph-tier-pill');
    if (!p) return;
    document.querySelectorAll('.glyph-tier-pill').forEach(function (el) { el.classList.remove('active'); });
    p.classList.add('active');
    applyAll();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
