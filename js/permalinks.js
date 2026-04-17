/* permalinks.js — hover-reveal ¶ anchor on every heading with an id.
 * Click copies the absolute URL with fragment to clipboard + shows a toast.
 * No dependency on third-party anchor-js; ~40 lines of vanilla.
 */
(function () {
  'use strict';
  var HEADINGS = 'section h2[id], section h3[id], section h2 + * h3[id]';
  var TOAST_ID = 'permalink-toast';

  function toast(msg) {
    var t = document.getElementById(TOAST_ID);
    if (!t) {
      t = document.createElement('div');
      t.id = TOAST_ID;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 1600);
  }

  function copyURL(id) {
    var url = location.origin + location.pathname + '#' + id;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        function () { toast('link copied'); },
        function () { fallbackCopy(url); }
      );
    } else {
      fallbackCopy(url);
    }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('link copied'); }
    catch (e) { toast('copy failed; long-press to copy'); }
    document.body.removeChild(ta);
  }

  function attach(h) {
    if (h.querySelector('.permalink')) return;
    var id = h.id;
    if (!id) {
      // auto-generate id from text if missing
      id = h.textContent.trim().toLowerCase()
        .replace(/[^a-z0-9§.]+/g, '-')
        .replace(/^-|-$/g, '') || 'section';
      h.id = id;
    }
    var a = document.createElement('a');
    a.href = '#' + id;
    a.className = 'permalink';
    a.setAttribute('aria-label', 'permalink to ' + (h.textContent || id));
    a.textContent = '¶';
    a.addEventListener('click', function (e) {
      e.preventDefault();
      history.replaceState(null, '', '#' + id);
      copyURL(id);
    });
    h.appendChild(a);
  }

  function init() {
    document.querySelectorAll(HEADINGS).forEach(attach);
    // Also target any top-level h2 without id - give it one based on text
    document.querySelectorAll('h2:not([id])').forEach(function (h) {
      if (h.closest('.hero')) return;
      attach(h);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
