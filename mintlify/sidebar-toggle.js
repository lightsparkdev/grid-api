// Collapsible + resizable docs sidebar (desktop).
//
// A rail on the right edge of #sidebar-content:
//  - drag it to resize the sidebar (clamped MIN..MAX); release below the snap
//    threshold to collapse.
//  - click it (no drag) to toggle collapse.
// Collapsed shows a slim visible rail with a bare icon (click/pointer to
// reopen); expanded shows the toggle on hover at the edge (col-resize). Width +
// collapsed state persist in localStorage and are restored pre-paint by the
// inline script in docs.json head.raw, so there's no flash.

(function () {
  var DESKTOP_MIN = 1024;
  var KEY = 'ls-nav-collapsed';
  var MIN_WIDTH = 280; // the original sidebar width — only resizes wider
  var MAX_WIDTH = 420;
  var SNAP_COLLAPSE = 240; // drag left past this x -> collapse
  var DRAG_THRESHOLD = 4; // px of movement before a press counts as a drag

  var rail = null;

  function isDesktop() {
    return window.innerWidth >= DESKTOP_MIN;
  }

  // #sidebar-content is in the DOM on every docs page, but custom-layout pages
  // (frontmatter mode: "custom", e.g. the flow builder) keep it and hide it
  // (display:none). getClientRects() is empty for a non-rendered element, so this
  // is true only when there's a real sidebar to toggle — no sidebar, no rail.
  function hasVisibleSidebar() {
    var sc = document.getElementById('sidebar-content');
    return !!sc && sc.getClientRects().length > 0;
  }

  function getPref() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function setPref(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (e) {
      /* private mode — toggle still works for the session */
    }
  }

  function clampWidth(w) {
    return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, Math.round(w)));
  }

  // Width is session-only — not persisted, so a refresh resets to the 280px
  // default (the CSS var fallback) with no post-paint resize jump.
  function applyWidth(w) {
    document.documentElement.style.setProperty('--ls-sidebar-width', w + 'px');
  }

  // Follow the saved preference; default expanded everywhere (including the
  // playground) so the docs nav is visible by default. The rail is still there
  // to collapse the sidebar for more room.
  function shouldCollapse() {
    return getPref() === '1';
  }

  function isCollapsed() {
    return document.documentElement.classList.contains('ls-nav-collapsed');
  }

  function updateRail() {
    if (!rail) return;
    var collapsed = isCollapsed();
    rail.setAttribute('aria-label', collapsed ? 'Show navigation' : 'Hide navigation');
    rail.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }

  function applyState(collapsed) {
    document.documentElement.classList.toggle('ls-nav-collapsed', collapsed);
    updateRail();
  }

  // Deliberate, animated toggle — shared by the edge rail and the footer
  // button. ls-nav-animating turns the collapse transition on for this toggle
  // (it's off by default so navigation never animates) and suppresses the
  // hover reveal so the button/edge don't flash from the cursor sitting over
  // the rail mid-transition. Add it + force a reflow before applyState so the
  // width/opacity change animates from the current value, not snaps.
  var animTimer = 0;
  function animatedToggle() {
    var next = !isCollapsed();
    setPref(next ? '1' : '0');
    // Mute the rail tooltip: its copy flips with the state (Collapse ⇄
    // Expand), so it must not reappear under a cursor that just sat through
    // the click with the swapped text. A fresh rail mouseenter unmutes.
    document.documentElement.classList.add('ls-nav-tip-muted');
    document.documentElement.classList.add('ls-nav-animating');
    document.documentElement.getBoundingClientRect(); // force reflow to arm the transition
    applyState(next);
    clearTimeout(animTimer);
    animTimer = setTimeout(function () {
      document.documentElement.classList.remove('ls-nav-animating');
    }, 320);
  }

  function removeRail() {
    if (rail && rail.parentNode) rail.parentNode.removeChild(rail);
    rail = null;
  }

  // Collapse button in the sidebar footer, next to the theme switcher — the
  // discoverable affordance (the edge rail only reveals on hover). This
  // element is only the invisible HIT TARGET: the visible circle + glyph are
  // pseudo-elements of the server-rendered switcher (see style.css), so the
  // button shows from first paint instead of popping in when this script
  // finally runs. Lives inside #sidebar-content so the collapsed state hides
  // it with the rest of the footer; reopening is the rail's job.
  var footerBtn = null;

  function removeFooterBtn() {
    if (footerBtn && footerBtn.parentNode) footerBtn.parentNode.removeChild(footerBtn);
    footerBtn = null;
  }

  function ensureFooterBtn() {
    if (!isDesktop() || !hasVisibleSidebar()) {
      removeFooterBtn();
      return;
    }
    if (footerBtn && document.body.contains(footerBtn)) return;
    // Two generations of Mintlify markup (keep in sync with the CSS anchors):
    // the pinned local CLI renders a single "Toggle dark mode" button; the
    // evergreen hosted renderer (prod + previews) a "Theme preference" group.
    var theme = document.querySelector(
      '#sidebar-content button[aria-label="Toggle dark mode"], ' +
        '#sidebar-content [role="group"][aria-label="Theme preference"]'
    );
    if (!theme || !theme.parentElement) return;
    footerBtn = document.createElement('button');
    footerBtn.type = 'button';
    footerBtn.className = 'ls-nav-collapse-btn';
    footerBtn.setAttribute('aria-label', 'Hide navigation');
    footerBtn.addEventListener('click', animatedToggle);
    // Rightmost in the footer row: [spacer][theme switcher][collapse].
    theme.parentElement.insertBefore(footerBtn, theme.nextSibling);
  }

  function ensureRail() {
    if (!isDesktop() || !hasVisibleSidebar()) {
      removeRail();
      return;
    }
    if (rail && document.body.contains(rail)) return;

    rail = document.createElement('button');
    rail.type = 'button';
    rail.className = 'ls-nav-rail';
    rail.innerHTML = '<span class="ls-nav-rail-btn" aria-hidden="true"></span>';
    attachInteractions(rail);
    document.body.appendChild(rail);
    updateRail();
  }

  // Drag = resize (expanded only); plain click = toggle collapse (either state,
  // mouse or keyboard).
  function attachInteractions(el) {
    var startX = 0;
    var moved = false;
    var dragging = false;
    var dragEndAt = 0;

    function onMove(e) {
      if (!moved && Math.abs(e.clientX - startX) > DRAG_THRESHOLD) {
        moved = true;
        dragging = true;
        document.documentElement.classList.add('ls-nav-dragging');
        document.body.style.userSelect = 'none';
      }
      if (!dragging) return;
      // Live: crossing the snap threshold collapses immediately (no release
      // needed); dragging back out reopens and resumes resizing.
      if (e.clientX < SNAP_COLLAPSE) {
        if (!isCollapsed()) applyState(true);
      } else {
        if (isCollapsed()) applyState(false);
        applyWidth(clampWidth(e.clientX));
      }
    }

    function onUp(e) {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('mouseup', onUp, true);
      if (!moved) return; // a click — handled by the click listener
      dragEndAt = Date.now();
      document.documentElement.classList.remove('ls-nav-dragging');
      document.body.style.userSelect = '';
      // State was already applied live during the drag — just persist it.
      if (isCollapsed()) {
        setPref('1');
      } else {
        applyWidth(clampWidth(e.clientX));
        setPref('0');
      }
    }

    // A genuine (re-)entry re-arms the tooltip muted by animatedToggle.
    el.addEventListener('mouseenter', function () {
      document.documentElement.classList.remove('ls-nav-tip-muted');
    });

    // Resize only from the expanded edge; the collapsed rail is click-only.
    el.addEventListener('mousedown', function (e) {
      if (e.button !== 0 || isCollapsed()) return;
      e.preventDefault();
      startX = e.clientX;
      moved = false;
      dragging = false;
      document.addEventListener('mousemove', onMove, true);
      document.addEventListener('mouseup', onUp, true);
    });

    el.addEventListener('click', function () {
      if (Date.now() - dragEndAt < 300) return; // swallow the click after a drag
      animatedToggle();
    });
  }

  // Page-scoped classes on <html> — the cheap replacement for html:has(...)
  // selectors in style.css / head.raw. A :has() anchored at the root gets
  // re-evaluated on DOM mutations anywhere in the document, which froze
  // navigation for seconds on pages that build DOM incrementally (mermaid
  // diagrams). This is the effective setter on both full loads and SPA
  // navigations (head.raw carries a pre-paint copy, but the hosted renderer
  // currently strips head.raw scripts).
  function updatePageClasses() {
    var root = document.documentElement;
    var path = location.pathname.replace(/\/+$/, '') || '/';
    root.classList.toggle('ls-page-flow-builder', path === '/flow-builder');
    root.classList.toggle('ls-page-wallet-demo', path === '/global-accounts/demo');
    // Custom-layout pages (frontmatter mode: "custom") — detected from the
    // DOM so future custom pages are covered without listing paths here.
    root.classList.toggle('ls-page-custom', !!document.querySelector('.is-custom'));
  }

  function sync() {
    var root = document.documentElement;
    updatePageClasses();
    // Navigation/first paint must never animate (only deliberate toggles do —
    // see the click handler). Clear the animate flag, and snap the rail button
    // for this navigation-driven state change so its icon doesn't ghost in/out
    // between pages; restore its transition next frame so hover reveals animate.
    root.classList.remove('ls-nav-animating');
    root.classList.add('ls-nav-snap');
    applyState(shouldCollapse());
    ensureRail();
    ensureFooterBtn();
    requestAnimationFrame(function () {
      root.classList.remove('ls-nav-snap');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }

  // SPA navigation: Mintlify swaps content without a full reload. On a path
  // change, re-sync. Otherwise only schedule the rAF-debounced ensure pass
  // when something is actually out of sync: the rail/footer button got wiped,
  // or the .is-custom marker (which mounts after the pathname flips) doesn't
  // match the ls-page-custom class yet — a cheap guard so we don't read
  // layout every frame.
  var lastPath = location.pathname;
  var ensureScheduled = false;
  function scheduleEnsure() {
    if (ensureScheduled) return;
    ensureScheduled = true;
    requestAnimationFrame(function () {
      ensureScheduled = false;
      updatePageClasses();
      ensureRail();
      ensureFooterBtn();
    });
  }
  var observer = new MutationObserver(function () {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      sync();
      return;
    }
    var customStale =
      !!document.querySelector('.is-custom') !==
      document.documentElement.classList.contains('ls-page-custom');
    if (
      customStale ||
      !rail ||
      !document.body.contains(rail) ||
      !footerBtn ||
      !document.body.contains(footerBtn)
    ) {
      scheduleEnsure();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('popstate', sync);

  var rafPending = false;
  window.addEventListener('resize', function () {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      ensureRail();
      ensureFooterBtn();
    });
  });
})();
