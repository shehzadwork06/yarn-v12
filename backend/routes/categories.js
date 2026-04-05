// const router = require('express').Router();
// const { authenticate } = require('../middlewares/auth');

// router.use(authenticate);

// //
// // GET /api/categories
// //
// router.get('/', (req, res) => {
//   const db = req.app.locals.db;
//   const { search, active } = req.query;

//   let query = 'SELECT * FROM product_categories WHERE 1=1';
//   const params = [];

//   if (active !== undefined) {
//     query += ' AND is_active = ?';
//     params.push(active === 'true' ? 1 : 0);
//   }

//   if (search) {
//     query += ' AND name LIKE ?';
//     params.push(`%${search}%`);
//   }

//   query += ' ORDER BY created_at DESC';

//   const categories = db.prepare(query).all(...params);
//   res.json(categories);
// });


// //
// // GET /api/categories/:id
// //
// router.get('/:id', (req, res) => {
//   const db = req.app.locals.db;

//   const category = db
//     .prepare('SELECT * FROM product_categories WHERE id = ?')
//     .get(req.params.id);

//   if (!category)
//     return res.status(404).json({ error: 'Category not found' });

//   res.json(category);
// });


// //
// // POST /api/categories
// //
// router.post('/', (req, res) => {
//   const db = req.app.locals.db;
//   const { name, description } = req.body;

//   if (!name)
//     return res.status(400).json({ error: 'Category name is required' });

//   try {
//     const result = db
//       .prepare(
//         `INSERT INTO product_categories (name, description)
//          VALUES (?, ?)`
//       )
//       .run(name, description || null);

//     const category = db
//       .prepare('SELECT * FROM product_categories WHERE id = ?')
//       .get(result.lastInsertRowid);

//     res.status(201).json(category);
//   } catch (err) {
//     if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
//       return res.status(400).json({ error: 'Category already exists' });
//     }
//     throw err;
//   }
// });


// //
// // PUT /api/categories/:id
// //
// router.put('/:id', (req, res) => {
//   const db = req.app.locals.db;
//   const { name, description, is_active } = req.body;

//   db.prepare(`
//     UPDATE product_categories
//     SET
//       name = COALESCE(?, name),
//       description = COALESCE(?, description),
//       is_active = COALESCE(?, is_active)
//     WHERE id = ?
//   `).run(name, description, is_active, req.params.id);

//   const updated = db
//     .prepare('SELECT * FROM product_categories WHERE id = ?')
//     .get(req.params.id);

//   if (!updated)
//     return res.status(404).json({ error: 'Category not found' });

//   res.json(updated);
// });

// module.exports = router;
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// GET /api/categories
// Returns only categories that have at least one product in the current mode's types.
// If no products exist yet for a category, it will still show (for new setups).
// We keep it simple: return ALL categories but flag which mode they belong to.
// Categories are shared master data — the product form restricts types by mode.
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { search, active } = req.query;

  let query = 'SELECT * FROM product_categories WHERE 1=1';
  const params = [];

  if (active !== undefined) { query += ' AND is_active = ?'; params.push(active === 'true' ? 1 : 0); }
  if (search) { query += ' AND name LIKE ?'; params.push(`%${search}%`); }
  query += ' ORDER BY created_at DESC';

  res.json(db.prepare(query).all(...params));
});

// GET /api/categories/:id
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const category = db.prepare('SELECT * FROM product_categories WHERE id = ?').get(req.params.id);
  if (!category) return res.status(404).json({ error: 'Category not found' });
  res.json(category);
});

// POST /api/categories
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });
  try {
    const result = db.prepare(`INSERT INTO product_categories (name, description) VALUES (?, ?)`).run(name, description || null);
    res.status(201).json(db.prepare('SELECT * FROM product_categories WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(400).json({ error: 'Category already exists' });
    throw err;
  }
});

// PUT /api/categories/:id
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { name, description, is_active } = req.body;
  db.prepare(`UPDATE product_categories SET
    name=COALESCE(?,name), description=COALESCE(?,description), is_active=COALESCE(?,is_active)
    WHERE id=?`).run(name, description, is_active, req.params.id);
  const updated = db.prepare('SELECT * FROM product_categories WHERE id = ?').get(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  res.json(updated);
});

module.exports = router;