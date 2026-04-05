const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const { generateNumber } = require('../utils/helpers');
router.use(authenticate);

router.get('/', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  res.json(db.prepare(`SELECT sr.*, s.sale_number, c.name as customer_name FROM ${T.sale_returns} sr
    JOIN ${T.sales} s ON sr.sale_id=s.id JOIN ${T.customers} c ON s.customer_id=c.id ORDER BY sr.created_at DESC`).all());
});

router.get('/:id', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  const ret = db.prepare(`SELECT sr.*, s.sale_number, c.name as customer_name FROM ${T.sale_returns} sr
    JOIN ${T.sales} s ON sr.sale_id=s.id JOIN ${T.customers} c ON s.customer_id=c.id WHERE sr.id=?`).get(req.params.id);
  if (!ret) return res.status(404).json({ error: 'Return not found' });
  const items = db.prepare(`SELECT ri.*, p.name as product_name, p.unit as unit, l.lot_number FROM ${T.sale_ret_items} ri
    JOIN ${T.products} p ON ri.product_id=p.id JOIN ${T.lots} l ON ri.lot_id=l.id WHERE ri.return_id=?`).all(ret.id);
  res.json({ ...ret, items });
});

router.post('/', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  const { sale_id, date, reason, notes, restock_location, items } = req.body;
  if (!sale_id || !reason || !items || !items.length)
    return res.status(400).json({ error: 'sale_id, reason and items required' });

const defaultRestock = req.businessMode === 'chem' ? 'CHEMICAL_STORE' : 'FINISHED_STORE';
  const txn = db.transaction(() => {
    const retNum = generateNumber(T.srPrefix);
    let total = 0;
    items.forEach(i => { total += i.quantity * i.rate; });
    const loc = restock_location || defaultRestock;

    const r = db.prepare(`INSERT INTO ${T.sale_returns} (return_number, sale_id, date, reason, notes, restock_location, total_amount) VALUES (?,?,?,?,?,?,?)`)
      .run(retNum, sale_id, date || new Date().toISOString().split('T')[0], reason, notes || null, loc, total);
    const returnId = r.lastInsertRowid;

    for (const item of items) {
      db.prepare(`INSERT INTO ${T.sale_ret_items} (return_id, lot_id, product_id, quantity, rate, amount, restock_location) VALUES (?,?,?,?,?,?,?)`)
        .run(returnId, item.lot_id, item.product_id, item.quantity, item.rate, item.quantity * item.rate, loc);
      db.prepare(`UPDATE ${T.lots} SET current_quantity=current_quantity+?, status='PARTIALLY_SOLD', location=?, updated_at=datetime('now') WHERE id=?`)
        .run(item.quantity, loc, item.lot_id);
      const inv = db.prepare(`SELECT * FROM ${T.inventory} WHERE lot_id=?`).get(item.lot_id);
      if (inv) {
        db.prepare(`UPDATE ${T.inventory} SET quantity=quantity+?, location=?, updated_at=datetime('now') WHERE id=?`).run(item.quantity, loc, inv.id);
      } else {
        db.prepare(`INSERT INTO ${T.inventory} (product_id, lot_id, location, quantity) VALUES (?,?,?,?)`).run(item.product_id, item.lot_id, loc, item.quantity);
      }
    }

    const sale = db.prepare(`SELECT * FROM ${T.sales} WHERE id=?`).get(sale_id);
    const cust = db.prepare(`SELECT * FROM ${T.customers} WHERE id=?`).get(sale.customer_id);
    const newBal = cust.current_balance - total;
    db.prepare(`UPDATE ${T.customers} SET current_balance=? WHERE id=?`).run(newBal, sale.customer_id);
    db.prepare(`INSERT INTO ${T.customer_ledger} (customer_id, date, type, reference_id, description, credit, balance) VALUES (?,?,?,?,?,?,?)`)
      .run(sale.customer_id, date || new Date().toISOString().split('T')[0], 'ADJUSTMENT', returnId, `Return ${retNum}`, total, newBal);

    return db.prepare(`SELECT * FROM ${T.sale_returns} WHERE id=?`).get(returnId);
  });
  try   { res.status(201).json(txn()); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id/cancel', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  db.prepare(`UPDATE ${T.sale_returns} SET status='CANCELLED' WHERE id=?`).run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
// PUT /api/sale-returns/:id — update header + adjust item quantities in place
router.put('/:id', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  const { date, reason, notes, restock_location, items } = req.body;

  const ret = db.prepare(`SELECT * FROM ${T.sale_returns} WHERE id=?`).get(req.params.id);
  if (!ret) return res.status(404).json({ error: 'Sale return not found' });
  if (ret.status === 'CANCELLED') return res.status(400).json({ error: 'Cannot edit a cancelled return' });
  if (!reason || !items || !items.length)
    return res.status(400).json({ error: 'reason and items required' });

  const loc = restock_location || ret.restock_location;

  const txn = db.transaction(() => {
    const existingItems = db.prepare(`SELECT * FROM ${T.sale_ret_items} WHERE return_id=?`).all(ret.id);
    let newTotal = 0;

    for (const item of items) {
      const existing = existingItems.find(ei => ei.lot_id === item.lot_id);
      if (!existing) continue;
      const qtyDiff = item.quantity - existing.quantity; // positive = returning more
      const newAmt  = item.quantity * item.rate;
      newTotal += newAmt;

      db.prepare(`UPDATE ${T.sale_ret_items} SET quantity=?, rate=?, amount=?, restock_location=? WHERE id=?`)
        .run(item.quantity, item.rate, newAmt, loc, existing.id);

      // Adjust lot: +qtyDiff restores more stock if returning more, reduces if returning less
      db.prepare(`UPDATE ${T.lots} SET current_quantity=current_quantity+?, location=?, updated_at=datetime('now') WHERE id=?`)
        .run(qtyDiff, loc, item.lot_id);

      // Adjust inventory accordingly
      const inv = db.prepare(`SELECT * FROM ${T.inventory} WHERE lot_id=?`).get(item.lot_id);
      if (inv) {
        db.prepare(`UPDATE ${T.inventory} SET quantity=quantity+?, location=?, updated_at=datetime('now') WHERE id=?`)
          .run(qtyDiff, loc, inv.id);
      }
    }

    // Update return header
    db.prepare(`UPDATE ${T.sale_returns} SET date=?, reason=?, notes=?, restock_location=?, total_amount=? WHERE id=?`)
      .run(date || ret.date, reason, notes || null, loc, newTotal, ret.id);

    // Adjust customer balance + ledger by net difference only
    const totalDiff = newTotal - ret.total_amount;
    if (totalDiff !== 0) {
      const sale = db.prepare(`SELECT * FROM ${T.sales} WHERE id=?`).get(ret.sale_id);
      const cust = db.prepare(`SELECT * FROM ${T.customers} WHERE id=?`).get(sale.customer_id);
      const newBal = cust.current_balance - totalDiff;
      db.prepare(`UPDATE ${T.customers} SET current_balance=? WHERE id=?`).run(newBal, sale.customer_id);
      db.prepare(`UPDATE ${T.customer_ledger} SET credit=credit+?, balance=balance-? WHERE reference_id=? AND type='ADJUSTMENT'`)
        .run(totalDiff, totalDiff, ret.id);
    }

    return db.prepare(`SELECT sr.*, s.sale_number, c.name as customer_name FROM ${T.sale_returns} sr
      JOIN ${T.sales} s ON sr.sale_id=s.id JOIN ${T.customers} c ON s.customer_id=c.id WHERE sr.id=?`).get(ret.id);
  });

  try   { res.json(txn()); }
  catch (err) { res.status(400).json({ error: err.message }); }
});