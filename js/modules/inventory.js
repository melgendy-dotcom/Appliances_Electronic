function renderInventory() {
  const d = MOCK.inventory;
  const state = { search: '', status: 'all', brand: 'all' };

  function kpiHtml() {
    return `
      <div class="kpi-grid cols-5">
        <div class="kpi-card" style="border-top-color:var(--accent)"><span class="icon">🔢</span><div class="label">Total SKUs</div><div class="value">${fmtNum(d.kpis.totalSkus)}</div></div>
        <div class="kpi-card" style="border-top-color:var(--green)"><span class="icon">✅</span><div class="label">In Stock</div><div class="value">${fmtNum(d.kpis.inStock)}</div><div class="sub">${d.kpis.inStockPct}%</div></div>
        <div class="kpi-card" style="border-top-color:var(--accent)"><span class="icon">⚠️</span><div class="label">Low Stock (≤3)</div><div class="value">${fmtNum(d.kpis.lowStock)}</div></div>
        <div class="kpi-card" style="border-top-color:var(--red)"><span class="icon">❌</span><div class="label">Out of Stock</div><div class="value">${fmtNum(d.kpis.outOfStock)}</div></div>
        <div class="kpi-card" style="border-top-color:var(--blue)"><span class="icon">💰</span><div class="label">Stock Value (WAC)</div><div class="value">${fmtEGP(d.kpis.stockValue, 0)}</div></div>
      </div>`;
  }

  function chartsHtml() {
    const max = Math.max(...d.byBrand.map(b => b.amt));
    return `
      <div class="charts-row">
        <div class="chart-card"><h4>Stock Status Distribution</h4><canvas id="invDonut"></canvas></div>
        <div class="chart-card"><h4>Stock Value by Brand</h4>
          <div class="progress-list">
            ${d.byBrand.map(b => `
              <div class="progress-row">
                <span>${b.name}</span>
                <div class="progress-track"><div class="progress-fill" style="width:${(b.amt/max*100).toFixed(0)}%;background:var(--blue)"></div></div>
                <span class="mono">${fmtEGP(b.amt, 0)}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  function rowsHtml(rows) {
    if (!rows.length) return `<tr class="empty-row"><td colspan="9">No records match filter</td></tr>`;
    return rows.map(r => {
      const s = Calc.stockStatus(r.available);
      return `<tr>
        <td>${r.model}</td><td class="rtl-cell">${r.product}</td><td>${r.brand}</td>
        <td>${fmtNum(r.avgCost, 2)}</td><td>${r.rcvd}</td><td>${r.sold}</td>
        <td class="${r.available < 0 ? 'neg' : ''}">${r.available}</td>
        <td>${fmtNum(r.avgCost * r.available, 2)}</td>
        <td><span class="pill ${s.pill}">${s.label}</span></td>
        <td>${fmtDate(r.lastSale)}</td>
      </tr>`;
    }).join('');
  }

  function tableHtml(rows) {
    return `
      <div class="filters-row">
        <input type="text" id="invSearch" placeholder="Search model, product, brand...">
        <select id="invFilterStatus"><option value="all">All Status</option><option value="In Stock">In Stock</option><option value="Low Stock">Low Stock</option><option value="Out of Stock">Out</option></select>
        <select id="invFilterBrand"><option value="all">All Brands</option>${[...new Set(d.rows.map(r => r.brand))].map(b => `<option value="${b}">${b}</option>`).join('')}</select>
      </div>
      <div class="table-card"><div class="table-scroll">
      <table>
        <thead><tr><th>Model No.</th><th>Product</th><th>Brand</th><th>Avg Cost</th><th>Rcvd</th><th>Sold</th><th>Available</th><th>Stock Value</th><th>Status</th><th>Last Sale</th></tr></thead>
        <tbody id="invTbody">${rowsHtml(rows)}</tbody>
      </table>
      </div></div>`;
  }

  const html = `
    <div class="module-title">Inventory</div>
    <div class="module-sub">Real-time stock ledger with WAC valuation · IAS 2</div>
    ${kpiHtml()}${chartsHtml()}${tableHtml(d.rows)}
  `;

  setTimeout(() => {
    new Chart(document.getElementById('invDonut'), {
      type: 'doughnut',
      data: { labels: d.statusDist.map(s => s.label), datasets: [{ data: d.statusDist.map(s => s.value), backgroundColor: d.statusDist.map(s => resolveColor(s.color)) }] },
      options: { plugins: { legend: { labels: { color: '#8B949E' } } } },
    });

    function applyFilters() {
      const rows = d.rows.filter(r => {
        if (state.search) {
          const t = state.search.toLowerCase();
          if (!(r.model.toLowerCase().includes(t) || r.product.toLowerCase().includes(t) || r.brand.toLowerCase().includes(t))) return false;
        }
        if (state.status !== 'all' && Calc.stockStatus(r.available).label !== state.status) return false;
        if (state.brand !== 'all' && r.brand !== state.brand) return false;
        return true;
      });
      document.getElementById('invTbody').innerHTML = rowsHtml(rows);
    }
    document.getElementById('invSearch').addEventListener('input', e => { state.search = e.target.value; applyFilters(); });
    document.getElementById('invFilterStatus').addEventListener('change', e => { state.status = e.target.value; applyFilters(); });
    document.getElementById('invFilterBrand').addEventListener('change', e => { state.brand = e.target.value; applyFilters(); });
  }, 0);

  return html;
}
