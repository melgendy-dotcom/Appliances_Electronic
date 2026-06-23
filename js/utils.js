// ---------- Formatters ----------
function fmtEGP(n, decimals = 2) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return 'EGP ' + Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtNum(n, decimals = 0) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtDate(d) {
  const dt = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dt)) return '—';
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function fmtPct(n, decimals = 1) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number(n).toFixed(decimals) + '%';
}

// ---------- Calculations (IFRS business logic) ----------
const Calc = {
  poTotal: (qty, unitCost) => (Number(qty) || 0) * (Number(unitCost) || 0),
  poBalance: (total, paid) => (Number(total) || 0) - (Number(paid) || 0),

  stockStatus: (available) => {
    if (available > 3) return { label: 'In Stock', pill: 'pill-green' };
    if (available >= 1) return { label: 'Low Stock', pill: 'pill-amber' };
    if (available === 0) return { label: 'Out of Stock', pill: 'pill-red' };
    return { label: 'Negative', pill: 'pill-red' };
  },

  grossProfit: (saleAmount, costAmount) => (Number(saleAmount) || 0) - (Number(costAmount) || 0),
  gpPct: (gp, saleAmount) => saleAmount ? (gp / saleAmount) * 100 : 0,

  apAgingBucket: (invoiceDate) => {
    const days = Math.floor((Date.now() - new Date(invoiceDate).getTime()) / 86400000);
    if (days <= 30) return { label: 'Current', pill: 'pill-green' };
    if (days <= 60) return { label: 'Due', pill: 'pill-amber' };
    if (days <= 90) return { label: 'Overdue', pill: 'pill-red' };
    return { label: 'Critical', pill: 'pill-red' };
  },

  netReceivable: (invoiceAmount, commissionPct) => (Number(invoiceAmount) || 0) * (1 - (Number(commissionPct) || 0) / 100),
};

// ---------- Toast ----------
function toast(message, type = 'success') {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ---------- Filtering helper ----------
function filterRows(rows, searchTerm, searchFields, dropdownFilters) {
  return rows.filter(row => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matches = searchFields.some(f => String(row[f] ?? '').toLowerCase().includes(term));
      if (!matches) return false;
    }
    for (const [field, value] of Object.entries(dropdownFilters)) {
      if (value && value !== 'all' && row[field] !== value) return false;
    }
    return true;
  });
}
