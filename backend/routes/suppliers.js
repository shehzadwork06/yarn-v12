const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// GET /api/suppliers
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const T = req.T;
  
  // OPERATIONS workspace has no suppliers
  if (req.businessMode === 'OPERATIONS') {
    return res.status(400).json({ error: 'Suppliers not available in Operations workspace' });
  }
  
  const { search, active } = req.query;
  let query = `SELECT * FROM ${T.suppliers} WHERE 1=1`;
  const params = [];
  if (active !== undefined) { query += ' AND is_active = ?'; params.push(active === 'true' ? 1 : 0); }
  if (search) { query += ' AND name LIKE ?'; params.push(`%${search}%`); }
  query += ' ORDER BY name';
  res.json(db.prepare(query).all(...params));
});

// GET /api/suppliers/:id
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const T = req.T;
  
  if (req.businessMode === 'OPERATIONS') {
    return res.status(400).json({ error: 'Suppliers not available in Operations workspace' });
  }
  
  const supplier = db.prepare(`SELECT * FROM ${T.suppliers} WHERE id = ?`).get(req.params.id);
  if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
  res.json(supplier);
});

// POST /api/suppliers
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const T = req.T;
  
  if (req.businessMode === 'OPERATIONS') {
    return res.status(400).json({ error: 'Suppliers not available in Operations workspace' });
  }
  
  const { name, phone, address, credit_terms, opening_balance } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const bal = opening_balance || 0;
  const result = db.prepare(
    `INSERT INTO ${T.suppliers} (name, phone, address, credit_terms, opening_balance, current_balance) VALUES (?,?,?,?,?,?)`
  ).run(name, phone, address, credit_terms, bal, bal);

  if (bal > 0) {
    db.prepare(`INSERT INTO ${T.supplier_ledger} (supplier_id, type, description, debit, balance) VALUES (?,?,?,?,?)`)
      .run(result.lastInsertRowid, 'OPENING', 'Opening balance', bal, bal);
  }
  res.status(201).json(db.prepare(`SELECT * FROM ${T.suppliers} WHERE id = ?`).get(result.lastInsertRowid));
});

// PUT /api/suppliers/:id
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const T = req.T;
  
  if (req.businessMode === 'OPERATIONS') {
    return res.status(400).json({ error: 'Suppliers not available in Operations workspace' });
  }
  
  const { name, phone, address, credit_terms, is_active } = req.body;
  db.prepare(`UPDATE ${T.suppliers} SET name=COALESCE(?,name), phone=COALESCE(?,phone),
    address=COALESCE(?,address), credit_terms=COALESCE(?,credit_terms),
    is_active=COALESCE(?,is_active) WHERE id=?`
  ).run(name, phone, address, credit_terms, is_active, req.params.id);
  res.json(db.prepare(`SELECT * FROM ${T.suppliers} WHERE id = ?`).get(req.params.id));
});

// GET /api/suppliers/:id/ledger
router.get('/:id/ledger', (req, res) => {
  const db = req.app.locals.db;
  const T = req.T;
  
  if (req.businessMode === 'OPERATIONS') {
    return res.status(400).json({ error: 'Suppliers not available in Operations workspace' });
  }
  
  res.json(db.prepare(`SELECT * FROM ${T.supplier_ledger} WHERE supplier_id = ? ORDER BY created_at DESC`).all(req.params.id));
});

// POST /api/suppliers/:id/payment
router.post('/:id/payment', (req, res) => {
  const db = req.app.locals.db;
  const T = req.T;
  
  if (req.businessMode === 'OPERATIONS') {
    return res.status(400).json({ error: 'Suppliers not available in Operations workspace' });
  }
  
  const { amount, description, date } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount required' });

  const txn = db.transaction(() => {
    const supplier = db.prepare(`SELECT * FROM ${T.suppliers} WHERE id = ?`).get(req.params.id);
    const newBalance = supplier.current_balance - amount;
    db.prepare(`UPDATE ${T.suppliers} SET current_balance = ? WHERE id = ?`).run(newBalance, req.params.id);
    db.prepare(`INSERT INTO ${T.supplier_ledger} (supplier_id, date, type, description, credit, balance) VALUES (?,?,?,?,?,?)`)
      .run(req.params.id, date || new Date().toISOString().split('T')[0], 'PAYMENT', description || 'Payment', amount, newBalance);
    return db.prepare(`SELECT * FROM ${T.suppliers} WHERE id = ?`).get(req.params.id);
  });
  res.json(txn());
});

module.exports = router;
