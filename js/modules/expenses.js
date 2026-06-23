function renderExpenses() {
  const d = MOCK.expenses;
  const state = { search: '', category: 'all' };

  function kpiHtml() {
    return `
      <div class="kpi-grid cols-5">
        <div class="kpi-card" style="border-top-color:var(--red)"><span class="icon">💸</span><div class="label">Total Expenses (MTD)</div><div class="value">${fmtEGP(d.kpis.total, 0)}</div></div>
        <div class="kpi-card" style="border-top-color:var(--accent)"><span class="icon">📦</span><div class="label">Packaging</div><div class="value">${fmtEGP(d.kpis.packaging, 0)}</div><div class="sub">${d.kpis.packagingPct}% of opex</div></div>
        <div class="kpi-card" style="border-top-color:var(--blue)"><span class="icon">🚚</span><div class="label">Logistics</div><div class="value">${fmtEGP(d.kpis.logistics, 0)}</div><div class="sub">${d.kpis.logisticsPct}% of opex</div></div>
        <div class="kpi-card" style="border-top-color:var(--purple)"><span class="icon">💳</span><div class="label">BNPL Fees</div><div class="value">${fmtEGP(d.kpis.bnpl, 0)}</div><div class="sub">${d.kpis.bnplPct}% of opex</div></div>
        <div class="kpi-card" style="border-top-color:var(--grey)"><span class="icon">🏬</span><div class="label">Storage</div><div class="value">${fmtEGP(d.kpis.storage, 0)}</div></div>
      </div>`;
  }

  function chartsHtml() {
    const max = Math.max(...d.byCategory.map(c => c.amt));
    return `
      <div class="charts-row">
        <div class="chart-card"><h4>Expenses by Category</h4>
          <div class="progress-list">
            ${d.byCategory.map(c => `
              <div class="progress-row">
                <span>${c.name}</span>
                <div class="progress-track"><div class="progress-fill" style="width:${(c.amt/max*100).toFixed(0)}%;background:var(--accent)"></div></div>
                <span class="mono">${fmtEGP(c.amt, 0)}</span>
              </div>`).join('')}
          </div>
        </div>
        <div class="chart-card"><h4>Monthly Expense Trend</h4><canvas id="expMonthlyChart"></canvas></div>
      </div>`;
  }

  function formHtml() {
    return `
      <div class="form-panel">
        <h3>Log New Expense</h3>
        <form id="expForm">
          <div class="form-grid">
            <div class="form-field"><label>Date</label><input type="date" name="date" required value="${new Date().toISOString().slice(0,10)}"></div>
            <div class="form-field"><label>Category</label><select name="category">${CONSTANTS.expenseCategories.map(c => `<option>${c}</option>`).join('')}</select></div>
            <div class="form-field"><label>Description</label><input type="text" name="desc" required></div>
            <div class="form-field"><label>Amount (EGP)</label><input type="number" name="amount" min="0" step="0.01" required></div>
            <div class="form-field"><label>Pay Method</label><select name="method"><option>Cash</option><option>Bank Transfer</option><option>Cheque</option><option>Credit Card</option></select></div>
            <div class="form-field"><label>Vendor / Notes</label><input type="text" name="notes"></div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="expSaveBtn">Save Expense</button>
            <button type="reset" class="btn">Clear</button>
          </div>
        </form>
      </div>`;
  }

  function rowsHtml(rows) {
    if (!rows.length) return `<tr class="empty-row"><td colspan="6">No records match filter</td></tr>`;
    return rows.map(r => `<tr>
        <td>${fmtDate(r.date)}</td><td>${r.category}</td><td>${r.desc}</td>
        <td>${fmtNum(r.amount, 2)}</td><td>${r.method}</td><td>${r.notes || '—'}</td>
      </tr>`).join('');
  }

  function tableHtml(rows) {
    return `
      <div class="filters-row">
        <input type="text" id="expSearch" placeholder="Search description, notes...">
        <select id="expFilterCategory"><option value="all">All Categories</option>${CONSTANTS.expenseCategories.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
      </div>
      <div class="table-card"><div class="table-scroll">
      <table>
        <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount (EGP)</th><th>Pay Method</th><th>Vendor / Notes</th></tr></thead>
        <tbody id="expTbody">${rowsHtml(rows)}</tbody>
      </table>
      </div></div>`;
  }

  const html = `
    <div class="module-title">Expenses</div>
    <div class="module-sub">Operational expense ledger for P&L reporting · IAS 1</div>
    ${kpiHtml()}${chartsHtml()}${formHtml()}${tableHtml(d.rows)}
  `;

  setTimeout(() => {
    new Chart(document.getElementById('expMonthlyChart'), {
      type: 'bar',
      data: { labels: d.monthly.map(m => m.m), datasets: [{ label: 'EGP', data: d.monthly.map(m => m.v), backgroundColor: '#F85149' }] },
      options: chartOpts(),
    });

    document.getElementById('expForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('expSaveBtn');
      btn.disabled = true; btn.textContent = 'Saving…';
      const fd = new FormData(e.target);
      const row = { date: new Date(fd.get('date')), category: fd.get('category'), desc: fd.get('desc'),
        amount: Number(fd.get('amount')), method: fd.get('method'), notes: fd.get('notes') || '' };
      try {
        await SheetsAPI.append('Expenses', row);
        d.rows.unshift(row);
        applyFilters();
        e.target.reset();
        toast('Expense saved', 'success');
      } catch (err) {
        toast('Save failed: ' + err.message, 'error');
      } finally {
        btn.disabled = false; btn.textContent = 'Save Expense';
      }
    });

    function applyFilters() {
      const rows = filterRows(d.rows, state.search, ['desc', 'notes'], { category: state.category });
      document.getElementById('expTbody').innerHTML = rowsHtml(rows);
    }
    document.getElementById('expSearch').addEventListener('input', e => { state.search = e.target.value; applyFilters(); });
    document.getElementById('expFilterCategory').addEventListener('change', e => { state.category = e.target.value; applyFilters(); });
  }, 0);

  return html;
}
