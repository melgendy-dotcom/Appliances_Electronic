// Google Sheets Apps Script connector (JSONP).
// Swap point: set SHEETS_API_URL to your deployed Apps Script Web App URL
// (see MDA section 11). Until then, falls back to MOCK data.

const SHEETS_API_URL = ''; // e.g. 'https://script.google.com/macros/s/XXXX/exec'

const SheetsAPI = {
  connected: false,

  async get(sheet) {
    if (!SHEETS_API_URL) return null; // caller should fall back to MOCK
    return new Promise((resolve, reject) => {
      const cbName = 'cb_' + sheet + '_' + Date.now();
      window[cbName] = (data) => { resolve(data); delete window[cbName]; script.remove(); };
      const script = document.createElement('script');
      script.src = `${SHEETS_API_URL}?action=get&sheet=${sheet}&callback=${cbName}`;
      script.onerror = () => { reject(new Error('Sync failed')); script.remove(); };
      document.body.appendChild(script);
    });
  },

  async append(sheet, data) {
    if (!SHEETS_API_URL) return { ok: false, mock: true };
    const res = await fetch(SHEETS_API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'append', sheet, data }),
    });
    return res.json();
  },
};

function updateSyncStatus(state) {
  const dot = document.getElementById('syncDot');
  const label = document.getElementById('syncLabel');
  if (!dot || !label) return;
  if (state === 'success') {
    dot.className = 'sync-dot green';
    label.textContent = 'Synced ' + new Date().toLocaleTimeString('en-GB');
  } else if (state === 'failed') {
    dot.className = 'sync-dot red';
    label.textContent = 'Sync failed';
  } else if (state === 'mock') {
    dot.className = 'sync-dot';
    label.textContent = 'Mock data (no Sheets URL set)';
  }
}
