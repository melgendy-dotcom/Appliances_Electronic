// Mock data — replace with live Google Sheets API once VITE_SHEETS_API_URL is deployed.
// See SheetsAPI in api.js for the swap point.

const CONSTANTS = {
  channels: ['B Tech', 'In Store', 'Jumia', 'Noon', 'Raneen', 'Raya'],
  expenseCategories: ['Packaging', 'Logistics & Shipping', 'Salaries & Wages', 'Marketing & Ads', 'BNPL Fees', 'Storage', 'Rent', 'Utilities', 'Maintenance & Repairs', 'Other'],
  payMethods: ['Cash', 'Payment Terms', 'Transfer', 'Cheque'],
  vendors: ['Awlad Mahmoud', 'الحويطي', 'الرضا', 'الروضه', 'الشهد', 'الشيخ جمال', 'الصبي', 'الصفا', 'الفتح', 'الفهد', 'الفولي', 'المركز العربي', 'الندى', 'الهدير', 'بكري الحق', 'حازم سليمان', 'حامد قطوش', 'حديث المدينه', 'سعداوي', 'سيف عطا', 'عبدالباسط', 'على بركة الله', 'فجر الإسلام', 'هذا من فضل ربي'],
  commissionRates: { 'Jumia': 12.0, 'Noon': 10.5, 'B Tech': 0, 'Raneen': 8.0, 'Raya': 8.0, 'In Store': 0 },
};

function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }

const MOCK = {
  globalStats: { skus: 663, channels: 6, vendors: 24, revenue: 4800000, marginPct: 18.2, ifrsStd: 'IFRS' },

  purchasing: {
    kpis: { totalValue: 3200000, totalOrders: 205, paid: 2300000, paidPct: 72, outstanding: 895000, outstandingVendors: 24, activeSuppliers: 24 },
    monthly: [{ m: 'Jan', v: 480000 }, { m: 'Feb', v: 520000 }, { m: 'Mar', v: 610000 }, { m: 'Apr', v: 590000 }, { m: 'May', v: 540000 }, { m: 'Jun', v: 460000 }],
    topSuppliers: [{ name: 'الفولي', amt: 420000 }, { name: 'الشهد', amt: 380000 }, { name: 'الندى', amt: 310000 }, { name: 'سعداوي', amt: 260000 }, { name: 'الفتح', amt: 210000 }],
    rows: [
      { date: daysAgo(2), supplier: 'الفولي', model: 'TV-55X', product: 'تلفزيون سامسونج 55 بوصة', qty: 10, unitCost: 12000, total: 120000, method: 'Cash', paid: 120000 },
      { date: daysAgo(5), supplier: 'الشهد', model: 'AC-12K', product: 'تكييف شارب 1.5 حصان', qty: 8, unitCost: 9500, total: 76000, method: 'Payment Terms', paid: 30000 },
      { date: daysAgo(8), supplier: 'الندى', model: 'WM-7KG', product: 'غسالة LG اتوماتيك', qty: 15, unitCost: 7200, total: 108000, method: 'Transfer', paid: 108000 },
      { date: daysAgo(12), supplier: 'سعداوي', model: 'FR-18FT', product: 'ثلاجة شارب 18 قدم', qty: 6, unitCost: 14500, total: 87000, method: 'Cheque', paid: 50000 },
      { date: daysAgo(15), supplier: 'الفتح', model: 'MW-25L', product: 'ميكروويف توشيبا', qty: 20, unitCost: 1800, total: 36000, method: 'Cash', paid: 36000 },
    ],
  },

  inventory: {
    kpis: { totalSkus: 663, inStock: 420, inStockPct: 63, lowStock: 47, outOfStock: 93, stockValue: 18400000 },
    statusDist: [{ label: 'In Stock', value: 420, color: 'var(--green)' }, { label: 'Low Stock', value: 47, color: 'var(--accent)' }, { label: 'Out of Stock', value: 93, color: 'var(--red)' }, { label: 'Negative', value: 103, color: '#7a1f1c' }],
    byBrand: [{ name: 'Samsung', amt: 4200000 }, { name: 'LG', amt: 3600000 }, { name: 'Sharp', amt: 2900000 }, { name: 'Toshiba', amt: 2400000 }, { name: 'Tornado', amt: 1800000 }, { name: 'Other', amt: 3500000 }],
    rows: [
      { model: 'TV-55X', product: 'تلفزيون سامسونج 55 بوصة', brand: 'Samsung', avgCost: 11800, rcvd: 120, sold: 95, available: 25, lastSale: daysAgo(1) },
      { model: 'AC-12K', product: 'تكييف شارب 1.5 حصان', brand: 'Sharp', avgCost: 9200, rcvd: 60, sold: 58, available: 2, lastSale: daysAgo(3) },
      { model: 'WM-7KG', product: 'غسالة LG اتوماتيك', brand: 'LG', avgCost: 7000, rcvd: 90, sold: 90, available: 0, lastSale: daysAgo(7) },
      { model: 'FR-18FT', product: 'ثلاجة شارب 18 قدم', brand: 'Sharp', avgCost: 14100, rcvd: 40, sold: 42, available: -2, lastSale: daysAgo(2) },
      { model: 'MW-25L', product: 'ميكروويف توشيبا', brand: 'Toshiba', avgCost: 1750, rcvd: 200, sold: 150, available: 50, lastSale: daysAgo(1) },
      { model: 'FAN-16', product: 'مروحة ترنادو 16 بوصة', brand: 'Tornado', avgCost: 650, rcvd: 300, sold: 297, available: 3, lastSale: daysAgo(4) },
    ],
  },

  sales: {
    kpis: { revenue: 4800000, revenueChangePct: 8.4, cogs: 3900000, gp: 873000, gpPct: 18.2, transactions: 1843, avgTicket: 2604 },
    monthly: [{ m: 'Jan', sales: 4100000, cogs: 3350000 }, { m: 'Feb', sales: 4350000, cogs: 3560000 }, { m: 'Mar', sales: 4600000, cogs: 3760000 }, { m: 'Apr', sales: 4500000, cogs: 3700000 }, { m: 'May', sales: 4700000, cogs: 3850000 }, { m: 'Jun', sales: 4800000, cogs: 3900000 }],
    byChannel: [{ name: 'Jumia', pct: 34, color: 'var(--accent)' }, { name: 'Noon', pct: 25, color: 'var(--blue)' }, { name: 'B Tech', pct: 18, color: 'var(--green)' }, { name: 'Raneen', pct: 12, color: 'var(--purple)' }, { name: 'Raya', pct: 7, color: 'var(--red)' }, { name: 'In Store', pct: 4, color: 'var(--grey)' }],
    rows: [
      { date: daysAgo(0), channel: 'Jumia', model: 'TV-55X', product: 'تلفزيون سامسونج 55 بوصة', brand: 'Samsung', qty: 1, sale: 16500, cost: 11800, status: 'Paid' },
      { date: daysAgo(1), channel: 'Noon', model: 'AC-12K', product: 'تكييف شارب 1.5 حصان', brand: 'Sharp', qty: 1, sale: 13800, cost: 9200, status: 'Pending' },
      { date: daysAgo(1), channel: 'B Tech', model: 'WM-7KG', product: 'غسالة LG اتوماتيك', brand: 'LG', qty: 2, sale: 9600, cost: 7000, status: 'Paid' },
      { date: daysAgo(2), channel: 'Raneen', model: 'FR-18FT', product: 'ثلاجة شارب 18 قدم', brand: 'Sharp', qty: 1, sale: 19900, cost: 14100, status: 'Partial' },
      { date: daysAgo(3), channel: 'Raya', model: 'MW-25L', product: 'ميكروويف توشيبا', brand: 'Toshiba', qty: 3, sale: 2700, cost: 1750, status: 'Paid' },
      { date: daysAgo(4), channel: 'In Store', model: 'FAN-16', product: 'مروحة ترنادو 16 بوصة', brand: 'Tornado', qty: 5, sale: 1100, cost: 650, status: 'Paid' },
    ],
  },

  ap: {
    kpis: { outstanding: 895000, outstandingVendors: 24, paidJun: 476000, newBillsJun: 312000, newBillsInvoices: 38, overdueAmt: 168000, overdueVendors: 4 },
    aging: [{ label: 'Current (0–30 days)', amt: 412000, color: 'var(--green)' }, { label: '31–60 Days', amt: 210000, color: 'var(--accent)' }, { label: '61–90 Days', amt: 168000, color: 'var(--red)' }, { label: 'Over 90 Days', amt: 105000, color: 'var(--red)' }],
    rows: [
      { vendor: 'الفولي', opening: 50000, bills: 420000, payments: 380000, date: daysAgo(10) },
      { vendor: 'الشهد', opening: 20000, bills: 380000, payments: 290000, date: daysAgo(35) },
      { vendor: 'الندى', opening: 0, bills: 310000, payments: 310000, date: daysAgo(5) },
      { vendor: 'سعداوي', opening: 15000, bills: 260000, payments: 180000, date: daysAgo(65) },
      { vendor: 'الفتح', opening: 0, bills: 210000, payments: 140000, date: daysAgo(95) },
    ].map(r => ({ ...r, balance: r.opening + r.bills - r.payments })),
  },

  ar: {
    kpis: { outstanding: 1200000, collectedMtd: 3600000, pendingSettlement: 312000, overdueAmt: 88000 },
    aging: [{ label: 'Current (0–30 days)', amt: 824000, color: 'var(--green)' }, { label: '31–60 Days', amt: 200000, color: 'var(--accent)' }, { label: '61–90 Days', amt: 88000, color: 'var(--red)' }, { label: 'Over 90 Days', amt: 88000, color: 'var(--red)' }],
    rows: [
      { date: daysAgo(3), channel: 'Jumia', type: 'Sales Invoice', ref: 'JM-10234', invoice: 16500, commission: 12.0, status: 'Pending' },
      { date: daysAgo(8), channel: 'Noon', type: 'Marketplace Settlement', ref: 'NN-88123', invoice: 13800, commission: 10.5, status: 'Received' },
      { date: daysAgo(20), channel: 'Raneen', type: 'Sales Invoice', ref: 'RN-55621', invoice: 19900, commission: 8.0, status: 'Partial' },
      { date: daysAgo(40), channel: 'Raya', type: 'Sales Invoice', ref: 'RY-22310', invoice: 2700, commission: 8.0, status: 'Pending' },
      { date: daysAgo(2), channel: 'B Tech', type: 'Receipt', ref: 'BT-99021', invoice: 9600, commission: 0, status: 'Received' },
    ],
  },

  expenses: {
    kpis: { total: 2100000, packaging: 340000, packagingPct: 16, logistics: 290000, logisticsPct: 14, bnpl: 180000, bnplPct: 8.5, storage: 145000 },
    byCategory: [{ name: 'Packaging', amt: 340000 }, { name: 'Logistics & Shipping', amt: 290000 }, { name: 'Salaries & Wages', amt: 610000 }, { name: 'Marketing & Ads', amt: 320000 }, { name: 'BNPL Fees', amt: 180000 }, { name: 'Storage', amt: 145000 }, { name: 'Other', amt: 215000 }],
    monthly: [{ m: 'Jan', v: 1850000 }, { m: 'Feb', v: 1920000 }, { m: 'Mar', v: 1980000 }, { m: 'Apr', v: 2020000 }, { m: 'May', v: 2060000 }, { m: 'Jun', v: 2100000 }],
    rows: [
      { date: daysAgo(1), category: 'Packaging', desc: 'Carton boxes restock', amount: 28000, method: 'Bank Transfer', notes: 'Monthly order' },
      { date: daysAgo(2), category: 'Logistics & Shipping', desc: 'Aramex last-mile fees', amount: 41000, method: 'Bank Transfer', notes: '' },
      { date: daysAgo(3), category: 'BNPL Fees', desc: 'ValU commission', amount: 22000, method: 'Bank Transfer', notes: '' },
      { date: daysAgo(5), category: 'Storage', desc: 'Warehouse rent', amount: 45000, method: 'Cheque', notes: 'June' },
      { date: daysAgo(7), category: 'Marketing & Ads', desc: 'Facebook ads', amount: 35000, method: 'Credit Card', notes: '' },
    ],
  },
};
