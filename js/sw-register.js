/* sw-register.js — registers the service worker for offline-first support.
 * Guards against unsupported browsers; silently no-ops on localhost over
 * file:// so local preview never tries to claim an SW scope.
 */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function (err) {
      // fail silently; offline is a progressive enhancement
      if (window.console && console.warn) console.warn('sw register failed', err);
    });
  });
})();
