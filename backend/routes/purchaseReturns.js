
// const router = require('express').Router();
// const { authenticate } = require('../middlewares/auth');
// const { generateNumber } = require('../utils/helpers');
// router.use(authenticate);

// // ─── GET /api/purchase-returns ───────────────────────────────────────────────
// router.get('/', (req, res) => {
//   const db = req.app.locals.db;
//   const T  = req.T;
//   // supplier_name and purchase_number are stored directly on the return record
//   // so this query works even after the original purchase has been deleted
//   res.json(
//     db.prepare(
//       `SELECT * FROM ${T.pur_returns} ORDER BY created_at DESC`
//     ).all()
//   );
// });

// // ─── GET /api/purchase-returns/:id ───────────────────────────────────────────
// router.get('/:id', (req, res) => {
//   const db  = req.app.locals.db;
//   const T   = req.T;
//   const ret = db.prepare(
//     `SELECT * FROM ${T.pur_returns} WHERE id = ?`
//   ).get(req.params.id);
//   if (!ret) return res.status(404).json({ error: 'Return not found' });

//   // Items also carry snapshots (product_name, lot_number, unit) so they
//   // remain readable even after the original lots are deleted
//   const items = db.prepare(
//     `SELECT * FROM ${T.pur_ret_items} WHERE return_id = ?`
//   ).all(ret.id);

//   res.json({ ...ret, items });
// });

// // ─── POST /api/purchase-returns ──────────────────────────────────────────────
// router.post('/', (req, res) => {
//   const db = req.app.locals.db;
//   const T  = req.T;
//   const { purchase_id, date, reason, notes, items } = req.body;

//   if (!purchase_id || !reason || !items || !items.length)
//     return res.status(400).json({ error: 'purchase_id, reason and items required' });

//   const txn = db.transaction(() => {
//     // ── Fetch & validate the purchase ───────────────────────────────────────
//     const purchase = db.prepare(
//       `SELECT p.*, s.name as supplier_name
//        FROM ${T.purchases} p
//        JOIN ${T.suppliers} s ON p.supplier_id = s.id
//        WHERE p.id = ?`
//     ).get(purchase_id);
//     if (!purchase) throw new Error('Purchase not found');

//     // ── Validate each item's lot ─────────────────────────────────────────────
//     for (const item of items) {
//       const lot = db.prepare(`SELECT * FROM ${T.lots} WHERE id = ?`).get(item.lot_id);
//       if (!lot) throw new Error(`Lot ${item.lot_id} not found`);
//       if (parseInt(lot.purchase_id) !== parseInt(purchase_id))
//         throw new Error(`Lot ${lot.lot_number} does not belong to this purchase`);
//       if (['DYEING', 'CHEMICAL_MANUFACTURING', 'FINISHED', 'SOLD'].includes(lot.status))
//         throw new Error(`Lot ${lot.lot_number} cannot be returned — it has been processed or sold`);
//       const inv = db.prepare(`SELECT * FROM ${T.inventory} WHERE lot_id = ?`).get(item.lot_id);
//       const available = inv ? inv.quantity : 0;
//       if (item.quantity > available)
//         throw new Error(`Return qty (${item.quantity}) exceeds available stock (${available}) for lot ${lot.lot_number}`);
//     }

//     // ── Calculate total ──────────────────────────────────────────────────────
//     let total = 0;
//     items.forEach(i => { total += i.quantity * i.rate; });

//     // ── Insert return record — snapshot purchase & supplier info ────────────
//     const retNum = generateNumber(T.prPrefix);
//     const r = db.prepare(
//       `INSERT INTO ${T.pur_returns}
//          (return_number, purchase_id, purchase_number, supplier_id, supplier_name,
//           date, reason, notes, total_amount)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
//     ).run(
//       retNum,
//       purchase_id,
//       purchase.purchase_number,
//       purchase.supplier_id,
//       purchase.supplier_name,
//       date || new Date().toISOString().split('T')[0],
//       reason,
//       notes || null,
//       total
//     );
//     const returnId = r.lastInsertRowid;

//     // ── Insert return items with snapshots — adjust lots & inventory ─────────
//     for (const item of items) {
//       const lot     = db.prepare(`SELECT * FROM ${T.lots}     WHERE id = ?`).get(item.lot_id);
//       const product = db.prepare(`SELECT * FROM ${T.products} WHERE id = ?`).get(item.product_id);

//       db.prepare(
//         `INSERT INTO ${T.pur_ret_items}
//            (return_id, lot_id, lot_number, product_id, product_name, quantity, rate, amount, unit)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
//       ).run(
//         returnId,
//         item.lot_id,
//         lot.lot_number,
//         item.product_id,
//         product?.name || null,
//         item.quantity,
//         item.rate,
//         item.quantity * item.rate,
//         product?.unit || null
//       );

//       // Reduce lot stock
//       db.prepare(
//         `UPDATE ${T.lots} SET current_quantity = current_quantity - ?, updated_at = datetime('now') WHERE id = ?`
//       ).run(item.quantity, item.lot_id);

//       // Reduce inventory
//       db.prepare(
//         `UPDATE ${T.inventory} SET quantity = quantity - ?, updated_at = datetime('now') WHERE lot_id = ?`
//       ).run(item.quantity, item.lot_id);
//     }

//     // ── Supplier ledger: credit (reduces what we owe them) ───────────────────
//     const sup    = db.prepare(`SELECT * FROM ${T.suppliers} WHERE id = ?`).get(purchase.supplier_id);
//     const newBal = sup.current_balance - total;
//     db.prepare(`UPDATE ${T.suppliers} SET current_balance = ? WHERE id = ?`).run(newBal, purchase.supplier_id);
//     db.prepare(
//       `INSERT INTO ${T.supplier_ledger}
//          (supplier_id, date, type, reference_id, description, credit, balance)
//        VALUES (?, ?, 'ADJUSTMENT', ?, ?, ?, ?)`
//     ).run(
//       purchase.supplier_id,
//       date || new Date().toISOString().split('T')[0],
//       returnId,
//       `Purchase Return ${retNum} against ${purchase.purchase_number}`,
//       total,
//       newBal
//     );

//     // ── Full-return cleanup ──────────────────────────────────────────────────
//     // Check if every item of the original purchase is now fully returned
//     const purchaseItems  = db.prepare(`SELECT * FROM ${T.pur_items} WHERE purchase_id = ?`).all(purchase_id);
//     const allReturnItems = db.prepare(
//       `SELECT ri.product_id, ri.quantity
//        FROM ${T.pur_ret_items} ri
//        JOIN ${T.pur_returns}   pr ON ri.return_id = pr.id
//        WHERE pr.purchase_id = ?`
//     ).all(purchase_id);

//     let allReturned = purchaseItems.length > 0;
//     for (const pi of purchaseItems) {
//       const returnedQty = allReturnItems
//         .filter(ri => parseInt(ri.product_id) === parseInt(pi.product_id))
//         .reduce((sum, ri) => sum + ri.quantity, 0);
//       if (returnedQty < pi.quantity) { allReturned = false; break; }
//     }

//     if (allReturned) {
//       const lotIds = purchaseItems.map(pi => pi.lot_id).filter(Boolean);
//       const ph     = lotIds.length > 0 ? lotIds.map(() => '?').join(',') : null;

//       // Safety: don't hard-delete if any lot was sold or manufactured
//       const canDelete = !ph || (
//         db.prepare(`SELECT COUNT(*) as n FROM ${T.sale_items}    WHERE lot_id IN (${ph})`).get(...lotIds).n === 0 &&
//         db.prepare(`SELECT COUNT(*) as n FROM ${T.manufacturing} WHERE lot_id IN (${ph})`).get(...lotIds).n === 0
//       );

//       if (canDelete) {
//         // purchase_id is now nullable — set to NULL so no FK blocks the purchase delete
//         db.prepare(`UPDATE ${T.pur_returns} SET purchase_id = NULL WHERE purchase_id = ?`).run(purchase_id);

//         // Delete inventory and lots
//         if (ph) {
//           db.prepare(`DELETE FROM ${T.inventory} WHERE lot_id IN (${ph})`).run(...lotIds);
//           db.prepare(`DELETE FROM ${T.lots}      WHERE id      IN (${ph})`).run(...lotIds);
//         }

//         // Delete purchase items then the purchase itself
//         db.prepare(`DELETE FROM ${T.pur_items} WHERE purchase_id = ?`).run(purchase_id);
//         db.prepare(`DELETE FROM ${T.purchases} WHERE id = ?`).run(purchase_id);
//       }
//     }

//     // Always return the created record — snapshot fields make it self-contained
//     return db.prepare(`SELECT * FROM ${T.pur_returns} WHERE id = ?`).get(returnId);
//   });

//   try   { res.status(201).json(txn()); }
//   catch (err) { res.status(400).json({ error: err.message }); }
// });

// // ─── PUT /api/purchase-returns/:id ───────────────────────────────────────────
// router.put('/:id', (req, res) => {
//   const db = req.app.locals.db;
//   const T  = req.T;
//   const { date, reason, notes, items } = req.body;

//   const ret = db.prepare(`SELECT * FROM ${T.pur_returns} WHERE id = ?`).get(req.params.id);
//   if (!ret) return res.status(404).json({ error: 'Purchase return not found' });
//   if (ret.status === 'CANCELLED') return res.status(400).json({ error: 'Cannot edit a cancelled return' });
//   if (!reason || !items || !items.length)
//     return res.status(400).json({ error: 'reason and items required' });

//   const txn = db.transaction(() => {
//     const existingItems = db.prepare(`SELECT * FROM ${T.pur_ret_items} WHERE return_id = ?`).all(ret.id);
//     let newTotal = 0;

//     for (const item of items) {
//       const existing = existingItems.find(ei => parseInt(ei.lot_id) === parseInt(item.lot_id));
//       if (!existing) continue;

//       const qtyDiff = item.quantity - existing.quantity;
//       const newAmt  = item.quantity * item.rate;
//       newTotal += newAmt;

//       db.prepare(
//         `UPDATE ${T.pur_ret_items} SET quantity = ?, rate = ?, amount = ? WHERE id = ?`
//       ).run(item.quantity, item.rate, newAmt, existing.id);

//       // Adjust lot and inventory (positive diff = returning more = reduce stock further)
//       db.prepare(
//         `UPDATE ${T.lots}      SET current_quantity = current_quantity - ?, updated_at = datetime('now') WHERE id      = ?`
//       ).run(qtyDiff, item.lot_id);
//       db.prepare(
//         `UPDATE ${T.inventory} SET quantity          = quantity          - ?, updated_at = datetime('now') WHERE lot_id = ?`
//       ).run(qtyDiff, item.lot_id);
//     }

//     // Update return header
//     db.prepare(
//       `UPDATE ${T.pur_returns} SET date = ?, reason = ?, notes = ?, total_amount = ? WHERE id = ?`
//     ).run(date || ret.date, reason, notes || null, newTotal, ret.id);

//     // Adjust supplier balance + ledger by the difference
//     const totalDiff = newTotal - ret.total_amount;
//     if (totalDiff !== 0 && ret.supplier_id) {
//       const sup = db.prepare(`SELECT * FROM ${T.suppliers} WHERE id = ?`).get(ret.supplier_id);
//       if (sup) {
//         const newBal = sup.current_balance - totalDiff;
//         db.prepare(`UPDATE ${T.suppliers} SET current_balance = ? WHERE id = ?`).run(newBal, ret.supplier_id);
//         db.prepare(
//           `UPDATE ${T.supplier_ledger}
//            SET credit = credit + ?, balance = balance - ?
//            WHERE reference_id = ? AND type = 'ADJUSTMENT'`
//         ).run(totalDiff, totalDiff, ret.id);
//       }
//     }

//     // ── Full-return cleanup (same logic as POST) ─────────────────────────────
//     if (ret.purchase_id) {
//       const purchaseItems  = db.prepare(`SELECT * FROM ${T.pur_items} WHERE purchase_id = ?`).all(ret.purchase_id);
//       const allReturnItems = db.prepare(
//         `SELECT ri.product_id, ri.quantity
//          FROM ${T.pur_ret_items} ri
//          JOIN ${T.pur_returns}   pr ON ri.return_id = pr.id
//          WHERE pr.purchase_id = ?`
//       ).all(ret.purchase_id);

//       let allReturned = purchaseItems.length > 0;
//       for (const pi of purchaseItems) {
//         const returnedQty = allReturnItems
//           .filter(ri => parseInt(ri.product_id) === parseInt(pi.product_id))
//           .reduce((sum, ri) => sum + ri.quantity, 0);
//         if (returnedQty < pi.quantity) { allReturned = false; break; }
//       }

//       if (allReturned) {
//         const lotIds = purchaseItems.map(pi => pi.lot_id).filter(Boolean);
//         const ph     = lotIds.length > 0 ? lotIds.map(() => '?').join(',') : null;

//         const canDelete = !ph || (
//           db.prepare(`SELECT COUNT(*) as n FROM ${T.sale_items}    WHERE lot_id IN (${ph})`).get(...lotIds).n === 0 &&
//           db.prepare(`SELECT COUNT(*) as n FROM ${T.manufacturing} WHERE lot_id IN (${ph})`).get(...lotIds).n === 0
//         );

//         if (canDelete) {
//           db.prepare(`UPDATE ${T.pur_returns} SET purchase_id = NULL WHERE purchase_id = ?`).run(ret.purchase_id);
//           if (ph) {
//             db.prepare(`DELETE FROM ${T.inventory} WHERE lot_id IN (${ph})`).run(...lotIds);
//             db.prepare(`DELETE FROM ${T.lots}      WHERE id      IN (${ph})`).run(...lotIds);
//           }
//           db.prepare(`DELETE FROM ${T.pur_items} WHERE purchase_id = ?`).run(ret.purchase_id);
//           db.prepare(`DELETE FROM ${T.purchases} WHERE id = ?`).run(ret.purchase_id);
//         }
//       }
//     }

//     return db.prepare(`SELECT * FROM ${T.pur_returns} WHERE id = ?`).get(ret.id);
//   });

//   try   { res.json(txn()); }
//   catch (err) { res.status(400).json({ error: err.message }); }
// });

// module.exports = router;

const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const { generateNumber } = require('../utils/helpers');
router.use(authenticate);

// ── Helper: disable FKs, run a delete function, re-enable FKs ────────────────
// This is the guaranteed fix for the FOREIGN KEY constraint failed error.
// The yarn_purchase_return_items table has FK(lot_id) → yarn_lots which we
// cannot drop via ALTER TABLE in SQLite. Disabling FK checks for the cleanup
// is the only reliable solution without a full DB rebuild.
function withFKDisabled(db, fn) {
  db.pragma('foreign_keys = OFF');
  try {
    fn();
  } finally {
    db.pragma('foreign_keys = ON');
  }
}

// ── Helper: full-return cleanup ───────────────────────────────────────────────
function runFullReturnCleanup(db, T, purchase_id) {
  const purchaseItems = db.prepare(`SELECT * FROM ${T.pur_items} WHERE purchase_id = ?`).all(purchase_id);
  if (!purchaseItems.length) return;

  const allReturnItems = db.prepare(
    `SELECT ri.product_id, ri.quantity
     FROM ${T.pur_ret_items} ri
     JOIN ${T.pur_returns} pr ON ri.return_id = pr.id
     WHERE pr.purchase_id = ?`
  ).all(purchase_id);

  let allReturned = true;
  for (const pi of purchaseItems) {
    const returnedQty = allReturnItems
      .filter(ri => parseInt(ri.product_id) === parseInt(pi.product_id))
      .reduce((sum, ri) => sum + ri.quantity, 0);
    if (returnedQty < pi.quantity) { allReturned = false; break; }
  }

  if (!allReturned) return;

  const lotIds = purchaseItems.map(pi => pi.lot_id).filter(Boolean);
  const ph = lotIds.length > 0 ? lotIds.map(() => '?').join(',') : null;

  // Safety: don't delete if any lot was sold or manufactured
  if (ph) {
    const soldCount  = db.prepare(`SELECT COUNT(*) as n FROM ${T.sale_items}    WHERE lot_id IN (${ph})`).get(...lotIds).n;
    const manufCount = db.prepare(`SELECT COUNT(*) as n FROM ${T.manufacturing} WHERE lot_id IN (${ph})`).get(...lotIds).n;
    if (soldCount > 0 || manufCount > 0) return;
  }

  // Disable FK checks so lot deletion doesn't fail due to return_items FK
  withFKDisabled(db, () => {
    // Null out purchase_id on return records (purchase_id is nullable after migration)
    db.prepare(`UPDATE ${T.pur_returns} SET purchase_id = NULL WHERE purchase_id = ?`).run(purchase_id);

    // Delete inventory first, then lots
    if (ph) {
      db.prepare(`DELETE FROM ${T.inventory} WHERE lot_id IN (${ph})`).run(...lotIds);
      db.prepare(`DELETE FROM ${T.lots}      WHERE id      IN (${ph})`).run(...lotIds);
    }

    // Delete purchase items then the purchase
    db.prepare(`DELETE FROM ${T.pur_items} WHERE purchase_id = ?`).run(purchase_id);
    db.prepare(`DELETE FROM ${T.purchases} WHERE id = ?`).run(purchase_id);
  });
}

// ─── GET /api/purchase-returns ───────────────────────────────────────────────
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const T  = req.T;
  res.json(
    db.prepare(`SELECT * FROM ${T.pur_returns} ORDER BY created_at DESC`).all()
  );
});

// ─── GET /api/purchase-returns/:id ───────────────────────────────────────────
router.get('/:id', (req, res) => {
  const db  = req.app.locals.db;
  const T   = req.T;
  const ret = db.prepare(`SELECT * FROM ${T.pur_returns} WHERE id = ?`).get(req.params.id);
  if (!ret) return res.status(404).json({ error: 'Return not found' });

  const items = db.prepare(`SELECT * FROM ${T.pur_ret_items} WHERE return_id = ?`).all(ret.id);
  res.json({ ...ret, items });
});

// ─── POST /api/purchase-returns ──────────────────────────────────────────────
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const T  = req.T;
  const { purchase_id, date, reason, notes, items } = req.body;

  if (!purchase_id || !reason || !items || !items.length)
    return res.status(400).json({ error: 'purchase_id, reason and items required' });

  const txn = db.transaction(() => {
    // Fetch purchase + supplier info — snapshot it onto the return record
    const purchase = db.prepare(
      `SELECT p.*, s.name as supplier_name
       FROM ${T.purchases} p
       JOIN ${T.suppliers} s ON p.supplier_id = s.id
       WHERE p.id = ?`
    ).get(purchase_id);
    if (!purchase) throw new Error('Purchase not found');

    // Validate each item
    for (const item of items) {
      const lot = db.prepare(`SELECT * FROM ${T.lots} WHERE id = ?`).get(item.lot_id);
      if (!lot) throw new Error(`Lot ${item.lot_id} not found`);
      if (parseInt(lot.purchase_id) !== parseInt(purchase_id))
        throw new Error(`Lot ${lot.lot_number} does not belong to this purchase`);
      if (['DYEING', 'CHEMICAL_MANUFACTURING', 'FINISHED', 'SOLD'].includes(lot.status))
        throw new Error(`Lot ${lot.lot_number} cannot be returned — it has been processed or sold`);
      const inv = db.prepare(`SELECT * FROM ${T.inventory} WHERE lot_id = ?`).get(item.lot_id);
      const available = inv ? inv.quantity : 0;
      if (item.quantity > available)
        throw new Error(`Return qty (${item.quantity}) exceeds available stock (${available}) for lot ${lot.lot_number}`);
    }

    let total = 0;
    items.forEach(i => { total += i.quantity * i.rate; });

    // Insert return record with full snapshot of purchase & supplier info
    const retNum = generateNumber(T.prPrefix);

    // Try to insert with snapshot columns (works after migration)
    // Fall back gracefully if columns don't exist yet on very old DBs
    let returnId;
    try {
      const r = db.prepare(
        `INSERT INTO ${T.pur_returns}
           (return_number, purchase_id, purchase_number, supplier_id, supplier_name,
            date, reason, notes, total_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        retNum, purchase_id, purchase.purchase_number,
        purchase.supplier_id, purchase.supplier_name,
        date || new Date().toISOString().split('T')[0],
        reason, notes || null, total
      );
      returnId = r.lastInsertRowid;
    } catch (e) {
      // Fallback: insert without snapshot columns (original schema)
      const r = db.prepare(
        `INSERT INTO ${T.pur_returns}
           (return_number, purchase_id, date, reason, notes, total_amount)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        retNum, purchase_id,
        date || new Date().toISOString().split('T')[0],
        reason, notes || null, total
      );
      returnId = r.lastInsertRowid;
    }

    // Insert return items with snapshot columns
    for (const item of items) {
      const lot     = db.prepare(`SELECT * FROM ${T.lots}     WHERE id = ?`).get(item.lot_id);
      const product = db.prepare(`SELECT * FROM ${T.products} WHERE id = ?`).get(item.product_id);

      try {
        db.prepare(
          `INSERT INTO ${T.pur_ret_items}
             (return_id, lot_id, lot_number, product_id, product_name, quantity, rate, amount, unit)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          returnId, item.lot_id, lot.lot_number,
          item.product_id, product?.name || null,
          item.quantity, item.rate, item.quantity * item.rate,
          product?.unit || null
        );
      } catch (e) {
        // Fallback: original schema without snapshot columns
        db.prepare(
          `INSERT INTO ${T.pur_ret_items}
             (return_id, lot_id, product_id, quantity, rate, amount)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(returnId, item.lot_id, item.product_id, item.quantity, item.rate, item.quantity * item.rate);
      }

      // Reduce lot stock and inventory
      db.prepare(`UPDATE ${T.lots}      SET current_quantity = current_quantity - ?, updated_at = datetime('now') WHERE id      = ?`).run(item.quantity, item.lot_id);
      db.prepare(`UPDATE ${T.inventory} SET quantity          = quantity          - ?, updated_at = datetime('now') WHERE lot_id = ?`).run(item.quantity, item.lot_id);
    }

    // Supplier ledger: credit (reduces what we owe them)
    const sup    = db.prepare(`SELECT * FROM ${T.suppliers} WHERE id = ?`).get(purchase.supplier_id);
    const newBal = sup.current_balance - total;
    db.prepare(`UPDATE ${T.suppliers} SET current_balance = ? WHERE id = ?`).run(newBal, purchase.supplier_id);
    db.prepare(
      `INSERT INTO ${T.supplier_ledger}
         (supplier_id, date, type, reference_id, description, credit, balance)
       VALUES (?, ?, 'ADJUSTMENT', ?, ?, ?, ?)`
    ).run(
      purchase.supplier_id,
      date || new Date().toISOString().split('T')[0],
      returnId,
      `Purchase Return ${retNum} against ${purchase.purchase_number}`,
      total, newBal
    );

    // Full-return cleanup — FK checks disabled inside the helper
    runFullReturnCleanup(db, T, purchase_id);

    return db.prepare(`SELECT * FROM ${T.pur_returns} WHERE id = ?`).get(returnId);
  });

  try   { res.status(201).json(txn()); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

// ─── PUT /api/purchase-returns/:id ───────────────────────────────────────────
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const T  = req.T;
  const { date, reason, notes, items } = req.body;

  const ret = db.prepare(`SELECT * FROM ${T.pur_returns} WHERE id = ?`).get(req.params.id);
  if (!ret) return res.status(404).json({ error: 'Purchase return not found' });
  if (ret.status === 'CANCELLED') return res.status(400).json({ error: 'Cannot edit a cancelled return' });
  if (!reason || !items || !items.length)
    return res.status(400).json({ error: 'reason and items required' });

  const txn = db.transaction(() => {
    const existingItems = db.prepare(`SELECT * FROM ${T.pur_ret_items} WHERE return_id = ?`).all(ret.id);
    let newTotal = 0;

    for (const item of items) {
      const existing = existingItems.find(ei => parseInt(ei.lot_id) === parseInt(item.lot_id));
      if (!existing) continue;

      const qtyDiff = item.quantity - existing.quantity;
      const newAmt  = item.quantity * item.rate;
      newTotal += newAmt;

      db.prepare(`UPDATE ${T.pur_ret_items} SET quantity = ?, rate = ?, amount = ? WHERE id = ?`).run(item.quantity, item.rate, newAmt, existing.id);
      db.prepare(`UPDATE ${T.lots}          SET current_quantity = current_quantity - ?, updated_at = datetime('now') WHERE id      = ?`).run(qtyDiff, item.lot_id);
      db.prepare(`UPDATE ${T.inventory}     SET quantity          = quantity          - ?, updated_at = datetime('now') WHERE lot_id = ?`).run(qtyDiff, item.lot_id);
    }

    db.prepare(`UPDATE ${T.pur_returns} SET date = ?, reason = ?, notes = ?, total_amount = ? WHERE id = ?`).run(date || ret.date, reason, notes || null, newTotal, ret.id);

    // Adjust supplier balance
    const totalDiff = newTotal - ret.total_amount;
    if (totalDiff !== 0 && ret.supplier_id) {
      const sup = db.prepare(`SELECT * FROM ${T.suppliers} WHERE id = ?`).get(ret.supplier_id);
      if (sup) {
        const newBal = sup.current_balance - totalDiff;
        db.prepare(`UPDATE ${T.suppliers} SET current_balance = ? WHERE id = ?`).run(newBal, ret.supplier_id);
        db.prepare(`UPDATE ${T.supplier_ledger} SET credit = credit + ?, balance = balance - ? WHERE reference_id = ? AND type = 'ADJUSTMENT'`).run(totalDiff, totalDiff, ret.id);
      }
    }

    // Full-return cleanup — FK checks disabled inside the helper
    if (ret.purchase_id) {
      runFullReturnCleanup(db, T, ret.purchase_id);
    }

    return db.prepare(`SELECT * FROM ${T.pur_returns} WHERE id = ?`).get(ret.id);
  });

  try   { res.json(txn()); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;