// Collapsible docs sidebar (desktop).
//
// Injects a small chevron "tab" on the right edge of #sidebar-content. Clicking
// it toggles html.ls-nav-collapsed (the CSS in style.css animates the
// collapse with an ease-out-snappy curve). The choice is remembered in
// localStorage and applies on every page; the Global Accounts playground
// defaults to collapsed until the visitor sets a preference.
//
// First-paint state is set by an inline script in docs.json head.raw so there's
// no flash; this file handles the interactive tab + SPA route changes.

(function () {
  var DESKTOP_MIN = 1024;
  var KEY = 'ls-nav-collapsed';
  var DEMO_PATHS = ['/global-accounts/demo', '/global-accounts/demo/'];
  var SIDEBAR_WIDTH = 280; // matches #sidebar-content width in style.css

  var tab = null;

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
      /* private mode / blocked storage — toggle still works for the session */
    }
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

  // The sidebar's expanded right edge. Computed from its left offset + the fixed
  // width so it's correct even while collapsed (width 0). Drives the tab's
  // resting position via --ls-sidebar-edge.
  function measureEdge() {
    var sidebar = document.getElementById('sidebar-content');
    if (!sidebar) return;
    var left = sidebar.getBoundingClientRect().left;
    var edge = Math.round(left + SIDEBAR_WIDTH);
    document.documentElement.style.setProperty('--ls-sidebar-edge', edge + 'px');
  }

  function updateTab() {
    if (!tab) return;
    var collapsed = isCollapsed();
    tab.setAttribute('aria-label', collapsed ? 'Show navigation' : 'Hide navigation');
    tab.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }

  function applyState(collapsed) {
    document.documentElement.classList.toggle('ls-nav-collapsed', collapsed);
    updateTab();
  }

  function removeTab() {
    if (tab && tab.parentNode) tab.parentNode.removeChild(tab);
    tab = null;
  }

  function ensureTab() {
    if (!isDesktop() || !document.getElementById('sidebar-content')) {
      removeTab();
      return;
    }
    if (tab && document.body.contains(tab)) return;

    tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'ls-nav-tab';
    tab.innerHTML = '<span class="ls-nav-tab-icon" aria-hidden="true"></span>';
    tab.addEventListener('click', function () {
      var next = !isCollapsed();
      setPref(next ? '1' : '0');
      measureEdge();
      applyState(next);
    });
    document.body.appendChild(tab);
    measureEdge();
    updateTab();
  }

  // Re-apply the default when no preference is stored (keeps a stored choice),
  // then make sure the tab exists.
  function sync() {
    applyState(shouldCollapse());
    ensureTab();
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
    } else if (!tab || !document.body.contains(tab)) {
      ensureTab();
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
      ensureTab();
      measureEdge();
    });
  });
})();
