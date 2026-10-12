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
  // Fictional demo contact records for the table only. Never seed banking fields.
  const demoRecords = {
    ISO: [
      { id: 'iso-demo-1', name: 'Northstar Merchant Solutions', address: '1250 Market Street', address2: 'Suite 410', city: 'Philadelphia', state: 'PA', zip: '19107', owner: 'Daniel Carter', phone: '(202) 555-0101', email: 'daniel@northstar.example', commission: '15%' },
      { id: 'iso-demo-2', name: 'Harborview Payment Group', address: '280 Atlantic Avenue', address2: 'Floor 3', city: 'Boston', state: 'MA', zip: '02110', owner: 'Olivia Bennett', phone: '(202) 555-0102', email: 'olivia@harborview.example', commission: '12.5%' },
      { id: 'iso-demo-3', name: 'Summit Processing Partners', address: '3400 Commerce Boulevard', address2: '', city: 'Denver', state: 'CO', zip: '80202', owner: 'Marcus Reed', phone: '(202) 555-0103', email: 'marcus@summitprocessing.example', commission: '18%' },
      { id: 'iso-demo-4', name: 'Evergreen Merchant Network', address: '860 Pine Street', address2: 'Suite 220', city: 'Seattle', state: 'WA', zip: '98101', owner: 'Sophia Miller', phone: '(202) 555-0104', email: 'sophia@evergreenmerchant.example', commission: '10%' },
      { id: 'iso-demo-5', name: 'Blue Ridge Payment Services', address: '190 Peachtree Street', address2: '', city: 'Atlanta', state: 'GA', zip: '30303', owner: 'Ethan Brooks', phone: '(202) 555-0105', email: 'ethan@blueridgepayments.example', commission: '14%' }
    ],
    Agent: [
      { id: 'agent-demo-1', name: 'Alex Morgan', address: '410 Madison Avenue', address2: 'Apt 8B', city: 'New York', state: 'NY', zip: '10017', owner: 'Alex Morgan', phone: '(202) 555-0111', email: 'alex.morgan@agents.example', commission: '35%' },
      { id: 'agent-demo-2', name: 'Jordan Lee', address: '775 Lake Shore Drive', address2: '', city: 'Chicago', state: 'IL', zip: '60611', owner: 'Jordan Lee', phone: '(202) 555-0112', email: 'jordan.lee@agents.example', commission: '30%' },
      { id: 'agent-demo-3', name: 'Taylor Brooks', address: '220 Congress Avenue', address2: 'Suite 105', city: 'Austin', state: 'TX', zip: '78701', owner: 'Taylor Brooks', phone: '(202) 555-0113', email: 'taylor.brooks@agents.example', commission: '25%' },
      { id: 'agent-demo-4', name: 'Casey Rivera', address: '690 Ocean Drive', address2: '', city: 'Miami Beach', state: 'FL', zip: '33139', owner: 'Casey Rivera', phone: '(202) 555-0114', email: 'casey.rivera@agents.example', commission: '32%' },
      { id: 'agent-demo-5', name: 'Morgan Parker', address: '510 Wilshire Boulevard', address2: 'Floor 2', city: 'Santa Monica', state: 'CA', zip: '90401', owner: 'Morgan Parker', phone: '(202) 555-0115', email: 'morgan.parker@agents.example', commission: '28%' }
    ]
  };
  let records = demoRecords[kind].map(record => ({ ...record }));
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
      window.PinlessRowActions.attach(tr, {
        name: record.name || kind,
        onEdit: () => open(record.id),
        onDelete: () => {
          if (!window.confirm('Delete "' + (record.name || kind) + '"? This change only lasts until reload.')) return;
          records = records.filter(item => item.id !== record.id);
          render();
          message.textContent = kind + ' deleted from this preview. Records reset on reload.';
          message.hidden = false;
        }
      });
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