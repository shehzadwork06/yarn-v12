// const router = require('express').Router();
// const { authenticate } = require('../middlewares/auth');

// router.use(authenticate);

// // GET /api/employees
// router.get('/', (req, res) => {
//   const db = req.app.locals.db;
//   const { department, active, search } = req.query;
//   let query = 'SELECT * FROM employees WHERE 1=1';
//   const params = [];
//   if (department) { query += ' AND department = ?'; params.push(department); }
//   if (active !== undefined) { query += ' AND is_active = ?'; params.push(active === 'true' ? 1 : 0); }
//   if (search) { query += ' AND (name LIKE ? OR employee_code LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
//   query += ' ORDER BY name';
//   res.json(db.prepare(query).all(...params));
// });

// // GET /api/employees/:id
// router.get('/:id', (req, res) => {
//   const db = req.app.locals.db;
//   const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
//   if (!emp) return res.status(404).json({ error: 'Employee not found' });
//   const loans = db.prepare('SELECT * FROM loans WHERE employee_id = ? ORDER BY created_at DESC').all(emp.id);
//   res.json({ ...emp, loans });
// });

// // POST /api/employees
// router.post('/', (req, res) => {
//   const db = req.app.locals.db;
//   const { name, phone, address, designation, department, basic_salary, joining_date } = req.body;
//   if (!name) return res.status(400).json({ error: 'Name required' });
//   const code = `EMP-${Date.now().toString(36).toUpperCase()}`;
//   const result = db.prepare(
//     'INSERT INTO employees (employee_code, name, phone, address, designation, department, basic_salary, joining_date) VALUES (?,?,?,?,?,?,?,?)'
//   ).run(code, name, phone, address, designation, department, basic_salary || 0, joining_date);
//   res.status(201).json(db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid));
// });

// // PUT /api/employees/:id
// router.put('/:id', (req, res) => {
//   const db = req.app.locals.db;
//   const { name, phone, address, designation, department, basic_salary, is_active } = req.body;
//   db.prepare(`UPDATE employees SET name=COALESCE(?,name), phone=COALESCE(?,phone), address=COALESCE(?,address),
//     designation=COALESCE(?,designation), department=COALESCE(?,department),
//     basic_salary=COALESCE(?,basic_salary), is_active=COALESCE(?,is_active) WHERE id=?`)
//     .run(name, phone, address, designation, department, basic_salary, is_active, req.params.id);
//   res.json(db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id));
// });

// // POST /api/employees/:id/loan
// router.post('/:id/loan', (req, res) => {
//   const db = req.app.locals.db;
//   const { amount, monthly_deduction, notes } = req.body;
//   if (!amount || !monthly_deduction) return res.status(400).json({ error: 'Amount and monthly_deduction required' });
//   const result = db.prepare(
//     'INSERT INTO loans (employee_id, amount, monthly_deduction, remaining, notes) VALUES (?,?,?,?,?)'
//   ).run(req.params.id, amount, monthly_deduction, amount, notes);
//   res.status(201).json(db.prepare('SELECT * FROM loans WHERE id = ?').get(result.lastInsertRowid));
// });

// // GET /api/employees/:id/loans
// router.get('/:id/loans', (req, res) => {
//   const db = req.app.locals.db;
//   res.json(db.prepare('SELECT * FROM loans WHERE employee_id = ? ORDER BY created_at DESC').all(req.params.id));
// });

// module.exports = router;
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// GET /api/employees
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { department, active, search } = req.query;
  let query = 'SELECT * FROM employees WHERE 1=1';
  const params = [];
  if (department) { query += ' AND department = ?'; params.push(department); }
  if (active !== undefined) { query += ' AND is_active = ?'; params.push(active === 'true' ? 1 : 0); }
  if (search) { query += ' AND (name LIKE ? OR employee_code LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY name';
  res.json(db.prepare(query).all(...params));
});

// GET /api/employees/:id
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  const loans = db.prepare('SELECT * FROM loans WHERE employee_id = ? ORDER BY created_at DESC').all(emp.id);
  res.json({ ...emp, loans });
});

// POST /api/employees
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { name, phone, address, designation, department, basic_salary, joining_date } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const code = `EMP-${Date.now().toString(36).toUpperCase()}`;
  const result = db.prepare(
    'INSERT INTO employees (employee_code, name, phone, address, designation, department, basic_salary, joining_date) VALUES (?,?,?,?,?,?,?,?)'
  ).run(code, name, phone, address, designation, department, basic_salary || 0, joining_date);
  res.status(201).json(db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid));
});

// PUT /api/employees/:id
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { name, phone, address, designation, department, basic_salary, joining_date, is_active } = req.body;
  db.prepare(`UPDATE employees SET
    name=COALESCE(?,name), phone=COALESCE(?,phone), address=COALESCE(?,address),
    designation=COALESCE(?,designation), department=COALESCE(?,department),
    basic_salary=COALESCE(?,basic_salary), joining_date=COALESCE(?,joining_date),
    is_active=COALESCE(?,is_active) WHERE id=?`)
    .run(name, phone, address, designation, department, basic_salary, joining_date, is_active, req.params.id);
  res.json(db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id));
});

// POST /api/employees/:id/loan
router.post('/:id/loan', (req, res) => {
  const db = req.app.locals.db;
  const { amount, monthly_deduction, notes } = req.body;
  if (!amount || !monthly_deduction) return res.status(400).json({ error: 'Amount and monthly_deduction required' });
  const result = db.prepare(
    'INSERT INTO loans (employee_id, amount, monthly_deduction, remaining, notes) VALUES (?,?,?,?,?)'
  ).run(req.params.id, amount, monthly_deduction, amount, notes);
  res.status(201).json(db.prepare('SELECT * FROM loans WHERE id = ?').get(result.lastInsertRowid));
});

// GET /api/employees/:id/loans
router.get('/:id/loans', (req, res) => {
  const db = req.app.locals.db;
  res.json(db.prepare('SELECT * FROM loans WHERE employee_id = ? ORDER BY created_at DESC').all(req.params.id));
});

module.exports = router;