/* toc.js — auto-generated Table of Contents for the CSLv3 page.
 *   - sticky right-rail on ≥1024px viewports
 *   - collapsible <details> on mobile
 *   - IntersectionObserver-based active-section highlighting
 *   - smooth-scroll on click with offset
 * Idempotent: re-running mounts a single instance.
 */
(function () {
  'use strict';
  if (document.getElementById('toc')) return;

  var main = document.querySelector('main') || document.body;
  var sections = main.querySelectorAll('section[id]');
  if (sections.length < 3) return;   // not worth a TOC

  var nav = document.createElement('nav');
  nav.id = 'toc';
  nav.setAttribute('aria-label', 'Page contents');
  nav.innerHTML = '<div class="toc-wrap">' +
                  '  <div class="toc-title">Contents</div>' +
                  '  <ol class="toc-list"></ol>' +
                  '</div>';
  var list = nav.querySelector('.toc-list');
  sections.forEach(function (s) {
    var h = s.querySelector('h2, h3');
    if (!h) return;
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + s.id;
    a.textContent = h.textContent.replace(/¶/g, '').trim();
    a.dataset.target = s.id;
    li.appendChild(a);
    list.appendChild(li);
  });

  // mobile wrap: <details> collapsible
  var mobile = document.createElement('details');
  mobile.id = 'toc-mobile';
  mobile.innerHTML = '<summary>Contents</summary>';
  var mobileList = list.cloneNode(true);
  mobileList.classList.remove('toc-list');
  mobileList.classList.add('toc-list-mobile');
  mobile.appendChild(mobileList);

  // Find the main first so we can insert before it
  if (main.parentElement) {
    main.parentElement.insertBefore(mobile, main);
    main.parentElement.insertBefore(nav, main);
  } else {
    document.body.appendChild(nav);
  }

  // smooth-scroll on click
  function scrollHandler(e) {
    var a = e.target.closest('a[data-target], a[href^="#"]');
    if (!a) return;
    var id = a.dataset.target || a.getAttribute('href').slice(1);
    var tgt = document.getElementById(id);
    if (!tgt) return;
    e.preventDefault();
    history.replaceState(null, '', '#' + id);
    tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (mobile.open) mobile.open = false;
  }
  nav.addEventListener('click', scrollHandler);
  mobile.addEventListener('click', scrollHandler);

  // IntersectionObserver for active-section highlighting
  if ('IntersectionObserver' in window) {
    var active = null;
    function setActive(id) {
      if (active === id) return;
      active = id;
      nav.querySelectorAll('a').forEach(function (a) {
        a.classList.toggle('active', a.dataset.target === id);
      });
      mobileList.querySelectorAll('a').forEach(function (a) {
        a.classList.toggle('active', a.dataset.target === id);
      });
    }
    var io = new IntersectionObserver(function (entries) {
      // pick the first intersecting section above the mid-line
      var best = null, bestY = Infinity;
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var top = e.boundingClientRect.top;
          if (top < bestY) { bestY = top; best = e.target; }
        }
      });
      if (best) setActive(best.id);
    }, { rootMargin: '-20% 0% -60% 0%', threshold: 0 });
    sections.forEach(function (s) { io.observe(s); });
  }
})();
