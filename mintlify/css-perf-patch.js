// Neutralizes a Chrome/Blink pathology triggered by Mintlify's `:has()` CSS.
//
// THE BUG: three of Mintlify's code-block rules have selectors that start
// with a bare `:has(` (unanchored subject). The first time a matching
// standalone code block renders, Blink permanently marks the document root
// ":has-affected". While such marks exist AND `:has()` rules are present in
// active stylesheets, every forced style recalc walks the entire document
// (~30x slower: ~0.1ms -> ~20ms per recalc). Mermaid's ~280 getBBox
// measurements during navigation then freeze the page for many seconds
// (hovers dead; scroll survives on the compositor thread).
//
// Verified properties (see PR #697 for the experiments):
//   - the marks survive rule removal, content replacement, and forced
//     recalcs — they last for the life of the tab;
//   - but they only COST while `:has()` rules are present: with every
//     :has rule removed, recalcs drop back to ~0.1ms instantly;
//   - partial removal does not help — any remaining :has rule keeps the
//     expensive path armed.
//
// TWO DEFENSES, both in this file:
//
// 1. PREVENTION (always on): rewrite the three bare-:has selectors to
//    preceding-sibling equivalents the moment stylesheets appear. In
//    Mintlify's DOM the ":has() parent" is always a preceding sibling, so
//    this is visually identical (verified pixel-identical and computed-
//    style-identical across all Global Accounts pages, light + dark).
//    Exact-match only: if Mintlify ships different CSS this is a no-op.
//
// 2. CURE (poisoned tabs only): custom JS runs after first paint, so a tab
//    whose FIRST page renders a matching code block is marked before we can
//    prevent it. For those tabs we detect the poisoned state (one cheap
//    probe) and, around each SPA navigation, temporarily stash-and-delete
//    ALL :has rules (fighting mid-navigation stylesheet re-injection), then
//    restore them in place — same owner sheet, same index, so cascade and
//    @layer order are preserved. Cosmetic :has styling (sidebar chevron
//    hiding, code-block corner effects) is simplified for the few seconds
//    of the transition on those rare tabs; steady-state look is untouched.
//
// The complete fix is Mintlify correcting the three selectors upstream —
// delete this file when they do.
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

  // Rewrites a selector list via MAP. Returns null when nothing matched.
  function mapSelectorList(sel) {
    if (!sel || sel.indexOf(':has(') === -1) return null;
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
    return hit ? out.join(',') : null;
  }

  /* ------------------------- defense 1: prevention ------------------------ */

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
      if (!rule.selectorText && rule.cssRules && rule.cssRules.length) {
        patchRules(rule); // @media / @layer / @supports groups
        continue;
      }
      var mapped = mapSelectorList(rule.selectorText);
      if (!mapped) continue;
      try {
        var css = rule.cssText;
        var body = css.slice(css.indexOf('{'));
        owner.deleteRule(i);
        owner.insertRule(mapped + ' ' + body, i);
      } catch (e) {
        /* leave the rule as-is */
      }
    }
  }

  /* --------------------------- defense 2: cure ---------------------------- */

  var poisoned = false;
  var curing = false;
  var stash = []; // { owner, index, cssText } in deletion order (desc index per owner)
  var restoreTimer = 0;

  function probeCost() {
    var root = document.documentElement;
    void root.offsetHeight;
    var d = document.createElement('div');
    document.body.appendChild(d);
    var t0 = performance.now();
    void root.offsetHeight;
    var cost = performance.now() - t0;
    d.remove();
    void root.offsetHeight;
    return cost;
  }

  function detectPoison() {
    if (!document.body) return;
    try {
      var runs = [probeCost(), probeCost(), probeCost()].sort(function (a, b) { return a - b; });
      poisoned = runs[1] > 4; // healthy ~0.1-1ms, poisoned ~9-20ms
    } catch (e) {
      poisoned = false;
    }
  }

  function stashDeleteIn(owner) {
    var list;
    try {
      list = owner.cssRules;
    } catch (e) {
      return;
    }
    if (!list) return;
    for (var i = list.length - 1; i >= 0; i--) {
      var rule = list[i];
      var sel = rule.selectorText;
      if (sel && sel.indexOf(':has(') !== -1) {
        try {
          stash.push({ owner: owner, index: i, cssText: rule.cssText });
          owner.deleteRule(i);
          continue;
        } catch (e) {
          /* keep rule */
        }
      }
      if (rule.cssRules && rule.cssRules.length) stashDeleteIn(rule);
    }
  }

  function stashDeleteAll() {
    for (var i = 0; i < document.styleSheets.length; i++) {
      stashDeleteIn(document.styleSheets[i]);
    }
  }

  function restoreStash() {
    // Reinsert in reverse deletion order: per owner that yields ascending
    // indexes, so each recorded index is valid again at insertion time.
    for (var i = stash.length - 1; i >= 0; i--) {
      var entry = stash[i];
      var cssText = entry.cssText;
      // Never restore a bare-:has original — apply the prevention rewrite.
      var brace = cssText.indexOf('{');
      var mapped = mapSelectorList(cssText.slice(0, brace).trim());
      if (mapped) cssText = mapped + ' ' + cssText.slice(brace);
      try {
        var max = entry.owner.cssRules ? entry.owner.cssRules.length : 0;
        entry.owner.insertRule(cssText, Math.min(entry.index, max));
      } catch (e) {
        /* owner sheet gone or rule now invalid — skip */
      }
    }
    stash = [];
    curing = false;
  }

  function startCure() {
    if (!poisoned || curing) return;
    curing = true;
    stashDeleteAll();
    clearTimeout(restoreTimer);
    restoreTimer = setTimeout(restoreStash, 4000);
  }

  function extendCure() {
    // another navigation while a window is open: re-sweep + push restore out
    stashDeleteAll();
    clearTimeout(restoreTimer);
    restoreTimer = setTimeout(restoreStash, 4000);
  }

  function onNavigate() {
    if (!poisoned) return;
    if (curing) extendCure();
    else startCure();
  }

  // Navigation triggers: link clicks (earliest), history traversal, and a
  // pathname watcher as fallback for programmatic navigation.
  document.addEventListener(
    'click',
    function (e) {
      var a = e.target && e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) === '/' && href.indexOf('//') !== 0) onNavigate();
    },
    true
  );
  window.addEventListener('popstate', onNavigate);
  var lastPath = location.pathname;

  /* ------------------------------ scheduling ------------------------------ */

  function sweep() {
    if (curing) {
      stashDeleteAll(); // mid-navigation sheet re-injection brings rules back
    } else {
      for (var i = 0; i < document.styleSheets.length; i++) {
        patchRules(document.styleSheets[i]);
      }
    }
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      onNavigate();
    }
  }

  // Sweep every frame while the page settles (idempotent), then only when
  // new stylesheets appear (SPA navigations). Poison detection runs once,
  // after the page has settled.
  var settleAt = 0;
  function loop(now) {
    sweep();
    if (document.readyState === 'complete') {
      if (!settleAt) settleAt = now;
      if (now - settleAt > 2000) {
        detectPoison();
        return watch();
      }
    }
    requestAnimationFrame(loop);
  }

  function watch() {
    new MutationObserver(function (muts) {
      for (var m = 0; m < muts.length; m++) {
        var added = muts[m].addedNodes;
        for (var n = 0; n < added.length; n++) {
          var tag = added[n].tagName;
          if (tag === 'STYLE' || tag === 'LINK') {
            sweep();
            return;
          }
        }
      }
      if (location.pathname !== lastPath) {
        lastPath = location.pathname;
        onNavigate();
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  loop(performance.now());
})();
