// const router = require('express').Router();
// const { authenticate } = require('../middlewares/auth');

// router.use(authenticate);

// // GET /api/wastage
// router.get('/', (req, res) => {
//   const db = req.app.locals.db;
//   const { process_stage, from_date, to_date, lot_id } = req.query;
//   let query = `SELECT w.*, l.lot_number, p.name as product_name
//     FROM wastage w JOIN lots l ON w.lot_id = l.id JOIN products p ON l.product_id = p.id WHERE 1=1`;
//   const params = [];
//   if (process_stage) { query += ' AND w.process_stage = ?'; params.push(process_stage); }
//   if (from_date) { query += ' AND w.date >= ?'; params.push(from_date); }
//   if (to_date) { query += ' AND w.date <= ?'; params.push(to_date); }
//   if (lot_id) { query += ' AND w.lot_id = ?'; params.push(lot_id); }
//   query += ' ORDER BY w.created_at DESC';
//   res.json(db.prepare(query).all(...params));
// });

// // GET /api/wastage/summary
// router.get('/summary', (req, res) => {
//   const db = req.app.locals.db;
//   const { from_date, to_date } = req.query;
//   let dateFilter = '';
//   const params = [];
//   if (from_date) { dateFilter += ' AND date >= ?'; params.push(from_date); }
//   if (to_date) { dateFilter += ' AND date <= ?'; params.push(to_date); }

//   const byStage = db.prepare(`
//     SELECT process_stage, COUNT(*) as count, SUM(wastage_amount) as total_wastage,
//       SUM(wastage_cost) as total_cost, AVG(wastage_percentage) as avg_percentage
//     FROM wastage WHERE 1=1 ${dateFilter} GROUP BY process_stage
//   `).all(...params);

//   const total = db.prepare(`
//     SELECT COUNT(*) as count, SUM(wastage_amount) as total_wastage,
//       SUM(wastage_cost) as total_cost, AVG(wastage_percentage) as avg_percentage
//     FROM wastage WHERE 1=1 ${dateFilter}
//   `).get(...params);

//   res.json({ by_stage: byStage, total });
// });

// module.exports = router;
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
router.use(authenticate);
router.get('/', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  res.json(db.prepare(`SELECT w.*, l.lot_number, p.name as product_name, p.unit
    FROM ${T.wastage} w
    JOIN ${T.lots} l ON w.lot_id=l.id
    JOIN ${T.products} p ON l.product_id=p.id
    ORDER BY w.created_at DESC`).all());
});
router.get('/summary', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  const total = db.prepare(`SELECT COALESCE(SUM(wastage_amount),0) as total_wastage,
    COALESCE(SUM(wastage_cost),0) as total_cost, COALESCE(AVG(wastage_percentage),0) as avg_percentage FROM ${T.wastage}`).get();
  const by_stage = db.prepare(`SELECT process_stage, COALESCE(SUM(wastage_amount),0) as total_wastage,
    COALESCE(SUM(wastage_cost),0) as total_cost FROM ${T.wastage} GROUP BY process_stage`).all();
  const latestUnit = db.prepare(`SELECT p.unit
    FROM ${T.wastage} w
    JOIN ${T.lots} l ON w.lot_id=l.id
    JOIN ${T.products} p ON l.product_id=p.id
    ORDER BY w.created_at DESC
    LIMIT 1`).get();
  res.json({ total, by_stage, unit: latestUnit?.unit || null });
});
module.exports = router;