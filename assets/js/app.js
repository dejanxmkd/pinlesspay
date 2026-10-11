window.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  document.querySelectorAll('[data-nav]').forEach(a => {
    if (location.pathname.endsWith(a.getAttribute('href'))) a.classList.add('active');
  });

  const refreshIcons = () => { if (window.lucide) lucide.createIcons(); };


  // Native-like mobile burger navigation. Reuse the existing eight sidebar routes.
  // Only the top header shows the logo; the mobile menu displays navigation links.
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    const topbar = document.createElement('header');
    topbar.className = 'mobile-topbar mobile-app-header';
    topbar.innerHTML =
      '<button class="mobile-menu-button" type="button" aria-label="Open navigation" ' +
      'aria-controls="mobile-navigation" aria-expanded="false">' +
      '<span class="mobile-burger-lines" aria-hidden="true"><span></span><span></span><span></span></span></button>' +
      '<a class="mobile-app-brand" href="dashboard.html" aria-label="Pinless Pay Home">' +
      '<img src="assets/img/logo.svg" alt="Pinless Pay"></a>' +
      '<span class="mobile-header-spacer" aria-hidden="true"></span>';

    const shade = document.createElement('button');
    shade.type = 'button';
    shade.className = 'mobile-nav-backdrop';
    shade.setAttribute('aria-label', 'Close navigation');

    const heading = document.createElement('div');
    heading.className = 'mobile-drawer-heading';
    // Mirror the first navigation link beside X; its original stays in the desktop menu.
    const dashboardNavLink = sidebar.querySelector('.nav a[href="dashboard.html"]');
    if (dashboardNavLink) {
      const dashboardHeaderLink = dashboardNavLink.cloneNode(true);
      dashboardHeaderLink.classList.add('mobile-dashboard-link');
      dashboardHeaderLink.removeAttribute('data-nav');
      if (dashboardHeaderLink.classList.contains('active')) dashboardHeaderLink.setAttribute('aria-current', 'page');
      heading.appendChild(dashboardHeaderLink);
    }
    const menuClose = document.createElement('button');
    menuClose.type = 'button';
    menuClose.className = 'mobile-drawer-close';
    menuClose.setAttribute('aria-label', 'Close navigation');
    menuClose.innerHTML = '<i data-lucide="x"></i>';
    heading.appendChild(menuClose);
    const brand = sidebar.querySelector('.brand');
    if (brand) brand.insertAdjacentElement('afterend', heading);
    else sidebar.prepend(heading);

    sidebar.id = 'mobile-navigation';
    sidebar.setAttribute('aria-label', 'Site navigation');
    const trigger = topbar.querySelector('.mobile-menu-button');
    const closeBtn = heading.querySelector('.mobile-drawer-close');
    const menuMedia = window.matchMedia('(max-width: 900px)');
    let lastNavFocus = null;
    const closeNav = (returnFocus = true) => {
      const wasOpen = document.body.classList.contains('mobile-nav-open');
      document.body.classList.remove('mobile-nav-open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-label', 'Open navigation');
      if (menuMedia.matches) sidebar.inert = true;
      if (wasOpen && returnFocus && lastNavFocus && document.contains(lastNavFocus)) {
        lastNavFocus.focus({ preventScroll: true });
      }
    };
    const openNav = () => {
      lastNavFocus = document.activeElement;
      sidebar.inert = false;
      document.body.classList.add('mobile-nav-open');
      trigger.setAttribute('aria-expanded', 'true');
      trigger.setAttribute('aria-label', 'Close navigation');
      closeBtn.focus({ preventScroll: true });
    };
    const syncNav = () => {
      if (!menuMedia.matches) {
        closeNav(false);
        sidebar.inert = false;
      } else if (!document.body.classList.contains('mobile-nav-open')) {
        sidebar.inert = true;
      }
    };
    document.body.insertBefore(topbar, document.querySelector('.app'));
    document.body.appendChild(shade);
    trigger.addEventListener('click', () => {
      if (document.body.classList.contains('mobile-nav-open')) closeNav();
      else openNav();
    });
    closeBtn.addEventListener('click', () => closeNav());
    shade.addEventListener('click', () => closeNav());
    sidebar.querySelectorAll('.nav a, .profile-menu-panel a').forEach(link =>
      link.addEventListener('click', () => closeNav(false)));
    sidebar.addEventListener('keydown', e => {
      if (e.key !== 'Tab' || !menuMedia.matches) return;
      const nodes = Array.from(sidebar.querySelectorAll('button, a[href]'))
        .filter(el => !el.disabled && el.getClientRects().length > 0);
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
    menuMedia.addEventListener('change', syncNav);
    syncNav();

    // The section links remain the same across desktop and mobile.
    const page = location.pathname.split('/').pop();
    const activeTarget = page === 'merchant-details.html' ? 'merchants.html'
      : page === 'application-details.html' ? 'applications.html' : page;
    if (activeTarget && activeTarget !== page) {
      sidebar.querySelectorAll('[data-nav]').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === activeTarget);
      });
    }
    refreshIcons();
  }

  // ---------- Sidebar profile dropdown ----------
  document.querySelectorAll('.logout').forEach(logout => {
    const menu = document.createElement('div');
    menu.className = 'profile-menu';
    menu.innerHTML = `
      <button class="profile-menu-trigger" type="button" aria-label="Open account menu" aria-expanded="false">
        <i data-lucide="chevrons-up-down"></i>
      </button>
      <div class="profile-menu-panel" role="menu">
        <a href="login.html" role="menuitem"><i data-lucide="log-out"></i><span>Log out</span></a>
      </div>
    `;
    logout.replaceWith(menu);
  });

  document.querySelectorAll('.profile-menu-trigger').forEach(trigger => {
    trigger.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const menu = trigger.closest('.profile-menu');
      const open = menu.classList.toggle('open');
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

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

  const decorateActionMenu = scope => {
    scope.querySelectorAll('.action-menu-panel a, .action-menu-panel button').forEach(item => {
      if (item.dataset.iconReady) return;
      const label = item.textContent.trim().toLowerCase();
      const icon = label.startsWith('view') ? 'eye' : label.startsWith('edit') ? 'pencil' : null;
      if (!icon) return;
      item.insertAdjacentHTML('afterbegin', '<i data-lucide="' + icon + '"></i>');
      item.dataset.iconReady = '1';
    });
  };

  decorateActionMenu(document);

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
    document.querySelectorAll('.profile-menu.open').forEach(menu => {
      menu.classList.remove('open');
      menu.querySelector('.profile-menu-trigger')?.setAttribute('aria-expanded','false');
    });
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
    // Processors-page deep links select the corresponding merchant filter.
    if (key === 'merchants') {
      const requestedProcessor = new URLSearchParams(location.search).get('processor');
      const processorSelect = selects.find(sel => sel.dataset.field === 'processor');
      if (requestedProcessor && processorSelect &&
          Array.from(processorSelect.options).some(option => option.value === requestedProcessor)) {
        processorSelect.value = requestedProcessor;
      }
    }
    apply();
  });

  // ---------- Drawer system ----------
  const overlay = document.querySelector('.drawer-overlay');
  const drawers = Array.from(document.querySelectorAll('.drawer'));

  let lastDrawerFocus = null;
  const closeDrawers = () => {
    const wasOpen = drawers.some(d => d.classList.contains('open'));
    drawers.forEach(d => {
      d.classList.remove('open');
      d.setAttribute('aria-hidden', 'true');
      d.inert = true;
    });
    overlay?.classList.remove('open');
    document.body.classList.remove('drawer-open');
    if (wasOpen && lastDrawerFocus && document.contains(lastDrawerFocus)) {
      lastDrawerFocus.focus({ preventScroll: true });
    }
  };

  const openDrawer = id => {
    const drawer = document.getElementById(id);
    if (!drawer) return;
    lastDrawerFocus = document.activeElement;
    drawers.forEach(d => {
      d.classList.remove('open');
      d.setAttribute('aria-hidden', 'true');
      d.inert = true;
    });
    drawer.inert = false;
    drawer.setAttribute('aria-hidden', 'false');
    drawer.classList.add('open');
    overlay?.classList.add('open');
    document.body.classList.add('drawer-open');
    // Avoid triggering the mobile keyboard as soon as a sheet opens.
    setTimeout(() => {
      if (!drawer.classList.contains('open')) return;
      if (window.matchMedia('(max-width: 900px)').matches) {
        drawer.querySelector('[data-close-drawer]')?.focus({ preventScroll: true });
      } else {
        drawer.querySelector('input,select,button')?.focus({ preventScroll: true });
      }
    }, 130);
  };

  drawers.forEach(drawer => {
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.inert = true;
    const heading = drawer.querySelector('[data-drawer-title]');
    if (heading) {
      heading.id = heading.id || (drawer.id + '-title');
      drawer.setAttribute('aria-labelledby', heading.id);
    }
    const header = drawer.querySelector('.drawer-header');
    if (!header) return;
    let touchStartY = null;
    header.addEventListener('touchstart', e => {
      touchStartY = e.touches[0]?.clientY ?? null;
    }, { passive: true });
    header.addEventListener('touchend', e => {
      if (touchStartY !== null && e.changedTouches[0]?.clientY - touchStartY > 85 &&
          window.matchMedia('(max-width: 900px)').matches) closeDrawers();
      touchStartY = null;
    }, { passive: true });
    drawer.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(drawer.querySelectorAll('button, input, select, textarea, a[href]'))
        .filter(el => !el.disabled && el.getClientRects().length > 0);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  });

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


  // Merchant column keys and their exact visible labels.
  const merchantColumns = [
    ['dba', 'Merchant DBA'], ['merchantId', 'Merchant ID'], ['address', 'Address'],
    ['address2', 'Address 2'], ['city', 'City'], ['state', 'State'], ['zip', 'Zip'],
    ['processor', 'Processor'], ['mcc', 'MCC'], ['owner', 'Owner'],
    ['phone', 'DBA Phone'], ['iso', 'ISO'], ['agent', 'Agent'], ['rates', 'Rates'],
    ['statusDate', 'Status Date'], ['status', 'Status']
  ];
  const merchantFields = merchantColumns.map(([name]) => name);

  const setDrawerMode = (mode, data = {}) => {
    if (!merchantDrawer || !merchantForm) return;
    merchantDrawer.dataset.mode = mode;
    merchantDrawer.querySelector('[data-drawer-title]').textContent = mode === 'edit' ? 'Edit Merchant' : 'Add Merchant';
    merchantDrawer.querySelector('[data-drawer-subtitle]').textContent =
      mode === 'edit' ? 'Update merchant information.' : 'Create a new merchant record.';
    merchantDrawer.querySelector('[data-submit-label]').textContent = mode === 'edit' ? 'Save Changes' : 'Add Merchant';
    merchantForm.classList.remove('show-errors');
    merchantFields.forEach(name => {
      const el = merchantForm.elements[name];
      if (el) el.value = data[name] ?? (name === 'status' ? 'Active' : '');
    });
  };

  const rowData = row => Object.fromEntries(merchantColumns.map(([name]) => [
    name, row.dataset[name] || (name === 'status' ? 'Active' : '')
  ]));

  const statusClass = value => {
    const v = (value || '').toLowerCase();
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
    if (!merchantTable) return null;
    const tr = document.createElement('tr');
    tr.dataset.row = '1';
    tr.dataset.viewHref = 'merchant-details.html';

    merchantColumns.forEach(([key, label]) => {
      const td = document.createElement('td');
      td.dataset.label = label;
      if (key === 'dba') {
        const nameWrap = document.createElement('span');
        nameWrap.className = 'merchant-name-wrap';
        const name = document.createElement('strong');
        name.dataset.col = 'dba';
        const button = document.createElement('button');
        button.className = 'merchant-inline-edit';
        button.type = 'button';
        button.dataset.editMerchant = '';
        button.title = 'Edit Merchant';
        button.setAttribute('aria-label', 'Edit merchant');
        button.innerHTML = '<i data-lucide="pencil"></i>';
        nameWrap.append(name, button);
        td.appendChild(nameWrap);
      } else if (key === 'status') {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.dataset.col = 'status';
        td.appendChild(badge);
      } else {
        const value = document.createElement('span');
        value.dataset.col = key;
        td.appendChild(value);
      }
      tr.appendChild(td);
    });

    merchantTable.querySelector('tbody').prepend(tr);
    updateMerchantRow(tr, data);
    wireMerchantEditButtons(tr);
    tr.addEventListener('click', e => {
      if (e.target.closest('button,a,input,select,label,.action-menu')) return;
      window.location.href = tr.dataset.viewHref;
    });
    refreshIcons();
    return tr;
  };

  function updateMerchantRow(row, data) {
    merchantColumns.forEach(([name]) => {
      row.dataset[name] = data[name] || '';
      const col = row.querySelector('[data-col="' + name + '"]');
      if (col) col.textContent = data[name] || '—';
    });
    row.dataset.search = merchantFields.map(name => data[name] || '').join(' ');
    const edit = row.querySelector('[data-edit-merchant]');
    if (edit) edit.setAttribute('aria-label', 'Edit ' + (data.dba || 'merchant'));
    const badge = row.querySelector('[data-col="status"]');
    if (badge) badge.className = 'badge ' + statusClass(data.status);
  }

  merchantForm?.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(merchantForm).entries());
    const required = ['dba', 'address', 'city', 'state', 'zip', 'processor', 'mcc', 'owner', 'phone'];
    if (required.some(key => !String(data[key] || '').trim())) {
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

  // CSV import is a client-side preview only: no server writes.
  const importInput = document.querySelector('[data-import-file]');
  if (importInput) {
    const expected = ['Merchant DBA', 'Processor', 'Transactions', 'Volume', 'Avg Ticket',
                      'Income', 'House %', 'Agent %', 'Agent Residual', 'Pinless Pay Total'];
    const feedback = document.querySelector('[data-import-feedback]');
    const preview = document.querySelector('[data-import-preview]');
    const rowsTarget = document.querySelector('[data-import-rows]');
    const filename = document.querySelector('[data-import-filename]');
    const previewCount = document.querySelector('[data-import-count]');

    const parseCsv = text => {
      const records = [];
      let row = [], cell = '', quoted = false;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
          if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
          else quoted = !quoted;
        } else if (char === ',' && !quoted) {
          row.push(cell); cell = '';
        } else if ((char === '\n' || char === '\r') && !quoted) {
          if (char === '\r' && text[i + 1] === '\n') i++;
          row.push(cell); cell = '';
          if (row.some(value => value.trim() !== '')) records.push(row);
          row = [];
        } else {
          cell += char;
        }
      }
      if (quoted) throw new Error('CSV has an unclosed quoted value.');
      row.push(cell);
      if (row.some(value => value.trim() !== '')) records.push(row);
      return records;
    };

    importInput.addEventListener('change', async () => {
      const file = importInput.files?.[0];
      preview.hidden = true;
      rowsTarget.replaceChildren();
      feedback.textContent = '';
      feedback.className = 'import-feedback';
      filename.textContent = file ? file.name : 'No file selected';
      if (!file) return;

      if (!file.name.toLowerCase().endsWith('.csv') || file.size > 5 * 1024 * 1024) {
        feedback.textContent = 'Choose a CSV file smaller than 5 MB.';
        feedback.classList.add('error');
        return;
      }
      try {
        const parsed = parseCsv((await file.text()).replace(/^\uFEFF/, ''));
        if (!parsed.length || parsed[0].length !== expected.length ||
            !expected.every((col, i) => parsed[0][i].trim() === col)) {
          throw new Error('CSV columns must match the Residuals table headers in exactly the same order.');
        }
        const data = parsed.slice(1);
        if (!data.length) throw new Error('The CSV file has no data rows.');
        if (data.some(row => row.length !== expected.length)) {
          throw new Error('Every row must have exactly 10 columns.');
        }
        data.slice(0, 50).forEach(values => {
          const tr = document.createElement('tr');
          values.forEach((value, i) => {
            const td = document.createElement('td');
            td.dataset.label = expected[i];
            td.textContent = value.trim() || '—';
            if ([3, 4, 5, 8, 9].includes(i)) td.classList.add('money');
            if (i === 8) td.classList.add('agent-amount');
            if (i === 9) td.classList.add('pay-total');
            tr.appendChild(td);
          });
          rowsTarget.appendChild(tr);
        });
        previewCount.textContent = 'Showing ' + Math.min(data.length, 50) + ' of ' + data.length + ' rows';
        preview.hidden = false;
        feedback.textContent = 'CSV validated. ' + data.length + ' record' + (data.length === 1 ? '' : 's') + ' ready to preview.';
        feedback.classList.add('success');
      } catch (error) {
        feedback.textContent = error.message || 'Unable to read the selected CSV file.';
        feedback.classList.add('error');
      }
    });
  }

});
