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
  var DEMO_PATHS = ['/global-accounts/demo', '/global-accounts/demo/'];
  var MIN_WIDTH = 280; // the original sidebar width — only resizes wider
  var MAX_WIDTH = 420;
  var SNAP_COLLAPSE = 240; // drag left past this x -> collapse
  var DRAG_THRESHOLD = 4; // px of movement before a press counts as a drag

  var rail = null;

  function isDesktop() {
    return window.innerWidth >= DESKTOP_MIN;
  }

  function isDemo() {
    return DEMO_PATHS.indexOf(location.pathname) !== -1;
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

  // Remembered preference wins everywhere; otherwise the playground defaults to
  // collapsed and every other page defaults to expanded.
  function shouldCollapse() {
    var pref = getPref();
    if (pref === '1') return true;
    if (pref === '0') return false;
    return isDemo();
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

  function removeRail() {
    if (rail && rail.parentNode) rail.parentNode.removeChild(rail);
    rail = null;
  }

  function ensureRail() {
    if (!isDesktop() || !document.getElementById('sidebar-content')) {
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
    var animTimer = 0;

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
      var next = !isCollapsed();
      setPref(next ? '1' : '0');
      applyState(next);
      // Suppress the hover reveal during the open/close animation so the button
      // and edge highlight don't flash from the cursor sitting over the rail
      // mid-transition; they reveal together on a real hover once settled.
      document.documentElement.classList.add('ls-nav-animating');
      clearTimeout(animTimer);
      animTimer = setTimeout(function () {
        document.documentElement.classList.remove('ls-nav-animating');
      }, 320);
    });
  }

  function sync() {
    applyState(shouldCollapse());
    ensureRail();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }

  // SPA navigation: Mintlify swaps content without a full reload.
  var lastPath = location.pathname;
  var observer = new MutationObserver(function () {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      sync();
    } else if (!rail || !document.body.contains(rail)) {
      ensureRail();
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
    });
  });
})();
