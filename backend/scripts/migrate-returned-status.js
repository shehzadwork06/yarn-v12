/**
 * Migration Script: Add RETURNED status to yarn_lots and chem_lots
 * 
 * Run this script directly if you're getting CHECK constraint errors:
 * node scripts/migrate-returned-status.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/yarnchem.db');
console.log(`[migration] Opening database: ${DB_PATH}`);

const db = new Database(DB_PATH);

const configs = [
  { 
    table: 'yarn_lots',
    newCheck: "('IN_STORE','DYEING','FINISHED','READY_FOR_SALE','SOLD','PARTIALLY_SOLD','RETURNED')",
    locationCheck: "('STORE','DYEING','FINISHED_STORE')",
    defaultLocation: 'STORE',
    codeCol: 'shade_code',
    productTable: 'yarn_products'
  },
  { 
    table: 'chem_lots',
    newCheck: "('IN_STORE','CHEMICAL_MANUFACTURING','READY_FOR_SALE','SOLD','PARTIALLY_SOLD','RETURNED')",
    locationCheck: "('CHEMICAL_STORE')",
    defaultLocation: 'CHEMICAL_STORE',
    codeCol: 'chemical_code',
    productTable: 'chem_products'
  }
];

for (const config of configs) {
  // Check if table exists
  const tableExists = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(config.table);
  if (!tableExists) {
    console.log(`[migration] ${config.table}: Table doesn't exist — skip`);
    continue;
  }

  // Check current schema
  const schemaRow = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(config.table);
  const schema = schemaRow ? schemaRow.sql : '';
  
  if (schema.includes("'RETURNED'")) {
    console.log(`[migration] ${config.table}: RETURNED status already present — skip`);
    continue;
  }
  
  console.log(`[migration] ${config.table}: Migrating to add RETURNED status...`);
  
  try {
    db.pragma('foreign_keys = OFF');
    
    db.transaction(() => {
      // Rename old table
      db.exec(`ALTER TABLE ${config.table} RENAME TO ${config.table}_migration_temp`);
      
      // Create new table with RETURNED status
      db.exec(`
        CREATE TABLE ${config.table} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          lot_number TEXT UNIQUE NOT NULL,
          product_id INTEGER NOT NULL,
          purchase_id INTEGER,
          status TEXT DEFAULT 'IN_STORE' CHECK(status IN ${config.newCheck}),
          location TEXT DEFAULT '${config.defaultLocation}' CHECK(location IN ${config.locationCheck}),
          initial_quantity REAL NOT NULL,
          current_quantity REAL NOT NULL,
          ${config.codeCol} TEXT,
          cost_per_unit REAL DEFAULT 0,
          notes TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (product_id) REFERENCES ${config.productTable}(id)
        )
      `);

      // Copy data from old table
      db.exec(`
        INSERT INTO ${config.table} 
          (id, lot_number, product_id, purchase_id, status, location, initial_quantity, current_quantity, ${config.codeCol}, cost_per_unit, notes, created_at, updated_at)
        SELECT 
          id, lot_number, product_id, purchase_id, status, location, initial_quantity, current_quantity, ${config.codeCol}, cost_per_unit, notes, created_at, updated_at
        FROM ${config.table}_migration_temp
      `);

      // Drop old table
      db.exec(`DROP TABLE ${config.table}_migration_temp`);
    })();
    
    console.log(`[migration] ✅ ${config.table} migrated successfully!`);
  } catch (e) {
    console.error(`[migration] ❌ ${config.table} migration failed:`, e.message);
    
    // Try to recover
    try {
      const tempExists = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(`${config.table}_migration_temp`);
      if (tempExists) {
        db.exec(`DROP TABLE IF EXISTS ${config.table}`);
        db.exec(`ALTER TABLE ${config.table}_migration_temp RENAME TO ${config.table}`);
        console.log(`[migration] Recovered ${config.table} from temp table`);
      }
    } catch (recoverErr) {
      console.error(`[migration] Recovery failed:`, recoverErr.message);
    }
  } finally {
    db.pragma('foreign_keys = ON');
  }
}

db.close();
console.log('[migration] Done!');
