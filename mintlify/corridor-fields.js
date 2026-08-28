// Filters the corridor required-fields table rendered by
// snippets/corridor-required-fields.mdx. Every filter combination ships in the
// same table; the rows that don't match are hidden. Styling lives in style.css.
(function () {
  function filterValue(root, name) {
    const select = root.querySelector(`[data-corridor-filter="${name}"]`);
    return select ? select.value : null;
  }

  function applyFilters(root) {
    const sender = filterValue(root, 'sender');
    const receiver = filterValue(root, 'receiver');
    const currency = filterValue(root, 'currency');
    let matches = 0;

    root.querySelectorAll('tbody tr').forEach(function (row) {
      const isMatch =
        row.dataset.sender === sender &&
        row.dataset.receiver === receiver &&
        (currency === 'ALL' || row.dataset.currency === currency);
      row.hidden = !isMatch;
      if (isMatch) {
        matches += 1;
      }
    });

    // Hide the table itself, not just its rows: a lone header reads as a bug.
    const table = root.querySelector('table');
    if (table) {
      table.hidden = matches === 0;
    }

    const empty = root.querySelector('[data-corridor-empty]');
    if (empty) {
      empty.hidden = matches > 0;
    }
  }

  document.addEventListener('change', function (event) {
    const root = event.target.closest('[data-corridor-fields]');
    if (root) {
      applyFilters(root);
    }
  });
})();
