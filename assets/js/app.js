window.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  document.querySelectorAll('[data-nav]').forEach(a => {
    if (location.pathname.endsWith(a.getAttribute('href'))) a.classList.add('active');
  });

  const refreshIcons = () => { if (window.lucide) lucide.createIcons(); };

  // ---------- Row action overflow menus ----------
  document.querySelectorAll('td.actions').forEach(cell => {
    if (cell.querySelector('.action-menu')) return;
    const actions = Array.from(cell.children).filter(el =>
      el.matches('a,button') && !el.classList.contains('action-menu-trigger')
    );

    if (actions.length > 2) {
      const menu = document.createElement('div');
      menu.className = 'action-menu';

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'action-menu-trigger';
      trigger.setAttribute('aria-label', 'More actions');
      trigger.innerHTML = '<i data-lucide="ellipsis"></i>';

      const panel = document.createElement('div');
      panel.className = 'action-menu-panel';

      actions.forEach(action => panel.appendChild(action));
      menu.appendChild(trigger);
      menu.appendChild(panel);
      cell.appendChild(menu);
    }
  });

  document.querySelectorAll('.action-menu-trigger').forEach(trigger => {
    trigger.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const menu = trigger.closest('.action-menu');
      document.querySelectorAll('.action-menu.open').forEach(other => {
        if (other !== menu) other.classList.remove('open');
      });
      menu?.classList.toggle('open');
    });
  });

  document.querySelectorAll('.action-menu-panel').forEach(panel => {
    panel.addEventListener('click', e => e.stopPropagation());
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.action-menu.open').forEach(menu => menu.classList.remove('open'));
  });

  refreshIcons();

  // ---------- Clickable table rows open view mode ----------
  document.querySelectorAll('tr[data-view-href]').forEach(row => {
    row.addEventListener('click', e => {
      if (e.target.closest('button,a,input,select,label,.action-menu')) return;
      window.location.href = row.dataset.viewHref;
    });
  });

  // ---------- Generic client-side table filtering ----------
  document.querySelectorAll('[data-filter-table]').forEach(table => {
    const key = table.dataset.filterTable;
    const rows = () => Array.from(table.querySelectorAll('tbody tr[data-row]'));
    const search = document.querySelector('[data-search="' + key + '"]');
    const selects = Array.from(document.querySelectorAll('[data-filter="' + key + '"]'));
    const clear = document.querySelector('[data-clear-filters="' + key + '"]');
    const count = document.querySelector('[data-filter-count="' + key + '"]');
    const empty = document.querySelector('[data-filter-empty="' + key + '"]');

    const apply = () => {
      const q = (search?.value || '').trim().toLowerCase();
      let visible = 0;
      rows().forEach(row => {
        const searchable = (row.dataset.search || row.textContent).toLowerCase();
        const matchesSearch = !q || searchable.includes(q);
        const matchesSelects = selects.every(sel => {
          if (!sel.value) return true;
          return (row.dataset[sel.dataset.field] || '') === sel.value;
        });
        const show = matchesSearch && matchesSelects;
        row.hidden = !show;
        if (show) visible++;
      });
      if (count) count.textContent = visible + ' result' + (visible === 1 ? '' : 's');
      if (empty) empty.hidden = visible !== 0;
    };

    search?.addEventListener('input', apply);
    selects.forEach(sel => sel.addEventListener('change', apply));
    clear?.addEventListener('click', () => {
      if (search) search.value = '';
      selects.forEach(sel => sel.value = '');
      apply();
    });
    apply();
  });

  // ---------- Drawer system ----------
  const overlay = document.querySelector('.drawer-overlay');
  const drawers = Array.from(document.querySelectorAll('.drawer'));

  const closeDrawers = () => {
    drawers.forEach(d => d.classList.remove('open'));
    overlay?.classList.remove('open');
    document.body.classList.remove('drawer-open');
  };

  const openDrawer = id => {
    const drawer = document.getElementById(id);
    if (!drawer) return;
    drawers.forEach(d => d.classList.remove('open'));
    drawer.classList.add('open');
    overlay?.classList.add('open');
    document.body.classList.add('drawer-open');
    setTimeout(() => drawer.querySelector('input,select,button')?.focus(), 120);
  };

  document.querySelectorAll('[data-open-drawer]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openDrawer(btn.dataset.openDrawer);
    });
  });
  document.querySelectorAll('[data-close-drawer]').forEach(btn => btn.addEventListener('click', closeDrawers));
  overlay?.addEventListener('click', closeDrawers);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawers(); });

  // ---------- Merchants: add/edit through one reusable drawer ----------
  const merchantDrawer = document.getElementById('merchant-drawer');
  const merchantForm = document.getElementById('merchant-form');
  const merchantTable = document.querySelector('[data-filter-table="merchants"]');
  let editingRow = null;

  const merchantFields = ['dba','address','processor','mcc','phone','owner','cell','status'];

  const setDrawerMode = (mode, data = {}) => {
    if (!merchantDrawer || !merchantForm) return;
    merchantDrawer.dataset.mode = mode;
    merchantDrawer.querySelector('[data-drawer-title]').textContent = mode === 'edit' ? 'Edit Merchant' : 'Add Merchant';
    merchantDrawer.querySelector('[data-drawer-subtitle]').textContent =
      mode === 'edit' ? 'Update merchant information.' : 'Create a new merchant record.';
    merchantDrawer.querySelector('[data-submit-label]').textContent = mode === 'edit' ? 'Save Changes' : 'Add Merchant';

    merchantFields.forEach(name => {
      const el = merchantForm.elements[name];
      if (!el) return;
      el.value = data[name] || (name === 'status' ? 'Active' : '');
    });
  };

  const rowData = row => ({
    dba: row.dataset.dba || '',
    address: row.dataset.address || '',
    processor: row.dataset.processor || '',
    mcc: row.dataset.mcc || '',
    phone: row.dataset.phone || '',
    owner: row.dataset.owner || '',
    cell: row.dataset.cell || '',
    status: row.dataset.status || 'Active'
  });

  const statusClass = value => {
    const v = value.toLowerCase();
    if (v === 'active' || v === 'approved' || v === 'paid') return 'success';
    if (v === 'pending') return 'warning';
    if (v === 'in review') return 'purple';
    if (v === 'declined' || v === 'inactive') return 'danger';
    return 'neutral';
  };

  const wireMerchantEditButtons = scope => {
    scope.querySelectorAll('[data-edit-merchant]').forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        editingRow = btn.closest('tr');
        setDrawerMode('edit', rowData(editingRow));
        openDrawer('merchant-drawer');
      });
    });
  };

  document.querySelectorAll('[data-add-merchant]').forEach(btn => {
    btn.addEventListener('click', () => {
      editingRow = null;
      setDrawerMode('add');
      openDrawer('merchant-drawer');
    });
  });

  wireMerchantEditButtons(document);

  const buildMerchantRow = data => {
    const tr = document.createElement('tr');
    tr.dataset.row = '1';
    tr.dataset.viewHref = 'merchant-details.html';
    tr.innerHTML = `
      <td><strong data-col="dba"></strong></td>
      <td data-col="address"></td>
      <td data-col="processor"></td>
      <td data-col="mcc"></td>
      <td data-col="phone"></td>
      <td data-col="owner"></td>
      <td data-col="created">Today</td>
      <td><span class="badge" data-col="status"></span></td>
      <td class="actions">
        <div class="action-menu">
          <button class="action-menu-trigger" type="button" aria-label="More actions"><i data-lucide="ellipsis"></i></button>
          <div class="action-menu-panel"><button type="button" data-edit-merchant>Edit Merchant</button></div>
        </div>
      </td>`;
    merchantTable.querySelector('tbody').prepend(tr);
    updateMerchantRow(tr, data);
    wireMerchantEditButtons(tr);
    tr.addEventListener('click', e => {
      if (e.target.closest('button,a,input,select,label,.action-menu')) return;
      window.location.href = tr.dataset.viewHref;
    });
    const trigger = tr.querySelector('.action-menu-trigger');
    trigger?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const menu = trigger.closest('.action-menu');
      document.querySelectorAll('.action-menu.open').forEach(other => {
        if (other !== menu) other.classList.remove('open');
      });
      menu?.classList.toggle('open');
    });
    tr.querySelector('.action-menu-panel')?.addEventListener('click', e => e.stopPropagation());
    refreshIcons();
    return tr;
  };

  function updateMerchantRow(row, data) {
    Object.entries(data).forEach(([k,v]) => row.dataset[k] = v);
    row.dataset.search = [data.dba,data.address,data.processor,data.mcc,data.phone,data.owner,data.cell,data.status].join(' ');
    ['dba','address','processor','mcc','phone','owner'].forEach(k => {
      const cell = row.querySelector('[data-col="' + k + '"]');
      if (cell) cell.textContent = data[k] || '—';
    });
    const badge = row.querySelector('[data-col="status"]');
    if (badge) {
      badge.textContent = data.status;
      badge.className = 'badge ' + statusClass(data.status);
    }
  }

  merchantForm?.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(merchantForm).entries());
    if (!data.dba || !data.address || !data.processor || !data.mcc || !data.phone || !data.owner || !data.cell) {
      merchantForm.classList.add('show-errors');
      return;
    }
    merchantForm.classList.remove('show-errors');

    if (editingRow) {
      updateMerchantRow(editingRow, data);
      showToast('Merchant updated successfully');
    } else {
      buildMerchantRow(data);
      showToast('Merchant added successfully');
    }
    closeDrawers();
    const search = document.querySelector('[data-search="merchants"]');
    if (search) search.dispatchEvent(new Event('input'));
  });

  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<i data-lucide="circle-check"></i><span>' + message + '</span>';
    refreshIcons();
    toast.classList.add('show');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  // Deep links from the old standalone pages / details page.
  const params = new URLSearchParams(location.search);
  if (merchantDrawer && params.get('drawer') === 'add') {
    editingRow = null;
    setDrawerMode('add');
    openDrawer('merchant-drawer');
  }
  if (merchantDrawer && params.get('edit')) {
    const target = Array.from(merchantTable?.querySelectorAll('tbody tr[data-row]') || [])
      .find(r => (r.dataset.dba || '').toLowerCase().replace(/\s+/g,'-') === params.get('edit'));
    if (target) {
      editingRow = target;
      setDrawerMode('edit', rowData(target));
      openDrawer('merchant-drawer');
    }
  }

  document.querySelectorAll('[data-demo-submit]').forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    const banner = document.querySelector('.success-banner');
    if (banner) banner.style.display = 'flex';
  }));
});