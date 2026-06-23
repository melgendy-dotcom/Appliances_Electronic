function renderSales() {
  const d = MOCK.sales;
  const state = { search: '', channel: 'all', status: 'all' };

  function kpiHtml() {
    return `
      <div class="kpi-grid">
        <div class="kpi-card" style="border-top-color:var(--green)"><span class="icon">📈</span><div class="label">Revenue (MTD)</div><div class="value">${fmtEGP(d.kpis.revenue, 0)}</div><div class="sub pos" style="color:var(--green)">↑ ${fmtPct(d.kpis.revenueChangePct)}</div></div>
        <div class="kpi-card" style="border-top-color:var(--red)"><span class="icon">📉</span><div class="label">COGS</div><div class="value">${fmtEGP(d.kpis.cogs, 0)}</div></div>
        <div class="kpi-card" style="border-top-color:var(--accent)"><span class="icon">💵</span><div class="label">Gross Profit</div><div class="value">${fmtEGP(d.kpis.gp, 0)}</div><div class="sub">GP% ${fmtPct(d.kpis.gpPct)}</div></div>
        <div class="kpi-card" style="border-top-color:var(--blue)"><span class="icon">🧾</span><div class="label">Transactions</div><div class="value">${fmtNum(d.kpis.transactions)}</div><div class="sub">Avg ${fmtEGP(d.kpis.avgTicket, 0)}</div></div>
      </div>`;
  }

  function chartsHtml() {
    return `
      <div class="charts-row">
        <div class="chart-card"><h4>Monthly Revenue vs COGS</h4><canvas id="salesMonthlyChart"></canvas></div>
        <div class="chart-card"><h4>Sales by Channel (MTD)</h4>
          <div class="progress-list">
            ${d.byChannel.map(c => `
              <div class="progress-row">
                <span>${c.name}</span>
                <div class="progress-track"><div class="progress-fill" style="width:${c.pct}%;background:${resolveColor(c.color)}"></div></div>
                <span class="mono">${c.pct}%</span>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  function formHtml() {
    return `
      <div class="form-panel">
        <h3>Log New Sale</h3>
        <form id="saleForm">
          <div class="form-grid">
            <div class="form-field"><label>Sale Date</label><input type="date" name="date" required value="${new Date().toISOString().slice(0,10)}"></div>
            <div class="form-field"><label>Channel</label><select name="channel">${CONSTANTS.channels.map(c => `<option>${c}</option>`).join('')}</select></div>
            <div class="form-field"><label>Model No.</label><input type="text" name="model"></div>
            <div class="form-field"><label>Product Name (AR)</label><input type="text" name="product" dir="rtl"></div>
            <div class="form-field"><label>Brand</label><input type="text" name="brand"></div>
            <div class="form-field"><label>Order No.</label><input type="text" name="orderNo"></div>
            <div class="form-field"><label>Qty Sold</label><input type="number" name="qty" min="1" required value="1"></div>
            <div class="form-field"><label>Sale Amount (EGP)</label><input type="number" name="sale" min="0" step="0.01" required id="saleAmt"></div>
            <div class="form-field"><label>Cost Amount (EGP)</label><input type="number" name="cost" min="0" step="0.01" required id="saleCost"></div>
            <div class="form-field"><label>GP (auto)</label><input type="text" id="saleGp" readonly value="EGP 0.00 (0.0%)"></div>
            <div class="form-field"><label>Payment Status</label><select name="status"><option>Paid</option><option>Pending</option><option>Partial</option></select></div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="saleSaveBtn">Save Sale</button>
            <button type="reset" class="btn">Clear</button>
          </div>
        </form>
      </div>`;
  }

  function rowsHtml(rows) {
    if (!rows.length) return `<tr class="empty-row"><td colspan="11">No records match filter</td></tr>`;
    return rows.map(r => {
      const gp = Calc.grossProfit(r.sale, r.cost);
      const gpPct = Calc.gpPct(gp, r.sale);
      const pillMap = { Paid: 'pill-green', Pending: 'pill-amber', Partial: 'pill-blue' };
      return `<tr>
        <td>${fmtDate(r.date)}</td><td>${r.channel}</td><td>${r.model}</td><td class="rtl-cell">${r.product}</td>
        <td>${r.brand}</td><td>${r.qty}</td><td>${fmtNum(r.sale, 2)}</td><td>${fmtNum(r.cost, 2)}</td>
        <td class="${gp >= 0 ? 'pos' : 'neg'}">${fmtNum(gp, 2)}</td><td class="${gp >= 0 ? 'pos' : 'neg'}">${fmtPct(gpPct)}</td>
        <td><span class="pill ${pillMap[r.status] || 'pill-grey'}">${r.status}</span></td>
      </tr>`;
    }).join('');
  }

  function tableHtml(rows) {
    return `
      <div class="filters-row">
        <input type="text" id="saleSearch" placeholder="Search model, product, brand...">
        <select id="saleFilterChannel"><option value="all">All Channels</option>${CONSTANTS.channels.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
        <select id="saleFilterStatus"><option value="all">All Status</option><option>Paid</option><option>Pending</option><option>Partial</option></select>
      </div>
      <div class="table-card"><div class="table-scroll">
      <table>
        <thead><tr><th>Date</th><th>Channel</th><th>Model</th><th>Product</th><th>Brand</th><th>Qty</th><th>Sale</th><th>Cost</th><th>GP</th><th>GP%</th><th>Status</th></tr></thead>
        <tbody id="saleTbody">${rowsHtml(rows)}</tbody>
      </table>
      </div></div>`;
  }

  const html = `
    <div class="module-title">Sales</div>
    <div class="module-sub">Multi-channel sales register with GP tracking · IFRS 15</div>
    ${kpiHtml()}${chartsHtml()}${formHtml()}${tableHtml(d.rows)}
  `;

  setTimeout(() => {
    new Chart(document.getElementById('salesMonthlyChart'), {
      type: 'bar',
      data: { labels: d.monthly.map(m => m.m), datasets: [
        { label: 'Sales', data: d.monthly.map(m => m.sales), backgroundColor: '#3FB950' },
        { label: 'COGS', data: d.monthly.map(m => m.cogs), backgroundColor: '#F85149' },
      ]},
      options: chartOpts(),
    });

    const saleAmt = document.getElementById('saleAmt'), saleCost = document.getElementById('saleCost'), gpEl = document.getElementById('saleGp');
    function recalc() {
      const gp = Calc.grossProfit(saleAmt.value, saleCost.value);
      const gpPct = Calc.gpPct(gp, Number(saleAmt.value) || 0);
      gpEl.value = `${fmtEGP(gp)} (${fmtPct(gpPct)})`;
      gpEl.style.color = gp >= 0 ? 'var(--green)' : 'var(--red)';
    }
    [saleAmt, saleCost].forEach(el => el.addEventListener('input', recalc));

    document.getElementById('saleForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('saleSaveBtn');
      btn.disabled = true; btn.textContent = 'Saving…';
      const fd = new FormData(e.target);
      const row = { date: new Date(fd.get('date')), channel: fd.get('channel'), model: fd.get('model') || '—',
        product: fd.get('product') || '', brand: fd.get('brand') || '—', qty: Number(fd.get('qty')),
        sale: Number(fd.get('sale')), cost: Number(fd.get('cost')), status: fd.get('status') };
      try {
        await SheetsAPI.append('Sales', row);
        d.rows.unshift(row);
        applyFilters();
        e.target.reset();
        gpEl.value = 'EGP 0.00 (0.0%)';
        toast('Sale logged', 'success');
      } catch (err) {
        toast('Save failed: ' + err.message, 'error');
      } finally {
        btn.disabled = false; btn.textContent = 'Save Sale';
      }
    });

    function applyFilters() {
      const rows = filterRows(d.rows, state.search, ['model', 'product', 'brand'], { channel: state.channel, status: state.status });
      document.getElementById('saleTbody').innerHTML = rowsHtml(rows);
    }
    document.getElementById('saleSearch').addEventListener('input', e => { state.search = e.target.value; applyFilters(); });
    document.getElementById('saleFilterChannel').addEventListener('change', e => { state.channel = e.target.value; applyFilters(); });
    document.getElementById('saleFilterStatus').addEventListener('change', e => { state.status = e.target.value; applyFilters(); });
  }, 0);

  return html;
}
