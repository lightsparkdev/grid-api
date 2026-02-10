// Add 'is-homepage' class to body when on the homepage
// This allows us to target homepage-specific CSS

(function() {
  function checkHomepage() {
    const path = window.location.pathname;
    const isHomepage = path === '/' || path === '/index' || path === '';
    
    if (isHomepage) {
      document.body.classList.add('is-homepage');
    } else {
      document.body.classList.remove('is-homepage');
    }
  }
  
  // Run on initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkHomepage);
  } else {
    checkHomepage();
  }
  
  // Also run on navigation (for SPA-style navigation)
  window.addEventListener('popstate', checkHomepage);
  
  // Observe URL changes for client-side routing
  const observer = new MutationObserver(checkHomepage);
  observer.observe(document.body, { childList: true, subtree: true });
})();
