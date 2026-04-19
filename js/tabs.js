/* tabs.js — audience tab switching for index.html */
(function () {
  'use strict';
  var btns   = document.querySelectorAll('.tab-btn');
  var panels = document.querySelectorAll('.tab-panel');
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('aria-controls');
      btns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById(target).classList.add('active');
    });
  });
}());
