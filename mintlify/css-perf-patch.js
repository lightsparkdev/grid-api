// Rewrites three of Mintlify's code-block CSS rules whose selectors start
// with a bare `:has(` — an unanchored subject that, in Chrome/Blink,
// permanently flags the document root as ":has-affected" the first time a
// matching code block renders. From then on, every forced style recalc in
// the tab walks the entire document (~30x slower), which turns mermaid's
// ~280 getBBox measurements during navigation into a multi-second freeze
// (hover effects dead; scroll survives on the compositor thread).
//
// In Mintlify's DOM the ":has() parent" is always expressible as a preceding
// sibling instead, which Blink matches cheaply. Verified pixel-identical and
// computed-style-identical across all Global Accounts pages, light + dark.
//
// Rules are only touched on an exact selector match, so if Mintlify ships
// different CSS this becomes a no-op — the look can never break; worst case
// the perf fix silently stops applying.
//
// Coverage caveat: custom JS runs after first paint, so a tab whose FIRST
// page is one that renders standalone code blocks (e.g. implementation-
// overview) is poisoned before this runs, and that can't be undone. All
// pages rendered after this script runs (every SPA navigation) are safe.
// The complete fix is Mintlify correcting these selectors upstream — remove
// this file when they do.
(function () {
  var MAP = {
    ':has([data-floating-buttons]) > [data-component-part="code-block-root"] pre > code':
      '[data-floating-buttons] ~ [data-component-part="code-block-root"] pre > code',
    ':has([data-component-part="code-block-header"]) > [data-component-part="code-block-root"] pre > code':
      '[data-component-part="code-block-header"] ~ [data-component-part="code-block-root"] pre > code',
    ':has([data-component-part="code-group-tab-bar"]) [data-component-part="code-block-root"] pre > code':
      '[data-component-part="code-group-tab-bar"] ~ [data-component-part="code-block-root"] pre > code, ' +
      '[data-component-part="code-group-tab-bar"] ~ * [data-component-part="code-block-root"] pre > code',
  };

  function patchRules(owner) {
    var list;
    try {
      list = owner.cssRules;
    } catch (e) {
      return; // cross-origin sheet
    }
    if (!list) return;
    for (var i = list.length - 1; i >= 0; i--) {
      var rule = list[i];
      if (rule.cssRules && rule.cssRules.length) {
        patchRules(rule); // @media / @layer / @supports groups
        continue;
      }
      var sel = rule.selectorText;
      if (!sel || sel.indexOf(':has(') === -1) continue;
      var parts = sel.split(',');
      var out = [];
      var hit = false;
      for (var j = 0; j < parts.length; j++) {
        var trimmed = parts[j].trim();
        if (MAP[trimmed]) {
          out.push(MAP[trimmed]);
          hit = true;
        } else {
          out.push(parts[j]);
        }
      }
      if (!hit) continue;
      try {
        var css = rule.cssText;
        var body = css.slice(css.indexOf('{'));
        owner.deleteRule(i);
        owner.insertRule(out.join(',') + ' ' + body, i);
      } catch (e) {
        /* leave the rule as-is */
      }
    }
  }

  function scanAll() {
    for (var i = 0; i < document.styleSheets.length; i++) {
      patchRules(document.styleSheets[i]);
    }
  }

  // Scan every frame while the page is still settling (idempotent: once a
  // rule is rewritten its selector no longer matches the map)...
  var settleAt = 0;
  function loop(now) {
    scanAll();
    if (document.readyState === 'complete') {
      if (!settleAt) settleAt = now;
      if (now - settleAt > 2000) return watch();
    }
    requestAnimationFrame(loop);
  }

  // ...then only re-scan when new stylesheets appear (SPA navigations).
  function watch() {
    new MutationObserver(function (muts) {
      for (var m = 0; m < muts.length; m++) {
        var added = muts[m].addedNodes;
        for (var n = 0; n < added.length; n++) {
          var tag = added[n].tagName;
          if (tag === 'STYLE' || tag === 'LINK') {
            scanAll();
            return;
          }
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  loop(performance.now());
})();
