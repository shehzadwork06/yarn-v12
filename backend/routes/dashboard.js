// const router = require('express').Router();
// const { authenticate } = require('../middlewares/auth');

// router.use(authenticate);

// // GET /api/dashboard — Main dashboard KPIs
// router.get('/', (req, res) => {
//   const db = req.app.locals.db;
//   const today = new Date().toISOString().split('T')[0];
//   const monthPrefix = today.substring(0, 7);

//   // Total stock value
//   const stockValue = db.prepare(`
//     SELECT COALESCE(SUM(i.quantity * l.cost_per_unit), 0) as total
//     FROM inventory i JOIN lots l ON i.lot_id = l.id WHERE i.quantity > 0
//   `).get();

//   // Total receivable (customer balances)
//   const receivable = db.prepare('SELECT COALESCE(SUM(current_balance), 0) as total FROM customers WHERE current_balance > 0').get();

//   // Total payable (supplier balances)
//   const payable = db.prepare('SELECT COALESCE(SUM(current_balance), 0) as total FROM suppliers WHERE current_balance > 0').get();

//   // Today sales
//   const todaySales = db.prepare('SELECT COALESCE(SUM(net_amount), 0) as total, COUNT(*) as count FROM sales WHERE date = ? AND status != ?').get(today, 'CANCELLED');

//   // Today purchases
//   const todayPurchases = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total, COUNT(*) as count FROM purchases WHERE date = ? AND status != ?').get(today, 'CANCELLED');

//   // Monthly sales
//   const monthlySales = db.prepare('SELECT COALESCE(SUM(net_amount), 0) as total, COUNT(*) as count FROM sales WHERE date LIKE ? AND status != ?').get(monthPrefix + '%', 'CANCELLED');

//   // Monthly purchases
//   const monthlyPurchases = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total, COUNT(*) as count FROM purchases WHERE date LIKE ? AND status != ?').get(monthPrefix + '%', 'CANCELLED');

//   // Low stock alerts
//   const lowStock = db.prepare(`
//     SELECT p.id, p.name, p.type, p.min_stock_level, p.unit,
//       COALESCE(SUM(i.quantity), 0) as total_quantity
//     FROM products p LEFT JOIN inventory i ON p.id = i.product_id AND i.quantity > 0
//     WHERE p.is_active = 1 AND p.min_stock_level > 0
//     GROUP BY p.id HAVING total_quantity <= p.min_stock_level
//   `).all();

//   // Total wastage
//   const totalWastage = db.prepare('SELECT COALESCE(SUM(wastage_amount), 0) as total_amount, COALESCE(SUM(wastage_cost), 0) as total_cost FROM wastage').get();

//   // Monthly wastage
//   const monthlyWastage = db.prepare('SELECT COALESCE(SUM(wastage_amount), 0) as total_amount, COALESCE(SUM(wastage_cost), 0) as total_cost FROM wastage WHERE date LIKE ?').get(monthPrefix + '%');

//   // Active manufacturing
//   const activeMfg = db.prepare('SELECT COUNT(*) as count FROM manufacturing_processes WHERE status = ?').get('IN_PROGRESS');

//   // Recent sales (last 5)
//   const recentSales = db.prepare(`
//     SELECT s.*, c.name as customer_name FROM sales s JOIN customers c ON s.customer_id = c.id
//     WHERE s.status != 'CANCELLED' ORDER BY s.created_at DESC LIMIT 5
//   `).all();

//   // Stock by location
//   const stockByLocation = db.prepare(`
//     SELECT location, COUNT(DISTINCT lot_id) as lot_count, SUM(quantity) as total_quantity
//     FROM inventory WHERE quantity > 0 GROUP BY location
//   `).all();

//   // Sales trend (last 7 days)
//   const salesTrend = db.prepare(`
//     SELECT date, COALESCE(SUM(net_amount), 0) as total, COUNT(*) as count
//     FROM sales WHERE date >= date('now', '-7 days') AND status != 'CANCELLED'
//     GROUP BY date ORDER BY date
//   `).all();

//   // Monthly profit
//   const revenue = db.prepare('SELECT COALESCE(SUM(net_amount), 0) as total FROM sales WHERE date LIKE ? AND status != ?').get(monthPrefix + '%', 'CANCELLED');
//   const costs = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total FROM purchases WHERE date LIKE ? AND status != ?').get(monthPrefix + '%', 'CANCELLED');
//   const wastCost = db.prepare('SELECT COALESCE(SUM(wastage_cost), 0) as total FROM wastage WHERE date LIKE ?').get(monthPrefix + '%');
//   const expenses = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date LIKE ?').get(monthPrefix + '%');

//   res.json({
//     stock_value: stockValue.total,
//     total_receivable: receivable.total,
//     total_payable: payable.total,
//     today_sales: todaySales,
//     today_purchases: todayPurchases,
//     monthly_sales: monthlySales,
//     monthly_purchases: monthlyPurchases,
//     low_stock_alerts: lowStock,
//     total_wastage: totalWastage,
//     monthly_wastage: monthlyWastage,
//     active_manufacturing: activeMfg.count,
//     recent_sales: recentSales,
//     stock_by_location: stockByLocation,
//     sales_trend: salesTrend,
//     monthly_profit: {
//       revenue: revenue.total,
//       costs: costs.total + wastCost.total,
//       expenses: expenses.total,
//       net: revenue.total - costs.total - wastCost.total - expenses.total
//     }
//   });
// });

// module.exports = router;
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
router.use(authenticate);

router.get('/', (req, res) => {
  const db    = req.app.locals.db;
  const T     = req.T;
  const today = new Date().toISOString().split('T')[0];
  const month = today.substring(0, 7);

  // OPERATIONS workspace has different dashboard
  if (req.businessMode === 'OPERATIONS') {
    // HR/Finance focused dashboard
    const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM employees WHERE is_active = 1').get();
    const todayPresent = db.prepare(`SELECT COUNT(DISTINCT employee_id) as count FROM attendance WHERE date = ? AND status IN ('PRESENT','OVERTIME','HALF_DAY')`).get(today);
    const todayAbsent = db.prepare(`SELECT COUNT(DISTINCT employee_id) as count FROM attendance WHERE date = ? AND status = 'ABSENT'`).get(today);
    const monthlyExpenses = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date LIKE ?').get(month + '%');
    const monthlyPayroll = db.prepare('SELECT COALESCE(SUM(net_salary), 0) as total FROM payroll WHERE month = ? AND year = ?').get(month.split('-')[1], parseInt(month.split('-')[0]));
    const recentExpenses = db.prepare('SELECT * FROM expenses ORDER BY date DESC, created_at DESC LIMIT 10').all();
    const pendingPayroll = db.prepare(`SELECT COUNT(*) as count FROM payroll WHERE status = 'DRAFT'`).get();

    return res.json({
      total_employees: totalEmployees.count,
      today_present: todayPresent.count,
      today_absent: todayAbsent.count,
      monthly_expenses: monthlyExpenses.total,
      monthly_payroll: monthlyPayroll.total,
      pending_payroll: pendingPayroll.count,
      recent_expenses: recentExpenses,
    });
  }

  // YARN/CHEMICAL workspace dashboard
  const stockValue = db.prepare(
    `SELECT COALESCE(SUM(i.quantity * l.cost_per_unit),0) as total
     FROM ${T.inventory} i JOIN ${T.lots} l ON i.lot_id=l.id WHERE i.quantity > 0`
  ).get();

  const receivable = db.prepare(`SELECT COALESCE(SUM(current_balance),0) as total FROM ${T.customers} WHERE current_balance > 0`).get();
  const payable    = db.prepare(`SELECT COALESCE(SUM(current_balance),0) as total FROM ${T.suppliers} WHERE current_balance > 0`).get();

  const todaySales = db.prepare(
    `SELECT COALESCE(SUM(net_amount),0) as total, COUNT(*) as count FROM ${T.sales} WHERE date=? AND status!='CANCELLED'`
  ).get(today);

  const todayPurchases = db.prepare(
    `SELECT COALESCE(SUM(total_amount),0) as total, COUNT(*) as count FROM ${T.purchases} WHERE date=? AND status!='CANCELLED'`
  ).get(today);

  const monthlySales = db.prepare(
    `SELECT COALESCE(SUM(net_amount),0) as total, COUNT(*) as count FROM ${T.sales} WHERE date LIKE ? AND status!='CANCELLED'`
  ).get(month + '%');

  const monthlyPurchases = db.prepare(
    `SELECT COALESCE(SUM(total_amount),0) as total, COUNT(*) as count FROM ${T.purchases} WHERE date LIKE ? AND status!='CANCELLED'`
  ).get(month + '%');

  const lowStock = db.prepare(
    `SELECT p.id, p.name, p.type, p.min_stock_level, p.unit, COALESCE(SUM(i.quantity),0) as total_quantity
     FROM ${T.products} p LEFT JOIN ${T.inventory} i ON p.id=i.product_id AND i.quantity > 0
     WHERE p.is_active=1 AND p.min_stock_level > 0 GROUP BY p.id HAVING total_quantity <= p.min_stock_level`
  ).all();

  const totalWastage = db.prepare(
    `SELECT
      COALESCE(SUM(w.wastage_amount),0) as total_amount,
      COALESCE(SUM(w.wastage_cost),0) as total_cost,
      (
        SELECT p.unit
        FROM ${T.wastage} w2
        JOIN ${T.lots} l2 ON w2.lot_id = l2.id
        JOIN ${T.products} p ON l2.product_id = p.id
        ORDER BY w2.created_at DESC
        LIMIT 1
      ) as unit
    FROM ${T.wastage} w`
  ).get();

  const monthlyWastage = db.prepare(
    `SELECT COALESCE(SUM(wastage_amount),0) as total_amount, COALESCE(SUM(wastage_cost),0) as total_cost FROM ${T.wastage} WHERE date LIKE ?`
  ).get(month + '%');

  const activeMfg = db.prepare(
    `SELECT COUNT(*) as count FROM ${T.manufacturing} WHERE status='IN_PROGRESS'`
  ).get();

  const recentSales = db.prepare(
    `SELECT s.*, c.name as customer_name FROM ${T.sales} s JOIN ${T.customers} c ON s.customer_id=c.id
     WHERE s.status!='CANCELLED' ORDER BY s.created_at DESC LIMIT 5`
  ).all();

  const stockByLocation = db.prepare(
    `SELECT location, COUNT(DISTINCT lot_id) as lot_count, SUM(quantity) as total_quantity
     FROM ${T.inventory} WHERE quantity > 0 GROUP BY location`
  ).all();

  const salesTrend = db.prepare(
    `SELECT date, COALESCE(SUM(net_amount),0) as total, COUNT(*) as count FROM ${T.sales}
     WHERE date >= date('now','-7 days') AND status!='CANCELLED' GROUP BY date ORDER BY date`
  ).all();

  const revenue  = db.prepare(`SELECT COALESCE(SUM(net_amount),0) as total FROM ${T.sales} WHERE date LIKE ? AND status!='CANCELLED'`).get(month + '%');
  const costs    = db.prepare(`SELECT COALESCE(SUM(total_amount),0) as total FROM ${T.purchases} WHERE date LIKE ? AND status!='CANCELLED'`).get(month + '%');
  const wastCost = db.prepare(`SELECT COALESCE(SUM(wastage_cost),0) as total FROM ${T.wastage} WHERE date LIKE ?`).get(month + '%');
  const expenses = db.prepare(`SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE date LIKE ?`).get(month + '%');

  res.json({
    stock_value:        stockValue.total,
    total_receivable:   receivable.total,
    total_payable:      payable.total,
    today_sales:        todaySales,
    today_purchases:    todayPurchases,
    monthly_sales:      monthlySales,
    monthly_purchases:  monthlyPurchases,
    low_stock_alerts:   lowStock,
    total_wastage:      totalWastage,
    monthly_wastage:    monthlyWastage,
    active_manufacturing: activeMfg.count,
    recent_sales:       recentSales,
    stock_by_location:  stockByLocation,
    sales_trend:        salesTrend,
    monthly_profit: {
      revenue:  revenue.total,
      costs:    costs.total,
      wastage:  wastCost.total,
      expenses: expenses.total,
      net:      revenue.total - costs.total - wastCost.total - expenses.total,
    },
  });
});

module.exports = router;