/* sw.js — offline-first service worker for cssl.dev
 *
 * Strategy :
 *   precache      : /CSLv3, /sigil, /manifest.webmanifest, /js/*
 *   HTML          : network-first, fall back to cache (fresh when online)
 *   JS/CSS/icons  : stale-while-revalidate (fast + eventually-fresh)
 *   images/og     : cache-first with 30-day expiry
 *
 * Cache name includes a version string; bumping it forces a full refresh.
 * v3 (2026-04-17) : / is a 307 redirect -> /CSLv3 is new root.
 */
'use strict';

var CACHE = 'cssl-v3-2026-04-17';
var PRECACHE = [
  '/CSLv3',
  '/sigil',
  '/manifest.webmanifest',
  '/js/feedback.js',
  '/js/tabs.js',
  '/js/sw-register.js',
  '/js/kbd-nav.js',
  '/js/permalinks.js',
  '/js/toc.js',
  '/js/glyph-table.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(PRECACHE).catch(function () {
        return Promise.all(PRECACHE.map(function (u) {
          return c.add(u).catch(function () {});
        }));
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.map(function (n) {
        if (n !== CACHE) return caches.delete(n);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function networkFirst(request) {
  return fetch(request).then(function (resp) {
    if (resp && resp.status === 200) {
      var clone = resp.clone();
      caches.open(CACHE).then(function (c) { c.put(request, clone); });
    }
    return resp;
  }).catch(function () {
    return caches.match(request).then(function (cached) {
      return cached || caches.match('/CSLv3');
    });
  });
}

function staleWhileRevalidate(request) {
  return caches.open(CACHE).then(function (c) {
    return c.match(request).then(function (cached) {
      var fetched = fetch(request).then(function (resp) {
        if (resp && resp.status === 200) c.put(request, resp.clone());
        return resp;
      }).catch(function () { return cached; });
      return cached || fetched;
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // skip caching the root — it's a redirect, not a cacheable page
  if (url.pathname === '/') return;

  var accept = req.headers.get('accept') || '';
  if (accept.indexOf('text/html') !== -1) {
    e.respondWith(networkFirst(req));
  } else {
    e.respondWith(staleWhileRevalidate(req));
  }
});
