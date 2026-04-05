
// const router = require('express').Router();
// const { authenticate } = require('../middlewares/auth');
// const { generateNumber } = require('../utils/helpers');
// router.use(authenticate);

// router.get('/', (req, res) => {
//   const db = req.app.locals.db; const T = req.T;
//   const { status } = req.query;
//   let sql = `SELECT m.*, l.lot_number, p.name as product_name FROM ${T.manufacturing} m
//     JOIN ${T.lots} l ON m.lot_id = l.id JOIN ${T.products} p ON l.product_id = p.id WHERE 1=1`;
//   const params = [];
//   if (status) { sql += ' AND m.status = ?'; params.push(status); }
//   sql += ' ORDER BY m.created_at DESC';
//   res.json(db.prepare(sql).all(...params));
// });

// router.get('/:id', (req, res) => {
//   const db = req.app.locals.db; const T = req.T;
//   const proc = db.prepare(`SELECT m.*, l.lot_number, p.name as product_name, p.type as product_type
//     FROM ${T.manufacturing} m JOIN ${T.lots} l ON m.lot_id = l.id
//     JOIN ${T.products} p ON l.product_id = p.id WHERE m.id = ?`).get(req.params.id);
//   if (!proc) return res.status(404).json({ error: 'Process not found' });
//   const wastage = db.prepare(`SELECT * FROM ${T.wastage} WHERE manufacturing_id = ?`).all(proc.id);
//   res.json({ ...proc, wastage });
// });

// // ── YARN: Start Dyeing ────────────────────────────────────────────────────────
// router.post('/start-dyeing', (req, res) => {
//   if (req.businessMode !== 'YARN')
//     return res.status(403).json({ error: 'start-dyeing only available in YARN workspace' });
//   const db = req.app.locals.db; const T = req.T;
//   const { lot_id, input_weight, expected_output, notes } = req.body;
//   if (!lot_id || !input_weight || !expected_output)
//     return res.status(400).json({ error: 'lot_id, input_weight, expected_output required' });

//   const txn = db.transaction(() => {
//     const lot = db.prepare(`SELECT l.*, p.type as product_type FROM ${T.lots} l
//       JOIN ${T.products} p ON l.product_id = p.id WHERE l.id = ?`).get(lot_id);
//     if (!lot)                            throw new Error('Lot not found');
//     if (lot.product_type !== 'RAW_YARN') throw new Error('Only RAW_YARN lots can be sent for dyeing');
//     if (lot.status !== 'IN_STORE')       throw new Error('Lot must be IN_STORE to start dyeing');
//     if (input_weight > lot.current_quantity) throw new Error('Input weight exceeds available quantity');

//     db.prepare(`UPDATE ${T.lots} SET status='DYEING', location='DYEING', updated_at=datetime('now') WHERE id=?`).run(lot_id);
//     db.prepare(`UPDATE ${T.inventory} SET location='DYEING', updated_at=datetime('now') WHERE lot_id=? AND location='STORE'`).run(lot_id);

//     const r = db.prepare(`INSERT INTO ${T.manufacturing} (lot_id, process_type, status, input_weight, expected_output, notes)
//       VALUES (?,?,?,?,?,?)`).run(lot_id, 'DYEING', 'IN_PROGRESS', input_weight, expected_output, notes || null);
//     return db.prepare(`SELECT m.*, l.lot_number FROM ${T.manufacturing} m JOIN ${T.lots} l ON m.lot_id=l.id WHERE m.id=?`)
//              .get(r.lastInsertRowid);
//   });
//   try   { res.status(201).json(txn()); }
//   catch (err) { res.status(400).json({ error: err.message }); }
// });

// // ── YARN: Complete Dyeing ─────────────────────────────────────────────────────
// router.post('/complete-dyeing', (req, res) => {
//   if (req.businessMode !== 'YARN')
//     return res.status(403).json({ error: 'complete-dyeing only available in YARN workspace' });
//   const db = req.app.locals.db; const T = req.T;
//   const { manufacturing_id, actual_output, shade_code, output_product_id, notes } = req.body;
//   if (!manufacturing_id || actual_output === undefined)
//     return res.status(400).json({ error: 'manufacturing_id and actual_output required' });

//   const txn = db.transaction(() => {
//     const mfg = db.prepare(`SELECT * FROM ${T.manufacturing} WHERE id=?`).get(manufacturing_id);
//     if (!mfg)                         throw new Error('Process not found');
//     if (mfg.status !== 'IN_PROGRESS') throw new Error('Process is not IN_PROGRESS');

//     const inputLot  = db.prepare(`SELECT * FROM ${T.lots} WHERE id=?`).get(mfg.lot_id);
//     const wastageAmt = mfg.input_weight - actual_output;
//     const wastagePct = (wastageAmt / mfg.input_weight) * 100;
//     const outProdId  = output_product_id || inputLot.product_id;
//     const outLotNum  = generateNumber(T.lotDyedPrefix);

//     const outLot = db.prepare(`INSERT INTO ${T.lots}
//       (lot_number, product_id, purchase_id, status, location, initial_quantity, current_quantity, shade_code, cost_per_unit)
//       VALUES (?,?,?,?,?,?,?,?,?)`
//     ).run(outLotNum, outProdId, inputLot.purchase_id, 'READY_FOR_SALE', 'FINISHED_STORE',
//           actual_output, actual_output, shade_code || inputLot.shade_code, inputLot.cost_per_unit);

//     db.prepare(`INSERT INTO ${T.inventory} (product_id, lot_id, location, quantity, unit) VALUES (?,?,?,?,?)`)
//       .run(outProdId, outLot.lastInsertRowid, 'FINISHED_STORE', actual_output, 'No Of Cones');

//     // yarn_lots allows 'FINISHED' status — correct for yarn
//     db.prepare(`UPDATE ${T.lots} SET status='FINISHED', current_quantity=0, updated_at=datetime('now') WHERE id=?`).run(mfg.lot_id);
//     db.prepare(`UPDATE ${T.inventory} SET quantity=0, updated_at=datetime('now') WHERE lot_id=?`).run(mfg.lot_id);
//     db.prepare(`UPDATE ${T.manufacturing} SET status='COMPLETED', actual_output=?, shade_code=?, output_product_id=?, output_lot_id=?, end_date=date('now'), notes=COALESCE(?,notes) WHERE id=?`)
//       .run(actual_output, shade_code, outProdId, outLot.lastInsertRowid, notes, manufacturing_id);

//     if (wastageAmt > 0) {
//       db.prepare(`INSERT INTO ${T.wastage}
//         (lot_id, manufacturing_id, process_stage, input_weight, expected_output, actual_output, wastage_amount, wastage_percentage, cost_per_unit, wastage_cost)
//         VALUES (?,?,?,?,?,?,?,?,?,?)`
//       ).run(mfg.lot_id, manufacturing_id, 'DYEING', mfg.input_weight, mfg.expected_output,
//             actual_output, wastageAmt, wastagePct, inputLot.cost_per_unit, wastageAmt * inputLot.cost_per_unit);
//     }
//     return db.prepare(`SELECT * FROM ${T.manufacturing} WHERE id=?`).get(manufacturing_id);
//   });
//   try   { res.status(200).json(txn()); }
//   catch (err) { res.status(400).json({ error: err.message }); }
// });

// // ── CHEMICAL: Start ───────────────────────────────────────────────────────────
// router.post('/start-chemical', (req, res) => {
//   if (req.businessMode !== 'CHEMICAL')
//     return res.status(403).json({ error: 'start-chemical only available in CHEMICAL workspace' });
//   const db = req.app.locals.db; const T = req.T;
//   const { lot_id, input_weight, expected_output, notes } = req.body;
//   if (!lot_id || !input_weight || !expected_output)
//     return res.status(400).json({ error: 'lot_id, input_weight, expected_output required' });

//   const txn = db.transaction(() => {
//     const lot = db.prepare(`SELECT l.*, p.type as product_type FROM ${T.lots} l
//       JOIN ${T.products} p ON l.product_id=p.id WHERE l.id=?`).get(lot_id);
//     if (!lot)                                throw new Error('Lot not found');
//     if (lot.product_type !== 'CHEMICAL_RAW') throw new Error('Only CHEMICAL_RAW lots can start chemical manufacturing');
//     if (lot.status !== 'IN_STORE')           throw new Error('Lot must be IN_STORE');
//     if (input_weight > lot.current_quantity) throw new Error('Input weight exceeds available quantity');

//     db.prepare(`UPDATE ${T.lots} SET status='CHEMICAL_MANUFACTURING', updated_at=datetime('now') WHERE id=?`).run(lot_id);

//     const r = db.prepare(`INSERT INTO ${T.manufacturing} (lot_id, process_type, status, input_weight, expected_output, notes)
//       VALUES (?,?,?,?,?,?)`).run(lot_id, 'CHEMICAL_MANUFACTURING', 'IN_PROGRESS', input_weight, expected_output, notes || null);
//     return db.prepare(`SELECT m.*, l.lot_number FROM ${T.manufacturing} m JOIN ${T.lots} l ON m.lot_id=l.id WHERE m.id=?`)
//              .get(r.lastInsertRowid);
//   });
//   try   { res.status(201).json(txn()); }
//   catch (err) { res.status(400).json({ error: err.message }); }
// });

// // ── CHEMICAL: Complete ────────────────────────────────────────────────────────
// router.post('/complete-chemical', (req, res) => {
//   if (req.businessMode !== 'CHEMICAL')
//     return res.status(403).json({ error: 'complete-chemical only available in CHEMICAL workspace' });
//   const db = req.app.locals.db; const T = req.T;
//   const { manufacturing_id, actual_output, chemical_code, output_product_id, notes } = req.body;
//   if (!manufacturing_id || actual_output === undefined)
//     return res.status(400).json({ error: 'manufacturing_id and actual_output required' });

//   const txn = db.transaction(() => {
//     const mfg      = db.prepare(`SELECT * FROM ${T.manufacturing} WHERE id=?`).get(manufacturing_id);
//     if (!mfg || mfg.status !== 'IN_PROGRESS') throw new Error('Process not found or not IN_PROGRESS');
//     const inputLot  = db.prepare(`SELECT * FROM ${T.lots} WHERE id=?`).get(mfg.lot_id);
//     const wastageAmt = mfg.input_weight - actual_output;
//     const wastagePct = (wastageAmt / mfg.input_weight) * 100;
//     const outProdId  = output_product_id || inputLot.product_id;
//     const outLotNum  = generateNumber(T.lotDyedPrefix);

//     const outLot = db.prepare(`INSERT INTO ${T.lots}
//       (lot_number, product_id, purchase_id, status, location, initial_quantity, current_quantity, chemical_code, cost_per_unit)
//       VALUES (?,?,?,?,?,?,?,?,?)`
//     ).run(outLotNum, outProdId, inputLot.purchase_id, 'READY_FOR_SALE', 'CHEMICAL_STORE',
//           actual_output, actual_output, chemical_code || inputLot.chemical_code, inputLot.cost_per_unit);

//     db.prepare(`INSERT INTO ${T.inventory} (product_id, lot_id, location, quantity, unit) VALUES (?,?,?,?,?)`)
//       .run(outProdId, outLot.lastInsertRowid, 'CHEMICAL_STORE', actual_output, 'KG');

//     // chem_lots does NOT have 'FINISHED' in its CHECK constraint — use 'SOLD' instead
//     db.prepare(`UPDATE ${T.lots} SET status='SOLD', current_quantity=0, updated_at=datetime('now') WHERE id=?`).run(mfg.lot_id);
//     db.prepare(`UPDATE ${T.inventory} SET quantity=0, updated_at=datetime('now') WHERE lot_id=?`).run(mfg.lot_id);
//     db.prepare(`UPDATE ${T.manufacturing} SET status='COMPLETED', actual_output=?, chemical_code=?, output_product_id=?, output_lot_id=?, end_date=date('now'), notes=COALESCE(?,notes) WHERE id=?`)
//       .run(actual_output, chemical_code, outProdId, outLot.lastInsertRowid, notes, manufacturing_id);

//     if (wastageAmt > 0) {
//       db.prepare(`INSERT INTO ${T.wastage}
//         (lot_id, manufacturing_id, process_stage, input_weight, expected_output, actual_output, wastage_amount, wastage_percentage, cost_per_unit, wastage_cost)
//         VALUES (?,?,?,?,?,?,?,?,?,?)`
//       ).run(mfg.lot_id, manufacturing_id, 'CHEMICAL_MANUFACTURING', mfg.input_weight, mfg.expected_output,
//             actual_output, wastageAmt, wastagePct, inputLot.cost_per_unit, wastageAmt * inputLot.cost_per_unit);
//     }
//     return db.prepare(`SELECT * FROM ${T.manufacturing} WHERE id=?`).get(manufacturing_id);
//   });
//   try   { res.status(200).json(txn()); }
//   catch (err) { res.status(400).json({ error: err.message }); }
// });

// module.exports = router;
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const { generateNumber } = require('../utils/helpers');
router.use(authenticate);

router.get('/', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  const { status } = req.query;
  let sql = `SELECT m.*, l.lot_number, p.name as product_name, p.unit as unit FROM ${T.manufacturing} m
    JOIN ${T.lots} l ON m.lot_id = l.id JOIN ${T.products} p ON l.product_id = p.id WHERE 1=1`;
  const params = [];
  if (status) { sql += ' AND m.status = ?'; params.push(status); }
  sql += ' ORDER BY m.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  const proc = db.prepare(`SELECT m.*, l.lot_number, p.name as product_name, p.type as product_type, p.unit as unit
    FROM ${T.manufacturing} m JOIN ${T.lots} l ON m.lot_id = l.id
    JOIN ${T.products} p ON l.product_id = p.id WHERE m.id = ?`).get(req.params.id);
  if (!proc) return res.status(404).json({ error: 'Process not found' });
  const wastage = db.prepare(`SELECT * FROM ${T.wastage} WHERE manufacturing_id = ?`).all(proc.id);
  res.json({ ...proc, wastage });
});

// ── YARN: Start Dyeing ────────────────────────────────────────────────────────
router.post('/start-dyeing', (req, res) => {
  if (req.businessMode !== 'YARN')
    return res.status(403).json({ error: 'start-dyeing only available in YARN workspace' });
  const db = req.app.locals.db; const T = req.T;
  const { lot_id, input_weight, expected_output, notes } = req.body;
  if (!lot_id || !input_weight || !expected_output)
    return res.status(400).json({ error: 'lot_id, input_weight, expected_output required' });

  const txn = db.transaction(() => {
    const lot = db.prepare(`SELECT l.*, p.type as product_type FROM ${T.lots} l
      JOIN ${T.products} p ON l.product_id = p.id WHERE l.id = ?`).get(lot_id);
    if (!lot)                            throw new Error('Lot not found');
    if (lot.product_type !== 'RAW_YARN') throw new Error('Only RAW_YARN lots can be sent for dyeing');
    if (lot.status !== 'IN_STORE')       throw new Error('Lot must be IN_STORE to start dyeing');
    if (input_weight > lot.current_quantity) throw new Error('Input weight exceeds available quantity');

    db.prepare(`UPDATE ${T.lots} SET status='DYEING', location='DYEING', updated_at=datetime('now') WHERE id=?`).run(lot_id);
    db.prepare(`UPDATE ${T.inventory} SET location='DYEING', updated_at=datetime('now') WHERE lot_id=? AND location='STORE'`).run(lot_id);

    const r = db.prepare(`INSERT INTO ${T.manufacturing} (lot_id, process_type, status, input_weight, expected_output, notes)
      VALUES (?,?,?,?,?,?)`).run(lot_id, 'DYEING', 'IN_PROGRESS', input_weight, expected_output, notes || null);
    return db.prepare(`SELECT m.*, l.lot_number FROM ${T.manufacturing} m JOIN ${T.lots} l ON m.lot_id=l.id WHERE m.id=?`)
             .get(r.lastInsertRowid);
  });
  try   { res.status(201).json(txn()); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

// ── YARN: Complete Dyeing ─────────────────────────────────────────────────────
router.post('/complete-dyeing', (req, res) => {
  if (req.businessMode !== 'YARN')
    return res.status(403).json({ error: 'complete-dyeing only available in YARN workspace' });
  const db = req.app.locals.db; const T = req.T;
  const { manufacturing_id, actual_output, shade_code, output_product_id, notes } = req.body;
  if (!manufacturing_id || actual_output === undefined)
    return res.status(400).json({ error: 'manufacturing_id and actual_output required' });

  const txn = db.transaction(() => {
    const mfg = db.prepare(`SELECT * FROM ${T.manufacturing} WHERE id=?`).get(manufacturing_id);
    if (!mfg)                         throw new Error('Process not found');
    if (mfg.status !== 'IN_PROGRESS') throw new Error('Process is not IN_PROGRESS');

    const inputLot  = db.prepare(`SELECT * FROM ${T.lots} WHERE id=?`).get(mfg.lot_id);
    const wastageAmt = mfg.input_weight - actual_output;
    const wastagePct = (wastageAmt / mfg.input_weight) * 100;
    const outProdId  = output_product_id || inputLot.product_id;
    const outProduct = db.prepare(`SELECT unit FROM ${T.products} WHERE id=?`).get(outProdId);
    const outputUnit = outProduct?.unit || 'No Of Cones';
    const outLotNum  = generateNumber(T.lotDyedPrefix);

    const outLot = db.prepare(`INSERT INTO ${T.lots}
      (lot_number, product_id, purchase_id, status, location, initial_quantity, current_quantity, shade_code, cost_per_unit)
      VALUES (?,?,?,?,?,?,?,?,?)`
    ).run(outLotNum, outProdId, inputLot.purchase_id, 'READY_FOR_SALE', 'FINISHED_STORE',
          actual_output, actual_output, shade_code || inputLot.shade_code, inputLot.cost_per_unit);

    db.prepare(`INSERT INTO ${T.inventory} (product_id, lot_id, location, quantity, unit) VALUES (?,?,?,?,?)`)
      .run(outProdId, outLot.lastInsertRowid, 'FINISHED_STORE', actual_output, outputUnit);

    db.prepare(`UPDATE ${T.lots} SET status='FINISHED', current_quantity=0, updated_at=datetime('now') WHERE id=?`).run(mfg.lot_id);
    db.prepare(`UPDATE ${T.inventory} SET quantity=0, updated_at=datetime('now') WHERE lot_id=?`).run(mfg.lot_id);
    db.prepare(`UPDATE ${T.manufacturing} SET status='COMPLETED', actual_output=?, shade_code=?, output_product_id=?, output_lot_id=?, end_date=date('now'), notes=COALESCE(?,notes) WHERE id=?`)
      .run(actual_output, shade_code, outProdId, outLot.lastInsertRowid, notes, manufacturing_id);

    if (wastageAmt > 0) {
      db.prepare(`INSERT INTO ${T.wastage}
        (lot_id, manufacturing_id, process_stage, input_weight, expected_output, actual_output, wastage_amount, wastage_percentage, cost_per_unit, wastage_cost)
        VALUES (?,?,?,?,?,?,?,?,?,?)`
      ).run(mfg.lot_id, manufacturing_id, 'DYEING', mfg.input_weight, mfg.expected_output,
            actual_output, wastageAmt, wastagePct, inputLot.cost_per_unit, wastageAmt * inputLot.cost_per_unit);
    }
    return db.prepare(`SELECT * FROM ${T.manufacturing} WHERE id=?`).get(manufacturing_id);
  });
  try   { res.status(200).json(txn()); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

// ── CHEMICAL: Start ───────────────────────────────────────────────────────────
router.post('/start-chemical', (req, res) => {
  if (req.businessMode !== 'CHEMICAL')
    return res.status(403).json({ error: 'start-chemical only available in CHEMICAL workspace' });
  const db = req.app.locals.db; const T = req.T;
  const { lot_id, input_weight, expected_output, notes } = req.body;
  if (!lot_id || !input_weight || !expected_output)
    return res.status(400).json({ error: 'lot_id, input_weight, expected_output required' });

  const txn = db.transaction(() => {
    const lot = db.prepare(`SELECT l.*, p.type as product_type FROM ${T.lots} l
      JOIN ${T.products} p ON l.product_id=p.id WHERE l.id=?`).get(lot_id);
    if (!lot)                                throw new Error('Lot not found');
    if (lot.product_type !== 'CHEMICAL_RAW') throw new Error('Only CHEMICAL_RAW lots can start chemical manufacturing');
    if (lot.status !== 'IN_STORE')           throw new Error('Lot must be IN_STORE');
    if (input_weight > lot.current_quantity) throw new Error('Input weight exceeds available quantity');

    db.prepare(`UPDATE ${T.lots} SET status='CHEMICAL_MANUFACTURING', updated_at=datetime('now') WHERE id=?`).run(lot_id);

    const r = db.prepare(`INSERT INTO ${T.manufacturing} (lot_id, process_type, status, input_weight, expected_output, notes)
      VALUES (?,?,?,?,?,?)`).run(lot_id, 'CHEMICAL_MANUFACTURING', 'IN_PROGRESS', input_weight, expected_output, notes || null);
    return db.prepare(`SELECT m.*, l.lot_number FROM ${T.manufacturing} m JOIN ${T.lots} l ON m.lot_id=l.id WHERE m.id=?`)
             .get(r.lastInsertRowid);
  });
  try   { res.status(201).json(txn()); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

// ── CHEMICAL: Complete ────────────────────────────────────────────────────────
router.post('/complete-chemical', (req, res) => {
  if (req.businessMode !== 'CHEMICAL')
    return res.status(403).json({ error: 'complete-chemical only available in CHEMICAL workspace' });
  const db = req.app.locals.db; const T = req.T;
  const { manufacturing_id, actual_output, chemical_code, output_product_id, notes } = req.body;
  if (!manufacturing_id || actual_output === undefined)
    return res.status(400).json({ error: 'manufacturing_id and actual_output required' });

  const txn = db.transaction(() => {
    const mfg      = db.prepare(`SELECT * FROM ${T.manufacturing} WHERE id=?`).get(manufacturing_id);
    if (!mfg || mfg.status !== 'IN_PROGRESS') throw new Error('Process not found or not IN_PROGRESS');
    const inputLot  = db.prepare(`SELECT * FROM ${T.lots} WHERE id=?`).get(mfg.lot_id);
    const wastageAmt = mfg.input_weight - actual_output;
    const wastagePct = (wastageAmt / mfg.input_weight) * 100;

    // ── Resolve output product (must be CHEMICAL_FINISHED type) ──────────────
    let outProdId = output_product_id ? parseInt(output_product_id) : null;

    if (!outProdId) {
      const inputProduct = db.prepare(`SELECT * FROM ${T.products} WHERE id=?`).get(inputLot.product_id);
      // Find existing CHEMICAL_FINISHED product with same name
      const existing = db.prepare(
        `SELECT id FROM ${T.products} WHERE name=? AND type='CHEMICAL_FINISHED' LIMIT 1`
      ).get(inputProduct.name);

      if (existing) {
        outProdId = existing.id;
      } else {
        // Auto-create CHEMICAL_FINISHED product from the raw material name
        const newProd = db.prepare(
          `INSERT INTO ${T.products} (name, type, unit, chemical_code, is_active) VALUES (?,?,?,?,1)`
        ).run(inputProduct.name, 'CHEMICAL_FINISHED', inputProduct.unit || 'Kg', chemical_code || null);
        outProdId = newProd.lastInsertRowid;
      }
    }

    const outLotNum = generateNumber(T.lotDyedPrefix);
    const outProduct = db.prepare(`SELECT unit FROM ${T.products} WHERE id=?`).get(outProdId);
    const outputUnit = outProduct?.unit || 'Kg';

    // Output lot is READY_FOR_SALE so it appears in Sales
    const outLot = db.prepare(`INSERT INTO ${T.lots}
      (lot_number, product_id, purchase_id, status, location, initial_quantity, current_quantity, chemical_code, cost_per_unit)
      VALUES (?,?,?,?,?,?,?,?,?)`
    ).run(outLotNum, outProdId, inputLot.purchase_id, 'READY_FOR_SALE', 'CHEMICAL_STORE',
          actual_output, actual_output, chemical_code || inputLot.chemical_code, inputLot.cost_per_unit);

    db.prepare(`INSERT INTO ${T.inventory} (product_id, lot_id, location, quantity, unit) VALUES (?,?,?,?,?)`)
      .run(outProdId, outLot.lastInsertRowid, 'CHEMICAL_STORE', actual_output, outputUnit);

    // chem_lots CHECK: ('IN_STORE','CHEMICAL_MANUFACTURING','READY_FOR_SALE','SOLD','PARTIALLY_SOLD')
    // 'FINISHED' is NOT allowed — use 'SOLD' for the consumed raw lot
    db.prepare(`UPDATE ${T.lots} SET status='SOLD', current_quantity=0, updated_at=datetime('now') WHERE id=?`).run(mfg.lot_id);
    db.prepare(`UPDATE ${T.inventory} SET quantity=0, updated_at=datetime('now') WHERE lot_id=?`).run(mfg.lot_id);
    db.prepare(`UPDATE ${T.manufacturing} SET status='COMPLETED', actual_output=?, chemical_code=?, output_product_id=?, output_lot_id=?, end_date=date('now'), notes=COALESCE(?,notes) WHERE id=?`)
      .run(actual_output, chemical_code, outProdId, outLot.lastInsertRowid, notes, manufacturing_id);

    if (wastageAmt > 0) {
      db.prepare(`INSERT INTO ${T.wastage}
        (lot_id, manufacturing_id, process_stage, input_weight, expected_output, actual_output, wastage_amount, wastage_percentage, cost_per_unit, wastage_cost)
        VALUES (?,?,?,?,?,?,?,?,?,?)`
      ).run(mfg.lot_id, manufacturing_id, 'CHEMICAL_MANUFACTURING', mfg.input_weight, mfg.expected_output,
            actual_output, wastageAmt, wastagePct, inputLot.cost_per_unit, wastageAmt * inputLot.cost_per_unit);
    }
    return db.prepare(`SELECT * FROM ${T.manufacturing} WHERE id=?`).get(manufacturing_id);
  });
  try   { res.status(200).json(txn()); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;