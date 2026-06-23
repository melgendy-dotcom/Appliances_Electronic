function renderAR() {
  const d = MOCK.ar;
  const state = { search: '', status: 'all', channel: 'all' };

  function kpiHtml() {
    return `
      <div class="kpi-grid">
        <div class="kpi-card" style="border-top-color:var(--blue)"><span class="icon">📥</span><div class="label">Total AR Outstanding</div><div class="value">${fmtEGP(d.kpis.outstanding, 0)}</div></div>
        <div class="kpi-card" style="border-top-color:var(--green)"><span class="icon">✅</span><div class="label">Collected (MTD)</div><div class="value">${fmtEGP(d.kpis.collectedMtd, 0)}</div></div>
        <div class="kpi-card" style="border-top-color:var(--accent)"><span class="icon">⏳</span><div class="label">Pending Settlement</div><div class="value">${fmtEGP(d.kpis.pendingSettlement, 0)}</div></div>
        <div class="kpi-card" style="border-top-color:var(--red)"><span class="icon">⚠️</span><div class="label">Overdue >30 Days</div><div class="value">${fmtEGP(d.kpis.overdueAmt, 0)}</div></div>
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
        <h3>Log AR Invoice / Receipt</h3>
        <form id="arForm">
          <div class="form-grid">
            <div class="form-field"><label>Date</label><input type="date" name="date" required value="${new Date().toISOString().slice(0,10)}"></div>
            <div class="form-field"><label>Customer / Channel</label><select name="channel" id="arChannel">${CONSTANTS.channels.map(c => `<option>${c}</option>`).join('')}</select></div>
            <div class="form-field"><label>Transaction Type</label><select name="type"><option>Sales Invoice</option><option>Receipt</option><option>Credit Note</option><option>Marketplace Settlement</option></select></div>
            <div class="form-field"><label>Invoice / Ref #</label><input type="text" name="ref"></div>
            <div class="form-field"><label>Invoice Amount (EGP)</label><input type="number" name="invoice" min="0" step="0.01" required id="arInvoice"></div>
            <div class="form-field"><label>Commission %</label><input type="number" name="commission" min="0" step="0.01" id="arCommission" value="0"></div>
            <div class="form-field"><label>Net Receivable</label><input type="text" id="arNet" readonly value="EGP 0.00"></div>
            <div class="form-field"><label>Payment Status</label><select name="status"><option>Pending</option><option>Received</option><option>Partial</option></select></div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="arSaveBtn">Save Entry</button>
            <button type="reset" class="btn">Clear</button>
          </div>
        </form>
      </div>`;
  }

  function rowsHtml(rows) {
    if (!rows.length) return `<tr class="empty-row"><td colspan="9">No records match filter</td></tr>`;
    return rows.map(r => {
      const net = Calc.netReceivable(r.invoice, r.commission);
      const pillMap = { Received: 'pill-green', Pending: 'pill-amber', Partial: 'pill-blue' };
      const channelPill = { Jumia: 'pill-amber', Noon: 'pill-blue', Raneen: 'pill-purple', 'B Tech': 'pill-green', Raya: 'pill-red', 'In Store': 'pill-grey' };
      return `<tr>
        <td>${fmtDate(r.date)}</td><td><span class="pill ${channelPill[r.channel] || 'pill-grey'}">${r.channel}</span></td>
        <td>${r.type}</td><td>${r.ref}</td><td>${fmtNum(r.invoice, 2)}</td><td>${fmtPct(r.commission)}</td>
        <td>${fmtNum(net, 2)}</td><td>—</td><td><span class="pill ${pillMap[r.status] || 'pill-grey'}">${r.status}</span></td>
      </tr>`;
    }).join('');
  }

  function tableHtml(rows) {
    return `
      <div class="filters-row">
        <input type="text" id="arSearch" placeholder="Search ref #...">
        <select id="arFilterChannel"><option value="all">All Channels</option>${CONSTANTS.channels.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
        <select id="arFilterStatus"><option value="all">All Status</option><option>Pending</option><option>Received</option><option>Partial</option></select>
      </div>
      <div class="table-card"><div class="table-scroll">
      <table>
        <thead><tr><th>Date</th><th>Channel</th><th>Type</th><th>Ref #</th><th>Invoice</th><th>Commission</th><th>Net Receivable</th><th>Due Date</th><th>Status</th></tr></thead>
        <tbody id="arTbody">${rowsHtml(rows)}</tbody>
      </table>
      </div></div>`;
  }

  const html = `
    <div class="module-title">AR Ledger</div>
    <div class="module-sub">Accounts Receivable tracking by marketplace channel · IFRS 15, IFRS 9</div>
    ${kpiHtml()}${agingHtml()}${formHtml()}${tableHtml(d.rows)}
  `;

  setTimeout(() => {
    const channelSel = document.getElementById('arChannel'), commEl = document.getElementById('arCommission');
    channelSel.addEventListener('change', () => {
      commEl.value = CONSTANTS.commissionRates[channelSel.value] ?? 0;
      recalc();
    });
    commEl.value = CONSTANTS.commissionRates[channelSel.value] ?? 0;

    const invoiceEl = document.getElementById('arInvoice'), netEl = document.getElementById('arNet');
    function recalc() {
      const net = Calc.netReceivable(invoiceEl.value, commEl.value);
      netEl.value = fmtEGP(net);
    }
    [invoiceEl, commEl].forEach(el => el.addEventListener('input', recalc));

    document.getElementById('arForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('arSaveBtn');
      btn.disabled = true; btn.textContent = 'Saving…';
      const fd = new FormData(e.target);
      const row = { date: new Date(fd.get('date')), channel: fd.get('channel'), type: fd.get('type'),
        ref: fd.get('ref') || '—', invoice: Number(fd.get('invoice')), commission: Number(fd.get('commission')) || 0,
        status: fd.get('status') };
      try {
        await SheetsAPI.append('AR', row);
        d.rows.unshift(row);
        applyFilters();
        e.target.reset();
        netEl.value = 'EGP 0.00';
        toast('AR entry saved', 'success');
      } catch (err) {
        toast('Save failed: ' + err.message, 'error');
      } finally {
        btn.disabled = false; btn.textContent = 'Save Entry';
      }
    });

    function applyFilters() {
      const rows = filterRows(d.rows, state.search, ['ref'], { channel: state.channel, status: state.status });
      document.getElementById('arTbody').innerHTML = rowsHtml(rows);
    }
    document.getElementById('arSearch').addEventListener('input', e => { state.search = e.target.value; applyFilters(); });
    document.getElementById('arFilterChannel').addEventListener('change', e => { state.channel = e.target.value; applyFilters(); });
    document.getElementById('arFilterStatus').addEventListener('change', e => { state.status = e.target.value; applyFilters(); });
  }, 0);

  return html;
}
