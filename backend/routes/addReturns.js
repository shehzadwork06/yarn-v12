// migrations/addReturns.js
// Run this ONCE to add return tables to your existing database.
// It is safe to run multiple times (uses IF NOT EXISTS).

const Database = require('better-sqlite3');
const path = require('path');
const DB_PATH = path.join(__dirname, '..', 'data', 'yarnchem.db');

function runMigration() {
  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  console.log('[MIGRATION] Adding purchase_returns and sale_returns tables...');

  // ── Purchase Returns ─────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_number TEXT UNIQUE NOT NULL,
      purchase_id INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      reason TEXT NOT NULL,
      notes TEXT,
      total_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'COMPLETED' CHECK(status IN ('COMPLETED','CANCELLED')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (purchase_id) REFERENCES purchases(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_return_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_id INTEGER NOT NULL,
      lot_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (return_id) REFERENCES purchase_returns(id),
      FOREIGN KEY (lot_id) REFERENCES lots(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // ── Sale Returns ─────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS sale_returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_number TEXT UNIQUE NOT NULL,
      sale_id INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      reason TEXT NOT NULL,
      notes TEXT,
      restock_location TEXT DEFAULT 'FINISHED_STORE' CHECK(restock_location IN ('STORE','FINISHED_STORE','CHEMICAL_STORE')),
      total_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'COMPLETED' CHECK(status IN ('COMPLETED','CANCELLED')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (sale_id) REFERENCES sales(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sale_return_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_id INTEGER NOT NULL,
      lot_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL,
      restock_location TEXT DEFAULT 'FINISHED_STORE',
      FOREIGN KEY (return_id) REFERENCES sale_returns(id),
      FOREIGN KEY (lot_id) REFERENCES lots(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // ── Extend supplier_ledger to allow RETURN type ───────────────
  // SQLite doesn't support ALTER COLUMN — we use a soft approach:
  // The existing CHECK constraint on type only blocks new bad values.
  // Since we're inserting 'ADJUSTMENT' for both return types (which is
  // already in the allowed list), no schema change is needed there.

  console.log('[MIGRATION] Done. Tables created:');
  console.log('  - purchase_returns');
  console.log('  - purchase_return_items');
  console.log('  - sale_returns');
  console.log('  - sale_return_items');

  db.close();
}

runMigration();
