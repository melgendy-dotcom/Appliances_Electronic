function renderPurchasing() {
  const d = MOCK.purchasing;
  const state = { search: '', supplier: 'all', method: 'all' };

  function kpiHtml() {
    return `
      <div class="kpi-grid">
        <div class="kpi-card" style="border-top-color:var(--blue)"><span class="icon">📦</span>
          <div class="label">Total PO Value</div>
          <div class="value">${fmtEGP(d.kpis.totalValue, 0)}</div>
          <div class="sub">${d.kpis.totalOrders} orders</div></div>
        <div class="kpi-card" style="border-top-color:var(--green)"><span class="icon">✅</span>
          <div class="label">Amount Paid</div>
          <div class="value">${fmtEGP(d.kpis.paid, 0)}</div>
          <div class="sub">${d.kpis.paidPct}% of total</div></div>
        <div class="kpi-card" style="border-top-color:var(--red)"><span class="icon">⚠️</span>
          <div class="label">Outstanding Balance</div>
          <div class="value">${fmtEGP(d.kpis.outstanding, 0)}</div>
          <div class="sub">${d.kpis.outstandingVendors} suppliers</div></div>
        <div class="kpi-card" style="border-top-color:var(--accent)"><span class="icon">🏭</span>
          <div class="label">Active Suppliers</div>
          <div class="value">${d.kpis.activeSuppliers}</div>
          <div class="sub">vendors</div></div>
      </div>`;
  }

  function chartsHtml() {
    const max = Math.max(...d.topSuppliers.map(s => s.amt));
    return `
      <div class="charts-row">
        <div class="chart-card"><h4>Monthly Purchase Value</h4><canvas id="poMonthlyChart"></canvas></div>
        <div class="chart-card"><h4>Top Supplier Spend</h4>
          <div class="progress-list">
            ${d.topSuppliers.map(s => `
              <div class="progress-row">
                <span class="rtl">${s.name}</span>
                <div class="progress-track"><div class="progress-fill" style="width:${(s.amt/max*100).toFixed(0)}%;background:var(--accent)"></div></div>
                <span class="mono">${fmtEGP(s.amt, 0)}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  function formHtml() {
    return `
      <div class="form-panel">
        <h3>Log New PO</h3>
        <form id="poForm">
          <div class="form-grid">
            <div class="form-field"><label>Date</label><input type="date" name="date" required value="${new Date().toISOString().slice(0,10)}"></div>
            <div class="form-field"><label>Supplier</label><input type="text" name="supplier" required list="supplierList"></div>
            <div class="form-field"><label>Model No.</label><input type="text" name="model"></div>
            <div class="form-field"><label>Product Name (AR)</label><input type="text" name="product" dir="rtl"></div>
            <div class="form-field"><label>Qty Ordered</label><input type="number" name="qty" min="1" required id="poQty"></div>
            <div class="form-field"><label>Unit Cost (EGP)</label><input type="number" name="unitCost" min="0" step="0.01" required id="poUnitCost"></div>
            <div class="form-field"><label>Total Cost</label><input type="text" id="poTotal" readonly value="EGP 0.00"></div>
            <div class="form-field"><label>Pay Method</label>
              <select name="method" id="poMethod">${CONSTANTS.payMethods.map(m => `<option>${m}</option>`).join('')}</select></div>
            <div class="form-field"><label>Terms (Days)</label><input type="number" name="terms" min="0" value="0"></div>
            <div class="form-field"><label>Amount Paid</label><input type="number" name="paid" min="0" step="0.01" id="poPaid" value="0"></div>
            <div class="form-field"><label>Balance</label><input type="text" id="poBalance" readonly value="EGP 0.00"></div>
          </div>
          <datalist id="supplierList">${[...new Set(d.rows.map(r => r.supplier))].map(s => `<option value="${s}">`).join('')}</datalist>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="poSaveBtn">Save PO</button>
            <button type="reset" class="btn">Clear</button>
          </div>
        </form>
      </div>`;
  }

  function tableHtml(rows) {
    return `
      <div class="filters-row">
        <input type="text" id="poSearch" placeholder="Search supplier, model, product...">
        <select id="poFilterSupplier"><option value="all">All Suppliers</option>${[...new Set(d.rows.map(r => r.supplier))].map(s => `<option value="${s}">${s}</option>`).join('')}</select>
        <select id="poFilterMethod"><option value="all">All Methods</option>${CONSTANTS.payMethods.map(m => `<option value="${m}">${m}</option>`).join('')}</select>
      </div>
      <div class="table-card"><div class="table-scroll">
      <table>
        <thead><tr><th>Date</th><th>Supplier</th><th>Model</th><th>Product</th><th>Qty</th><th>Unit Cost</th><th>Total</th><th>Method</th><th>Paid</th><th>Balance</th></tr></thead>
        <tbody id="poTbody">${rowsHtml(rows)}</tbody>
      </table>
      </div></div>`;
  }

  function rowsHtml(rows) {
    if (!rows.length) return `<tr class="empty-row"><td colspan="10">No records match filter</td></tr>`;
    return rows.map(r => {
      const total = Calc.poTotal(r.qty, r.unitCost);
      const balance = Calc.poBalance(total, r.paid);
      return `<tr>
        <td>${fmtDate(r.date)}</td><td class="rtl-cell">${r.supplier}</td><td>${r.model}</td>
        <td class="rtl-cell">${r.product}</td><td>${r.qty}</td><td>${fmtNum(r.unitCost, 2)}</td>
        <td>${fmtNum(total, 2)}</td><td>${r.method}</td><td>${fmtNum(r.paid, 2)}</td>
        <td class="${balance > 0 ? 'neg' : 'pos'}">${fmtNum(balance, 2)}</td>
      </tr>`;
    }).join('');
  }

  const html = `
    <div class="module-title">Purchasing</div>
    <div class="module-sub">Log and track all purchase orders from suppliers · IAS 2, IAS 37</div>
    ${kpiHtml()}${chartsHtml()}${formHtml()}${tableHtml(d.rows)}
  `;

  setTimeout(() => {
    // chart
    new Chart(document.getElementById('poMonthlyChart'), {
      type: 'bar',
      data: { labels: d.monthly.map(m => m.m), datasets: [{ label: 'EGP', data: d.monthly.map(m => m.v), backgroundColor: '#E8A020' }] },
      options: chartOpts(),
    });

    // auto-calc
    const qty = document.getElementById('poQty'), unit = document.getElementById('poUnitCost'),
          paid = document.getElementById('poPaid'), totalEl = document.getElementById('poTotal'),
          balEl = document.getElementById('poBalance');
    function recalc() {
      const total = Calc.poTotal(qty.value, unit.value);
      const balance = Calc.poBalance(total, paid.value);
      totalEl.value = fmtEGP(total);
      balEl.value = fmtEGP(balance);
      balEl.style.color = balance > 0 ? 'var(--red)' : 'var(--green)';
    }
    [qty, unit, paid].forEach(el => el.addEventListener('input', recalc));

    document.getElementById('poForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('poSaveBtn');
      btn.disabled = true; btn.textContent = 'Saving…';
      const fd = new FormData(e.target);
      const total = Calc.poTotal(fd.get('qty'), fd.get('unitCost'));
      const row = { date: new Date(fd.get('date')), supplier: fd.get('supplier'), model: fd.get('model') || '—',
        product: fd.get('product') || '', qty: Number(fd.get('qty')), unitCost: Number(fd.get('unitCost')),
        total, method: fd.get('method'), paid: Number(fd.get('paid')) || 0 };
      try {
        await SheetsAPI.append('Purchasing', row);
        d.rows.unshift(row);
        applyFilters();
        e.target.reset();
        document.getElementById('poTotal').value = 'EGP 0.00';
        document.getElementById('poBalance').value = 'EGP 0.00';
        toast('Purchase order saved', 'success');
      } catch (err) {
        toast('Save failed: ' + err.message, 'error');
      } finally {
        btn.disabled = false; btn.textContent = 'Save PO';
      }
    });

    function applyFilters() {
      const rows = filterRows(d.rows, state.search, ['supplier', 'model', 'product'], { supplier: state.supplier, method: state.method });
      document.getElementById('poTbody').innerHTML = rowsHtml(rows);
    }
    document.getElementById('poSearch').addEventListener('input', e => { state.search = e.target.value; applyFilters(); });
    document.getElementById('poFilterSupplier').addEventListener('change', e => { state.supplier = e.target.value; applyFilters(); });
    document.getElementById('poFilterMethod').addEventListener('change', e => { state.method = e.target.value; applyFilters(); });
  }, 0);

  return html;
}
