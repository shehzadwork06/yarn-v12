// const router = require('express').Router();
// const { authenticate } = require('../middlewares/auth');

// router.use(authenticate);

// // GET /api/finance/profit/daily
// router.get('/profit/daily', (req, res) => {
//   const db = req.app.locals.db;
//   const { date } = req.query;
//   const d = date || new Date().toISOString().split('T')[0];

//   const revenue = db.prepare('SELECT COALESCE(SUM(net_amount), 0) as total FROM sales WHERE date = ? AND status != ?').get(d, 'CANCELLED');
//   const purchaseCost = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total FROM purchases WHERE date = ? AND status != ?').get(d, 'CANCELLED');
//   const wastageCost = db.prepare('SELECT COALESCE(SUM(wastage_cost), 0) as total FROM wastage WHERE date = ?').get(d);
//   const expenses = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date = ?').get(d);

//   const cogs = purchaseCost.total + wastageCost.total;
//   const netProfit = revenue.total - cogs - expenses.total;

//   res.json({ date: d, revenue: revenue.total, purchase_cost: purchaseCost.total, wastage_cost: wastageCost.total, expenses: expenses.total, cogs, net_profit: netProfit });
// });

// // GET /api/finance/profit/monthly
// router.get('/profit/monthly', (req, res) => {
//   const db = req.app.locals.db;
//   const { month, year } = req.query;
//   const m = month || (new Date().getMonth() + 1).toString().padStart(2, '0');
//   const y = year || new Date().getFullYear();
//   const prefix = `${y}-${m.toString().padStart(2, '0')}`;

//   const revenue = db.prepare('SELECT COALESCE(SUM(net_amount), 0) as total FROM sales WHERE date LIKE ? AND status != ?').get(prefix + '%', 'CANCELLED');
//   const purchaseCost = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total FROM purchases WHERE date LIKE ? AND status != ?').get(prefix + '%', 'CANCELLED');
//   const wastageCost = db.prepare('SELECT COALESCE(SUM(wastage_cost), 0) as total FROM wastage WHERE date LIKE ?').get(prefix + '%');
//   const expenses = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date LIKE ?').get(prefix + '%');
//   const payrollCost = db.prepare('SELECT COALESCE(SUM(net_salary), 0) as total FROM payroll WHERE month = ? AND year = ?').get(m, parseInt(y));

//   const cogs = purchaseCost.total + wastageCost.total;
//   const totalExpenses = expenses.total + payrollCost.total;
//   const netProfit = revenue.total - cogs - totalExpenses;

//   res.json({ month: m, year: y, revenue: revenue.total, purchase_cost: purchaseCost.total, wastage_cost: wastageCost.total, operating_expenses: expenses.total, payroll_cost: payrollCost.total, cogs, total_expenses: totalExpenses, net_profit: netProfit });
// });

// // GET /api/finance/profit/lot-wise
// router.get('/profit/lot-wise', (req, res) => {
//   const db = req.app.locals.db;
//   const { lot_id } = req.query;

//   let query = `SELECT l.id, l.lot_number, l.cost_per_unit, l.initial_quantity, l.current_quantity,
//     p.name as product_name, p.type as product_type`;
//   let from = ' FROM lots l JOIN products p ON l.product_id = p.id';
//   let where = ' WHERE 1=1';
//   const params = [];
//   if (lot_id) { where += ' AND l.id = ?'; params.push(lot_id); }

//   const lots = db.prepare(query + from + where + ' ORDER BY l.created_at DESC').all(...params);

//   const results = lots.map(lot => {
//     const purchaseCost = lot.cost_per_unit * lot.initial_quantity;
//     const saleRevenue = db.prepare('SELECT COALESCE(SUM(si.amount), 0) as total FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE si.lot_id = ? AND s.status != ?').get(lot.id, 'CANCELLED');
//     const wastCost = db.prepare('SELECT COALESCE(SUM(wastage_cost), 0) as total FROM wastage WHERE lot_id = ?').get(lot.id);
//     const profit = saleRevenue.total - purchaseCost - wastCost.total;

//     return {
//       ...lot,
//       purchase_cost: purchaseCost,
//       sale_revenue: saleRevenue.total,
//       wastage_cost: wastCost.total,
//       profit,
//       margin: saleRevenue.total > 0 ? ((profit / saleRevenue.total) * 100).toFixed(2) : '0.00'
//     };
//   });

//   res.json(results);
// });

// // POST /api/finance/expenses
// router.post('/expenses', (req, res) => {
//   const db = req.app.locals.db;
//   const { category, description, amount, date, reference } = req.body;
//   if (!category || !amount) return res.status(400).json({ error: 'Category and amount required' });
//   const result = db.prepare('INSERT INTO expenses (category, description, amount, date, reference) VALUES (?,?,?,?,?)')
//     .run(category, description, amount, date || new Date().toISOString().split('T')[0], reference);
//   res.status(201).json(db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid));
// });

// // GET /api/finance/expenses
// router.get('/expenses', (req, res) => {
//   const db = req.app.locals.db;
//   const { from_date, to_date, category } = req.query;
//   let query = 'SELECT * FROM expenses WHERE 1=1';
//   const params = [];
//   if (from_date) { query += ' AND date >= ?'; params.push(from_date); }
//   if (to_date) { query += ' AND date <= ?'; params.push(to_date); }
//   if (category) { query += ' AND category = ?'; params.push(category); }
//   query += ' ORDER BY date DESC';
//   res.json(db.prepare(query).all(...params));
// });

// module.exports = router;
// const router = require('express').Router();
// const { authenticate } = require('../middlewares/auth');

// router.use(authenticate);

// // GET /api/finance/profit/daily
// router.get('/profit/daily', (req, res) => {
//   const db = req.app.locals.db;
//   const { date } = req.query;
//   const d = date || new Date().toISOString().split('T')[0];

//   const revenue = db.prepare('SELECT COALESCE(SUM(net_amount), 0) as total FROM sales WHERE date = ? AND status != ?').get(d, 'CANCELLED');
//   const purchaseCost = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total FROM purchases WHERE date = ? AND status != ?').get(d, 'CANCELLED');
//   const wastageCost = db.prepare('SELECT COALESCE(SUM(wastage_cost), 0) as total FROM wastage WHERE date = ?').get(d);
//   const expenses = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date = ?').get(d);

//   const cogs = purchaseCost.total + wastageCost.total;
//   const netProfit = revenue.total - cogs - expenses.total;

//   res.json({ date: d, revenue: revenue.total, purchase_cost: purchaseCost.total, wastage_cost: wastageCost.total, expenses: expenses.total, cogs, net_profit: netProfit });
// });

// // GET /api/finance/profit/monthly
// router.get('/profit/monthly', (req, res) => {
//   const db = req.app.locals.db;
//   const { month, year } = req.query;
//   const m = month || (new Date().getMonth() + 1).toString().padStart(2, '0');
//   const y = year || new Date().getFullYear();
//   const prefix = `${y}-${m.toString().padStart(2, '0')}`;

//   const revenue = db.prepare('SELECT COALESCE(SUM(net_amount), 0) as total FROM sales WHERE date LIKE ? AND status != ?').get(prefix + '%', 'CANCELLED');
//   const purchaseCost = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total FROM purchases WHERE date LIKE ? AND status != ?').get(prefix + '%', 'CANCELLED');
//   const wastageCost = db.prepare('SELECT COALESCE(SUM(wastage_cost), 0) as total FROM wastage WHERE date LIKE ?').get(prefix + '%');
//   const expenses = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date LIKE ?').get(prefix + '%');
//   const payrollCost = db.prepare('SELECT COALESCE(SUM(net_salary), 0) as total FROM payroll WHERE month = ? AND year = ?').get(m, parseInt(y));

//   const cogs = purchaseCost.total + wastageCost.total;
//   const totalExpenses = expenses.total + payrollCost.total;
//   const netProfit = revenue.total - cogs - totalExpenses;

//   res.json({ month: m, year: y, revenue: revenue.total, purchase_cost: purchaseCost.total, wastage_cost: wastageCost.total, operating_expenses: expenses.total, payroll_cost: payrollCost.total, cogs, total_expenses: totalExpenses, net_profit: netProfit });
// });

// // GET /api/finance/profit/lot-wise
// router.get('/profit/lot-wise', (req, res) => {
//   const db = req.app.locals.db;
//   const { lot_id } = req.query;

//   let query = `SELECT l.id, l.lot_number, l.cost_per_unit, l.initial_quantity, l.current_quantity,
//     p.name as product_name, p.type as product_type`;
//   let from = ' FROM lots l JOIN products p ON l.product_id = p.id';
//   let where = ' WHERE 1=1';
//   const params = [];
//   if (lot_id) { where += ' AND l.id = ?'; params.push(lot_id); }

//   const lots = db.prepare(query + from + where + ' ORDER BY l.created_at DESC').all(...params);

//   const results = lots.map(lot => {
//     const purchaseCost = lot.cost_per_unit * lot.initial_quantity;
//     const saleRevenue = db.prepare('SELECT COALESCE(SUM(si.amount), 0) as total FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE si.lot_id = ? AND s.status != ?').get(lot.id, 'CANCELLED');
//     const wastCost = db.prepare('SELECT COALESCE(SUM(wastage_cost), 0) as total FROM wastage WHERE lot_id = ?').get(lot.id);
//     const profit = saleRevenue.total - purchaseCost - wastCost.total;

//     return {
//       ...lot,
//       purchase_cost: purchaseCost,
//       sale_revenue: saleRevenue.total,
//       wastage_cost: wastCost.total,
//       profit,
//       margin: saleRevenue.total > 0 ? ((profit / saleRevenue.total) * 100).toFixed(2) : '0.00'
//     };
//   });

//   res.json(results);
// });

// // POST /api/finance/expenses
// router.post('/expenses', (req, res) => {
//   const db = req.app.locals.db;
//   const { category, description, amount, date, reference } = req.body;
//   if (!category || !amount) return res.status(400).json({ error: 'Category and amount required' });
//   const result = db.prepare('INSERT INTO expenses (category, description, amount, date, reference) VALUES (?,?,?,?,?)')
//     .run(category, description, amount, date || new Date().toISOString().split('T')[0], reference);
//   res.status(201).json(db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid));
// });

// // GET /api/finance/expenses
// router.get('/expenses', (req, res) => {
//   const db = req.app.locals.db;
//   const { from_date, to_date, category } = req.query;
//   let query = 'SELECT * FROM expenses WHERE 1=1';
//   const params = [];
//   if (from_date) { query += ' AND date >= ?'; params.push(from_date); }
//   if (to_date) { query += ' AND date <= ?'; params.push(to_date); }
//   if (category) { query += ' AND category = ?'; params.push(category); }
//   query += ' ORDER BY date DESC';
//   res.json(db.prepare(query).all(...params));
// });

// module.exports = router;
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// ─── Helper: sum a value from both yarn and chem tables ───────────────────────
// Finance routes have no businessMode header — they always aggregate both workspaces.
function sumBoth(db, yarnSql, chemSql, params) {
  const y = db.prepare(yarnSql).get(...params);
  const c = db.prepare(chemSql).get(...params);
  return (y?.total || 0) + (c?.total || 0);
}

// ─── GET /api/finance/profit/daily ───────────────────────────────────────────
router.get('/profit/daily', (req, res) => {
  const db = req.app.locals.db;
  const { date } = req.query;
  const d = date || new Date().toISOString().split('T')[0];

  const revenue = sumBoth(db,
    "SELECT COALESCE(SUM(net_amount),   0) AS total FROM yarn_sales     WHERE date = ? AND status != 'CANCELLED'",
    "SELECT COALESCE(SUM(net_amount),   0) AS total FROM chem_sales     WHERE date = ? AND status != 'CANCELLED'",
    [d]
  );
  const purchaseCost = sumBoth(db,
    "SELECT COALESCE(SUM(total_amount), 0) AS total FROM yarn_purchases WHERE date = ? AND status != 'CANCELLED'",
    "SELECT COALESCE(SUM(total_amount), 0) AS total FROM chem_purchases WHERE date = ? AND status != 'CANCELLED'",
    [d]
  );
  const wastageCost = sumBoth(db,
    "SELECT COALESCE(SUM(wastage_cost), 0) AS total FROM yarn_wastage   WHERE date = ?",
    "SELECT COALESCE(SUM(wastage_cost), 0) AS total FROM chem_wastage   WHERE date = ?",
    [d]
  );
  const expenses = db.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE date = ?").get(d).total;

  const cogs      = purchaseCost + wastageCost;
  const netProfit = revenue - cogs - expenses;

  res.json({
    date: d,
    revenue,
    purchase_cost: purchaseCost,
    wastage_cost:  wastageCost,
    expenses,
    cogs,
    net_profit: netProfit,
  });
});

// ─── GET /api/finance/profit/monthly ─────────────────────────────────────────
router.get('/profit/monthly', (req, res) => {
  const db = req.app.locals.db;
  const { month, year } = req.query;
  const m      = (month || (new Date().getMonth() + 1)).toString().padStart(2, '0');
  const y      = year || new Date().getFullYear();
  const prefix = `${y}-${m}`;

  const revenue = sumBoth(db,
    "SELECT COALESCE(SUM(net_amount),   0) AS total FROM yarn_sales     WHERE date LIKE ? AND status != 'CANCELLED'",
    "SELECT COALESCE(SUM(net_amount),   0) AS total FROM chem_sales     WHERE date LIKE ? AND status != 'CANCELLED'",
    [prefix + '%']
  );
  const purchaseCost = sumBoth(db,
    "SELECT COALESCE(SUM(total_amount), 0) AS total FROM yarn_purchases WHERE date LIKE ? AND status != 'CANCELLED'",
    "SELECT COALESCE(SUM(total_amount), 0) AS total FROM chem_purchases WHERE date LIKE ? AND status != 'CANCELLED'",
    [prefix + '%']
  );
  const wastageCost = sumBoth(db,
    "SELECT COALESCE(SUM(wastage_cost), 0) AS total FROM yarn_wastage   WHERE date LIKE ?",
    "SELECT COALESCE(SUM(wastage_cost), 0) AS total FROM chem_wastage   WHERE date LIKE ?",
    [prefix + '%']
  );
  const operatingExpenses = db.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE date LIKE ?").get(prefix + '%').total;
  const payrollCost       = db.prepare("SELECT COALESCE(SUM(net_salary), 0) AS total FROM payroll WHERE month = ? AND year = ?").get(m, parseInt(y)).total;

  const cogs          = purchaseCost + wastageCost;
  const totalExpenses = operatingExpenses + payrollCost;
  const netProfit     = revenue - cogs - totalExpenses;

  res.json({
    month: m,
    year:  y,
    revenue,
    purchase_cost:      purchaseCost,
    wastage_cost:       wastageCost,
    operating_expenses: operatingExpenses,
    payroll_cost:       payrollCost,
    cogs,
    total_expenses:     totalExpenses,
    net_profit:         netProfit,
  });
});

// ─── GET /api/finance/profit/lot-wise ────────────────────────────────────────
// Queries both yarn_lots and chem_lots and merges results.
router.get('/profit/lot-wise', (req, res) => {
  const db    = req.app.locals.db;
  const lotId = req.query.lot_id;

  const buildResults = (lotsTable, saleItemsTable, salesTable, wastageTable, productsTable) => {
    let sql = `
      SELECT l.id, l.lot_number, l.cost_per_unit, l.initial_quantity, l.current_quantity,
             p.name as product_name, p.type as product_type
      FROM ${lotsTable} l
      JOIN ${productsTable} p ON l.product_id = p.id
      WHERE 1=1`;
    const params = [];
    if (lotId) { sql += ' AND l.id = ?'; params.push(lotId); }
    sql += ' ORDER BY l.created_at DESC';

    return db.prepare(sql).all(...params).map(lot => {
      const purchaseCost = lot.cost_per_unit * lot.initial_quantity;
      const saleRevenue  = db.prepare(
        `SELECT COALESCE(SUM(si.amount), 0) AS total
         FROM ${saleItemsTable} si
         JOIN ${salesTable} s ON si.sale_id = s.id
         WHERE si.lot_id = ? AND s.status != 'CANCELLED'`
      ).get(lot.id).total;
      const wasteCost = db.prepare(
        `SELECT COALESCE(SUM(wastage_cost), 0) AS total FROM ${wastageTable} WHERE lot_id = ?`
      ).get(lot.id).total;
      const profit = saleRevenue - purchaseCost - wasteCost;

      return {
        ...lot,
        purchase_cost: purchaseCost,
        sale_revenue:  saleRevenue,
        wastage_cost:  wasteCost,
        profit,
        margin: saleRevenue > 0 ? ((profit / saleRevenue) * 100).toFixed(2) : '0.00',
      };
    });
  };

  const yarnResults = buildResults('yarn_lots', 'yarn_sale_items', 'yarn_sales', 'yarn_wastage', 'yarn_products');
  const chemResults = buildResults('chem_lots', 'chem_sale_items', 'chem_sales', 'chem_wastage', 'chem_products');

  const all = [...yarnResults, ...chemResults].sort((a, b) =>
    parseInt(b.lot_number) - parseInt(a.lot_number)
  );

  res.json(all);
});

// ─── GET /api/finance/profit/range ───────────────────────────────────────────
// Used by ReportsPage — supports 1day / 1week / 1month / 3month / custom range.
router.get('/profit/range', (req, res) => {
  const db = req.app.locals.db;
  let { from_date, to_date } = req.query;

  if (!from_date) from_date = new Date().toISOString().split('T')[0];
  if (!to_date)   to_date   = from_date;

  const rev  = sumBoth(db,
    "SELECT COALESCE(SUM(net_amount),   0) AS total FROM yarn_sales     WHERE date >= ? AND date <= ? AND status != 'CANCELLED'",
    "SELECT COALESCE(SUM(net_amount),   0) AS total FROM chem_sales     WHERE date >= ? AND date <= ? AND status != 'CANCELLED'",
    [from_date, to_date]
  );
  const pcst = sumBoth(db,
    "SELECT COALESCE(SUM(total_amount), 0) AS total FROM yarn_purchases WHERE date >= ? AND date <= ? AND status != 'CANCELLED'",
    "SELECT COALESCE(SUM(total_amount), 0) AS total FROM chem_purchases WHERE date >= ? AND date <= ? AND status != 'CANCELLED'",
    [from_date, to_date]
  );
  const wcst = sumBoth(db,
    "SELECT COALESCE(SUM(wastage_cost), 0) AS total FROM yarn_wastage   WHERE date >= ? AND date <= ?",
    "SELECT COALESCE(SUM(wastage_cost), 0) AS total FROM chem_wastage   WHERE date >= ? AND date <= ?",
    [from_date, to_date]
  );
  const exp = db.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE date >= ? AND date <= ?").get(from_date, to_date).total;

  // Breakdown: group by month if > 31 days, else by day
  const breakdown = [];
  const start     = new Date(from_date);
  const end       = new Date(to_date);
  const diffDays  = Math.ceil((end - start) / 86400000);

  if (diffDays > 31) {
    let cur = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cur <= end) {
      const pfx   = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
      const mRev  = sumBoth(db,
        "SELECT COALESCE(SUM(net_amount),   0) AS total FROM yarn_sales     WHERE date LIKE ? AND status != 'CANCELLED'",
        "SELECT COALESCE(SUM(net_amount),   0) AS total FROM chem_sales     WHERE date LIKE ? AND status != 'CANCELLED'",
        [pfx + '%']
      );
      const mPcst = sumBoth(db,
        "SELECT COALESCE(SUM(total_amount), 0) AS total FROM yarn_purchases WHERE date LIKE ? AND status != 'CANCELLED'",
        "SELECT COALESCE(SUM(total_amount), 0) AS total FROM chem_purchases WHERE date LIKE ? AND status != 'CANCELLED'",
        [pfx + '%']
      );
      const mWcst = sumBoth(db,
        "SELECT COALESCE(SUM(wastage_cost), 0) AS total FROM yarn_wastage   WHERE date LIKE ?",
        "SELECT COALESCE(SUM(wastage_cost), 0) AS total FROM chem_wastage   WHERE date LIKE ?",
        [pfx + '%']
      );
      const mExp = db.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE date LIKE ?").get(pfx + '%').total;
      breakdown.push({ period: pfx, revenue: mRev, purchase_cost: mPcst, wastage_cost: mWcst, total_expenses: mExp, cogs: mPcst + mWcst });
      cur.setMonth(cur.getMonth() + 1);
    }
  } else {
    let cur = new Date(from_date);
    while (cur <= end) {
      const d     = cur.toISOString().split('T')[0];
      const dRev  = sumBoth(db,
        "SELECT COALESCE(SUM(net_amount),   0) AS total FROM yarn_sales     WHERE date = ? AND status != 'CANCELLED'",
        "SELECT COALESCE(SUM(net_amount),   0) AS total FROM chem_sales     WHERE date = ? AND status != 'CANCELLED'",
        [d]
      );
      const dPcst = sumBoth(db,
        "SELECT COALESCE(SUM(total_amount), 0) AS total FROM yarn_purchases WHERE date = ? AND status != 'CANCELLED'",
        "SELECT COALESCE(SUM(total_amount), 0) AS total FROM chem_purchases WHERE date = ? AND status != 'CANCELLED'",
        [d]
      );
      const dWcst = sumBoth(db,
        "SELECT COALESCE(SUM(wastage_cost), 0) AS total FROM yarn_wastage   WHERE date = ?",
        "SELECT COALESCE(SUM(wastage_cost), 0) AS total FROM chem_wastage   WHERE date = ?",
        [d]
      );
      const dExp = db.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE date = ?").get(d).total;
      if (dRev > 0 || dPcst > 0 || dWcst > 0 || dExp > 0) {
        breakdown.push({ period: d, revenue: dRev, purchase_cost: dPcst, wastage_cost: dWcst, total_expenses: dExp, cogs: dPcst + dWcst });
      }
      cur.setDate(cur.getDate() + 1);
    }
  }

  res.json({
    from_date,
    to_date,
    summary: {
      revenue:            rev,
      purchase_cost:      pcst,
      wastage_cost:       wcst,
      operating_expenses: exp,
      payroll_cost:       0,
      cogs:               pcst + wcst,
      total_expenses:     exp,
      net_profit:         rev - pcst - wcst - exp,
    },
    breakdown,
  });
});

// ─── POST /api/finance/expenses ───────────────────────────────────────────────
router.post('/expenses', (req, res) => {
  const db = req.app.locals.db;
  const { category, description, amount, date, reference } = req.body;
  if (!category || !amount) return res.status(400).json({ error: 'Category and amount required' });
  const result = db.prepare(
    'INSERT INTO expenses (category, description, amount, date, reference) VALUES (?,?,?,?,?)'
  ).run(category, description || null, amount, date || new Date().toISOString().split('T')[0], reference || null);
  res.status(201).json(db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid));
});

// ─── GET /api/finance/expenses ────────────────────────────────────────────────
router.get('/expenses', (req, res) => {
  const db     = req.app.locals.db;
  const { from_date, to_date, category } = req.query;
  let query    = 'SELECT * FROM expenses WHERE 1=1';
  const params = [];
  if (from_date) { query += ' AND date >= ?'; params.push(from_date); }
  if (to_date)   { query += ' AND date <= ?'; params.push(to_date); }
  if (category)  { query += ' AND category = ?'; params.push(category); }
  query += ' ORDER BY date DESC, created_at DESC';
  res.json(db.prepare(query).all(...params));
});

module.exports = router;
// PUT /api/finance/expenses/:id
router.put('/expenses/:id', (req, res) => {
  const db = req.app.locals.db;
  const { category, description, amount, date } = req.body;
  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Expense not found' });
  db.prepare(`UPDATE expenses SET
    category=COALESCE(?,category), description=COALESCE(?,description),
    amount=COALESCE(?,amount), date=COALESCE(?,date) WHERE id=?`)
    .run(category || null, description || null, amount || null, date || null, req.params.id);
  res.json(db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id));
});

// DELETE /api/finance/expenses/:id
router.delete('/expenses/:id', (req, res) => {
  const db = req.app.locals.db;
  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Expense not found' });
  db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});