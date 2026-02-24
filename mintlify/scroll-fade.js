(function () {
  var EDGE_THRESHOLD = 2;
  var DRAG_THRESHOLD = 5;
  var DEBOUNCE_MS = 100;
  var FADE_SELECTOR = '[data-component-part="tabs-list"]';

  function updateFadeClasses(el) {
    var scrollLeft = el.scrollLeft;
    var scrollWidth = el.scrollWidth;
    var clientWidth = el.clientWidth;
    var canScrollLeft = scrollLeft > EDGE_THRESHOLD;
    var canScrollRight = scrollLeft < scrollWidth - clientWidth - EDGE_THRESHOLD;
    var overflows = scrollWidth > clientWidth + EDGE_THRESHOLD;

    el.classList.toggle("is-scrollable", overflows);
    el.classList.toggle("scroll-fade-both", canScrollLeft && canScrollRight);
    el.classList.toggle("scroll-fade-left", canScrollLeft && !canScrollRight);
    el.classList.toggle("scroll-fade-right", !canScrollLeft && canScrollRight);

    if (!canScrollLeft && !canScrollRight) {
      el.classList.remove(
        "scroll-fade-left",
        "scroll-fade-right",
        "scroll-fade-both"
      );
    }
  }

  function initDragScroll(el) {
    var isDown = false;
    var startX = 0;
    var startScrollLeft = 0;
    var hasDragged = false;

    el.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      isDown = true;
      hasDragged = false;
      startX = e.pageX;
      startScrollLeft = el.scrollLeft;
    });

    el.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      var dx = e.pageX - startX;
      if (!hasDragged && Math.abs(dx) < DRAG_THRESHOLD) return;

      if (!hasDragged) {
        hasDragged = true;
        el.classList.add("is-dragging");
      }

      e.preventDefault();
      el.scrollLeft = startScrollLeft - dx;
    });

    function endDrag() {
      if (!isDown) return;
      isDown = false;
      if (hasDragged) {
        el.classList.remove("is-dragging");
        // Suppress the click that follows mouseup after a drag
        el.addEventListener(
          "click",
          function (e) {
            e.stopPropagation();
            e.preventDefault();
          },
          { once: true, capture: true }
        );
      }
      hasDragged = false;
    }

    el.addEventListener("mouseup", endDrag);
    el.addEventListener("mouseleave", endDrag);
  }

  function initTabList(el) {
    if (el.dataset.scrollFadeInit) return;
    el.dataset.scrollFadeInit = "true";

    updateFadeClasses(el);
    el.addEventListener("scroll", function () { updateFadeClasses(el); }, {
      passive: true,
    });

    var ro = new ResizeObserver(function () { updateFadeClasses(el); });
    ro.observe(el);

    initDragScroll(el);
  }

  function initAll() {
    var els = document.querySelectorAll(FADE_SELECTOR);
    for (var i = 0; i < els.length; i++) {
      initTabList(els[i]);
    }
  }

  // Debounced version for MutationObserver
  var timer = null;
  function debouncedInitAll() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(initAll, DEBOUNCE_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  var observer = new MutationObserver(debouncedInitAll);
  observer.observe(document.body, { childList: true, subtree: true });
})();
