function renderAP() {
  const d = MOCK.ap;
  const state = { search: '', status: 'all' };

  function kpiHtml() {
    return `
      <div class="kpi-grid">
        <div class="kpi-card" style="border-top-color:var(--red)"><span class="icon">💳</span><div class="label">Total AP Outstanding</div><div class="value">${fmtEGP(d.kpis.outstanding, 0)}</div><div class="sub">${d.kpis.outstandingVendors} vendors</div></div>
        <div class="kpi-card" style="border-top-color:var(--green)"><span class="icon">✅</span><div class="label">Paid (Jun)</div><div class="value">${fmtEGP(d.kpis.paidJun, 0)}</div></div>
        <div class="kpi-card" style="border-top-color:var(--accent)"><span class="icon">🧾</span><div class="label">New Bills (Jun)</div><div class="value">${fmtEGP(d.kpis.newBillsJun, 0)}</div><div class="sub">${d.kpis.newBillsInvoices} invoices</div></div>
        <div class="kpi-card" style="border-top-color:var(--purple)"><span class="icon">⏰</span><div class="label">Overdue >30 Days</div><div class="value">${fmtEGP(d.kpis.overdueAmt, 0)}</div><div class="sub">${d.kpis.overdueVendors} vendors</div></div>
      </div>`;
  }

  function agingHtml() {
    const max = Math.max(...d.aging.map(a => a.amt));
    return `
      <div class="aging-grid">
        ${d.aging.map(a => `
          <div class="aging-card">
            <div class="bucket">${a.label}</div>
            <div class="amt" style="color:${resolveColor(a.color)}">${fmtEGP(a.amt, 0)}</div>
            <div class="bar" style="width:${(a.amt/max*100).toFixed(0)}%;background:${resolveColor(a.color)}"></div>
          </div>`).join('')}
      </div>`;
  }

  function formHtml() {
    return `
      <div class="form-panel">
        <h3>Log AP Transaction</h3>
        <form id="apForm">
          <div class="form-grid">
            <div class="form-field"><label>Date</label><input type="date" name="date" required value="${new Date().toISOString().slice(0,10)}"></div>
            <div class="form-field"><label>Vendor Name</label><input type="text" name="vendor" required list="vendorList" dir="rtl"></div>
            <div class="form-field"><label>Transaction Type</label><select name="type"><option>Vendor Bill</option><option>Payment</option><option>Credit Note</option><option>Opening Balance</option></select></div>
            <div class="form-field"><label>Reference / Invoice #</label><input type="text" name="ref"></div>
            <div class="form-field"><label>Bill Amount (EGP)</label><input type="number" name="bill" min="0" step="0.01" value="0"></div>
            <div class="form-field"><label>Payment Amount (EGP)</label><input type="number" name="payment" min="0" step="0.01" value="0"></div>
            <div class="form-field"><label>Notes</label><input type="text" name="notes"></div>
          </div>
          <datalist id="vendorList">${CONSTANTS.vendors.map(v => `<option value="${v}">`).join('')}</datalist>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="apSaveBtn">Save Transaction</button>
            <button type="reset" class="btn">Clear</button>
          </div>
        </form>
      </div>`;
  }

  function rowsHtml(rows) {
    if (!rows.length) return `<tr class="empty-row"><td colspan="7">No records match filter</td></tr>`;
    return rows.map(r => {
      const bucket = Calc.apAgingBucket(r.date);
      return `<tr>
        <td class="rtl-cell">${r.vendor}</td><td>${fmtNum(r.opening, 2)}</td><td>${fmtNum(r.bills, 2)}</td>
        <td>${fmtNum(r.payments, 2)}</td><td class="${r.balance > 0 ? 'neg' : 'pos'}">${fmtNum(r.balance, 2)}</td>
        <td>${fmtDate(r.date)}</td><td><span class="pill ${bucket.pill}">${bucket.label}</span></td>
      </tr>`;
    }).join('');
  }

  function tableHtml(rows) {
    return `
      <div class="filters-row">
        <input type="text" id="apSearch" placeholder="Search vendor...">
        <select id="apFilterStatus"><option value="all">All Status</option><option value="Current">Current</option><option value="Due">Due</option><option value="Overdue">Overdue</option><option value="Critical">Critical</option></select>
      </div>
      <div class="table-card"><div class="table-scroll">
      <table>
        <thead><tr><th>Vendor</th><th>Opening Balance</th><th>Bills</th><th>Payments</th><th>Balance</th><th>Aging</th><th>Status</th></tr></thead>
        <tbody id="apTbody">${rowsHtml(rows)}</tbody>
      </table>
      </div></div>`;
  }

  const html = `
    <div class="module-title">AP Ledger</div>
    <div class="module-sub">Accounts Payable tracking across 24 vendors · IAS 37</div>
    ${kpiHtml()}${agingHtml()}${formHtml()}${tableHtml(d.rows)}
  `;

  setTimeout(() => {
    document.getElementById('apForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('apSaveBtn');
      btn.disabled = true; btn.textContent = 'Saving…';
      const fd = new FormData(e.target);
      const bills = Number(fd.get('bill')) || 0, payments = Number(fd.get('payment')) || 0;
      const row = { vendor: fd.get('vendor'), opening: 0, bills, payments, balance: bills - payments, date: new Date(fd.get('date')) };
      try {
        await SheetsAPI.append('AP', row);
        d.rows.unshift(row);
        applyFilters();
        e.target.reset();
        toast('AP transaction saved', 'success');
      } catch (err) {
        toast('Save failed: ' + err.message, 'error');
      } finally {
        btn.disabled = false; btn.textContent = 'Save Transaction';
      }
    });

    function applyFilters() {
      const rows = d.rows.filter(r => {
        if (state.search && !r.vendor.toLowerCase().includes(state.search.toLowerCase())) return false;
        if (state.status !== 'all' && Calc.apAgingBucket(r.date).label !== state.status) return false;
        return true;
      });
      document.getElementById('apTbody').innerHTML = rowsHtml(rows);
    }
    document.getElementById('apSearch').addEventListener('input', e => { state.search = e.target.value; applyFilters(); });
    document.getElementById('apFilterStatus').addEventListener('change', e => { state.status = e.target.value; applyFilters(); });
  }, 0);

  return html;
}
