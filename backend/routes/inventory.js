// // const router = require('express').Router();
// // const { authenticate } = require('../middlewares/auth');

// // router.use(authenticate);

// // // GET /api/inventory — full inventory with product and lot info
// // router.get('/', (req, res) => {
// //   const db = req.app.locals.db;
// //   const { location, product_id, low_stock } = req.query;
// //   let query = `SELECT i.*, p.name as product_name, p.type as product_type, p.min_stock_level, p.category_id,
// //     l.lot_number, l.status as lot_status, l.shade_code, l.chemical_code
// //     FROM inventory i 
// //     JOIN products p ON i.product_id = p.id
// //     JOIN lots l ON i.lot_id = l.id WHERE i.quantity > 0`;
// //   const params = [];
// //   if (location) { query += ' AND i.location = ?'; params.push(location); }
// //   if (product_id) { query += ' AND i.product_id = ?'; params.push(product_id); }
// //   query += ' ORDER BY p.name, l.lot_number';
// //   let results = db.prepare(query).all(...params);
  
// //   if (low_stock === 'true') {
// //     results = results.filter(r => r.quantity <= r.min_stock_level && r.min_stock_level > 0);
// //   }
// //   res.json(results);
// // });

// // // GET /api/inventory/summary — aggregated stock by product
// // router.get('/summary', (req, res) => {
// //   const db = req.app.locals.db;
// //   const summary = db.prepare(`
// //     SELECT p.id, p.name, p.type, p.unit, p.min_stock_level, p.category_id,
// //       SUM(i.quantity) as total_quantity,
// //       COUNT(DISTINCT i.lot_id) as lot_count,
// //       GROUP_CONCAT(DISTINCT i.location) as locations
// //     FROM products p
// //     LEFT JOIN inventory i ON p.id = i.product_id AND i.quantity > 0
// //     WHERE p.is_active = 1
// //     GROUP BY p.id ORDER BY p.name
// //   `).all();
// //   res.json(summary);
// // });

// // // GET /api/inventory/low-stock
// // router.get('/low-stock', (req, res) => {
// //   const db = req.app.locals.db;
// //   const alerts = db.prepare(`
// //     SELECT p.id, p.name, p.type, p.min_stock_level, p.unit,
// //       COALESCE(SUM(i.quantity), 0) as total_quantity
// //     FROM products p
// //     LEFT JOIN inventory i ON p.id = i.product_id AND i.quantity > 0
// //     WHERE p.is_active = 1 AND p.min_stock_level > 0
// //     GROUP BY p.id
// //     HAVING total_quantity <= p.min_stock_level
// //     ORDER BY (total_quantity / p.min_stock_level) ASC
// //   `).all();
// //   res.json(alerts);
// // });

// // // GET /api/inventory/by-location
// // router.get('/by-location', (req, res) => {
// //   const db = req.app.locals.db;
// //   const locations = ['STORE', 'DYEING', 'FINISHED_STORE', 'CHEMICAL_STORE'];
// //   const result = {};
// //   locations.forEach(loc => {
// //     result[loc] = db.prepare(`
// //       SELECT p.name, p.type, l.lot_number, i.quantity, i.unit
// //       FROM inventory i JOIN products p ON i.product_id = p.id JOIN lots l ON i.lot_id = l.id
// //       WHERE i.location = ? AND i.quantity > 0 ORDER BY p.name
// //     `).all(loc);
// //   });
// //   res.json(result);
// // });

// // module.exports = router;
// const router = require('express').Router();
// const { authenticate } = require('../middlewares/auth');
// router.use(authenticate);

// router.get('/', (req, res) => {
//   const db = req.app.locals.db; const T = req.T;
//   const { search, category_id, location } = req.query;
//   // yarn_lots has shade_code but not chemical_code; chem_lots has chemical_code but not shade_code
//   const shadeCol    = req.businessMode === 'YARN' ? 'l.shade_code'    : 'NULL as shade_code';
//   const chemCol     = req.businessMode === 'CHEMICAL' ? 'l.chemical_code' : 'NULL as chemical_code';
//   let sql = `SELECT i.*, p.name as product_name, p.type as product_type,
//       p.min_stock_level, p.unit, c.name as category_name, l.lot_number, ${shadeCol}, ${chemCol}
//     FROM ${T.inventory} i JOIN ${T.products} p ON i.product_id = p.id
//     JOIN ${T.lots} l ON i.lot_id = l.id
//     LEFT JOIN product_categories c ON p.category_id = c.id WHERE 1=1`;
//   const params = [];
//   if (search)      { sql += ' AND p.name LIKE ?';     params.push(`%${search}%`); }
//   if (category_id) { sql += ' AND p.category_id = ?'; params.push(category_id); }
//   if (location)    { sql += ' AND i.location = ?';    params.push(location); }
//   sql += ' ORDER BY p.name, l.lot_number';
//   res.json(db.prepare(sql).all(...params));
// });

// router.get('/summary', (req, res) => {
//   const db = req.app.locals.db; const T = req.T;
//   res.json(db.prepare(`SELECT p.id, p.name, p.type, p.unit, p.min_stock_level,
//     COALESCE(SUM(i.quantity),0) as total_quantity, COALESCE(SUM(i.quantity * l.cost_per_unit),0) as total_value
//     FROM ${T.products} p LEFT JOIN ${T.inventory} i ON p.id = i.product_id
//     LEFT JOIN ${T.lots} l ON i.lot_id = l.id GROUP BY p.id ORDER BY p.name`).all());
// });

// router.get('/low-stock', (req, res) => {
//   const db = req.app.locals.db; const T = req.T;
//   res.json(db.prepare(`SELECT p.id, p.name, p.type, p.unit, p.min_stock_level,
//     COALESCE(SUM(i.quantity),0) as total_quantity
//     FROM ${T.products} p LEFT JOIN ${T.inventory} i ON p.id = i.product_id
//     WHERE p.min_stock_level > 0 GROUP BY p.id HAVING total_quantity < p.min_stock_level
//     ORDER BY total_quantity ASC`).all());
// });

// router.get('/by-location', (req, res) => {
//   const db = req.app.locals.db; const T = req.T;
//   const shadeCol = req.businessMode === 'YARN' ? 'l.shade_code' : 'NULL as shade_code';
//   const chemCol  = req.businessMode === 'CHEMICAL' ? 'l.chemical_code' : 'NULL as chemical_code';
//   res.json(db.prepare(`SELECT i.location, p.id as product_id, p.name as product_name,
//     p.type, l.lot_number, ${shadeCol}, ${chemCol}, i.quantity, p.unit
//     FROM ${T.inventory} i JOIN ${T.products} p ON i.product_id = p.id
//     JOIN ${T.lots} l ON i.lot_id = l.id ORDER BY i.location, p.name`).all());
// });
// module.exports = router;
// const router = require('express').Router();
// const { authenticate } = require('../middlewares/auth');

// router.use(authenticate);

// // GET /api/inventory — full inventory with product and lot info
// router.get('/', (req, res) => {
//   const db = req.app.locals.db;
//   const { location, product_id, low_stock } = req.query;
//   let query = `SELECT i.*, p.name as product_name, p.type as product_type, p.min_stock_level, p.category_id,
//     l.lot_number, l.status as lot_status, l.shade_code, l.chemical_code
//     FROM inventory i 
//     JOIN products p ON i.product_id = p.id
//     JOIN lots l ON i.lot_id = l.id WHERE i.quantity > 0`;
//   const params = [];
//   if (location) { query += ' AND i.location = ?'; params.push(location); }
//   if (product_id) { query += ' AND i.product_id = ?'; params.push(product_id); }
//   query += ' ORDER BY p.name, l.lot_number';
//   let results = db.prepare(query).all(...params);
  
//   if (low_stock === 'true') {
//     results = results.filter(r => r.quantity <= r.min_stock_level && r.min_stock_level > 0);
//   }
//   res.json(results);
// });

// // GET /api/inventory/summary — aggregated stock by product
// router.get('/summary', (req, res) => {
//   const db = req.app.locals.db;
//   const summary = db.prepare(`
//     SELECT p.id, p.name, p.type, p.unit, p.min_stock_level, p.category_id,
//       SUM(i.quantity) as total_quantity,
//       COUNT(DISTINCT i.lot_id) as lot_count,
//       GROUP_CONCAT(DISTINCT i.location) as locations
//     FROM products p
//     LEFT JOIN inventory i ON p.id = i.product_id AND i.quantity > 0
//     WHERE p.is_active = 1
//     GROUP BY p.id ORDER BY p.name
//   `).all();
//   res.json(summary);
// });

// // GET /api/inventory/low-stock
// router.get('/low-stock', (req, res) => {
//   const db = req.app.locals.db;
//   const alerts = db.prepare(`
//     SELECT p.id, p.name, p.type, p.min_stock_level, p.unit,
//       COALESCE(SUM(i.quantity), 0) as total_quantity
//     FROM products p
//     LEFT JOIN inventory i ON p.id = i.product_id AND i.quantity > 0
//     WHERE p.is_active = 1 AND p.min_stock_level > 0
//     GROUP BY p.id
//     HAVING total_quantity <= p.min_stock_level
//     ORDER BY (total_quantity / p.min_stock_level) ASC
//   `).all();
//   res.json(alerts);
// });

// // GET /api/inventory/by-location
// router.get('/by-location', (req, res) => {
//   const db = req.app.locals.db;
//   const locations = ['STORE', 'DYEING', 'FINISHED_STORE', 'CHEMICAL_STORE'];
//   const result = {};
//   locations.forEach(loc => {
//     result[loc] = db.prepare(`
//       SELECT p.name, p.type, l.lot_number, i.quantity, i.unit
//       FROM inventory i JOIN products p ON i.product_id = p.id JOIN lots l ON i.lot_id = l.id
//       WHERE i.location = ? AND i.quantity > 0 ORDER BY p.name
//     `).all(loc);
//   });
//   res.json(result);
// });

// module.exports = router;
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
router.use(authenticate);

router.get('/', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  const { search, category_id, location } = req.query;
  // yarn_lots has shade_code but not chemical_code; chem_lots has chemical_code but not shade_code
  const shadeCol    = req.businessMode === 'YARN' ? 'l.shade_code'    : 'NULL as shade_code';
  const chemCol     = req.businessMode === 'CHEMICAL' ? 'l.chemical_code' : 'NULL as chemical_code';
  let sql = `SELECT i.*, p.name as product_name, p.type as product_type,
      p.min_stock_level, p.unit, c.name as category_name, l.lot_number, ${shadeCol}, ${chemCol}
    FROM ${T.inventory} i JOIN ${T.products} p ON i.product_id = p.id
    JOIN ${T.lots} l ON i.lot_id = l.id
    LEFT JOIN product_categories c ON p.category_id = c.id WHERE 1=1`;
  const params = [];
  if (search)      { sql += ' AND p.name LIKE ?';     params.push(`%${search}%`); }
  if (category_id) { sql += ' AND p.category_id = ?'; params.push(category_id); }
  if (location)    { sql += ' AND i.location = ?';    params.push(location); }
  sql += ' ORDER BY p.name, l.lot_number';
  res.json(db.prepare(sql).all(...params));
});

router.get('/summary', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  res.json(db.prepare(`SELECT p.id, p.name, p.type, p.unit, p.min_stock_level, p.category_id,
    c.name as category_name,
    COALESCE(SUM(i.quantity),0) as total_quantity, COALESCE(SUM(i.quantity * l.cost_per_unit),0) as total_value
    FROM ${T.products} p LEFT JOIN ${T.inventory} i ON p.id = i.product_id
    LEFT JOIN ${T.lots} l ON i.lot_id = l.id
    LEFT JOIN product_categories c ON p.category_id = c.id
    GROUP BY p.id ORDER BY p.name`).all());
});

router.get('/low-stock', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  res.json(db.prepare(`SELECT p.id, p.name, p.type, p.unit, p.min_stock_level,
    COALESCE(SUM(i.quantity),0) as total_quantity
    FROM ${T.products} p LEFT JOIN ${T.inventory} i ON p.id = i.product_id
    WHERE p.min_stock_level > 0 GROUP BY p.id HAVING total_quantity < p.min_stock_level
    ORDER BY total_quantity ASC`).all());
});

router.get('/by-location', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  const shadeCol = req.businessMode === 'YARN' ? 'l.shade_code' : 'NULL as shade_code';
  const chemCol  = req.businessMode === 'CHEMICAL' ? 'l.chemical_code' : 'NULL as chemical_code';
  res.json(db.prepare(`SELECT i.location, p.id as product_id, p.name as product_name,
    p.type, l.lot_number, ${shadeCol}, ${chemCol}, i.quantity, p.unit
    FROM ${T.inventory} i JOIN ${T.products} p ON i.product_id = p.id
    JOIN ${T.lots} l ON i.lot_id = l.id ORDER BY i.location, p.name`).all());
});
module.exports = router;