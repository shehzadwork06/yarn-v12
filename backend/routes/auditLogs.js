const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// GET /api/audit-logs — List all audit logs (paginated, filterable)
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { module, action, username, entity_type, from_date, to_date, search, page, limit } = req.query;
  const pg = parseInt(page) || 1;
  const lm = Math.min(parseInt(limit) || 50, 200);
  const offset = (pg - 1) * lm;

  let where = 'WHERE 1=1';
  const params = [];
  if (module) { where += ' AND module = ?'; params.push(module.toUpperCase()); }
  if (action) { where += ' AND action = ?'; params.push(action); }
  if (username) { where += ' AND username = ?'; params.push(username); }
  if (entity_type) { where += ' AND entity_type = ?'; params.push(entity_type); }
  if (from_date) { where += " AND date(timestamp) >= ?"; params.push(from_date); }
  if (to_date) { where += " AND date(timestamp) <= ?"; params.push(to_date); }
  if (search) { where += ' AND (description LIKE ? OR details LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const total = db.prepare(`SELECT COUNT(*) as count FROM audit_logs ${where}`).get(...params).count;
  const logs = db.prepare(`SELECT * FROM audit_logs ${where} ORDER BY id DESC LIMIT ? OFFSET ?`).all(...params, lm, offset);

  res.json({
    data: logs,
    total,
    page: pg,
    limit: lm,
    totalPages: Math.ceil(total / lm)
  });
});

// GET /api/audit-logs/modules — Get list of all logged modules
router.get('/modules', (req, res) => {
  const db = req.app.locals.db;
  const modules = db.prepare('SELECT DISTINCT module FROM audit_logs ORDER BY module').all();
  res.json(modules.map(m => m.module));
});

// GET /api/audit-logs/stats — Summary stats
router.get('/stats', (req, res) => {
  const db = req.app.locals.db;
  const today = new Date().toISOString().split('T')[0];

  const totalLogs = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get().count;
  const todayLogs = db.prepare('SELECT COUNT(*) as count FROM audit_logs WHERE date(timestamp) = ?').get(today).count;
  const byModule = db.prepare('SELECT module, COUNT(*) as count FROM audit_logs GROUP BY module ORDER BY count DESC').all();
  const byAction = db.prepare('SELECT action, COUNT(*) as count FROM audit_logs GROUP BY action ORDER BY count DESC').all();
  const recentUsers = db.prepare("SELECT DISTINCT username FROM audit_logs WHERE username != 'SYSTEM' ORDER BY id DESC LIMIT 10").all();

  res.json({ totalLogs, todayLogs, byModule, byAction, recentUsers: recentUsers.map(u => u.username) });
});

// NO DELETE endpoint — logs are immutable
// NO PUT endpoint — logs cannot be modified

module.exports = router;
