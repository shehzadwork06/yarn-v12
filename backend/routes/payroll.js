// const router = require('express').Router();
// const { authenticate } = require('../middlewares/auth');

// router.use(authenticate);

// // GET /api/payroll
// router.get('/', (req, res) => {
//   const db = req.app.locals.db;
//   const { month, year, status } = req.query;
//   let query = `SELECT p.*, e.name as employee_name, e.employee_code
//     FROM payroll p JOIN employees e ON p.employee_id = e.id WHERE 1=1`;
//   const params = [];
//   if (month) { query += ' AND p.month = ?'; params.push(month); }
//   if (year) { query += ' AND p.year = ?'; params.push(parseInt(year)); }
//   if (status) { query += ' AND p.status = ?'; params.push(status); }
//   query += ' ORDER BY p.created_at DESC';
//   res.json(db.prepare(query).all(...params));
// });

// // POST /api/payroll/generate — Generate payroll for a month
// router.post('/generate', (req, res) => {
//   const db = req.app.locals.db;
//   const { month, year } = req.body;
//   if (!month || !year) return res.status(400).json({ error: 'Month and year required' });

//   const txn = db.transaction(() => {
//     const prefix = `${year}-${month.toString().padStart(2, '0')}`;
//     const settings = {};
//     db.prepare('SELECT * FROM settings').all().forEach(s => { settings[s.key] = parseFloat(s.value); });
//     const overtimeMultiplier = settings.overtime_rate_multiplier || 1.5;
//     const standardHours = settings.standard_hours || 8;

//     const employees = db.prepare('SELECT * FROM employees WHERE is_active = 1').all();
//     const results = [];

//     // Count working days in month (Mon-Sat)
//     const daysInMonth = new Date(year, parseInt(month), 0).getDate();
//     let workingDays = 0;
//     for (let d = 1; d <= daysInMonth; d++) {
//       const day = new Date(year, parseInt(month) - 1, d).getDay();
//       if (day !== 0) workingDays++; // Exclude Sunday
//     }

//     for (const emp of employees) {
//       // Check if already generated
//       const existing = db.prepare('SELECT * FROM payroll WHERE employee_id = ? AND month = ? AND year = ?').get(emp.id, month, parseInt(year));
//       if (existing) { results.push(existing); continue; }

//       // Get attendance data
//       const att = db.prepare(`
//         SELECT 
//           COUNT(CASE WHEN status IN ('PRESENT','OVERTIME') THEN 1 END) as present,
//           COUNT(CASE WHEN status = 'HALF_DAY' THEN 1 END) as half_days,
//           COUNT(CASE WHEN status = 'ABSENT' THEN 1 END) as absent,
//           COALESCE(SUM(overtime_hours), 0) as total_overtime
//         FROM attendance WHERE employee_id = ? AND date LIKE ?
//       `).get(emp.id, prefix + '%');

//       const presentDays = att.present + (att.half_days * 0.5);
//       const absentDays = att.absent;
//       const perDaySalary = emp.basic_salary / workingDays;
//       const absentDeduction = absentDays * perDaySalary;
//       const halfDayDeduction = att.half_days * (perDaySalary * 0.5);
//       const totalAbsentDeduction = Math.round((absentDeduction + halfDayDeduction) * 100) / 100;

//       // Overtime calculation
//       const hourlyRate = perDaySalary / standardHours;
//       const overtimeAmount = Math.round(att.total_overtime * hourlyRate * overtimeMultiplier * 100) / 100;

//       // Loan deduction
//       let loanDeduction = 0;
//       const activeLoans = db.prepare('SELECT * FROM loans WHERE employee_id = ? AND status = ?').all(emp.id, 'ACTIVE');
//       for (const loan of activeLoans) {
//         const deduction = Math.min(loan.monthly_deduction, loan.remaining);
//         loanDeduction += deduction;
//         const newPaid = loan.total_paid + deduction;
//         const newRemaining = loan.remaining - deduction;
//         const newStatus = newRemaining <= 0 ? 'COMPLETED' : 'ACTIVE';
//         db.prepare('UPDATE loans SET total_paid = ?, remaining = ?, status = ? WHERE id = ?').run(newPaid, Math.max(0, newRemaining), newStatus, loan.id);
//       }

//       const netSalary = Math.round((emp.basic_salary - totalAbsentDeduction + overtimeAmount - loanDeduction) * 100) / 100;

//       const result = db.prepare(`
//         INSERT INTO payroll (employee_id, month, year, basic_salary, working_days, present_days, absent_days, half_days,
//           overtime_hours, overtime_amount, absent_deduction, loan_deduction, net_salary, status) 
//         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
//       `).run(emp.id, month, parseInt(year), emp.basic_salary, workingDays, presentDays, absentDays, att.half_days,
//         att.total_overtime, overtimeAmount, totalAbsentDeduction, loanDeduction, netSalary, 'DRAFT');

//       results.push(db.prepare('SELECT * FROM payroll WHERE id = ?').get(result.lastInsertRowid));
//     }
//     return results;
//   });

//   try {
//     res.json(txn());
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // PUT /api/payroll/:id/confirm
// router.put('/:id/confirm', (req, res) => {
//   const db = req.app.locals.db;
//   db.prepare('UPDATE payroll SET status = ? WHERE id = ? AND status = ?').run('CONFIRMED', req.params.id, 'DRAFT');
//   res.json(db.prepare('SELECT p.*, e.name as employee_name FROM payroll p JOIN employees e ON p.employee_id = e.id WHERE p.id = ?').get(req.params.id));
// });

// // PUT /api/payroll/:id/pay
// router.put('/:id/pay', (req, res) => {
//   const db = req.app.locals.db;
//   db.prepare('UPDATE payroll SET status = ?, paid_date = date(\'now\') WHERE id = ? AND status = ?').run('PAID', req.params.id, 'CONFIRMED');
//   res.json(db.prepare('SELECT p.*, e.name as employee_name FROM payroll p JOIN employees e ON p.employee_id = e.id WHERE p.id = ?').get(req.params.id));
// });

// module.exports = router;
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// GET /api/payroll
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { month, year, status } = req.query;
  let query = `SELECT p.*, e.name as employee_name, e.employee_code, e.designation, e.department
    FROM payroll p JOIN employees e ON p.employee_id = e.id WHERE 1=1`;
  const params = [];
  if (month)  { query += ' AND p.month = ?';  params.push(month); }
  if (year)   { query += ' AND p.year = ?';   params.push(parseInt(year)); }
  if (status) { query += ' AND p.status = ?'; params.push(status); }
  query += ' ORDER BY p.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Count Mon-Sat working days in a month, optionally starting from a given day.
 * @param {number} year
 * @param {number} month  1-based
 * @param {number} fromDay  1-based day to start counting from (default 1)
 */
function workingDaysInMonth(year, month, fromDay = 1) {
  const daysInMonth = new Date(year, month, 0).getDate(); // last day of month
  let count = 0;
  for (let d = fromDay; d <= daysInMonth; d++) {
    const dow = new Date(year, month - 1, d).getDay(); // 0=Sun
    if (dow !== 0) count++; // exclude Sunday only
  }
  return count;
}

// POST /api/payroll/generate
//
// SALARY FORMULA:
//   payableDays  = working days in month from max(1, joining day) to month end
//   perDaySalary = basic_salary / payableDays
//   presentDays  = COUNT(PRESENT/OVERTIME) + half_days*0.5  (from attendance)
//   earnedSalary = perDaySalary × presentDays
//   net          = earnedSalary + overtime − loans
//
// An employee who joined on the 15th has payableDays = working days from 15th
// to end of month.  If they were present for all those days they earn full basic.
// Absent days reduce their earned salary automatically (they weren't PRESENT).
router.post('/generate', (req, res) => {
  const db = req.app.locals.db;
  const { month, year } = req.body;
  if (!month || !year) return res.status(400).json({ error: 'Month and year required' });

  const txn = db.transaction(() => {
    const yr  = parseInt(year);
    const mo  = parseInt(month);
    const prefix = `${yr}-${String(mo).padStart(2, '0')}`;

    const settings = {};
    db.prepare('SELECT * FROM settings').all().forEach(s => { settings[s.key] = parseFloat(s.value); });
    const overtimeMultiplier = settings.overtime_rate_multiplier || 1.5;
    const standardHours      = settings.standard_hours           || 8;

    const employees = db.prepare('SELECT * FROM employees WHERE is_active = 1').all();
    const results   = [];

    for (const emp of employees) {
      // Skip already-generated
      const existing = db.prepare(
        'SELECT * FROM payroll WHERE employee_id = ? AND month = ? AND year = ?'
      ).get(emp.id, String(mo).padStart(2, '0'), yr);
      if (existing) { results.push(existing); continue; }

      // ── Determine payable days ─────────────────────────────────────────────
      // If the employee joined this month, start counting from their joining day.
      // Otherwise count the full month (Mon-Sat).
      let fromDay = 1;
      if (emp.joining_date) {
        const jd = new Date(emp.joining_date);
        if (jd.getFullYear() === yr && jd.getMonth() + 1 === mo) {
          fromDay = jd.getDate();
        } else if (jd > new Date(yr, mo - 1, 1)) {
          // Joined after this month entirely — skip (0 payable days)
          fromDay = null;
        }
      }

      // Employee hasn't joined yet this month — generate a zero record
      if (fromDay === null) {
        const r = db.prepare(`
          INSERT INTO payroll
            (employee_id, month, year, basic_salary, working_days,
             present_days, absent_days, half_days,
             overtime_hours, overtime_amount,
             absent_deduction, loan_deduction, net_salary, status)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).run(emp.id, String(mo).padStart(2, '0'), yr,
               emp.basic_salary, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'DRAFT');
        results.push(db.prepare(`SELECT p.*, e.name as employee_name, e.employee_code,
          e.designation, e.department FROM payroll p
          JOIN employees e ON p.employee_id = e.id WHERE p.id = ?`).get(r.lastInsertRowid));
        continue;
      }

      const payableDays = workingDaysInMonth(yr, mo, fromDay);

      // ── Attendance for this employee this month ────────────────────────────
      const att = db.prepare(`
        SELECT
          COUNT(CASE WHEN status IN ('PRESENT','OVERTIME') THEN 1 END) AS present,
          COUNT(CASE WHEN status = 'HALF_DAY'             THEN 1 END)  AS half_days,
          COUNT(CASE WHEN status = 'ABSENT'               THEN 1 END)  AS absent,
          COALESCE(SUM(overtime_hours), 0)                              AS total_overtime
        FROM attendance WHERE employee_id = ? AND date LIKE ?
      `).get(emp.id, prefix + '%');

      // ── Per-day salary based on payable days (NOT attendance records) ──────
      const perDaySalary         = payableDays > 0 ? emp.basic_salary / payableDays : 0;
      const effectivePresentDays = att.present + (att.half_days * 0.5);

      // Earned = only what they actually worked
      const earnedSalary         = Math.round(perDaySalary * effectivePresentDays * 100) / 100;

      // Absent deduction stored for display (implicit in earnedSalary formula)
      const absentDeduction      = Math.round(att.absent    * perDaySalary       * 100) / 100;
      const halfDeduction        = Math.round(att.half_days * perDaySalary * 0.5 * 100) / 100;
      const totalAbsentDeduction = Math.round((absentDeduction + halfDeduction)   * 100) / 100;

      // Overtime
      const hourlyRate     = standardHours > 0 ? perDaySalary / standardHours : 0;
      const overtimeAmount = Math.round(att.total_overtime * hourlyRate * overtimeMultiplier * 100) / 100;

      // Loans
      let loanDeduction = 0;
      const activeLoans = db.prepare("SELECT * FROM loans WHERE employee_id = ? AND status = 'ACTIVE'").all(emp.id);
      for (const loan of activeLoans) {
        const deduction    = Math.min(loan.monthly_deduction, loan.remaining);
        loanDeduction     += deduction;
        const newPaid      = loan.total_paid + deduction;
        const newRemaining = loan.remaining  - deduction;
        db.prepare('UPDATE loans SET total_paid=?, remaining=?, status=? WHERE id=?')
          .run(newPaid, Math.max(0, newRemaining), newRemaining <= 0 ? 'COMPLETED' : 'ACTIVE', loan.id);
      }

      const netSalary = Math.max(0, Math.round((earnedSalary + overtimeAmount - loanDeduction) * 100) / 100);

      const r = db.prepare(`
        INSERT INTO payroll
          (employee_id, month, year, basic_salary, working_days,
           present_days, absent_days, half_days,
           overtime_hours, overtime_amount,
           absent_deduction, loan_deduction, net_salary, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).run(
        emp.id, String(mo).padStart(2, '0'), yr,
        emp.basic_salary,
        payableDays,           // working days from joining day (or 1st) to month end
        effectivePresentDays,
        att.absent,
        att.half_days,
        att.total_overtime,
        overtimeAmount,
        totalAbsentDeduction,
        loanDeduction,
        netSalary,
        'DRAFT'
      );

      results.push(db.prepare(`SELECT p.*, e.name as employee_name, e.employee_code,
        e.designation, e.department FROM payroll p
        JOIN employees e ON p.employee_id = e.id WHERE p.id = ?`).get(r.lastInsertRowid));
    }
    return results;
  });

  try   { res.json(txn()); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/payroll/:id — Manual edit (DRAFT only)
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { present_days, absent_days, half_days,
          overtime_hours, overtime_amount,
          absent_deduction, loan_deduction, net_salary } = req.body;

  const payroll = db.prepare('SELECT * FROM payroll WHERE id = ?').get(req.params.id);
  if (!payroll) return res.status(404).json({ error: 'Payroll record not found' });
  if (payroll.status !== 'DRAFT') return res.status(400).json({ error: 'Only DRAFT payrolls can be edited' });

  const newPresent   = present_days     ?? payroll.present_days;
  const newAbsent    = absent_days      ?? payroll.absent_days;
  const newHalf      = half_days        ?? payroll.half_days;
  const newOTHours   = overtime_hours   ?? payroll.overtime_hours;
  const newOTAmount  = overtime_amount  ?? payroll.overtime_amount;
  const newAbsentDed = absent_deduction ?? payroll.absent_deduction;
  const newLoanDed   = loan_deduction   ?? payroll.loan_deduction;

  const payableDays = payroll.working_days || 1;
  const perDay      = payroll.basic_salary / payableDays;
  const earned      = Math.round(perDay * newPresent * 100) / 100;

  const newNet = net_salary != null
    ? parseFloat(net_salary)
    : Math.max(0, Math.round((earned + newOTAmount - newLoanDed) * 100) / 100);

  db.prepare(`UPDATE payroll SET
    present_days=?, absent_days=?, half_days=?,
    overtime_hours=?, overtime_amount=?,
    absent_deduction=?, loan_deduction=?, net_salary=?
    WHERE id=?`
  ).run(newPresent, newAbsent, newHalf, newOTHours, newOTAmount, newAbsentDed, newLoanDed, newNet, payroll.id);

  res.json(db.prepare(`SELECT p.*, e.name as employee_name, e.employee_code,
    e.designation, e.department FROM payroll p
    JOIN employees e ON p.employee_id = e.id WHERE p.id = ?`).get(payroll.id));
});

// PUT /api/payroll/:id/confirm
router.put('/:id/confirm', (req, res) => {
  const db = req.app.locals.db;
  db.prepare("UPDATE payroll SET status='CONFIRMED' WHERE id=? AND status='DRAFT'").run(req.params.id);
  res.json(db.prepare(`SELECT p.*, e.name as employee_name, e.employee_code,
    e.designation, e.department FROM payroll p
    JOIN employees e ON p.employee_id = e.id WHERE p.id = ?`).get(req.params.id));
});

// PUT /api/payroll/:id/pay
router.put('/:id/pay', (req, res) => {
  const db = req.app.locals.db;
  db.prepare("UPDATE payroll SET status='PAID', paid_date=date('now') WHERE id=? AND status='CONFIRMED'").run(req.params.id);
  res.json(db.prepare(`SELECT p.*, e.name as employee_name, e.employee_code,
    e.designation, e.department FROM payroll p
    JOIN employees e ON p.employee_id = e.id WHERE p.id = ?`).get(req.params.id));
});

module.exports = router;

// DELETE /api/payroll/month/:month/:year — delete ALL draft records for a month/year to allow full regeneration
router.delete('/month/:month/:year', (req, res) => {
  const db = req.app.locals.db;
  const { month, year } = req.params;
  const result = db.prepare("DELETE FROM payroll WHERE month=? AND year=? AND status='DRAFT'")
    .run(month, parseInt(year));
  res.json({ deleted: result.changes });
});

// DELETE /api/payroll/:id — only DRAFT records can be deleted (to allow regeneration)
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  const payroll = db.prepare('SELECT * FROM payroll WHERE id = ?').get(req.params.id);
  if (!payroll) return res.status(404).json({ error: 'Payroll record not found' });
  if (payroll.status !== 'DRAFT') return res.status(400).json({ error: 'Only DRAFT payrolls can be deleted' });
  db.prepare('DELETE FROM payroll WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});