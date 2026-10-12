/* Shared Gmail-style floating row actions. No permanent Actions column. */
(() => {
  const menu = document.createElement('div');
  menu.className = 'row-actions-dropdown';
  menu.setAttribute('role','menu');
  menu.hidden = true;
  document.body.appendChild(menu);

  const entries = new Set();
  const bound = new WeakMap();
  let opened = null;
  let hovered = null;

  const icon = kind => ({
    more:'<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
    edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z"/>',
    delete:'<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v7m4-7v7"/>'
  })[kind];

  const svg = kind => '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + icon(kind) + '</svg>';
  const touch = window.matchMedia('(hover: none), (pointer: coarse)');

  function close(restoreFocus = false) {
    const previous = opened;
    if (!previous) return;
    opened = null;
    previous.button.setAttribute('aria-expanded','false');
    previous.row.classList.remove('row-actions-open');
    menu.hidden = true;
    menu.replaceChildren();
    if (restoreFocus && previous.button.isConnected) previous.button.focus({preventScroll:true});
    if (previous !== hovered) previous.button.classList.remove('is-visible');
  }

  function prune() {
    for (const entry of entries) {
      if (entry.row.isConnected && entry.scroller.isConnected) continue;
      if (opened === entry) close(false);
      if (hovered === entry) hovered = null;
      entry.button.remove();
      entries.delete(entry);
      bound.delete(entry.row);
    }
  }

  function show(entry) {
    if (hovered && hovered !== entry && hovered !== opened) hovered.button.classList.remove('is-visible');
    hovered = entry;
    entry.button.classList.add('is-visible');
  }
  function hide(entry) {
    if (opened === entry || entry.button.matches(':focus-visible')) return;
    if (hovered === entry) hovered = null;
    entry.button.classList.remove('is-visible');
  }

  function place(entry) {
    const {row,scroller,button} = entry;
    if (row.hidden || !row.getClientRects().length) {
      button.hidden = true; return;
    }
    const rr = row.getBoundingClientRect();
    const sr = scroller.getBoundingClientRect();
    const size = 36;
    const verticalTop = Math.max(sr.top,0);
    const verticalBottom = Math.min(sr.bottom,window.innerHeight);
    if (rr.bottom <= verticalTop || rr.top >= verticalBottom ||
        sr.right <= 0 || sr.left >= window.innerWidth) {
      button.hidden = true; return;
    }
    button.hidden = false;
    const x = Math.min(sr.right - size - 10,window.innerWidth - size - 8);
    const y = rr.top + (rr.height - size) / 2;
    button.style.left = Math.max(sr.left + 4,x) + 'px';
    button.style.top = y + 'px';
  }

  function placeMenu() {
    if (!opened || menu.hidden) return;
    const r = opened.button.getBoundingClientRect();
    const width = menu.offsetWidth || 178;
    const height = menu.offsetHeight || 96;
    menu.style.left = Math.max(8, Math.min(window.innerWidth - width - 8, r.right - width)) + 'px';
    menu.style.top = (r.bottom + height + 6 <= window.innerHeight - 8
      ? r.bottom + 5 : Math.max(8, r.top - height - 5)) + 'px';
  }
  function refresh() {
    prune();
    entries.forEach(place);
    placeMenu();
  }

  function option(type,label,run) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'row-actions-option' + (type === 'delete' ? ' is-danger' : '');
    button.setAttribute('role','menuitem');
    button.innerHTML = svg(type) + '<span>' + label + '</span>';
    button.addEventListener('click',event => {
      event.preventDefault();
      event.stopPropagation();
      close(false);
      run();
    });
    return button;
  }

  function open(entry) {
    if (opened === entry) { close(true); return; }
    close(false);
    show(entry);
    opened = entry;
    entry.row.classList.add('row-actions-open');
    entry.button.setAttribute('aria-expanded','true');
    menu.setAttribute('aria-label',entry.name + ' actions');
    menu.replaceChildren(
      option('edit','Edit',entry.onEdit),
      option('delete','Delete',entry.onDelete)
    );
    menu.hidden = false;
    placeMenu();
    menu.querySelector('button')?.focus({preventScroll:true});
  }

  function attach(row,{name,onEdit,onDelete}) {
    if (!row || bound.has(row)) return;
    const scroller = row.closest('.directory-table-scroll,.merchants-table-wrap,.table-wrap');
    if (!scroller) return;
    prune();

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'row-actions-trigger';
    button.setAttribute('aria-label','More actions for ' + name);
    button.setAttribute('aria-haspopup','menu');
    button.setAttribute('aria-expanded','false');
    button.innerHTML = svg('more');
    document.body.appendChild(button);
    const entry = {row,scroller,button,name,onEdit,onDelete};
    entries.add(entry);
    bound.set(row,entry);
    row.tabIndex = 0;
    row.addEventListener('pointerenter',event => { if (event.pointerType === 'mouse') show(entry); });
    row.addEventListener('pointerleave',event => {
      if (event.relatedTarget === button || button.contains(event.relatedTarget)) return;
      hide(entry);
    });
    row.addEventListener('focusin',() => show(entry));
    row.addEventListener('focusout',event => {
      if (event.relatedTarget === button) return;
      hide(entry);
    });
    row.addEventListener('keydown',event => {
      if (event.target !== row) return;
      if (event.key === 'Enter' || event.key === 'F10' || event.key === 'ContextMenu') {
        event.preventDefault();
        open(entry);
      }
    });
    button.addEventListener('pointerenter',() => show(entry));
    button.addEventListener('pointerleave',event => {
      if (event.relatedTarget === row || row.contains(event.relatedTarget)) return;
      hide(entry);
    });
    button.addEventListener('click',event => {
      event.preventDefault();
      event.stopPropagation();
      open(entry);
    });
    if (touch.matches) button.classList.add('is-touch-visible');
    place(entry);
  }

  document.addEventListener('pointerdown',event => {
    if (opened && !menu.contains(event.target) && !opened.button.contains(event.target)) close(false);
  },true);
  document.addEventListener('keydown',event => {
    if (!opened) return;
    if (event.key === 'Escape') {event.preventDefault();close(true);}
    else if (event.key === 'Tab') close(false);
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (!menu.contains(document.activeElement)) return;
      event.preventDefault();
      const opts = Array.from(menu.querySelectorAll('button'));
      const i = opts.indexOf(document.activeElement);
      opts[(i + (event.key === 'ArrowDown'?1:-1) + opts.length) % opts.length]?.focus();
    }
  });
  document.addEventListener('scroll',refresh,true);
  window.addEventListener('resize',refresh);
  window.PinlessRowActions = {attach,close,refresh};
})();