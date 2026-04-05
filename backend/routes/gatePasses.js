
// const router = require('express').Router();
// const { authenticate } = require('../middlewares/auth');

// router.use(authenticate);

// // GET /api/gate-passes
// router.get('/', (req, res) => {
//   const db = req.app.locals.db;
//   const { from_date, to_date } = req.query;
//   let query = `SELECT gp.*, s.sale_number, c.name as customer_name
//     FROM gate_passes gp JOIN sales s ON gp.sale_id = s.id JOIN customers c ON s.customer_id = c.id WHERE 1=1`;
//   const params = [];
//   if (from_date) { query += ' AND gp.date >= ?'; params.push(from_date); }
//   if (to_date) { query += ' AND gp.date <= ?'; params.push(to_date); }
//   query += ' ORDER BY gp.created_at DESC';
//   res.json(db.prepare(query).all(...params));
// });

// // GET /api/gate-passes/:id
// router.get('/:id', (req, res) => {
//   const db = req.app.locals.db;
//   const gp = db.prepare(`SELECT gp.*, s.sale_number, s.net_amount, c.name as customer_name, c.phone as customer_phone
//     FROM gate_passes gp JOIN sales s ON gp.sale_id = s.id JOIN customers c ON s.customer_id = c.id WHERE gp.id = ?`).get(req.params.id);
//   if (!gp) return res.status(404).json({ error: 'Gate pass not found' });
//   const saleItems = db.prepare(`SELECT si.*, p.name as product_name, l.lot_number
//     FROM sale_items si JOIN products p ON si.product_id = p.id JOIN lots l ON si.lot_id = l.id WHERE si.sale_id = ?`).all(gp.sale_id);
//   res.json({ ...gp, items: saleItems });
// });

// // PUT /api/gate-passes/:id/verify
// router.put('/:id/verify', (req, res) => {
//   const db = req.app.locals.db;
//   const { verified_by, vehicle_number, notes } = req.body;
//   if (!verified_by) return res.status(400).json({ error: 'verified_by required' });
//   if (!vehicle_number) return res.status(400).json({ error: 'vehicle_number required' });
//   db.prepare('UPDATE gate_passes SET verified_by = ?, vehicle_number = ?, notes = ? WHERE id = ?')
//     .run(verified_by, vehicle_number, notes, req.params.id);
//   db.prepare('UPDATE sales SET status = ? WHERE id = (SELECT sale_id FROM gate_passes WHERE id = ?)').run('DISPATCHED', req.params.id);
//   res.json(db.prepare('SELECT * FROM gate_passes WHERE id = ?').get(req.params.id));
// });

// module.exports = router;


const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
router.use(authenticate);
router.get('/', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  res.json(db.prepare(`SELECT gp.*, s.sale_number, c.name as customer_name FROM ${T.gate_passes} gp
    JOIN ${T.sales} s ON gp.sale_id=s.id JOIN ${T.customers} c ON s.customer_id=c.id ORDER BY gp.created_at DESC`).all());
});
router.get('/:id', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  const gp = db.prepare(`SELECT gp.*, s.sale_number, c.name as customer_name FROM ${T.gate_passes} gp
    JOIN ${T.sales} s ON gp.sale_id=s.id JOIN ${T.customers} c ON s.customer_id=c.id WHERE gp.id=?`).get(req.params.id);
  if (!gp) return res.status(404).json({ error: 'Gate pass not found' });
  // Fetch sale items with lot info and quantity sold — frontend uses 'items' key
  const items = db.prepare(`SELECT si.id, si.quantity, si.amount, p.name as product_name, p.unit as unit, l.lot_number, l.id as lot_id
    FROM ${T.sale_items} si
    JOIN ${T.products} p ON si.product_id = p.id
    JOIN ${T.lots} l ON si.lot_id = l.id
    WHERE si.sale_id = ?`).all(gp.sale_id);
  res.json({ ...gp, items });
});
router.put('/:id/verify', (req, res) => {
  const db = req.app.locals.db; const T = req.T;
  const { verified_by, vehicle_number, notes } = req.body;
  if (!verified_by) return res.status(400).json({ error: 'verified_by is required' });
  if (!vehicle_number) return res.status(400).json({ error: 'vehicle_number is required' });
  db.prepare(`UPDATE ${T.gate_passes} SET verified_by=?, vehicle_number=?, notes=COALESCE(?,notes) WHERE id=?`)
    .run(verified_by, vehicle_number, notes, req.params.id);
  // Mark sale as DISPATCHED
  db.prepare(`UPDATE ${T.sales} SET status='DISPATCHED' WHERE id=(SELECT sale_id FROM ${T.gate_passes} WHERE id=?)`)
    .run(req.params.id);
  res.json(db.prepare(`SELECT * FROM ${T.gate_passes} WHERE id=?`).get(req.params.id));
});
module.exports = router;