// require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const { initializeDatabase } = require('./config/database');
// const { errorHandler } = require('./middlewares/errorHandler');
// const { auditMiddleware, logAction } = require('./middlewares/auditLogger');

// const app = express();
// const PORT = process.env.NODE_PORT || 8002;

// app.use(helmet({ contentSecurityPolicy: false }));
// app.use(cors({ origin: '*', credentials: true }));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// // Initialize database
// const db = initializeDatabase();
// app.locals.db = db;

// // Audit middleware — auto-log all write operations
// app.use(auditMiddleware);

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/categories', require('./routes/categories'));
// app.use('/api/products', require('./routes/products'));
// app.use('/api/lots', require('./routes/lots'));
// app.use('/api/inventory', require('./routes/inventory'));
// app.use('/api/suppliers', require('./routes/suppliers'));
// app.use('/api/customers', require('./routes/customers'));
// app.use('/api/purchases', require('./routes/purchases'));
// app.use('/api/manufacturing', require('./routes/manufacturing'));
// app.use('/api/wastage', require('./routes/wastage'));
// app.use('/api/sales', require('./routes/sales'));
// app.use('/api/gate-passes', require('./routes/gatePasses'));
// app.use('/api/employees', require('./routes/employees'));
// app.use('/api/attendance', require('./routes/attendance'));
// app.use('/api/payroll', require('./routes/payroll'));
// app.use('/api/finance', require('./routes/finance'));
// app.use('/api/dashboard', require('./routes/dashboard'));
// app.use('/api/audit-logs', require('./routes/auditLogs'));
// app.use('/api/purchase-returns', require('./routes/purchaseReturns'));
// app.use('/api/sale-returns',     require('./routes/saleReturns'));
// // Health check
// app.get('/api/', (req, res) => {
//   res.json({ message: 'YarnChem ERP API v1.0 — Online', status: 'ok', timestamp: new Date().toISOString() });
// });

// app.use(errorHandler);

// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`YarnChem ERP Backend running on port ${PORT}`);
// });

// module.exports = app;
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const { initializeDatabase }        = require('./config/database');
const { errorHandler }              = require('./middlewares/errorHandler');
const { auditMiddleware }           = require('./middlewares/auditLogger');
const { businessMode }              = require('./middlewares/businessMode');

const app  = express();
const PORT = process.env.NODE_PORT || 8002;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const db = initializeDatabase();
app.locals.db = db;

app.use(auditMiddleware);

// ── Auth (no mode needed) ────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));

// ── Shared routes (same data for both workspaces) ────────────────────────────
app.use('/api/categories',  require('./routes/categories'));
app.use('/api/employees',   require('./routes/employees'));
app.use('/api/attendance',  require('./routes/attendance'));
app.use('/api/payroll',     require('./routes/payroll'));
app.use('/api/finance',     require('./routes/finance'));
app.use('/api/audit-logs',  require('./routes/auditLogs'));

// ── Workspace routes (businessMode middleware selects yarn_ or chem_ tables) ─
app.use('/api/suppliers',        businessMode, require('./routes/suppliers'));
app.use('/api/customers',        businessMode, require('./routes/customers'));
app.use('/api/products',         businessMode, require('./routes/products'));
app.use('/api/lots',             businessMode, require('./routes/lots'));
app.use('/api/inventory',        businessMode, require('./routes/inventory'));
app.use('/api/purchases',        businessMode, require('./routes/purchases'));
app.use('/api/purchase-returns', businessMode, require('./routes/purchaseReturns'));
app.use('/api/sales',            businessMode, require('./routes/sales'));
app.use('/api/sale-returns',     businessMode, require('./routes/saleReturns'));
app.use('/api/manufacturing',    businessMode, require('./routes/manufacturing'));
app.use('/api/wastage',          businessMode, require('./routes/wastage'));
app.use('/api/gate-passes',      businessMode, require('./routes/gatePasses'));
app.use('/api/dashboard',        businessMode, require('./routes/dashboard'));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/', (req, res) => {
  res.json({ message: 'GH & Sons ERP API — Online', status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GH & Sons ERP Backend running on port ${PORT}`);
});

module.exports = app;