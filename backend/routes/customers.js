const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// GET /api/customers
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const T = req.T;
  
  // OPERATIONS workspace has no customers
  if (req.businessMode === 'OPERATIONS') {
    return res.status(400).json({ error: 'Customers not available in Operations workspace' });
  }
  
  const { search, active } = req.query;
  let query = `SELECT * FROM ${T.customers} WHERE 1=1`;
  const params = [];
  if (active !== undefined) { query += ' AND is_active = ?'; params.push(active === 'true' ? 1 : 0); }
  if (search) { query += ' AND name LIKE ?'; params.push(`%${search}%`); }
  query += ' ORDER BY name';
  res.json(db.prepare(query).all(...params));
});

// GET /api/customers/:id
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const T = req.T;
  
  if (req.businessMode === 'OPERATIONS') {
    return res.status(400).json({ error: 'Customers not available in Operations workspace' });
  }
  
  const customer = db.prepare(`SELECT * FROM ${T.customers} WHERE id = ?`).get(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

// POST /api/customers
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const T = req.T;
  
  if (req.businessMode === 'OPERATIONS') {
    return res.status(400).json({ error: 'Customers not available in Operations workspace' });
  }
  
  const { name, phone, address, credit_limit, opening_balance } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const bal = opening_balance || 0;
  const result = db.prepare(
    `INSERT INTO ${T.customers} (name, phone, address, credit_limit, opening_balance, current_balance) VALUES (?,?,?,?,?,?)`
  ).run(name, phone, address, credit_limit || 0, bal, bal);

  if (bal > 0) {
    db.prepare(`INSERT INTO ${T.customer_ledger} (customer_id, type, description, debit, balance) VALUES (?,?,?,?,?)`)
      .run(result.lastInsertRowid, 'OPENING', 'Opening balance', bal, bal);
  }
  res.status(201).json(db.prepare(`SELECT * FROM ${T.customers} WHERE id = ?`).get(result.lastInsertRowid));
});

// PUT /api/customers/:id
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const T = req.T;
  
  if (req.businessMode === 'OPERATIONS') {
    return res.status(400).json({ error: 'Customers not available in Operations workspace' });
  }
  
  const { name, phone, address, credit_limit, is_active } = req.body;
  db.prepare(`UPDATE ${T.customers} SET name=COALESCE(?,name), phone=COALESCE(?,phone),
    address=COALESCE(?,address), credit_limit=COALESCE(?,credit_limit),
    is_active=COALESCE(?,is_active) WHERE id=?`
  ).run(name, phone, address, credit_limit, is_active, req.params.id);
  res.json(db.prepare(`SELECT * FROM ${T.customers} WHERE id = ?`).get(req.params.id));
});

// GET /api/customers/:id/ledger
router.get('/:id/ledger', (req, res) => {
  const db = req.app.locals.db;
  const T = req.T;
  
  if (req.businessMode === 'OPERATIONS') {
    return res.status(400).json({ error: 'Customers not available in Operations workspace' });
  }
  
  res.json(db.prepare(`SELECT * FROM ${T.customer_ledger} WHERE customer_id = ? ORDER BY created_at DESC`).all(req.params.id));
});

// POST /api/customers/:id/payment
router.post('/:id/payment', (req, res) => {
  const db = req.app.locals.db;
  const T = req.T;
  
  if (req.businessMode === 'OPERATIONS') {
    return res.status(400).json({ error: 'Customers not available in Operations workspace' });
  }
  
  const { amount, description, date } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount required' });

  const txn = db.transaction(() => {
    const customer = db.prepare(`SELECT * FROM ${T.customers} WHERE id = ?`).get(req.params.id);
    const newBalance = customer.current_balance - amount;
    db.prepare(`UPDATE ${T.customers} SET current_balance = ? WHERE id = ?`).run(newBalance, req.params.id);
    db.prepare(`INSERT INTO ${T.customer_ledger} (customer_id, date, type, description, credit, balance) VALUES (?,?,?,?,?,?)`)
      .run(req.params.id, date || new Date().toISOString().split('T')[0], 'PAYMENT', description || 'Payment received', amount, newBalance);
    return db.prepare(`SELECT * FROM ${T.customers} WHERE id = ?`).get(req.params.id);
  });
  res.json(txn());
});

module.exports = router;
