// // config/database.js
// //
// // DB_PATH priority:
// //   1. process.env.DB_PATH   ← set by Electron main.js (points to AppData\Roaming\...)
// //   2. __dirname/../data/yarnchem.db  ← dev / plain Node fallback
// //
// const Database = require('better-sqlite3');
// const path     = require('path');
// const bcrypt   = require('bcryptjs');
 
// const DB_PATH = process.env.DB_PATH
//   ? process.env.DB_PATH
//   : path.join(__dirname, '..', 'data', 'yarnchem.db');
 
// console.log(`[database] Using DB at: ${DB_PATH}`);
 
// function initializeDatabase() {
//   const db = new Database(DB_PATH);
//   db.pragma('journal_mode = WAL');
//   db.pragma('foreign_keys = ON');
//   db.pragma('busy_timeout = 5000');
//   // ─────────────────────────────────────────────────────────────
//   // SHARED TABLES  (same data for both workspaces)
//   // ─────────────────────────────────────────────────────────────
//   db.exec(`
//     CREATE TABLE IF NOT EXISTS users (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       username TEXT UNIQUE NOT NULL,
//       password TEXT NOT NULL,
//       full_name TEXT NOT NULL,
//       role TEXT NOT NULL DEFAULT 'admin',
//       is_active INTEGER DEFAULT 1,
//       created_at TEXT DEFAULT (datetime('now'))
//     );
 
//     CREATE TABLE IF NOT EXISTS product_categories (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT UNIQUE NOT NULL,
//       description TEXT,
//       is_active INTEGER DEFAULT 1,
//       created_at TEXT DEFAULT (datetime('now'))
//     );
 
//     /* NOTE: suppliers/customers are now workspace-specific (yarn_ and chem_ tables below) */
 
//     CREATE TABLE IF NOT EXISTS employees (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       employee_code TEXT UNIQUE NOT NULL,
//       name TEXT NOT NULL,
//       phone TEXT,
//       address TEXT,
//       designation TEXT,
//       department TEXT,
//       basic_salary REAL DEFAULT 0,
//       joining_date TEXT,
//       is_active INTEGER DEFAULT 1,
//       created_at TEXT DEFAULT (datetime('now'))
//     );
 
//     CREATE TABLE IF NOT EXISTS attendance (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       employee_id INTEGER NOT NULL,
//       date TEXT NOT NULL DEFAULT (date('now')),
//       time_in TEXT,
//       time_out TEXT,
//       working_hours REAL DEFAULT 0,
//       overtime_hours REAL DEFAULT 0,
//       status TEXT DEFAULT 'PRESENT' CHECK(status IN ('PRESENT','HALF_DAY','ABSENT','LEAVE','OVERTIME')),
//       notes TEXT,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (employee_id) REFERENCES employees(id),
//       UNIQUE(employee_id, date)
//     );
 
//     CREATE TABLE IF NOT EXISTS loans (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       employee_id INTEGER NOT NULL,
//       amount REAL NOT NULL,
//       monthly_deduction REAL NOT NULL,
//       total_paid REAL DEFAULT 0,
//       remaining REAL NOT NULL,
//       status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','COMPLETED','CANCELLED')),
//       date TEXT DEFAULT (date('now')),
//       notes TEXT,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (employee_id) REFERENCES employees(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS payroll (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       employee_id INTEGER NOT NULL,
//       month TEXT NOT NULL,
//       year INTEGER NOT NULL,
//       basic_salary REAL DEFAULT 0,
//       working_days INTEGER DEFAULT 0,
//       present_days INTEGER DEFAULT 0,
//       absent_days INTEGER DEFAULT 0,
//       half_days INTEGER DEFAULT 0,
//       overtime_hours REAL DEFAULT 0,
//       overtime_amount REAL DEFAULT 0,
//       absent_deduction REAL DEFAULT 0,
//       loan_deduction REAL DEFAULT 0,
//       other_deductions REAL DEFAULT 0,
//       other_additions REAL DEFAULT 0,
//       net_salary REAL DEFAULT 0,
//       status TEXT DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','CONFIRMED','PAID')),
//       paid_date TEXT,
//       notes TEXT,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (employee_id) REFERENCES employees(id),
//       UNIQUE(employee_id, month, year)
//     );
 
//     CREATE TABLE IF NOT EXISTS expenses (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       category TEXT NOT NULL,
//       description TEXT,
//       amount REAL NOT NULL,
//       date TEXT NOT NULL DEFAULT (date('now')),
//       reference TEXT,
//       created_at TEXT DEFAULT (datetime('now'))
//     );
 
//     CREATE TABLE IF NOT EXISTS settings (
//       key TEXT PRIMARY KEY,
//       value TEXT NOT NULL
//     );
 
//     CREATE TABLE IF NOT EXISTS audit_logs (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       timestamp TEXT NOT NULL DEFAULT (datetime('now')),
//       user_id INTEGER,
//       username TEXT,
//       action TEXT NOT NULL,
//       module TEXT NOT NULL,
//       entity_type TEXT,
//       entity_id INTEGER,
//       description TEXT NOT NULL,
//       details TEXT,
//       ip_address TEXT,
//       created_at TEXT NOT NULL DEFAULT (datetime('now'))
//     );
//   `);
 
//   db.exec(`
//     CREATE TRIGGER IF NOT EXISTS prevent_audit_delete
//     BEFORE DELETE ON audit_logs
//     BEGIN SELECT RAISE(ABORT, 'AUDIT LOGS CANNOT BE DELETED'); END;
//   `);
//   db.exec(`
//     CREATE TRIGGER IF NOT EXISTS prevent_audit_update
//     BEFORE UPDATE ON audit_logs
//     BEGIN SELECT RAISE(ABORT, 'AUDIT LOGS CANNOT BE MODIFIED'); END;
//   `);
 
//   // ─────────────────────────────────────────────────────────────
//   // YARN WORKSPACE TABLES  (RAW_YARN, DYED_YARN only)
//   // Prefix: yarn_
//   // Locations: STORE, DYEING, FINISHED_STORE
//   // ─────────────────────────────────────────────────────────────
//   db.exec(`
//     CREATE TABLE IF NOT EXISTS yarn_products (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       category_id INTEGER NOT NULL,
//       type TEXT NOT NULL CHECK(type IN ('RAW_YARN','DYED_YARN')),
//       unit TEXT DEFAULT 'No Of Cones',
//       conversion_factor REAL DEFAULT 1.0,
//       min_stock_level REAL DEFAULT 0,
//       shade_code TEXT,
//       description TEXT,
//       is_active INTEGER DEFAULT 1,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (category_id) REFERENCES product_categories(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_lots (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       lot_number TEXT UNIQUE NOT NULL,
//       product_id INTEGER NOT NULL,
//       purchase_id INTEGER,
//       status TEXT DEFAULT 'IN_STORE' CHECK(status IN ('IN_STORE','DYEING','FINISHED','READY_FOR_SALE','SOLD','PARTIALLY_SOLD')),
//       location TEXT DEFAULT 'STORE' CHECK(location IN ('STORE','DYEING','FINISHED_STORE')),
//       initial_quantity REAL NOT NULL,
//       current_quantity REAL NOT NULL,
//       shade_code TEXT,
//       cost_per_unit REAL DEFAULT 0,
//       notes TEXT,
//       created_at TEXT DEFAULT (datetime('now')),
//       updated_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (product_id) REFERENCES yarn_products(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_inventory (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       product_id INTEGER NOT NULL,
//       lot_id INTEGER NOT NULL,
//       location TEXT NOT NULL CHECK(location IN ('STORE','DYEING','FINISHED_STORE')),
//       quantity REAL NOT NULL DEFAULT 0,
//       unit TEXT DEFAULT 'No Of Cones',
//       updated_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (product_id) REFERENCES yarn_products(id),
//       FOREIGN KEY (lot_id) REFERENCES yarn_lots(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_purchases (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       purchase_number TEXT UNIQUE NOT NULL,
//       supplier_id INTEGER NOT NULL,
//       date TEXT NOT NULL DEFAULT (date('now')),
//       total_amount REAL DEFAULT 0,
//       paid_amount REAL DEFAULT 0,
//       status TEXT DEFAULT 'RECEIVED' CHECK(status IN ('PENDING','RECEIVED','CANCELLED')),
//       notes TEXT,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (supplier_id) REFERENCES yarn_suppliers(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_purchase_items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       purchase_id INTEGER NOT NULL,
//       product_id INTEGER NOT NULL,
//       lot_id INTEGER,
//       quantity REAL NOT NULL,
//       rate REAL NOT NULL,
//       amount REAL NOT NULL,
//       FOREIGN KEY (purchase_id) REFERENCES yarn_purchases(id),
//       FOREIGN KEY (product_id) REFERENCES yarn_products(id),
//       FOREIGN KEY (lot_id) REFERENCES yarn_lots(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_sales (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       sale_number TEXT UNIQUE NOT NULL,
//       customer_id INTEGER NOT NULL,
//       date TEXT NOT NULL DEFAULT (date('now')),
//       total_amount REAL DEFAULT 0,
//       discount_percentage REAL DEFAULT 0,
//       discount_amount REAL DEFAULT 0,
//       net_amount REAL DEFAULT 0,
//       paid_amount REAL DEFAULT 0,
//       status TEXT DEFAULT 'CONFIRMED' CHECK(status IN ('DRAFT','CONFIRMED','DISPATCHED','CANCELLED')),
//       gate_pass_id INTEGER,
//       notes TEXT,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (customer_id) REFERENCES yarn_customers(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_sale_items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       sale_id INTEGER NOT NULL,
//       product_id INTEGER NOT NULL,
//       lot_id INTEGER NOT NULL,
//       quantity REAL NOT NULL,
//       rate REAL NOT NULL,
//       amount REAL NOT NULL,
//       target_price REAL,
//       FOREIGN KEY (sale_id) REFERENCES yarn_sales(id),
//       FOREIGN KEY (product_id) REFERENCES yarn_products(id),
//       FOREIGN KEY (lot_id) REFERENCES yarn_lots(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_gate_passes (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       gate_pass_number TEXT UNIQUE NOT NULL,
//       sale_id INTEGER NOT NULL,
//       date TEXT NOT NULL DEFAULT (date('now')),
//       lot_ids TEXT NOT NULL,
//       total_quantity REAL NOT NULL,
//       verified_by TEXT,
//       vehicle_number TEXT,
//       notes TEXT,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (sale_id) REFERENCES yarn_sales(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_manufacturing (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       lot_id INTEGER NOT NULL,
//       process_type TEXT NOT NULL DEFAULT 'DYEING' CHECK(process_type IN ('DYEING')),
//       status TEXT DEFAULT 'IN_PROGRESS' CHECK(status IN ('IN_PROGRESS','COMPLETED','CANCELLED')),
//       input_weight REAL NOT NULL,
//       expected_output REAL NOT NULL,
//       actual_output REAL,
//       shade_code TEXT,
//       output_product_id INTEGER,
//       output_lot_id INTEGER,
//       start_date TEXT DEFAULT (date('now')),
//       end_date TEXT,
//       notes TEXT,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (lot_id) REFERENCES yarn_lots(id),
//       FOREIGN KEY (output_product_id) REFERENCES yarn_products(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_wastage (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       lot_id INTEGER NOT NULL,
//       manufacturing_id INTEGER NOT NULL,
//       process_stage TEXT NOT NULL DEFAULT 'DYEING' CHECK(process_stage IN ('DYEING')),
//       input_weight REAL NOT NULL,
//       expected_output REAL NOT NULL,
//       actual_output REAL NOT NULL,
//       wastage_amount REAL NOT NULL,
//       wastage_percentage REAL NOT NULL,
//       cost_per_unit REAL DEFAULT 0,
//       wastage_cost REAL DEFAULT 0,
//       date TEXT DEFAULT (date('now')),
//       notes TEXT,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (lot_id) REFERENCES yarn_lots(id),
//       FOREIGN KEY (manufacturing_id) REFERENCES yarn_manufacturing(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_purchase_returns (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       return_number TEXT UNIQUE NOT NULL,
//       purchase_id INTEGER NOT NULL,
//       date TEXT NOT NULL DEFAULT (date('now')),
//       reason TEXT NOT NULL,
//       notes TEXT,
//       total_amount REAL DEFAULT 0,
//       status TEXT DEFAULT 'COMPLETED' CHECK(status IN ('COMPLETED','CANCELLED')),
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (purchase_id) REFERENCES yarn_purchases(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_purchase_return_items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       return_id INTEGER NOT NULL,
//       lot_id INTEGER NOT NULL,
//       product_id INTEGER NOT NULL,
//       quantity REAL NOT NULL,
//       rate REAL NOT NULL,
//       amount REAL NOT NULL,
//       FOREIGN KEY (return_id) REFERENCES yarn_purchase_returns(id),
//       FOREIGN KEY (lot_id) REFERENCES yarn_lots(id),
//       FOREIGN KEY (product_id) REFERENCES yarn_products(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_sale_returns (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       return_number TEXT UNIQUE NOT NULL,
//       sale_id INTEGER NOT NULL,
//       date TEXT NOT NULL DEFAULT (date('now')),
//       reason TEXT NOT NULL,
//       notes TEXT,
//       restock_location TEXT DEFAULT 'FINISHED_STORE' CHECK(restock_location IN ('STORE','FINISHED_STORE')),
//       total_amount REAL DEFAULT 0,
//       status TEXT DEFAULT 'COMPLETED' CHECK(status IN ('COMPLETED','CANCELLED')),
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (sale_id) REFERENCES yarn_sales(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_sale_return_items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       return_id INTEGER NOT NULL,
//       lot_id INTEGER NOT NULL,
//       product_id INTEGER NOT NULL,
//       quantity REAL NOT NULL,
//       rate REAL NOT NULL,
//       amount REAL NOT NULL,
//       restock_location TEXT DEFAULT 'FINISHED_STORE',
//       FOREIGN KEY (return_id) REFERENCES yarn_sale_returns(id),
//       FOREIGN KEY (lot_id) REFERENCES yarn_lots(id),
//       FOREIGN KEY (product_id) REFERENCES yarn_products(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_suppliers (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       phone TEXT,
//       address TEXT,
//       credit_terms TEXT,
//       opening_balance REAL DEFAULT 0,
//       current_balance REAL DEFAULT 0,
//       is_active INTEGER DEFAULT 1,
//       created_at TEXT DEFAULT (datetime('now'))
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_supplier_ledger (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       supplier_id INTEGER NOT NULL,
//       date TEXT NOT NULL DEFAULT (date('now')),
//       type TEXT NOT NULL CHECK(type IN ('PURCHASE','PAYMENT','OPENING','ADJUSTMENT')),
//       reference_id INTEGER,
//       description TEXT,
//       debit REAL DEFAULT 0,
//       credit REAL DEFAULT 0,
//       balance REAL DEFAULT 0,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (supplier_id) REFERENCES yarn_suppliers(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_customers (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       phone TEXT,
//       address TEXT,
//       credit_limit REAL DEFAULT 0,
//       opening_balance REAL DEFAULT 0,
//       current_balance REAL DEFAULT 0,
//       is_active INTEGER DEFAULT 1,
//       created_at TEXT DEFAULT (datetime('now'))
//     );
 
//     CREATE TABLE IF NOT EXISTS yarn_customer_ledger (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       customer_id INTEGER NOT NULL,
//       date TEXT NOT NULL DEFAULT (date('now')),
//       type TEXT NOT NULL CHECK(type IN ('SALE','PAYMENT','OPENING','ADJUSTMENT')),
//       reference_id INTEGER,
//       description TEXT,
//       debit REAL DEFAULT 0,
//       credit REAL DEFAULT 0,
//       balance REAL DEFAULT 0,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (customer_id) REFERENCES yarn_customers(id)
//     );
//   `);
 
//   // ─────────────────────────────────────────────────────────────
//   // CHEMICAL WORKSPACE TABLES  (CHEMICAL_RAW, CHEMICAL_FINISHED)
//   // Prefix: chem_
//   // Locations: CHEMICAL_STORE
//   // Note: category_id is optional for chemicals (NULL allowed)
//   // ─────────────────────────────────────────────────────────────
//   db.exec(`
//     CREATE TABLE IF NOT EXISTS chem_products (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       category_id INTEGER,
//       type TEXT NOT NULL CHECK(type IN ('CHEMICAL_RAW','CHEMICAL_FINISHED')),
//       unit TEXT DEFAULT 'KG',
//       conversion_factor REAL DEFAULT 1.0,
//       min_stock_level REAL DEFAULT 0,
//       chemical_code TEXT,
//       description TEXT,
//       is_active INTEGER DEFAULT 1,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (category_id) REFERENCES product_categories(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_lots (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       lot_number TEXT UNIQUE NOT NULL,
//       product_id INTEGER NOT NULL,
//       purchase_id INTEGER,
//       status TEXT DEFAULT 'IN_STORE' CHECK(status IN ('IN_STORE','CHEMICAL_MANUFACTURING','READY_FOR_SALE','SOLD','PARTIALLY_SOLD')),
//       location TEXT DEFAULT 'CHEMICAL_STORE' CHECK(location IN ('CHEMICAL_STORE')),
//       initial_quantity REAL NOT NULL,
//       current_quantity REAL NOT NULL,
//       chemical_code TEXT,
//       cost_per_unit REAL DEFAULT 0,
//       notes TEXT,
//       created_at TEXT DEFAULT (datetime('now')),
//       updated_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (product_id) REFERENCES chem_products(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_inventory (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       product_id INTEGER NOT NULL,
//       lot_id INTEGER NOT NULL,
//       location TEXT NOT NULL DEFAULT 'CHEMICAL_STORE',
//       quantity REAL NOT NULL DEFAULT 0,
//       unit TEXT DEFAULT 'KG',
//       updated_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (product_id) REFERENCES chem_products(id),
//       FOREIGN KEY (lot_id) REFERENCES chem_lots(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_purchases (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       purchase_number TEXT UNIQUE NOT NULL,
//       supplier_id INTEGER NOT NULL,
//       date TEXT NOT NULL DEFAULT (date('now')),
//       total_amount REAL DEFAULT 0,
//       paid_amount REAL DEFAULT 0,
//       status TEXT DEFAULT 'RECEIVED' CHECK(status IN ('PENDING','RECEIVED','CANCELLED')),
//       notes TEXT,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (supplier_id) REFERENCES chem_suppliers(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_purchase_items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       purchase_id INTEGER NOT NULL,
//       product_id INTEGER NOT NULL,
//       lot_id INTEGER,
//       quantity REAL NOT NULL,
//       rate REAL NOT NULL,
//       amount REAL NOT NULL,
//       FOREIGN KEY (purchase_id) REFERENCES chem_purchases(id),
//       FOREIGN KEY (product_id) REFERENCES chem_products(id),
//       FOREIGN KEY (lot_id) REFERENCES chem_lots(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_sales (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       sale_number TEXT UNIQUE NOT NULL,
//       customer_id INTEGER NOT NULL,
//       date TEXT NOT NULL DEFAULT (date('now')),
//       total_amount REAL DEFAULT 0,
//       discount_percentage REAL DEFAULT 0,
//       discount_amount REAL DEFAULT 0,
//       net_amount REAL DEFAULT 0,
//       paid_amount REAL DEFAULT 0,
//       status TEXT DEFAULT 'CONFIRMED' CHECK(status IN ('DRAFT','CONFIRMED','DISPATCHED','CANCELLED')),
//       gate_pass_id INTEGER,
//       notes TEXT,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (customer_id) REFERENCES chem_customers(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_sale_items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       sale_id INTEGER NOT NULL,
//       product_id INTEGER NOT NULL,
//       lot_id INTEGER NOT NULL,
//       quantity REAL NOT NULL,
//       rate REAL NOT NULL,
//       amount REAL NOT NULL,
//       target_price REAL,
//       FOREIGN KEY (sale_id) REFERENCES chem_sales(id),
//       FOREIGN KEY (product_id) REFERENCES chem_products(id),
//       FOREIGN KEY (lot_id) REFERENCES chem_lots(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_gate_passes (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       gate_pass_number TEXT UNIQUE NOT NULL,
//       sale_id INTEGER NOT NULL,
//       date TEXT NOT NULL DEFAULT (date('now')),
//       lot_ids TEXT NOT NULL,
//       total_quantity REAL NOT NULL,
//       verified_by TEXT,
//       vehicle_number TEXT,
//       notes TEXT,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (sale_id) REFERENCES chem_sales(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_manufacturing (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       lot_id INTEGER NOT NULL,
//       process_type TEXT NOT NULL DEFAULT 'CHEMICAL_MANUFACTURING',
//       status TEXT DEFAULT 'IN_PROGRESS' CHECK(status IN ('IN_PROGRESS','COMPLETED','CANCELLED')),
//       input_weight REAL NOT NULL,
//       expected_output REAL NOT NULL,
//       actual_output REAL,
//       chemical_code TEXT,
//       output_product_id INTEGER,
//       output_lot_id INTEGER,
//       start_date TEXT DEFAULT (date('now')),
//       end_date TEXT,
//       notes TEXT,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (lot_id) REFERENCES chem_lots(id),
//       FOREIGN KEY (output_product_id) REFERENCES chem_products(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_wastage (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       lot_id INTEGER NOT NULL,
//       manufacturing_id INTEGER NOT NULL,
//       process_stage TEXT NOT NULL DEFAULT 'CHEMICAL_MANUFACTURING',
//       input_weight REAL NOT NULL,
//       expected_output REAL NOT NULL,
//       actual_output REAL NOT NULL,
//       wastage_amount REAL NOT NULL,
//       wastage_percentage REAL NOT NULL,
//       cost_per_unit REAL DEFAULT 0,
//       wastage_cost REAL DEFAULT 0,
//       date TEXT DEFAULT (date('now')),
//       notes TEXT,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (lot_id) REFERENCES chem_lots(id),
//       FOREIGN KEY (manufacturing_id) REFERENCES chem_manufacturing(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_purchase_returns (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       return_number TEXT UNIQUE NOT NULL,
//       purchase_id INTEGER NOT NULL,
//       date TEXT NOT NULL DEFAULT (date('now')),
//       reason TEXT NOT NULL,
//       notes TEXT,
//       total_amount REAL DEFAULT 0,
//       status TEXT DEFAULT 'COMPLETED' CHECK(status IN ('COMPLETED','CANCELLED')),
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (purchase_id) REFERENCES chem_purchases(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_purchase_return_items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       return_id INTEGER NOT NULL,
//       lot_id INTEGER NOT NULL,
//       product_id INTEGER NOT NULL,
//       quantity REAL NOT NULL,
//       rate REAL NOT NULL,
//       amount REAL NOT NULL,
//       FOREIGN KEY (return_id) REFERENCES chem_purchase_returns(id),
//       FOREIGN KEY (lot_id) REFERENCES chem_lots(id),
//       FOREIGN KEY (product_id) REFERENCES chem_products(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_sale_returns (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       return_number TEXT UNIQUE NOT NULL,
//       sale_id INTEGER NOT NULL,
//       date TEXT NOT NULL DEFAULT (date('now')),
//       reason TEXT NOT NULL,
//       notes TEXT,
//       restock_location TEXT DEFAULT 'CHEMICAL_STORE',
//       total_amount REAL DEFAULT 0,
//       status TEXT DEFAULT 'COMPLETED' CHECK(status IN ('COMPLETED','CANCELLED')),
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (sale_id) REFERENCES chem_sales(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_sale_return_items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       return_id INTEGER NOT NULL,
//       lot_id INTEGER NOT NULL,
//       product_id INTEGER NOT NULL,
//       quantity REAL NOT NULL,
//       rate REAL NOT NULL,
//       amount REAL NOT NULL,
//       restock_location TEXT DEFAULT 'CHEMICAL_STORE',
//       FOREIGN KEY (return_id) REFERENCES chem_sale_returns(id),
//       FOREIGN KEY (lot_id) REFERENCES chem_lots(id),
//       FOREIGN KEY (product_id) REFERENCES chem_products(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_suppliers (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       phone TEXT,
//       address TEXT,
//       credit_terms TEXT,
//       opening_balance REAL DEFAULT 0,
//       current_balance REAL DEFAULT 0,
//       is_active INTEGER DEFAULT 1,
//       created_at TEXT DEFAULT (datetime('now'))
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_supplier_ledger (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       supplier_id INTEGER NOT NULL,
//       date TEXT NOT NULL DEFAULT (date('now')),
//       type TEXT NOT NULL CHECK(type IN ('PURCHASE','PAYMENT','OPENING','ADJUSTMENT')),
//       reference_id INTEGER,
//       description TEXT,
//       debit REAL DEFAULT 0,
//       credit REAL DEFAULT 0,
//       balance REAL DEFAULT 0,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (supplier_id) REFERENCES chem_suppliers(id)
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_customers (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       phone TEXT,
//       address TEXT,
//       credit_limit REAL DEFAULT 0,
//       opening_balance REAL DEFAULT 0,
//       current_balance REAL DEFAULT 0,
//       is_active INTEGER DEFAULT 1,
//       created_at TEXT DEFAULT (datetime('now'))
//     );
 
//     CREATE TABLE IF NOT EXISTS chem_customer_ledger (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       customer_id INTEGER NOT NULL,
//       date TEXT NOT NULL DEFAULT (date('now')),
//       type TEXT NOT NULL CHECK(type IN ('SALE','PAYMENT','OPENING','ADJUSTMENT')),
//       reference_id INTEGER,
//       description TEXT,
//       debit REAL DEFAULT 0,
//       credit REAL DEFAULT 0,
//       balance REAL DEFAULT 0,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (customer_id) REFERENCES chem_customers(id)
//     );
//   `);
 
//   // ─────────────────────────────────────────────────────────────
//   // Default data
//   // ─────────────────────────────────────────────────────────────
//   const s = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
//   s.run('company_name', 'GH & Sons Enterprises');
//   s.run('half_day_threshold', '4');
//   s.run('full_day_threshold', '8');
//   s.run('standard_hours', '8');
//   s.run('overtime_rate_multiplier', '1.5');
 
//   const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
//   if (!existing) {
//     const hash = bcrypt.hashSync('admin123', 10);
//     db.prepare('INSERT INTO users (username, password, full_name, role) VALUES (?,?,?,?)')
//       .run('admin', hash, 'System Administrator', 'admin');
//   }
//  // ── Safe migrations (fix any schema drift) ────────────────────────────────
//   const migrations = [
//     // yarn_products uses shade_code not chemical_code — safe no-op if exists
//     `ALTER TABLE yarn_products ADD COLUMN shade_code TEXT`,
//     `ALTER TABLE chem_products ADD COLUMN chemical_code TEXT`,
//   ];
//   for (const sql of migrations) {
//     try { db.exec(sql); } catch (e) { /* column already exists — ignore */ }
//   }

//   // ── Auto-seed default data (safe — INSERT OR IGNORE) ─────────────────────
//   const alreadySeeded = db.prepare(`SELECT COUNT(*) AS c FROM product_categories`).get().c;
//   if (alreadySeeded === 0) {
//     console.log('[database] Running first-time seed...');

//     const YARN_CATEGORIES = ['Viscose', 'Polyester', 'Bobbin'];

//     const YARN_SHADES = [
//       '0032','1001','1003','1012','1017','1019','1020','1021','1024','1025',
//       '1026','1027','1028','1032','1043','1052','1054','1055','1056','1057',
//       '1058','1060','1063','1065','1070','1074','1080','1084','1088','1089',
//       '1100','1103','1105','1108','1110','1111','1116','1118','1119','1122',
//       '1123','1126','1128','1140','1144','1145','1147','1154','1155','1156',
//       '1157','1166','1181','1187','1188','1191','1226','1243','1278','1306',
//       '1309','1311','1313','1321','1359','1380','1384','1386','1388','1510',
//       '2071','2072','2150','2191','2226','3000','3012','3019','3053','3055',
//       '3062','3071','3082','3084','3098','3100','3106','3126','3127','3128',
//       '3133','3147','3181','3186','3190','3227','3243','3337','3363','3385',
//       '3390','3394','3798','4071','4192','4197','4215','4242','4272','4288',
//       '4298','4314','4346','4387','4441','4550','4589','5048','5089','5221',
//       '5306','5390','5441','5792','6008','6011','6020','6108','7012','7065',
//       '8012','8056','9024','9025','DM102',
//     ];

//     const CHEMICAL_PRODUCTS = [
//       'Acidic buffer',
//       'Dispersing agent',
//       'UMT Fininishing Agent',
//       'Tamol NN',
//       'SNF',
//       'BTG',
//     ];

//     // Insert categories
//     const insertCat = db.prepare(`INSERT OR IGNORE INTO product_categories (name) VALUES (?)`);
//     for (const name of YARN_CATEGORIES) insertCat.run(name);

//     // Fetch category IDs
//     const catMap = {};
//     for (const name of YARN_CATEGORIES) {
//       const row = db.prepare(`SELECT id FROM product_categories WHERE name = ?`).get(name);
//       if (row) catMap[name] = row.id;
//     }

//     // Insert yarn products
//     const insertYarn = db.prepare(`
//       INSERT OR IGNORE INTO yarn_products
//         (name, category_id, type, unit, shade_code, is_active)
//       VALUES (?, ?, ?, 'No Of Cones', ?, 1)
//     `);

//     const seedYarn = db.transaction(() => {
//       for (const cat of YARN_CATEGORIES) {
//         const catId = catMap[cat];
//         if (!catId) continue;
//         for (const shade of YARN_SHADES) {
//           insertYarn.run(shade, catId, 'RAW_YARN',  null);
//           insertYarn.run(shade, catId, 'DYED_YARN', shade);
//         }
//       }
//     });
//     seedYarn();

//     // Insert chemical products
//     const insertChem = db.prepare(`
//       INSERT OR IGNORE INTO chem_products
//         (name, category_id, type, unit, is_active)
//       VALUES (?, NULL, 'CHEMICAL_RAW', 'Kg', 1)
//     `);
//     for (const name of CHEMICAL_PRODUCTS) insertChem.run(name);

//     console.log('[database] ✅ First-time seed complete.');
//   }

//   console.log('✅  Database ready — yarn_ and chem_ tables are fully separate');
//   return db;
// }
 
// module.exports = { initializeDatabase, DB_PATH };

// config/database.js
//
// DB_PATH priority:
//   1. process.env.DB_PATH   ← set by Electron main.js (points to AppData\Roaming\...)
//   2. __dirname/../data/yarnchem.db  ← dev / plain Node fallback
//
const Database = require('better-sqlite3');
const path     = require('path');
const bcrypt   = require('bcryptjs');
 
const DB_PATH = process.env.DB_PATH
  ? process.env.DB_PATH
  : path.join(__dirname, '..', 'data', 'yarnchem.db');
 
console.log(`[database] Using DB at: ${DB_PATH}`);
 
function initializeDatabase() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  // ─────────────────────────────────────────────────────────────
  // SHARED TABLES  (same data for both workspaces)
  // ─────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
 
    CREATE TABLE IF NOT EXISTS product_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
 
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      designation TEXT,
      department TEXT,
      basic_salary REAL DEFAULT 0,
      joining_date TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
 
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      time_in TEXT,
      time_out TEXT,
      working_hours REAL DEFAULT 0,
      overtime_hours REAL DEFAULT 0,
      status TEXT DEFAULT 'PRESENT' CHECK(status IN ('PRESENT','HALF_DAY','ABSENT','LEAVE','OVERTIME')),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      UNIQUE(employee_id, date)
    );
 
    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      monthly_deduction REAL NOT NULL,
      total_paid REAL DEFAULT 0,
      remaining REAL NOT NULL,
      status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','COMPLETED','CANCELLED')),
      date TEXT DEFAULT (date('now')),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );
 
    CREATE TABLE IF NOT EXISTS payroll (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      month TEXT NOT NULL,
      year INTEGER NOT NULL,
      basic_salary REAL DEFAULT 0,
      working_days INTEGER DEFAULT 0,
      present_days INTEGER DEFAULT 0,
      absent_days INTEGER DEFAULT 0,
      half_days INTEGER DEFAULT 0,
      overtime_hours REAL DEFAULT 0,
      overtime_amount REAL DEFAULT 0,
      absent_deduction REAL DEFAULT 0,
      loan_deduction REAL DEFAULT 0,
      other_deductions REAL DEFAULT 0,
      other_additions REAL DEFAULT 0,
      net_salary REAL DEFAULT 0,
      status TEXT DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','CONFIRMED','PAID')),
      paid_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      UNIQUE(employee_id, month, year)
    );
 
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      reference TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
 
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
 
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      user_id INTEGER,
      username TEXT,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      description TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
 
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS prevent_audit_delete
    BEFORE DELETE ON audit_logs
    BEGIN SELECT RAISE(ABORT, 'AUDIT LOGS CANNOT BE DELETED'); END;
  `);
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS prevent_audit_update
    BEFORE UPDATE ON audit_logs
    BEGIN SELECT RAISE(ABORT, 'AUDIT LOGS CANNOT BE MODIFIED'); END;
  `);
 
  // ─────────────────────────────────────────────────────────────
  // YARN WORKSPACE TABLES
  // ─────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS yarn_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('RAW_YARN','DYED_YARN')),
      unit TEXT DEFAULT 'No Of Cones',
      conversion_factor REAL DEFAULT 1.0,
      min_stock_level REAL DEFAULT 0,
      shade_code TEXT,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES product_categories(id)
    );
 
    CREATE TABLE IF NOT EXISTS yarn_lots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lot_number TEXT UNIQUE NOT NULL,
      product_id INTEGER NOT NULL,
      purchase_id INTEGER,
      status TEXT DEFAULT 'IN_STORE' CHECK(status IN ('IN_STORE','DYEING','FINISHED','READY_FOR_SALE','SOLD','PARTIALLY_SOLD','RETURNED')),
      location TEXT DEFAULT 'STORE' CHECK(location IN ('STORE','DYEING','FINISHED_STORE')),
      initial_quantity REAL NOT NULL,
      current_quantity REAL NOT NULL,
      shade_code TEXT,
      cost_per_unit REAL DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES yarn_products(id)
    );
 
    CREATE TABLE IF NOT EXISTS yarn_inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      lot_id INTEGER NOT NULL,
      location TEXT NOT NULL CHECK(location IN ('STORE','DYEING','FINISHED_STORE')),
      quantity REAL NOT NULL DEFAULT 0,
      unit TEXT DEFAULT 'No Of Cones',
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES yarn_products(id),
      FOREIGN KEY (lot_id) REFERENCES yarn_lots(id)
    );
 
    CREATE TABLE IF NOT EXISTS yarn_purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_number TEXT UNIQUE NOT NULL,
      supplier_id INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      total_amount REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'RECEIVED' CHECK(status IN ('PENDING','RECEIVED','CANCELLED')),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (supplier_id) REFERENCES yarn_suppliers(id)
    );
 
    CREATE TABLE IF NOT EXISTS yarn_purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      lot_id INTEGER,
      quantity REAL NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (purchase_id) REFERENCES yarn_purchases(id),
      FOREIGN KEY (product_id) REFERENCES yarn_products(id),
      FOREIGN KEY (lot_id) REFERENCES yarn_lots(id)
    );
 
    CREATE TABLE IF NOT EXISTS yarn_sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_number TEXT UNIQUE NOT NULL,
      customer_id INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      total_amount REAL DEFAULT 0,
      discount_percentage REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      net_amount REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'CONFIRMED' CHECK(status IN ('DRAFT','CONFIRMED','DISPATCHED','CANCELLED')),
      gate_pass_id INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES yarn_customers(id)
    );
 
    CREATE TABLE IF NOT EXISTS yarn_sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      lot_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL,
      target_price REAL,
      FOREIGN KEY (sale_id) REFERENCES yarn_sales(id),
      FOREIGN KEY (product_id) REFERENCES yarn_products(id),
      FOREIGN KEY (lot_id) REFERENCES yarn_lots(id)
    );
 
    CREATE TABLE IF NOT EXISTS yarn_gate_passes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gate_pass_number TEXT UNIQUE NOT NULL,
      sale_id INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      lot_ids TEXT NOT NULL,
      total_quantity REAL NOT NULL,
      verified_by TEXT,
      vehicle_number TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (sale_id) REFERENCES yarn_sales(id)
    );
 
    CREATE TABLE IF NOT EXISTS yarn_manufacturing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lot_id INTEGER NOT NULL,
      process_type TEXT NOT NULL DEFAULT 'DYEING' CHECK(process_type IN ('DYEING')),
      status TEXT DEFAULT 'IN_PROGRESS' CHECK(status IN ('IN_PROGRESS','COMPLETED','CANCELLED')),
      input_weight REAL NOT NULL,
      expected_output REAL NOT NULL,
      actual_output REAL,
      shade_code TEXT,
      output_product_id INTEGER,
      output_lot_id INTEGER,
      start_date TEXT DEFAULT (date('now')),
      end_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (lot_id) REFERENCES yarn_lots(id),
      FOREIGN KEY (output_product_id) REFERENCES yarn_products(id)
    );
 
    CREATE TABLE IF NOT EXISTS yarn_wastage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lot_id INTEGER NOT NULL,
      manufacturing_id INTEGER NOT NULL,
      process_stage TEXT NOT NULL DEFAULT 'DYEING' CHECK(process_stage IN ('DYEING')),
      input_weight REAL NOT NULL,
      expected_output REAL NOT NULL,
      actual_output REAL NOT NULL,
      wastage_amount REAL NOT NULL,
      wastage_percentage REAL NOT NULL,
      cost_per_unit REAL DEFAULT 0,
      wastage_cost REAL DEFAULT 0,
      date TEXT DEFAULT (date('now')),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (lot_id) REFERENCES yarn_lots(id),
      FOREIGN KEY (manufacturing_id) REFERENCES yarn_manufacturing(id)
    );
 
    CREATE TABLE IF NOT EXISTS yarn_purchase_returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_number TEXT UNIQUE NOT NULL,
      purchase_id   INTEGER,
      purchase_number TEXT,
      supplier_id   INTEGER,
      supplier_name TEXT,
      date TEXT NOT NULL DEFAULT (date('now')),
      reason TEXT NOT NULL,
      notes TEXT,
      total_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'COMPLETED' CHECK(status IN ('COMPLETED','CANCELLED')),
      created_at TEXT DEFAULT (datetime('now'))
    );
 
    CREATE TABLE IF NOT EXISTS yarn_purchase_return_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_id    INTEGER NOT NULL,
      lot_id       INTEGER,
      lot_number   TEXT,
      product_id   INTEGER,
      product_name TEXT,
      quantity     REAL NOT NULL,
      rate         REAL NOT NULL,
      amount       REAL NOT NULL,
      unit         TEXT,
      FOREIGN KEY (return_id) REFERENCES yarn_purchase_returns(id)
    );
 
    CREATE TABLE IF NOT EXISTS yarn_sale_returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_number TEXT UNIQUE NOT NULL,
      sale_id INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      reason TEXT NOT NULL,
      notes TEXT,
      restock_location TEXT DEFAULT 'FINISHED_STORE' CHECK(restock_location IN ('STORE','FINISHED_STORE')),
      total_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'COMPLETED' CHECK(status IN ('COMPLETED','CANCELLED')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (sale_id) REFERENCES yarn_sales(id)
    );
 
    CREATE TABLE IF NOT EXISTS yarn_sale_return_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_id INTEGER NOT NULL,
      lot_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL,
      restock_location TEXT DEFAULT 'FINISHED_STORE',
      FOREIGN KEY (return_id) REFERENCES yarn_sale_returns(id),
      FOREIGN KEY (lot_id) REFERENCES yarn_lots(id),
      FOREIGN KEY (product_id) REFERENCES yarn_products(id)
    );
 
    CREATE TABLE IF NOT EXISTS yarn_suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      credit_terms TEXT,
      opening_balance REAL DEFAULT 0,
      current_balance REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
 
    CREATE TABLE IF NOT EXISTS yarn_supplier_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      type TEXT NOT NULL CHECK(type IN ('PURCHASE','PAYMENT','OPENING','ADJUSTMENT')),
      reference_id INTEGER,
      description TEXT,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (supplier_id) REFERENCES yarn_suppliers(id)
    );
 
    CREATE TABLE IF NOT EXISTS yarn_customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      credit_limit REAL DEFAULT 0,
      opening_balance REAL DEFAULT 0,
      current_balance REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
 
    CREATE TABLE IF NOT EXISTS yarn_customer_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      type TEXT NOT NULL CHECK(type IN ('SALE','PAYMENT','OPENING','ADJUSTMENT')),
      reference_id INTEGER,
      description TEXT,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES yarn_customers(id)
    );
  `);
 
  // ─────────────────────────────────────────────────────────────
  // CHEMICAL WORKSPACE TABLES
  // ─────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS chem_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER,
      type TEXT NOT NULL CHECK(type IN ('CHEMICAL_RAW','CHEMICAL_FINISHED')),
      unit TEXT DEFAULT 'KG',
      conversion_factor REAL DEFAULT 1.0,
      min_stock_level REAL DEFAULT 0,
      chemical_code TEXT,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES product_categories(id)
    );
 
    CREATE TABLE IF NOT EXISTS chem_lots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lot_number TEXT UNIQUE NOT NULL,
      product_id INTEGER NOT NULL,
      purchase_id INTEGER,
      status TEXT DEFAULT 'IN_STORE' CHECK(status IN ('IN_STORE','CHEMICAL_MANUFACTURING','READY_FOR_SALE','SOLD','PARTIALLY_SOLD','RETURNED')),
      location TEXT DEFAULT 'CHEMICAL_STORE' CHECK(location IN ('CHEMICAL_STORE')),
      initial_quantity REAL NOT NULL,
      current_quantity REAL NOT NULL,
      chemical_code TEXT,
      cost_per_unit REAL DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES chem_products(id)
    );
 
    CREATE TABLE IF NOT EXISTS chem_inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      lot_id INTEGER NOT NULL,
      location TEXT NOT NULL DEFAULT 'CHEMICAL_STORE',
      quantity REAL NOT NULL DEFAULT 0,
      unit TEXT DEFAULT 'KG',
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES chem_products(id),
      FOREIGN KEY (lot_id) REFERENCES chem_lots(id)
    );
 
    CREATE TABLE IF NOT EXISTS chem_purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_number TEXT UNIQUE NOT NULL,
      supplier_id INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      total_amount REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'RECEIVED' CHECK(status IN ('PENDING','RECEIVED','CANCELLED')),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (supplier_id) REFERENCES chem_suppliers(id)
    );
 
    CREATE TABLE IF NOT EXISTS chem_purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      lot_id INTEGER,
      quantity REAL NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (purchase_id) REFERENCES chem_purchases(id),
      FOREIGN KEY (product_id) REFERENCES chem_products(id),
      FOREIGN KEY (lot_id) REFERENCES chem_lots(id)
    );
 
    CREATE TABLE IF NOT EXISTS chem_sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_number TEXT UNIQUE NOT NULL,
      customer_id INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      total_amount REAL DEFAULT 0,
      discount_percentage REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      net_amount REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'CONFIRMED' CHECK(status IN ('DRAFT','CONFIRMED','DISPATCHED','CANCELLED')),
      gate_pass_id INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES chem_customers(id)
    );
 
    CREATE TABLE IF NOT EXISTS chem_sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      lot_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL,
      target_price REAL,
      FOREIGN KEY (sale_id) REFERENCES chem_sales(id),
      FOREIGN KEY (product_id) REFERENCES chem_products(id),
      FOREIGN KEY (lot_id) REFERENCES chem_lots(id)
    );
 
    CREATE TABLE IF NOT EXISTS chem_gate_passes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gate_pass_number TEXT UNIQUE NOT NULL,
      sale_id INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      lot_ids TEXT NOT NULL,
      total_quantity REAL NOT NULL,
      verified_by TEXT,
      vehicle_number TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (sale_id) REFERENCES chem_sales(id)
    );
 
    CREATE TABLE IF NOT EXISTS chem_manufacturing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lot_id INTEGER NOT NULL,
      process_type TEXT NOT NULL DEFAULT 'CHEMICAL_MANUFACTURING',
      status TEXT DEFAULT 'IN_PROGRESS' CHECK(status IN ('IN_PROGRESS','COMPLETED','CANCELLED')),
      input_weight REAL NOT NULL,
      expected_output REAL NOT NULL,
      actual_output REAL,
      chemical_code TEXT,
      output_product_id INTEGER,
      output_lot_id INTEGER,
      start_date TEXT DEFAULT (date('now')),
      end_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (lot_id) REFERENCES chem_lots(id),
      FOREIGN KEY (output_product_id) REFERENCES chem_products(id)
    );
 
    CREATE TABLE IF NOT EXISTS chem_wastage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lot_id INTEGER NOT NULL,
      manufacturing_id INTEGER NOT NULL,
      process_stage TEXT NOT NULL DEFAULT 'CHEMICAL_MANUFACTURING',
      input_weight REAL NOT NULL,
      expected_output REAL NOT NULL,
      actual_output REAL NOT NULL,
      wastage_amount REAL NOT NULL,
      wastage_percentage REAL NOT NULL,
      cost_per_unit REAL DEFAULT 0,
      wastage_cost REAL DEFAULT 0,
      date TEXT DEFAULT (date('now')),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (lot_id) REFERENCES chem_lots(id),
      FOREIGN KEY (manufacturing_id) REFERENCES chem_manufacturing(id)
    );
 
    CREATE TABLE IF NOT EXISTS chem_purchase_returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_number TEXT UNIQUE NOT NULL,
      purchase_id   INTEGER,
      purchase_number TEXT,
      supplier_id   INTEGER,
      supplier_name TEXT,
      date TEXT NOT NULL DEFAULT (date('now')),
      reason TEXT NOT NULL,
      notes TEXT,
      total_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'COMPLETED' CHECK(status IN ('COMPLETED','CANCELLED')),
      created_at TEXT DEFAULT (datetime('now'))
    );
 
    CREATE TABLE IF NOT EXISTS chem_purchase_return_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_id    INTEGER NOT NULL,
      lot_id       INTEGER,
      lot_number   TEXT,
      product_id   INTEGER,
      product_name TEXT,
      quantity     REAL NOT NULL,
      rate         REAL NOT NULL,
      amount       REAL NOT NULL,
      unit         TEXT,
      FOREIGN KEY (return_id) REFERENCES chem_purchase_returns(id)
    );
 
    CREATE TABLE IF NOT EXISTS chem_sale_returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_number TEXT UNIQUE NOT NULL,
      sale_id INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      reason TEXT NOT NULL,
      notes TEXT,
      restock_location TEXT DEFAULT 'CHEMICAL_STORE',
      total_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'COMPLETED' CHECK(status IN ('COMPLETED','CANCELLED')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (sale_id) REFERENCES chem_sales(id)
    );
 
    CREATE TABLE IF NOT EXISTS chem_sale_return_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_id INTEGER NOT NULL,
      lot_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL,
      restock_location TEXT DEFAULT 'CHEMICAL_STORE',
      FOREIGN KEY (return_id) REFERENCES chem_sale_returns(id),
      FOREIGN KEY (lot_id) REFERENCES chem_lots(id),
      FOREIGN KEY (product_id) REFERENCES chem_products(id)
    );
 
    CREATE TABLE IF NOT EXISTS chem_suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      credit_terms TEXT,
      opening_balance REAL DEFAULT 0,
      current_balance REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
 
    CREATE TABLE IF NOT EXISTS chem_supplier_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      type TEXT NOT NULL CHECK(type IN ('PURCHASE','PAYMENT','OPENING','ADJUSTMENT')),
      reference_id INTEGER,
      description TEXT,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (supplier_id) REFERENCES chem_suppliers(id)
    );
 
    CREATE TABLE IF NOT EXISTS chem_customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      credit_limit REAL DEFAULT 0,
      opening_balance REAL DEFAULT 0,
      current_balance REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
 
    CREATE TABLE IF NOT EXISTS chem_customer_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      type TEXT NOT NULL CHECK(type IN ('SALE','PAYMENT','OPENING','ADJUSTMENT')),
      reference_id INTEGER,
      description TEXT,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES chem_customers(id)
    );
  `);
 
  // ─────────────────────────────────────────────────────────────
  // Default data
  // ─────────────────────────────────────────────────────────────
  const s = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  s.run('company_name', 'GH & Sons Enterprises');
  s.run('half_day_threshold', '4');
  s.run('full_day_threshold', '8');
  s.run('standard_hours', '8');
  s.run('overtime_rate_multiplier', '1.5');
 
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existing) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password, full_name, role) VALUES (?,?,?,?)')
      .run('admin', hash, 'System Administrator', 'admin');
  }

  // ── Simple column-add migrations (safe no-op if column already exists) ────
  const columnMigrations = [
    `ALTER TABLE yarn_products ADD COLUMN shade_code TEXT`,
    `ALTER TABLE chem_products ADD COLUMN chemical_code TEXT`,
    `ALTER TABLE yarn_purchase_returns ADD COLUMN purchase_number TEXT`,
    `ALTER TABLE yarn_purchase_returns ADD COLUMN supplier_id INTEGER`,
    `ALTER TABLE yarn_purchase_returns ADD COLUMN supplier_name TEXT`,
    `ALTER TABLE chem_purchase_returns ADD COLUMN purchase_number TEXT`,
    `ALTER TABLE chem_purchase_returns ADD COLUMN supplier_id INTEGER`,
    `ALTER TABLE chem_purchase_returns ADD COLUMN supplier_name TEXT`,
    `ALTER TABLE yarn_purchase_return_items ADD COLUMN lot_number TEXT`,
    `ALTER TABLE yarn_purchase_return_items ADD COLUMN product_name TEXT`,
    `ALTER TABLE yarn_purchase_return_items ADD COLUMN unit TEXT`,
    `ALTER TABLE chem_purchase_return_items ADD COLUMN lot_number TEXT`,
    `ALTER TABLE chem_purchase_return_items ADD COLUMN product_name TEXT`,
    `ALTER TABLE chem_purchase_return_items ADD COLUMN unit TEXT`,
  ];
  for (const sql of columnMigrations) {
    try { db.exec(sql); } catch (e) { /* column already exists — ignore */ }
  }

  // ── Recreate purchase_returns tables ─────────────────────────────────────
  //
  // Fixes two schema issues on existing databases:
  //   1. purchase_id INTEGER NOT NULL  → make nullable
  //   2. FOREIGN KEY (lot_id) on return_items → drop it so lots can be deleted
  //      without breaking return item rows (lot_number snapshot column is used instead)
  //
  // Uses SQLite rename+recreate pattern. Runs on every startup but checks both
  // conditions — only migrates if at least one issue is still present.
  //
  db.pragma('foreign_keys = OFF');
  try {
    db.transaction(() => {
      for (const prefix of ['yarn', 'chem']) {
        const retTable  = `${prefix}_purchase_returns`;
        const itemTable = `${prefix}_purchase_return_items`;

        // Check condition 1: is purchase_id still NOT NULL?
        const retCols           = db.prepare(`PRAGMA table_info(${retTable})`).all();
        const purIdCol          = retCols.find(c => c.name === 'purchase_id');
        const purchaseIdNotNull = purIdCol && purIdCol.notnull === 1;

        // Check condition 2: does lot_id still have a FK?
        const itemFKs    = db.prepare(`PRAGMA foreign_key_list(${itemTable})`).all();
        const hasLotIdFK = itemFKs.some(fk => fk.from === 'lot_id');

        // Skip only when BOTH issues are already resolved
        if (!purchaseIdNotNull && !hasLotIdFK) {
          console.log(`[database] ${retTable}: schema OK — skip migration`);
          continue;
        }

        console.log(`[database] Migrating ${retTable}: purchaseIdNotNull=${purchaseIdNotNull}, hasLotIdFK=${hasLotIdFK}`);

        // Rename old tables
        db.exec(`ALTER TABLE ${itemTable} RENAME TO ${itemTable}_old`);
        db.exec(`ALTER TABLE ${retTable}  RENAME TO ${retTable}_old`);

        // Recreate returns table — purchase_id nullable, snapshot columns
        db.exec(`
          CREATE TABLE ${retTable} (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            return_number   TEXT UNIQUE NOT NULL,
            purchase_id     INTEGER,
            purchase_number TEXT,
            supplier_id     INTEGER,
            supplier_name   TEXT,
            date            TEXT NOT NULL DEFAULT (date('now')),
            reason          TEXT NOT NULL,
            notes           TEXT,
            total_amount    REAL DEFAULT 0,
            status          TEXT DEFAULT 'COMPLETED'
                              CHECK(status IN ('COMPLETED','CANCELLED')),
            created_at      TEXT DEFAULT (datetime('now'))
          )
        `);

        // Recreate items table — NO FK on lot_id, snapshot columns
        db.exec(`
          CREATE TABLE ${itemTable} (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            return_id    INTEGER NOT NULL,
            lot_id       INTEGER,
            lot_number   TEXT,
            product_id   INTEGER,
            product_name TEXT,
            quantity     REAL NOT NULL,
            rate         REAL NOT NULL,
            amount       REAL NOT NULL,
            unit         TEXT,
            FOREIGN KEY (return_id) REFERENCES ${retTable}(id)
          )
        `);

        // Copy only columns that existed in old tables
        const oldRetCols  = db.prepare(`PRAGMA table_info(${retTable}_old)`).all().map(c => c.name);
        const oldItemCols = db.prepare(`PRAGMA table_info(${itemTable}_old)`).all().map(c => c.name);

        const retBase    = ['id','return_number','purchase_id','date','reason','notes','total_amount','status','created_at'];
        const retSnap    = ['purchase_number','supplier_id','supplier_name'].filter(c => oldRetCols.includes(c));
        const retCols2   = [...retBase, ...retSnap].join(', ');

        const itemBase   = ['id','return_id','lot_id','product_id','quantity','rate','amount'];
        const itemSnap   = ['lot_number','product_name','unit'].filter(c => oldItemCols.includes(c));
        const itemCols2  = [...itemBase, ...itemSnap].join(', ');

        db.exec(`INSERT INTO ${retTable}  (${retCols2})  SELECT ${retCols2}  FROM ${retTable}_old`);
        db.exec(`INSERT INTO ${itemTable} (${itemCols2}) SELECT ${itemCols2} FROM ${itemTable}_old`);

        // Drop old tables
        db.exec(`DROP TABLE ${itemTable}_old`);
        db.exec(`DROP TABLE ${retTable}_old`);

        console.log(`[database] ✅ ${retTable} + ${itemTable} migrated successfully`);
      }
    })();
  } catch (e) {
    console.error('[database] purchase_returns migration error:', e.message);
  }
  db.pragma('foreign_keys = ON');

  // ── Migration: Add 'RETURNED' status to lots tables ───────────────────────
  // SQLite doesn't support ALTER TABLE to modify CHECK constraints directly.
  // We need to recreate the tables with the new constraint.
  // This migration checks if the RETURNED status is already allowed.
  db.pragma('foreign_keys = OFF');
  try {
    db.transaction(() => {
      for (const config of [
        { 
          table: 'yarn_lots',
          oldCheck: "('IN_STORE','DYEING','FINISHED','READY_FOR_SALE','SOLD','PARTIALLY_SOLD')",
          newCheck: "('IN_STORE','DYEING','FINISHED','READY_FOR_SALE','SOLD','PARTIALLY_SOLD','RETURNED')",
          locationCheck: "('STORE','DYEING','FINISHED_STORE')",
          codeCol: 'shade_code'
        },
        { 
          table: 'chem_lots',
          oldCheck: "('IN_STORE','CHEMICAL_MANUFACTURING','READY_FOR_SALE','SOLD','PARTIALLY_SOLD')",
          newCheck: "('IN_STORE','CHEMICAL_MANUFACTURING','READY_FOR_SALE','SOLD','PARTIALLY_SOLD','RETURNED')",
          locationCheck: "('CHEMICAL_STORE')",
          codeCol: 'chemical_code'
        }
      ]) {
        // Test if RETURNED status is already allowed
        try {
          db.prepare(`UPDATE ${config.table} SET status = 'RETURNED' WHERE 1=0`).run();
          console.log(`[database] ${config.table}: RETURNED status already allowed — skip migration`);
          continue;
        } catch (e) {
          if (!e.message.includes('CHECK constraint')) {
            console.log(`[database] ${config.table}: RETURNED status already allowed — skip migration`);
            continue;
          }
          // CHECK constraint failed means we need to migrate
          console.log(`[database] ${config.table}: Migrating to add RETURNED status...`);
        }

        // Recreate the table with new CHECK constraint
        db.exec(`ALTER TABLE ${config.table} RENAME TO ${config.table}_old`);
        
        db.exec(`
          CREATE TABLE ${config.table} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lot_number TEXT UNIQUE NOT NULL,
            product_id INTEGER NOT NULL,
            purchase_id INTEGER,
            status TEXT DEFAULT 'IN_STORE' CHECK(status IN ${config.newCheck}),
            location TEXT DEFAULT '${config.locationCheck === "('CHEMICAL_STORE')" ? 'CHEMICAL_STORE' : 'STORE'}' CHECK(location IN ${config.locationCheck}),
            initial_quantity REAL NOT NULL,
            current_quantity REAL NOT NULL,
            ${config.codeCol} TEXT,
            cost_per_unit REAL DEFAULT 0,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (product_id) REFERENCES ${config.table.replace('_lots', '_products')}(id)
          )
        `);

        // Copy data
        db.exec(`
          INSERT INTO ${config.table} 
            (id, lot_number, product_id, purchase_id, status, location, initial_quantity, current_quantity, ${config.codeCol}, cost_per_unit, notes, created_at, updated_at)
          SELECT 
            id, lot_number, product_id, purchase_id, status, location, initial_quantity, current_quantity, ${config.codeCol}, cost_per_unit, notes, created_at, updated_at
          FROM ${config.table}_old
        `);

        // Drop old table
        db.exec(`DROP TABLE ${config.table}_old`);
        
        console.log(`[database] ✅ ${config.table} migrated to support RETURNED status`);
      }
    })();
  } catch (e) {
    console.error('[database] lots table migration error:', e.message);
  }
  db.pragma('foreign_keys = ON');

  // ── Auto-seed default data (safe — INSERT OR IGNORE) ─────────────────────
  const alreadySeeded = db.prepare(`SELECT COUNT(*) AS c FROM product_categories`).get().c;
  if (alreadySeeded === 0) {
    console.log('[database] Running first-time seed...');

    const YARN_CATEGORIES = ['Viscose', 'Polyester', 'Bobbin'];

    const YARN_SHADES = [
      '0032','1001','1003','1012','1017','1019','1020','1021','1024','1025',
      '1026','1027','1028','1032','1043','1052','1054','1055','1056','1057',
      '1058','1060','1063','1065','1070','1074','1080','1084','1088','1089',
      '1100','1103','1105','1108','1110','1111','1116','1118','1119','1122',
      '1123','1126','1128','1140','1144','1145','1147','1154','1155','1156',
      '1157','1166','1181','1187','1188','1191','1226','1243','1278','1306',
      '1309','1311','1313','1321','1359','1380','1384','1386','1388','1510',
      '2071','2072','2150','2191','2226','3000','3012','3019','3053','3055',
      '3062','3071','3082','3084','3098','3100','3106','3126','3127','3128',
      '3133','3147','3181','3186','3190','3227','3243','3337','3363','3385',
      '3390','3394','3798','4071','4192','4197','4215','4242','4272','4288',
      '4298','4314','4346','4387','4441','4550','4589','5048','5089','5221',
      '5306','5390','5441','5792','6008','6011','6020','6108','7012','7065',
      '8012','8056','9024','9025','DM102',
    ];

    const CHEMICAL_PRODUCTS = [
      'Acidic buffer',
      'Dispersing agent',
      'UMT Fininishing Agent',
      'Tamol NN',
      'SNF',
      'BTG',
    ];

    const insertCat = db.prepare(`INSERT OR IGNORE INTO product_categories (name) VALUES (?)`);
    for (const name of YARN_CATEGORIES) insertCat.run(name);

    const catMap = {};
    for (const name of YARN_CATEGORIES) {
      const row = db.prepare(`SELECT id FROM product_categories WHERE name = ?`).get(name);
      if (row) catMap[name] = row.id;
    }

    const insertYarn = db.prepare(`
      INSERT OR IGNORE INTO yarn_products
        (name, category_id, type, unit, shade_code, is_active)
      VALUES (?, ?, ?, 'No Of Cones', ?, 1)
    `);

    const seedYarn = db.transaction(() => {
      for (const cat of YARN_CATEGORIES) {
        const catId = catMap[cat];
        if (!catId) continue;
        for (const shade of YARN_SHADES) {
          insertYarn.run(shade, catId, 'RAW_YARN',  null);
          insertYarn.run(shade, catId, 'DYED_YARN', shade);
        }
      }
    });
    seedYarn();

    const insertChem = db.prepare(`
      INSERT OR IGNORE INTO chem_products
        (name, category_id, type, unit, is_active)
      VALUES (?, NULL, 'CHEMICAL_RAW', 'Kg', 1)
    `);
    for (const name of CHEMICAL_PRODUCTS) insertChem.run(name);

    console.log('[database] ✅ First-time seed complete.');
  }

  console.log('✅  Database ready — yarn_ and chem_ tables are fully separate');
  return db;
}
 
module.exports = { initializeDatabase, DB_PATH };