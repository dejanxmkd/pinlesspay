/* Shared ISO / Agent directories. Frontend-only preview; never persist banking data. */
document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-directory-kind]');
  if (!root) return;

  const kind = root.dataset.directoryKind === 'iso' ? 'ISO' : 'Agent';
  const fields = [
    ['name', kind + ' Name'],
    ['address', 'Address'],
    ['address2', 'Address 2'],
    ['city', 'City'],
    ['state', 'State'],
    ['zip', 'Zip'],
    ['owner', 'Owner Name'],
    ['phone', 'Phone'],
    ['email', 'Email'],
    ['commission', 'Commission']
  ];
  const rows = root.querySelector('[data-directory-rows]');
  const count = root.querySelector('[data-directory-count]');
  const add = root.querySelector('[data-directory-add]');
  const dialog = document.querySelector('[data-directory-dialog]');
  const form = dialog.querySelector('[data-directory-form]');
  const heading = dialog.querySelector('[data-directory-heading]');
  const submit = dialog.querySelector('[data-directory-submit]');
  const message = root.querySelector('[data-directory-message]');
  const closeButtons = dialog.querySelectorAll('[data-directory-close]');
  let records = [];
  let editingId = null;
  let returnFocus = null;

  function render() {
    rows.replaceChildren();
    count.textContent = records.length + ' ' + (records.length === 1 ? kind : kind === 'ISO' ? 'ISOs' : 'Agents');
    if (!records.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = fields.length + 1;
      td.className = 'directory-empty-cell';
      const strong = document.createElement('strong');
      strong.textContent = 'No ' + (kind === 'ISO' ? 'ISO' : 'agent') + ' records yet';
      const info = document.createElement('p');
      info.textContent = 'Select Add ' + kind + ' to create your first record.';
      td.append(strong, info);
      tr.appendChild(td);
      rows.appendChild(tr);
      return;
    }

    records.forEach(record => {
      const tr = document.createElement('tr');
      fields.forEach(([key, label], index) => {
        const td = document.createElement('td');
        td.setAttribute('data-label', label);
        const value = String(record[key] || '').trim();
        td.textContent = value || '—';
        if (index === 0) td.classList.add('directory-name');
        tr.appendChild(td);
      });
      const actions = document.createElement('td');
      actions.className = 'directory-actions';
      const button = document.createElement('button');
      button.className = 'directory-edit';
      button.type = 'button';
      button.textContent = 'Edit';
      button.setAttribute('aria-label', 'Edit ' + (record.name || kind));
      button.addEventListener('click', () => open(record.id));
      actions.appendChild(button);
      tr.appendChild(actions);
      rows.appendChild(tr);
    });
  }

  function open(id = null) {
    const record = records.find(item => item.id === id);
    editingId = record ? record.id : null;
    form.reset();
    fields.forEach(([key]) => {
      const input = form.elements.namedItem(key);
      if (input) input.value = record ? record[key] || '' : '';
    });
    // Banking credentials are intentionally never stored or repopulated.
    for (const name of ['bankName', 'routingNumber', 'accountNumber']) {
      const input = form.elements.namedItem(name);
      if (input) {
        input.value = '';
        input.required = !record;
      }
    }
    heading.textContent = (record ? 'Edit ' : 'Add ') + kind;
    submit.textContent = record ? 'Save Changes' : 'Add ' + kind;
    returnFocus = document.activeElement;
    message.hidden = true;
    dialog.showModal();
    form.elements.namedItem('name').focus();
  }

  add.addEventListener('click', () => open());
  closeButtons.forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = {};
    fields.forEach(([key]) => {
      data[key] = String(form.elements.namedItem(key)?.value || '').trim();
    });
    // Do not read, send, display, log, or save bankName/routingNumber/accountNumber.
    if (editingId) {
      const index = records.findIndex(item => item.id === editingId);
      if (index >= 0) records[index] = { ...records[index], ...data };
    } else {
      records.unshift({ id: String(Date.now()) + '-' + Math.random().toString(36).slice(2), ...data });
    }
    render();
    dialog.close();
    message.textContent = kind + (editingId ? ' updated' : ' added') + ' in this preview. Banking details were not stored. Records reset on reload.';
    message.hidden = false;
    if (window.lucide) window.lucide.createIcons();
  });
  render();
});