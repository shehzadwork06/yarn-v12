const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { authenticate, generateToken } = require('../middlewares/auth');
const { logAction } = require('../middlewares/auditLogger');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const db = req.app.locals.db;
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    logAction(db, { username: username || 'unknown', action: 'LOGIN_FAILED', module: 'AUTH', description: `Failed login attempt for user: ${username}`, ipAddress: req.ip });
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = generateToken(user);
  logAction(db, { userId: user.id, username: user.username, action: 'LOGIN', module: 'AUTH', description: `User logged in: ${user.username}`, ipAddress: req.ip });
  res.json({ token, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const db = req.app.locals.db;
  const user = db.prepare('SELECT id, username, full_name, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// PUT /api/auth/change-password
router.put('/change-password', authenticate, (req, res) => {
  const db = req.app.locals.db;
  const { current_password, new_password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(current_password, user.password)) {
    return res.status(400).json({ error: 'Current password incorrect' });
  }
  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.user.id);
  res.json({ message: 'Password changed successfully' });
});

module.exports = router;
