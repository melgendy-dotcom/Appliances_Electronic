const MODULES = {
  purchasing: { label: '🛒 Purchasing', render: renderPurchasing },
  inventory: { label: '📦 Inventory', render: renderInventory },
  sales: { label: '📈 Sales', render: renderSales },
  ap: { label: '💳 AP', render: renderAP },
  ar: { label: '📥 AR', render: renderAR },
  expenses: { label: '💸 Expenses', render: renderExpenses },
};

function resolveColor(varExpr) {
  if (!varExpr.startsWith('var(')) return varExpr;
  const name = varExpr.slice(4, -1).trim();
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function chartOpts() {
  return {
    plugins: { legend: { labels: { color: '#8B949E' } } },
    scales: {
      x: { ticks: { color: '#8B949E' }, grid: { color: '#21262D' } },
      y: { ticks: { color: '#8B949E' }, grid: { color: '#21262D' } },
    },
  };
}

function buildModuleNav() {
  const nav = document.getElementById('moduleNav');
  nav.innerHTML = Object.entries(MODULES).map(([key, m]) =>
    `<button class="module-tab" data-module="${key}">${m.label}</button>`).join('');
  nav.querySelectorAll('.module-tab').forEach(btn => {
    btn.addEventListener('click', () => switchModule(btn.dataset.module));
  });
}

function switchModule(key) {
  document.querySelectorAll('.module-tab').forEach(b => b.classList.toggle('active', b.dataset.module === key));
  document.querySelectorAll('.module-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + key));
  location.hash = key;
}

function buildModulePanels() {
  const container = document.getElementById('modulePanels');
  container.innerHTML = Object.keys(MODULES).map(key => `<div class="module-panel" id="panel-${key}"></div>`).join('');
}

function renderModule(key) {
  const panel = document.getElementById('panel-' + key);
  if (panel.dataset.loaded) return;
  panel.innerHTML = MODULES[key].render();
  panel.dataset.loaded = '1';
}

function renderAllModulesLazy() {
  // Render the default module immediately; render others on first tab visit.
  Object.keys(MODULES).forEach(key => {
    const observer = null; // simple eager render is fine at this scale
  });
}

function buildStatsBar() {
  const s = MOCK.globalStats;
  document.getElementById('statsBar').innerHTML = `
    <div class="stat-item"><div class="val">${fmtNum(s.skus)}</div><div class="lbl">SKUs</div></div>
    <div class="stat-item"><div class="val">${s.channels}</div><div class="lbl">Channels</div></div>
    <div class="stat-item"><div class="val">${s.vendors}</div><div class="lbl">Vendors</div></div>
    <div class="stat-item"><div class="val">${fmtEGP(s.revenue, 0)}</div><div class="lbl">Revenue</div></div>
    <div class="stat-item"><div class="val">${fmtPct(s.marginPct)}</div><div class="lbl">Margin</div></div>
    <div class="stat-item"><div class="val">${s.ifrsStd}</div><div class="lbl">Standard</div></div>
  `;
}

let autoRefreshInterval = null;

function startAutoRefresh() {
  if (autoRefreshInterval) return;
  autoRefreshInterval = setInterval(syncData, 5 * 60 * 1000);
  document.getElementById('autoToggle').textContent = 'Auto ON';
  document.getElementById('autoToggle').classList.add('btn-primary');
}

function stopAutoRefresh() {
  clearInterval(autoRefreshInterval);
  autoRefreshInterval = null;
  document.getElementById('autoToggle').textContent = 'Auto OFF';
  document.getElementById('autoToggle').classList.remove('btn-primary');
}

async function syncData() {
  if (!SHEETS_API_URL) {
    updateSyncStatus('mock');
    return;
  }
  try {
    await SheetsAPI.get('StockLedger');
    updateSyncStatus('success');
  } catch (e) {
    updateSyncStatus('failed');
    toast('Sync failed', 'error');
  }
}

function getActiveModuleKey() {
  const active = document.querySelector('.module-tab.active');
  return active ? active.dataset.module : 'sales';
}

function exportActiveModuleToExcel() {
  const key = getActiveModuleKey();
  const panel = document.getElementById('panel-' + key);
  const table = panel.querySelector('table');
  if (!table) {
    toast('Nothing to export', 'error');
    return;
  }
  const wb = XLSX.utils.table_to_book(table, { sheet: MODULES[key].label.replace(/[^\w ]/g, '').trim() });
  const fname = `Kenzz_${key}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fname);
  toast(`Exported ${fname}`, 'success');
}

function init() {
  buildStatsBar();
  buildModuleNav();
  buildModulePanels();

  const initial = (location.hash || '#sales').slice(1);
  const startKey = MODULES[initial] ? initial : 'sales';

  // Render every module's markup now (dataset small at this stage) so tab switches are instant.
  Object.keys(MODULES).forEach(renderModule);
  switchModule(startKey);

  document.getElementById('openDashboardBtn').addEventListener('click', () => {
    document.getElementById('moduleNav').scrollIntoView({ behavior: 'smooth' });
    switchModule('sales');
  });

  document.getElementById('syncBtn').addEventListener('click', syncData);
  document.getElementById('exportBtn').addEventListener('click', exportActiveModuleToExcel);
  document.getElementById('autoToggle').addEventListener('click', () => {
    autoRefreshInterval ? stopAutoRefresh() : startAutoRefresh();
  });

  syncData();
}

document.addEventListener('DOMContentLoaded', init);
