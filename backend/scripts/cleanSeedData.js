// backend/scripts/cleanSeedData.js
// Run once: node scripts/cleanSeedData.js
// Removes test/seed suppliers and customers, keeps all products.

const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'yarnchem.db');
const db = new Database(DB_PATH);

db.pragma('foreign_keys = OFF'); // disable FK so ledger rows don't block

const del = (table, label) => {
  const before = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get().c;
  db.prepare(`DELETE FROM ${table}`).run();
  console.log(`✅ Cleared ${table}: removed ${before} rows`);
};

// Clear yarn workspace suppliers + ledger
del('yarn_supplier_ledger', 'yarn_supplier_ledger');
del('yarn_suppliers',       'yarn_suppliers');

// Clear chem workspace suppliers + ledger
del('chem_supplier_ledger', 'chem_supplier_ledger');
del('chem_suppliers',       'chem_suppliers');

// Clear yarn workspace customers + ledger
del('yarn_customer_ledger', 'yarn_customer_ledger');
del('yarn_customers',       'yarn_customers');

// Clear chem workspace customers + ledger
del('chem_customer_ledger', 'chem_customer_ledger');
del('chem_customers',       'chem_customers');

// Reset auto-increment counters
db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('yarn_suppliers','chem_suppliers','yarn_customers','chem_customers','yarn_supplier_ledger','chem_supplier_ledger','yarn_customer_ledger','chem_customer_ledger')").run();

db.pragma('foreign_keys = ON');
db.close();

console.log('\n✅ Done. Products preserved. Suppliers and customers cleared.');
console.log('   You can now add your own suppliers and customers from the app.');