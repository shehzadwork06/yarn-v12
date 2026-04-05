// Audit Logger — immutable log for every system action
// Logs are stored in SQLite with triggers preventing DELETE/UPDATE

function logAction(db, { userId, username, action, module, entityType, entityId, description, details, ipAddress }) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (user_id, username, action, module, entity_type, entity_id, description, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId || null,
      username || 'SYSTEM',
      action,
      module,
      entityType || null,
      entityId || null,
      description,
      details ? JSON.stringify(details) : null,
      ipAddress || null
    );
  } catch (err) {
    console.error('[AUDIT LOG ERROR]', err.message);
  }
}

// Express middleware that auto-logs all write operations (POST/PUT/DELETE)
function auditMiddleware(req, res, next) {
  // Only log write operations
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) return next();
  // Skip login itself (logged separately in auth route)
  if (req.path === '/api/auth/login') return next();
  // Skip audit log reads from being logged
  if (req.originalUrl?.startsWith('/api/audit-logs')) return next();

  const originalJson = res.json.bind(res);
  res.json = function (body) {
    // Log after successful response
    if (res.statusCode < 400) {
      const db = req.app.locals.db;
      const user = req.user || {};
      const fullPath = req.originalUrl || req.url || req.path;
      const cleanPath = fullPath.replace(/\?.*$/, '').replace(/^\/api\//, '');
      const pathParts = cleanPath.split('/').filter(Boolean);
      const module = pathParts[0] || 'unknown';

      logAction(db, {
        userId: user.id,
        username: user.username,
        action: req.method,
        module: module.toUpperCase(),
        entityType: pathParts[0],
        entityId: body?.id || req.params?.id || null,
        description: buildDescription(req.method, module, fullPath, body),
        details: { path: fullPath, body: sanitizeBody(req.body), responseId: body?.id },
        ipAddress: req.ip || req.connection?.remoteAddress
      });
    }
    return originalJson(body);
  };

  next();
}

function buildDescription(method, module, path, responseBody) {
  const actions = { POST: 'Created', PUT: 'Updated', DELETE: 'Deleted', PATCH: 'Modified' };
  const verb = actions[method] || method;
  const cleanModule = module.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Specific descriptions based on path patterns
  if (path.includes('/payment')) return `${verb} payment in ${cleanModule}`;
  if (path.includes('/time-in')) return `Recorded time-in for employee`;
  if (path.includes('/time-out')) return `Recorded time-out for employee`;
  if (path.includes('/mark-absent')) return `Marked employee absent`;
  if (path.includes('/start-dyeing')) return `Started dyeing process for lot`;
  if (path.includes('/complete-dyeing')) return `Completed dyeing process`;
  if (path.includes('/start-chemical')) return `Started chemical manufacturing`;
  if (path.includes('/complete-chemical')) return `Completed chemical manufacturing`;
  if (path.includes('/generate')) return `Generated payroll`;
  if (path.includes('/confirm')) return `Confirmed record in ${cleanModule}`;
  if (path.includes('/pay')) return `Processed payment in ${cleanModule}`;
  if (path.includes('/verify')) return `Verified gate pass`;
  if (path.includes('/loan')) return `Added loan for employee`;
  if (path.includes('/expenses')) return `${verb} expense record`;
  if (path.includes('/change-password')) return `Changed password`;

  const name = responseBody?.name || responseBody?.lot_number || responseBody?.sale_number ||
    responseBody?.purchase_number || responseBody?.gate_pass_number || responseBody?.employee_code || '';

  return `${verb} ${cleanModule}${name ? ': ' + name : ''}`;
}

function sanitizeBody(body) {
  if (!body) return null;
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.current_password;
  delete sanitized.new_password;
  return sanitized;
}

module.exports = { logAction, auditMiddleware };
