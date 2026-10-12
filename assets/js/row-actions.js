/* Pinless Pay: shared accessible, portal-based row action menu for editable tables. */
(() => {
  const menu = document.createElement('div');
  menu.className = 'row-actions-dropdown';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', 'Row actions');
  menu.hidden = true;
  let current = null;

  const svg = (kind) => kind === 'more'
    ? '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>'
    : kind === 'edit'
    ? '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v7m4-7v7"/></svg>';

  function position() {
    if (!current) return;
    const {button} = current;
    if (!button.isConnected) { close(false); return; }
    const r = button.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) {
      close(false); return;
    }
    const width = menu.offsetWidth || 178;
    const height = menu.offsetHeight || 96;
    const left = Math.max(8, Math.min(window.innerWidth - width - 8, r.right - width));
    const top = r.bottom + 5 + height <= window.innerHeight - 8
      ? r.bottom + 5
      : Math.max(8, r.top - height - 5);
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
  }

  function close(restoreFocus = false) {
    const previous = current;
    if (!previous) return;
    current = null;
    previous.button.setAttribute('aria-expanded', 'false');
    previous.row.classList.remove('row-actions-open');
    menu.hidden = true;
    menu.replaceChildren();
    if (restoreFocus && previous.button.isConnected) previous.button.focus({preventScroll: true});
  }

  function option(icon, label, callback, danger = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'row-actions-option' + (danger ? ' is-danger' : '');
    button.setAttribute('role', 'menuitem');
    button.innerHTML = svg(icon) + '<span>' + label + '</span>';
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      close(false);
      callback();
    });
    return button;
  }

  function open(button, row, name, onEdit, onDelete) {
    if (current?.button === button) { close(true); return; }
    close(false);
    current = {button, row};
    button.setAttribute('aria-expanded', 'true');
    row.classList.add('row-actions-open');
    menu.replaceChildren(
      option('edit', 'Edit', onEdit),
      option('delete', 'Delete', onDelete, true)
    );
    menu.setAttribute('aria-label', name + ' actions');
    menu.hidden = false;
    position();
    menu.querySelector('button')?.focus({preventScroll:true});
  }

  function attach(cell, {row, name, onEdit, onDelete}) {
    if (!cell || cell.querySelector('.row-actions-trigger')) return;
    cell.classList.add('row-action-cell');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'row-actions-trigger';
    button.setAttribute('aria-label', 'More actions for ' + name);
    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = svg('more');
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      open(button, row, name, onEdit, onDelete);
    });
    cell.appendChild(button);
  }

  document.body.appendChild(menu);
  document.addEventListener('pointerdown', event => {
    if (current && !menu.contains(event.target) && !current.button.contains(event.target)) close(false);
  }, true);
  document.addEventListener('keydown', event => {
    if (!current) return;
    if (event.key === 'Escape') { event.preventDefault(); close(true); }
    else if (event.key === 'Tab') close(false);
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!menu.contains(document.activeElement)) return;
      event.preventDefault();
      const options = Array.from(menu.querySelectorAll('button'));
      const i = options.indexOf(document.activeElement);
      options[(i + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length]?.focus();
    }
  });
  window.addEventListener('resize', position);
  document.addEventListener('scroll', position, true);
  window.PinlessRowActions = {attach, close};
})();