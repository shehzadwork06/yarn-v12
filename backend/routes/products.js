const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
router.use(authenticate);

// ─── GET /api/products ────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const T  = req.T;
  const { type, search, active, category_id } = req.query;

  let sql = `
    SELECT p.*, c.name AS category_name
    FROM ${T.products} p
    LEFT JOIN product_categories c ON p.category_id = c.id
    WHERE 1=1`;
  const params = [];

  if (type) {
    if (!T.validTypes.includes(type))
      return res.status(400).json({
        error: `Type "${type}" is not valid in the ${req.businessMode} workspace`,
      });
    sql += ' AND p.type = ?';
    params.push(type);
  }
  if (active !== undefined) {
    sql += ' AND p.is_active = ?';
    params.push(active === 'true' ? 1 : 0);
  }
  if (search) {
    sql += ' AND p.name LIKE ?';
    params.push(`%${search}%`);
  }
  if (category_id) {
    sql += ' AND p.category_id = ?';
    params.push(category_id);
  }
  sql += ' ORDER BY p.created_at DESC';

  res.json(db.prepare(sql).all(...params));
});

// ─── GET /api/products/:id ────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const T  = req.T;
  const p  = db.prepare(
    `SELECT p.*, c.name AS category_name
     FROM ${T.products} p
     LEFT JOIN product_categories c ON p.category_id = c.id
     WHERE p.id = ?`,
  ).get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});

// ─── POST /api/products ───────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const T  = req.T;

  // businessMode.js sets req.businessMode as 'YARN' or 'CHEMICAL' (always uppercase)
  const isYarn = req.businessMode === 'YARN';

  const {
    name, category_id, type, unit, conversion_factor,
    min_stock_level, shade_code, chemical_code, description,
  } = req.body;

  // ── Validation ──────────────────────────────────────────────────────────────
  if (!name || !String(name).trim())
    return res.status(400).json({ error: 'name is required' });
  if (!type)
    return res.status(400).json({ error: 'type is required' });
  if (!T.validTypes.includes(type))
    return res.status(400).json({
      error: `In ${req.businessMode} workspace, type must be one of: ${T.validTypes.join(', ')}`,
    });
  if (isYarn && !category_id)
    return res.status(400).json({ error: 'category_id is required in YARN workspace' });

  // ── Insert — each branch only references its own table's columns ────────────
  let result;

  if (isYarn) {
    // yarn_products: has shade_code, NO chemical_code
    result = db.prepare(
      `INSERT INTO ${T.products}
         (name, category_id, type, unit, conversion_factor, min_stock_level, shade_code, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      String(name).trim(),
      category_id,
      type,
      unit              || T.defaultUnit,
      conversion_factor != null ? conversion_factor : 1.0,
      min_stock_level   != null ? min_stock_level   : 0,
      shade_code        || null,
      description       || null,
    );
  } else {
    // chem_products: has chemical_code, NO category_id, NO shade_code
    result = db.prepare(
      `INSERT INTO ${T.products}
         (name, type, unit, conversion_factor, min_stock_level, chemical_code, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      String(name).trim(),
      type,
      unit              || T.defaultUnit,
      conversion_factor != null ? conversion_factor : 1.0,
      min_stock_level   != null ? min_stock_level   : 0,
      chemical_code     || null,
      description       || null,
    );
  }

  const created = db.prepare(
    `SELECT p.*, c.name AS category_name
     FROM ${T.products} p
     LEFT JOIN product_categories c ON p.category_id = c.id
     WHERE p.id = ?`,
  ).get(result.lastInsertRowid);

  res.status(201).json(created);
});

// ─── PUT /api/products/:id ────────────────────────────────────────────────────
router.put('/:id', (req, res) => {
  const db  = req.app.locals.db;
  const T   = req.T;
  const { id } = req.params;

  // businessMode.js sets req.businessMode as 'YARN' or 'CHEMICAL' (always uppercase)
  const isYarn = req.businessMode === 'YARN';

  if (!db.prepare(`SELECT id FROM ${T.products} WHERE id = ?`).get(id))
    return res.status(404).json({ error: 'Product not found' });

  const {
    name, type, unit, conversion_factor, min_stock_level,
    shade_code, chemical_code, description, is_active,
  } = req.body;

  if (type && !T.validTypes.includes(type))
    return res.status(400).json({
      error: `Type "${type}" is not valid in the ${req.businessMode} workspace`,
    });

  // ── Update — each branch only references its own table's columns ────────────
  if (isYarn) {
    // yarn_products: shade_code only — chemical_code column does NOT exist here
    db.prepare(
      `UPDATE ${T.products} SET
         name              = COALESCE(?, name),
         type              = COALESCE(?, type),
         unit              = COALESCE(?, unit),
         conversion_factor = COALESCE(?, conversion_factor),
         min_stock_level   = COALESCE(?, min_stock_level),
         shade_code        = COALESCE(?, shade_code),
         description       = COALESCE(?, description),
         is_active         = COALESCE(?, is_active)
       WHERE id = ?`,
    ).run(
      name              ?? null,
      type              ?? null,
      unit              ?? null,
      conversion_factor ?? null,
      min_stock_level   ?? null,
      shade_code        ?? null,
      description       ?? null,
      is_active         ?? null,
      id,
    );
  } else {
    // chem_products: chemical_code only — shade_code column does NOT exist here
    db.prepare(
      `UPDATE ${T.products} SET
         name              = COALESCE(?, name),
         type              = COALESCE(?, type),
         unit              = COALESCE(?, unit),
         conversion_factor = COALESCE(?, conversion_factor),
         min_stock_level   = COALESCE(?, min_stock_level),
         chemical_code     = COALESCE(?, chemical_code),
         description       = COALESCE(?, description),
         is_active         = COALESCE(?, is_active)
       WHERE id = ?`,
    ).run(
      name              ?? null,
      type              ?? null,
      unit              ?? null,
      conversion_factor ?? null,
      min_stock_level   ?? null,
      chemical_code     ?? null,
      description       ?? null,
      is_active         ?? null,
      id,
    );
  }

  const updated = db.prepare(
    `SELECT p.*, c.name AS category_name
     FROM ${T.products} p
     LEFT JOIN product_categories c ON p.category_id = c.id
     WHERE p.id = ?`,
  ).get(id);

  res.json(updated);
});

module.exports = router;