/* feedback.js — obfuscated mailto tab (LAYER 1 of defense-in-depth)
 * Address and subject are ROT13(base64(...)) and base64(...) respectively,
 * encoded inside data-* attributes. href is set only on user interaction
 * (mouseenter / focus / touchstart) so scrapers that stop at DOM-parse
 * never see the real address. noscript fallback handles JS-off clients.
 */
(function () {
  'use strict';
  var tab = document.getElementById('feedback-tab');
  if (!tab) return;

  function rot13(s) {
    return s.replace(/[A-Za-z]/g, function (c) {
      var base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base);
    });
  }
  function decodeAddr() {
    try { return atob(rot13(tab.dataset.c || '')); } catch (e) { return ''; }
  }
  function decodeSubj() {
    try { return atob(tab.dataset.s || ''); } catch (e) { return ''; }
  }

  var activated = false;
  function activate() {
    if (activated) return;
    var addr = decodeAddr();
    if (!addr) return;
    var subj = decodeSubj();
    tab.href = 'mailto:' + addr + (subj ? '?subject=' + encodeURIComponent(subj) : '');
    activated = true;
  }
  tab.addEventListener('mouseenter', activate, { once: true });
  tab.addEventListener('focus', activate, { once: true });
  tab.addEventListener('touchstart', activate, { once: true, passive: true });
  // also activate on first click if the other events didn't fire
  tab.addEventListener('click', function (e) {
    if (!activated) { activate(); /* let the href take over on the next click */ }
  });
})();
