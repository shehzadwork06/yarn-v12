
const router = require("express").Router();
const { authenticate } = require("../middlewares/auth");
const { generateNumber, generateLotNumber } = require("../utils/helpers");
router.use(authenticate);

// GET /api/purchases
router.get("/", (req, res) => {
  const db = req.app.locals.db;
  const T = req.T;
  const { supplier_id, status, from_date, to_date } = req.query;

  let sql = `SELECT p.*, s.name as supplier_name
    FROM ${T.purchases} p
    JOIN ${T.suppliers} s ON p.supplier_id = s.id WHERE 1=1`;
  const params = [];
  if (supplier_id) {
    sql += " AND p.supplier_id = ?";
    params.push(supplier_id);
  }
  if (status) {
    sql += " AND p.status = ?";
    params.push(status);
  }
  if (from_date) {
    sql += " AND p.date >= ?";
    params.push(from_date);
  }
  if (to_date) {
    sql += " AND p.date <= ?";
    params.push(to_date);
  }
  sql += " ORDER BY p.created_at DESC";

  res.json(db.prepare(sql).all(...params));
});

// GET /api/purchases/:id
router.get("/:id", (req, res) => {
  const db = req.app.locals.db;
  const T = req.T;
  const purchase = db
    .prepare(
      `SELECT p.*, s.name as supplier_name FROM ${T.purchases} p
     JOIN ${T.suppliers} s ON p.supplier_id = s.id WHERE p.id = ?`,
    )
    .get(req.params.id);
  if (!purchase) return res.status(404).json({ error: "Purchase not found" });

  const items = db
    .prepare(
      `SELECT pi.*, pr.name as product_name, pr.type as product_type, pr.unit as unit, l.lot_number,
       c.name as category_name
     FROM ${T.pur_items} pi
     JOIN ${T.products} pr ON pi.product_id = pr.id
     LEFT JOIN ${T.lots} l ON pi.lot_id = l.id
     LEFT JOIN product_categories c ON pr.category_id = c.id
     WHERE pi.purchase_id = ?`,
    )
    .all(purchase.id);

  res.json({ ...purchase, items });
});

// POST /api/purchases
router.post("/", (req, res) => {
  const db = req.app.locals.db;
  const T = req.T;
  const { supplier_id, date, items, notes } = req.body;

  if (!supplier_id || !items || !items.length)
    return res
      .status(400)
      .json({ error: "supplier_id and items are required" });

  // Validate every product belongs to this workspace
  for (const item of items) {
    const prod = db
      .prepare(`SELECT type FROM ${T.products} WHERE id = ?`)
      .get(item.product_id);
    if (!prod)
      return res
        .status(400)
        .json({
          error: `Product ${item.product_id} not found in ${req.businessMode} workspace`,
        });
    if (!T.validTypes.includes(prod.type))
      return res.status(400).json({
        error:
          `Product type "${prod.type}" does not belong to ${req.businessMode} workspace. ` +
          `Allowed: ${T.validTypes.join(", ")}`,
      });
  }

  const txn = db.transaction(() => {
    const poNumber = generateNumber(T.poPrefix);
    let total = 0;
    items.forEach((i) => {
      total += i.quantity * i.rate;
    });

    const poResult = db
      .prepare(
        `INSERT INTO ${T.purchases} (purchase_number, supplier_id, date, total_amount, status, notes)
       VALUES (?,?,?,?,?,?)`,
      )
      .run(
        poNumber,
        supplier_id,
        date || new Date().toISOString().split("T")[0],
        total,
        "RECEIVED",
        notes || null,
      );
    const purchaseId = poResult.lastInsertRowid;

    const createdLots = [];
    for (const item of items) {
      const prod = db
        .prepare(`SELECT * FROM ${T.products} WHERE id = ?`)
        .get(item.product_id);
      const isYarn = req.businessMode === "YARN";

      // ── Location ────────────────────────────────────────────────────────────
      let location = T.defaultLocation;
      if (isYarn && prod.type === "DYED_YARN") location = "FINISHED_STORE";
      // Chemical always stays CHEMICAL_STORE (enforced by DB CHECK constraint)

      // ── Lot status ──────────────────────────────────────────────────────────
      // DYED_YARN and CHEMICAL_FINISHED purchased directly → READY_FOR_SALE
      // Everything else (RAW_YARN, CHEMICAL_RAW) → IN_STORE
      const lotStatus =
        prod.type === "DYED_YARN" || prod.type === "CHEMICAL_FINISHED"
          ? "READY_FOR_SALE"
          : "IN_STORE";

      const lotNumber = generateLotNumber(db, T.lots);

      // ── Insert lot with correct code column per workspace ──────────────────
      const lotResult = isYarn
        ? db
            .prepare(
              `INSERT INTO ${T.lots}
              (lot_number, product_id, purchase_id, status, location,
               initial_quantity, current_quantity, shade_code, cost_per_unit)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            )
            .run(
              lotNumber,
              item.product_id,
              purchaseId,
              lotStatus,
              location,
              item.quantity,
              item.quantity,
              item.shade_code || null,
              item.rate,
            )
        : db
            .prepare(
              `INSERT INTO ${T.lots}
              (lot_number, product_id, purchase_id, status, location,
               initial_quantity, current_quantity, chemical_code, cost_per_unit)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            )
            .run(
              lotNumber,
              item.product_id,
              purchaseId,
              lotStatus,
              location,
              item.quantity,
              item.quantity,
              item.chemical_code || null,
              item.rate,
            );

      const lotId = lotResult.lastInsertRowid;

      db.prepare(
        `INSERT INTO ${T.pur_items} (purchase_id, product_id, lot_id, quantity, rate, amount)
         VALUES (?,?,?,?,?,?)`,
      ).run(
        purchaseId,
        item.product_id,
        lotId,
        item.quantity,
        item.rate,
        item.quantity * item.rate,
      );

      db.prepare(
        `INSERT INTO ${T.inventory} (product_id, lot_id, location, quantity, unit)
         VALUES (?,?,?,?,?)`,
      ).run(
        item.product_id,
        lotId,
        location,
        item.quantity,
        prod.unit || T.defaultUnit,
      );

      createdLots.push({ lotId, lotNumber, productName: prod.name });
    }

    // Supplier ledger
    const sup = db
      .prepare(`SELECT * FROM ${T.suppliers} WHERE id = ?`)
      .get(supplier_id);
    const newBal = sup.current_balance + total;
    db.prepare(
      `UPDATE ${T.suppliers} SET current_balance = ? WHERE id = ?`,
    ).run(newBal, supplier_id);
    db.prepare(
      `INSERT INTO ${T.supplier_ledger} (supplier_id, date, type, reference_id, description, debit, balance)
       VALUES (?,?,?,?,?,?,?)`,
    ).run(
      supplier_id,
      date || new Date().toISOString().split("T")[0],
      "PURCHASE",
      purchaseId,
      `Purchase ${poNumber}`,
      total,
      newBal,
    );

    return {
      ...db
        .prepare(`SELECT * FROM ${T.purchases} WHERE id = ?`)
        .get(purchaseId),
      lots: createdLots,
    };
  });

  try {
    res.status(201).json(txn());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/purchases/:id
router.put("/:id", (req, res) => {
  const db = req.app.locals.db;
  const T = req.T;
  const { supplier_id, date, notes, items } = req.body;

  const purchase = db
    .prepare(`SELECT * FROM ${T.purchases} WHERE id = ?`)
    .get(req.params.id);
  if (!purchase) return res.status(404).json({ error: "Purchase not found" });

  if (!supplier_id || !items || !items.length)
    return res.status(400).json({ error: "supplier_id and items are required" });

  // Validate every product belongs to this workspace
  for (const item of items) {
    const prod = db
      .prepare(`SELECT type FROM ${T.products} WHERE id = ?`)
      .get(item.product_id);
    if (!prod)
      return res.status(400).json({
        error: `Product ${item.product_id} not found in ${req.businessMode} workspace`,
      });
    if (!T.validTypes.includes(prod.type))
      return res.status(400).json({
        error:
          `Product type "${prod.type}" does not belong to ${req.businessMode} workspace. ` +
          `Allowed: ${T.validTypes.join(", ")}`,
      });
  }

  const txn = db.transaction(() => {
    const isYarn = req.businessMode === "YARN";

    // ── Recalculate new total ────────────────────────────────────────────────
    let newTotal = 0;
    items.forEach((i) => { newTotal += i.quantity * i.rate; });
    const oldTotal = purchase.total_amount;
    const totalDiff = newTotal - oldTotal;

    // ── Update each existing purchase item (qty / rate only) ─────────────────
    // Keeps lot numbers intact — only qty, rate, amount and inventory adjust.
    const existingItems = db
      .prepare(`SELECT * FROM ${T.pur_items} WHERE purchase_id = ?`)
      .all(purchase.id);

    for (const item of items) {
      const existing = existingItems.find(
        (ei) => String(ei.product_id) === String(item.product_id)
      );
      if (existing) {
        const qtyDiff = item.quantity - existing.quantity;

        // Update purchase item row
        db.prepare(
          `UPDATE ${T.pur_items} SET quantity = ?, rate = ?, amount = ? WHERE id = ?`
        ).run(item.quantity, item.rate, item.quantity * item.rate, existing.id);

        // Update lot quantities and cost
        db.prepare(
          `UPDATE ${T.lots}
           SET current_quantity = current_quantity + ?,
               initial_quantity = initial_quantity + ?,
               cost_per_unit    = ?
           WHERE id = ?`
        ).run(qtyDiff, qtyDiff, item.rate, existing.lot_id);

        // Update inventory quantity
        db.prepare(
          `UPDATE ${T.inventory} SET quantity = quantity + ? WHERE lot_id = ?`
        ).run(qtyDiff, existing.lot_id);

        // Update shade/chemical code on lot if provided
        if (isYarn && item.shade_code !== undefined) {
          db.prepare(`UPDATE ${T.lots} SET shade_code = ? WHERE id = ?`)
            .run(item.shade_code || null, existing.lot_id);
        }
        if (!isYarn && item.chemical_code !== undefined) {
          db.prepare(`UPDATE ${T.lots} SET chemical_code = ? WHERE id = ?`)
            .run(item.chemical_code || null, existing.lot_id);
        }
      }
    }

    // ── Update purchase header ───────────────────────────────────────────────
    db.prepare(
      `UPDATE ${T.purchases}
       SET supplier_id = ?, date = ?, total_amount = ?, notes = ?
       WHERE id = ?`
    ).run(
      supplier_id,
      date || purchase.date,
      newTotal,
      notes || null,
      purchase.id
    );

    // ── Adjust supplier balance and ledger by the difference ─────────────────
    if (totalDiff !== 0) {
      const sup = db
        .prepare(`SELECT * FROM ${T.suppliers} WHERE id = ?`)
        .get(purchase.supplier_id);
      const newSupBal = sup.current_balance + totalDiff;
      db.prepare(`UPDATE ${T.suppliers} SET current_balance = ? WHERE id = ?`)
        .run(newSupBal, purchase.supplier_id);
      db.prepare(
        `UPDATE ${T.supplier_ledger}
         SET debit = debit + ?, balance = balance + ?
         WHERE reference_id = ? AND type = 'PURCHASE'`
      ).run(totalDiff, totalDiff, purchase.id);
    }

    return db
      .prepare(
        `SELECT p.*, s.name as supplier_name FROM ${T.purchases} p
         JOIN ${T.suppliers} s ON p.supplier_id = s.id WHERE p.id = ?`
      )
      .get(purchase.id);
  });

  try {
    res.json(txn());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;