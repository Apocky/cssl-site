/* kbd-nav.js — site-wide keyboard shortcuts.
 *   j / k         : scroll down / up by one viewport-paragraph (~160px)
 *   g g           : top of page
 *   shift-g       : bottom of page
 *   /             : focus glyph-table filter (if present)
 *   ?             : toggle help overlay
 *   esc           : close help overlay
 * Shortcuts are disabled while typing in form inputs.
 */
(function () {
  'use strict';
  var STEP = 160;
  var gPressed = 0;
  var gPressedAt = 0;

  function isTyping(e) {
    var el = e.target;
    if (!el) return false;
    var tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' ||
           el.isContentEditable === true;
  }

  function scrollBy(dy) { window.scrollBy({ top: dy, behavior: 'smooth' }); }

  function ensureOverlay() {
    var o = document.getElementById('kbd-help');
    if (o) return o;
    o = document.createElement('div');
    o.id = 'kbd-help';
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-label', 'Keyboard shortcuts');
    o.hidden = true;
    o.innerHTML =
      '<div class="kbd-help-card">' +
      '  <h3>Keyboard shortcuts</h3>' +
      '  <dl>' +
      '    <dt>J / K</dt><dd>scroll down / up</dd>' +
      '    <dt>G G</dt><dd>top of page</dd>' +
      '    <dt>Shift + G</dt><dd>bottom of page</dd>' +
      '    <dt>/</dt><dd>focus glyph-table filter</dd>' +
      '    <dt>?</dt><dd>toggle this help</dd>' +
      '    <dt>Esc</dt><dd>close overlays</dd>' +
      '  </dl>' +
      '  <p class="kbd-help-hint">press <kbd>Esc</kbd> or <kbd>?</kbd> to close</p>' +
      '</div>';
    document.body.appendChild(o);
    o.addEventListener('click', function (e) {
      if (e.target === o) o.hidden = true;
    });
    return o;
  }

  function toggleHelp() {
    var o = ensureOverlay();
    o.hidden = !o.hidden;
  }

  function focusGlyphFilter() {
    var f = document.getElementById('glyph-filter');
    if (f) { f.focus(); f.select && f.select(); return true; }
    return false;
  }

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (isTyping(e)) return;
    var k = e.key;
    if (k === 'j') { e.preventDefault(); scrollBy(STEP); return; }
    if (k === 'k') { e.preventDefault(); scrollBy(-STEP); return; }
    if (k === 'G') { e.preventDefault(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); return; }
    if (k === 'g') {
      var now = Date.now();
      if (gPressed && now - gPressedAt < 600) {
        gPressed = 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else { gPressed = 1; gPressedAt = now; }
      return;
    }
    if (k === '/') {
      if (focusGlyphFilter()) e.preventDefault();
      return;
    }
    if (k === '?') { e.preventDefault(); toggleHelp(); return; }
    if (k === 'Escape') {
      var o = document.getElementById('kbd-help');
      if (o && !o.hidden) { e.preventDefault(); o.hidden = true; }
      return;
    }
  });
})();
