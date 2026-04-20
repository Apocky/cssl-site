/* compression-demo.js — side-by-side EN ↔ CSLv3 showcase.
 * Preset-only (no live translator): six hand-paired examples from the
 * CSLv3 corpus illustrate the density argument. Char-based ratio is
 * shown with a disclaimer that precise token counts are model-specific.
 * Mounts into #compression-demo-mount if present on the page.
 */
(function () {
  'use strict';

  // Presets : each entry {topic, en, csl}. Hand-paired from specs/06 & 09.
  var PRESETS = [
    {
      topic: 'constraint',
      en:
        'Player health must remain between zero and the maximum value at all times.\n' +
        'Whenever health reaches zero, the player enters the dead state, and this\n' +
        'transition is irreversible within a single run.',
      csl:
        '§ player.hp\n' +
        '  W! 0 ≤ hp ≤ hp.max\n' +
        '  hp = 0 → state = dead\n' +
        '  N! resurrect @ run\n'
    },
    {
      topic: 'struct-def',
      en:
        'A Request has three fields: a method which is one of GET POST PUT or\n' +
        'DELETE; a path which is a string; and a body which is a sequence of\n' +
        'bytes. A Response has a status code, a body, and a list of header\n' +
        'key-value pairs.',
      csl:
        'Request  ⟨ method : Method, path : str, body : bytes ⟩\n' +
        'Response ⟨ status : i16, body : bytes, headers : [[str,str]] ⟩\n' +
        'Method = GET | POST | PUT | DELETE\n'
    },
    {
      topic: 'algorithm-sketch',
      en:
        'Binary search takes a sorted array and a key. Keep two pointers, low\n' +
        'starting at zero and high at the length of the array. While low is\n' +
        'less than high, compute the midpoint; if the element there equals the\n' +
        'key, return the index; if less, move low to one past the midpoint;\n' +
        'otherwise move high down to the midpoint. Return minus-one if not\n' +
        'found.',
      csl:
        '§ binsearch\n' +
        '  fn find (a : &[i32], k : i32) -> i32 =\n' +
        '    lo = 0 ; hi = len(a)\n' +
        '    while lo < hi :\n' +
        '      m = (lo + hi) / 2\n' +
        '      a[m] = k  ?  return m\n' +
        '      a[m] < k  ?  lo = m+1  :  hi = m\n' +
        '    return -1\n'
    },
    {
      topic: 'think-block',
      en:
        'Problem: the garbage-collected pointer leaks under contention. Decompose:\n' +
        'one, identify which acquire-release pair is unbalanced; two, determine\n' +
        'whether the leak is per-thread or shared; three, propose a fix. Trace:\n' +
        'acquire side looks fine; release side misses the drop in the panic-path.\n' +
        'Synthesis: add a drop guard on the panic path. Check: the fix holds\n' +
        'under the concurrent-panic stress test.',
      csl:
        '§P GC-ptr leaks @ contention\n' +
        '§D\n' +
        '  .1 unbalanced-acq/rel ?\n' +
        '  .2 per-thread ∨ shared ?\n' +
        '  .3 propose-fix\n' +
        '§T\n' +
        '  acq ✓ ; rel ✗ @ panic-path\n' +
        '§S drop-guard @ panic\n' +
        '§C concurrent-panic-stress ✓\n'
    },
    {
      topic: 'spec-section',
      en:
        'The HTTP handler must return a response with a status between one-\n' +
        'hundred and five-ninety-nine. For GET requests, the body is either\n' +
        'cached or freshly fetched. The handler must not write to disk, and\n' +
        'must not take longer than one-hundred milliseconds.',
      csl:
        '§INVARIANTS @ handler\n' +
        '  W! ∀ req : handle(req).status ∈ [100..599]\n' +
        '  W! (method = GET) → body ∈ {cached, fetched}\n' +
        '  N! write-to-disk\n' +
        '  N! latency > 100ms\n'
    },
    {
      topic: 'relationship-graph',
      en:
        'A warrior is an entity. A warrior has health, armor, and a weapon.\n' +
        'When the warrior\'s health reaches zero, the warrior dies. Armor\n' +
        'reduces incoming damage by a fixed amount. The weapon determines\n' +
        'outgoing damage.',
      csl:
        'warrior :: entity\n' +
        'warrior ⊗ ⟨hp, armor, weapon⟩\n' +
        'warrior.hp = 0 → warrior.state = dead\n' +
        'damage.in ~> damage.in - armor\n' +
        'damage.out <- weapon.dmg\n'
    }
  ];

  function charCount(s) { return s.length; }
  function lineCount(s) { return (s.match(/\n/g) || []).length + 1; }
  // Rough token approximation : ~3.5 chars/token for English prose, ~2.5 for CSL
  // (glyphs skew CSL slightly higher per char but each CSL token carries more info).
  // Label as approximate; precise counts require model-specific tokenizers.
  function approxTokens(s, dense) {
    return Math.max(1, Math.round(s.length / (dense ? 2.5 : 3.5)));
  }

  function mount() {
    var host = document.getElementById('compression-demo-mount');
    if (!host) return;
    var el = document.createElement('div');
    el.id = 'compression-demo';
    el.innerHTML =
      '<div class="cd-header">' +
      '  <label for="cd-preset">preset</label>' +
      '  <select id="cd-preset" aria-label="Compression demo preset">' +
      PRESETS.map(function (p, i) { return '<option value="' + i + '">' + p.topic + '</option>'; }).join('') +
      '  </select>' +
      '</div>' +
      '<div class="cd-split">' +
      '  <div class="cd-pane">' +
      '    <div class="cd-pane-label">English prose</div>' +
      '    <pre id="cd-en"></pre>' +
      '  </div>' +
      '  <div class="cd-pane">' +
      '    <div class="cd-pane-label">CSLv3</div>' +
      '    <pre id="cd-csl"></pre>' +
      '  </div>' +
      '</div>' +
      '<div class="cd-metrics" id="cd-metrics"></div>' +
      '<div class="cd-metrics" style="border-top:none;opacity:0.6;font-size:0.65rem;">' +
      'chars measured exactly ; tokens are approximate (~3.5 chars/tok for EN, ~2.5 for CSL). ' +
      'Precise token counts vary by model tokenizer ; see ' +
      '<a href="https://github.com/ApockyCSSL/CSLv3" style="color:inherit;border-bottom:1px dotted">the repo</a> ' +
      'for m₂-metric measurements under Qwen, Llama, and Mistral.' +
      '</div>';
    host.appendChild(el);

    var sel = document.getElementById('cd-preset');
    var enPre = document.getElementById('cd-en');
    var cslPre = document.getElementById('cd-csl');
    var metrics = document.getElementById('cd-metrics');

    function render(i) {
      var p = PRESETS[i];
      enPre.textContent = p.en;
      cslPre.textContent = p.csl;
      var enC = charCount(p.en), cslC = charCount(p.csl);
      var enT = approxTokens(p.en, false), cslT = approxTokens(p.csl, true);
      var charRatio = (cslC / enC);
      var tokRatio = (cslT / enT);
      var charPct = Math.max(4, Math.round(charRatio * 100));
      metrics.innerHTML =
        '<span class="cd-metric">chars : ' +
        '  <strong>' + cslC + '</strong> / ' + enC +
        '  = <strong>' + charRatio.toFixed(2) + '×</strong>' +
        '  <span class="cd-bar" style="width:' + charPct + 'px"></span>' +
        '</span>' +
        '<span class="cd-metric">~tokens : ' +
        '  <strong>' + cslT + '</strong> / ' + enT +
        '  = <strong>' + tokRatio.toFixed(2) + '×</strong>' +
        '</span>' +
        '<span class="cd-metric">lines : ' +
        '  <strong>' + lineCount(p.csl) + '</strong> / ' + lineCount(p.en) +
        '</span>';
    }
    sel.addEventListener('change', function () { render(parseInt(sel.value, 10)); });
    render(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
