
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const { generateNumber } = require('../utils/helpers');
router.use(authenticate);

router.get('/', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  const { customer_id, status, from_date, to_date } = req.query;
  let sql = `SELECT s.*, c.name as customer_name FROM ${T.sales} s
    JOIN ${T.customers} c ON s.customer_id = c.id WHERE 1=1`;
  const params = [];
  if (customer_id) { sql += ' AND s.customer_id = ?'; params.push(customer_id); }
  if (status)      { sql += ' AND s.status = ?';       params.push(status); }
  if (from_date)   { sql += ' AND s.date >= ?';        params.push(from_date); }
  if (to_date)     { sql += ' AND s.date <= ?';        params.push(to_date); }
  sql += ' ORDER BY s.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  const sale = db.prepare(`SELECT s.*, c.name as customer_name FROM ${T.sales} s
    JOIN ${T.customers} c ON s.customer_id = c.id WHERE s.id = ?`).get(req.params.id);
  if (!sale) return res.status(404).json({ error: 'Sale not found' });
  // yarn_lots has shade_code; chem_lots has chemical_code — select the right one
  const lotCodeCol = req.businessMode === 'YARN' ? 'l.shade_code' : 'l.chemical_code';
  const items = db.prepare(`SELECT si.*, p.name as product_name, p.type as product_type,
    p.unit as unit, l.lot_number, l.cost_per_unit as cost_per_unit, ${lotCodeCol} as shade_code,
    c.name as category_name FROM ${T.sale_items} si
    JOIN ${T.products} p ON si.product_id = p.id JOIN ${T.lots} l ON si.lot_id = l.id
    LEFT JOIN product_categories c ON p.category_id = c.id
    WHERE si.sale_id = ?`).all(sale.id);
  const gp = sale.gate_pass_id
    ? db.prepare(`SELECT * FROM ${T.gate_passes} WHERE id = ?`).get(sale.gate_pass_id)
    : null;
  res.json({ ...sale, items, gate_pass: gp });
});

router.post('/', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  const { customer_id, date, items, target_price, discount_percentage, notes } = req.body;
  if (!customer_id || !items || !items.length)
    return res.status(400).json({ error: 'customer_id and items required' });

  const txn = db.transaction(() => {
    const slNumber = generateNumber(T.slPrefix);
    let total = 0;

    for (const item of items) {
      const lot = db.prepare(`SELECT l.*, p.type as product_type FROM ${T.lots} l
        JOIN ${T.products} p ON l.product_id = p.id WHERE l.id = ?`).get(item.lot_id);
      if (!lot) throw new Error(`Lot ${item.lot_id} not found`);
      if (!['IN_STORE','READY_FOR_SALE','PARTIALLY_SOLD'].includes(lot.status))
        throw new Error(`Lot ${lot.lot_number} not available for sale (status: ${lot.status})`);
      if (lot.product_type === 'CHEMICAL_RAW')
        throw new Error('CHEMICAL_RAW cannot be sold directly');
      const inv = db.prepare(`SELECT SUM(quantity) as qty FROM ${T.inventory} WHERE lot_id = ? AND quantity > 0`).get(item.lot_id);
      if (!inv || inv.qty < item.quantity)
        throw new Error(`Insufficient stock for lot ${lot.lot_number}. Available: ${inv ? inv.qty : 0}`);
      item._amount = item.quantity * item.rate;
      total += item._amount;
    }

    let discPct = discount_percentage || 0, discAmt = 0, net = total;
    if (target_price && target_price < total) {
      discAmt = total - target_price; discPct = (discAmt / total) * 100; net = target_price;
    } else if (discPct > 0) {
      discAmt = total * (discPct / 100); net = total - discAmt;
    }

    const slResult = db.prepare(
      `INSERT INTO ${T.sales} (sale_number, customer_id, date, total_amount, discount_percentage, discount_amount, net_amount, status, notes)
       VALUES (?,?,?,?,?,?,?,?,?)`
    ).run(slNumber, customer_id, date || new Date().toISOString().split('T')[0],
          total, discPct, discAmt, net, 'CONFIRMED', notes || null);
    const saleId = slResult.lastInsertRowid;

    const lotIdArr = []; let totalQty = 0;
    for (const item of items) {
      const lot = db.prepare(`SELECT * FROM ${T.lots} WHERE id = ?`).get(item.lot_id);
      db.prepare(`INSERT INTO ${T.sale_items} (sale_id, product_id, lot_id, quantity, rate, amount, target_price) VALUES (?,?,?,?,?,?,?)`)
        .run(saleId, lot.product_id, item.lot_id, item.quantity, item.rate, item._amount, item.target_price || null);
      const inv = db.prepare(`SELECT * FROM ${T.inventory} WHERE lot_id = ? AND quantity > 0`).get(item.lot_id);
      db.prepare(`UPDATE ${T.inventory} SET quantity = ?, updated_at = datetime('now') WHERE id = ?`).run(inv.quantity - item.quantity, inv.id);
      const newQty = lot.current_quantity - item.quantity;
      db.prepare(`UPDATE ${T.lots} SET current_quantity = ?, status = ?, updated_at = datetime('now') WHERE id = ?`)
        .run(Math.max(0, newQty), newQty <= 0 ? 'SOLD' : 'PARTIALLY_SOLD', item.lot_id);
      lotIdArr.push(item.lot_id); totalQty += item.quantity;
    }

    // Gate pass
    const gpResult = db.prepare(`INSERT INTO ${T.gate_passes} (gate_pass_number, sale_id, date, lot_ids, total_quantity) VALUES (?,?,?,?,?)`)
      .run(generateNumber(T.gpPrefix), saleId, date || new Date().toISOString().split('T')[0], JSON.stringify(lotIdArr), totalQty);
    db.prepare(`UPDATE ${T.sales} SET gate_pass_id = ? WHERE id = ?`).run(gpResult.lastInsertRowid, saleId);

    // Customer ledger
    const cust = db.prepare(`SELECT * FROM ${T.customers} WHERE id = ?`).get(customer_id);
    const newBal = cust.current_balance + net;
    db.prepare(`UPDATE ${T.customers} SET current_balance = ? WHERE id = ?`).run(newBal, customer_id);
    db.prepare(`INSERT INTO ${T.customer_ledger} (customer_id, date, type, reference_id, description, debit, balance) VALUES (?,?,?,?,?,?,?)`)
      .run(customer_id, date || new Date().toISOString().split('T')[0], 'SALE', saleId, `Sale ${slNumber}`, net, newBal);

    return db.prepare(`SELECT s.*, c.name as customer_name FROM ${T.sales} s
      JOIN ${T.customers} c ON s.customer_id = c.id WHERE s.id = ?`).get(saleId);
  });

  try   { res.status(201).json(txn()); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
// PUT /api/sales/:id  — update header fields + adjust item qty/rate in place
router.put('/:id', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  const { customer_id, date, notes, target_price, discount_percentage, items } = req.body;

  const sale = db.prepare(`SELECT * FROM ${T.sales} WHERE id = ?`).get(req.params.id);
  if (!sale) return res.status(404).json({ error: 'Sale not found' });
  if (!customer_id || !items || !items.length)
    return res.status(400).json({ error: 'customer_id and items required' });

  const txn = db.transaction(() => {
    const existingItems = db.prepare(`SELECT * FROM ${T.sale_items} WHERE sale_id = ?`).all(sale.id);
    let newTotal = 0;

    // ── Update each matching item (matched by lot_id) ─────────────────────────
    for (const item of items) {
      const existing = existingItems.find(ei => ei.lot_id === item.lot_id);
      if (!existing) continue;
      const qtyDiff = item.quantity - existing.quantity; // positive = more sold
      const newAmt  = item.quantity * item.rate;
      newTotal += newAmt;

      db.prepare(`UPDATE ${T.sale_items} SET quantity = ?, rate = ?, amount = ? WHERE id = ?`)
        .run(item.quantity, item.rate, newAmt, existing.id);

      // Inventory: selling more reduces stock, selling less returns stock
      const inv = db.prepare(`SELECT * FROM ${T.inventory} WHERE lot_id = ? LIMIT 1`).get(item.lot_id);
      if (inv) {
        db.prepare(`UPDATE ${T.inventory} SET quantity = ?, updated_at = datetime('now') WHERE id = ?`)
          .run(inv.quantity - qtyDiff, inv.id);
      }

      // Lot: adjust current_quantity and recalc status
      const lot = db.prepare(`SELECT * FROM ${T.lots} WHERE id = ?`).get(item.lot_id);
      const lotNewQty = lot.current_quantity - qtyDiff;
      const lotStatus = lotNewQty <= 0 ? 'SOLD' : 'PARTIALLY_SOLD';
      db.prepare(`UPDATE ${T.lots} SET current_quantity = ?, status = ?, updated_at = datetime('now') WHERE id = ?`)
        .run(Math.max(0, lotNewQty), lotStatus, item.lot_id);
    }

    // ── Recalculate discount / net ────────────────────────────────────────────
    let discPct = discount_percentage || 0, discAmt = 0, net = newTotal;
    if (target_price && target_price < newTotal) {
      discAmt = newTotal - target_price; discPct = (discAmt / newTotal) * 100; net = target_price;
    } else if (discPct > 0) {
      discAmt = newTotal * (discPct / 100); net = newTotal - discAmt;
    }

    // ── Update sale header ────────────────────────────────────────────────────
    db.prepare(
      `UPDATE ${T.sales} SET customer_id=?, date=?, total_amount=?, discount_percentage=?,
       discount_amount=?, net_amount=?, notes=? WHERE id=?`
    ).run(customer_id, date || sale.date, newTotal, discPct, discAmt, net, notes || null, sale.id);

    // ── Adjust customer ledger by diff ────────────────────────────────────────
    const netDiff = net - sale.net_amount;
    if (netDiff !== 0) {
      const cust = db.prepare(`SELECT * FROM ${T.customers} WHERE id = ?`).get(sale.customer_id);
      const newBal = cust.current_balance + netDiff;
      db.prepare(`UPDATE ${T.customers} SET current_balance = ? WHERE id = ?`).run(newBal, sale.customer_id);
      db.prepare(
        `UPDATE ${T.customer_ledger} SET debit = debit + ?, balance = balance + ? WHERE reference_id = ? AND type = 'SALE'`
      ).run(netDiff, netDiff, sale.id);
    }

    return db.prepare(`SELECT s.*, c.name as customer_name FROM ${T.sales} s
      JOIN ${T.customers} c ON s.customer_id = c.id WHERE s.id = ?`).get(sale.id);
  });

  try   { res.json(txn()); }
  catch (err) { res.status(400).json({ error: err.message }); }
});