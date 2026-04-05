// const { initializeDatabase } = require('../config/database');
// const { generateLotNumber, generateNumber } = require('../utils/helpers');

// const db = initializeDatabase();

// function seed() {
//   console.log('Seeding database...');

//   const txn = db.transaction(() => {
//     // === PRODUCTS ===
//     const products = [
//       { name: 'Cotton Yarn 20/1', type: 'RAW_YARN', unit: 'KG', conversion_factor: 50, min_stock_level: 500 },
//       { name: 'Polyester Yarn 30/1', type: 'RAW_YARN', unit: 'KG', conversion_factor: 40, min_stock_level: 300 },
//       { name: 'Blended Yarn 40/1', type: 'RAW_YARN', unit: 'KG', conversion_factor: 45, min_stock_level: 200 },
//       { name: 'Cotton Yarn 20/1 - Red RX-101', type: 'DYED_YARN', unit: 'KG', shade_code: 'RX-101', min_stock_level: 100 },
//       { name: 'Cotton Yarn 20/1 - Blue BL-205', type: 'DYED_YARN', unit: 'KG', shade_code: 'BL-205', min_stock_level: 100 },
//       { name: 'Sodium Hydroxide (Caustic Soda)', type: 'CHEMICAL_RAW', unit: 'KG', min_stock_level: 200 },
//       { name: 'Hydrogen Peroxide', type: 'CHEMICAL_RAW', unit: 'KG', min_stock_level: 150 },
//       { name: 'Finishing Agent FA-300', type: 'CHEMICAL_FINISHED', unit: 'KG', chemical_code: 'FA-300', min_stock_level: 50 },
//     ];
//     const insertProduct = db.prepare('INSERT OR IGNORE INTO products (name, type, unit, conversion_factor, min_stock_level, shade_code, chemical_code) VALUES (?,?,?,?,?,?,?)');
//     products.forEach(p => insertProduct.run(p.name, p.type, p.unit, p.conversion_factor || 1, p.min_stock_level, p.shade_code || null, p.chemical_code || null));

//     // === SUPPLIERS ===
//     const suppliers = [
//       { name: 'Ali Textile Mills', phone: '0300-1234567', address: 'Faisalabad, Pakistan', credit_terms: 'Net 30', opening_balance: 150000 },
//       { name: 'Khan Chemical Trading', phone: '0321-7654321', address: 'Lahore, Pakistan', credit_terms: 'Net 15', opening_balance: 75000 },
//       { name: 'Raza Yarn Suppliers', phone: '0333-9876543', address: 'Karachi, Pakistan', credit_terms: 'Net 45', opening_balance: 0 },
//     ];
//     const insertSupplier = db.prepare('INSERT OR IGNORE INTO suppliers (name, phone, address, credit_terms, opening_balance, current_balance) VALUES (?,?,?,?,?,?)');
//     const insertSupLedger = db.prepare('INSERT INTO supplier_ledger (supplier_id, type, description, debit, balance) VALUES (?,?,?,?,?)');
//     suppliers.forEach(s => {
//       const r = insertSupplier.run(s.name, s.phone, s.address, s.credit_terms, s.opening_balance, s.opening_balance);
//       if (r.changes > 0 && s.opening_balance > 0) {
//         insertSupLedger.run(r.lastInsertRowid, 'OPENING', 'Opening balance', s.opening_balance, s.opening_balance);
//       }
//     });

//     // === CUSTOMERS ===
//     const customers = [
//       { name: 'Mahmood Textile Exports', phone: '0300-5551234', address: 'Sialkot, Pakistan', credit_limit: 500000, opening_balance: 85000 },
//       { name: 'Rafiq Garments', phone: '0321-5559876', address: 'Faisalabad, Pakistan', credit_limit: 300000, opening_balance: 0 },
//       { name: 'Global Fabrics Ltd', phone: '0333-5554567', address: 'Lahore, Pakistan', credit_limit: 1000000, opening_balance: 250000 },
//       { name: 'Sunrise Chemical Industries', phone: '0345-1112222', address: 'Karachi, Pakistan', credit_limit: 200000, opening_balance: 0 },
//     ];
//     const insertCustomer = db.prepare('INSERT OR IGNORE INTO customers (name, phone, address, credit_limit, opening_balance, current_balance) VALUES (?,?,?,?,?,?)');
//     const insertCustLedger = db.prepare('INSERT INTO customer_ledger (customer_id, type, description, debit, balance) VALUES (?,?,?,?,?)');
//     customers.forEach(c => {
//       const r = insertCustomer.run(c.name, c.phone, c.address, c.credit_limit, c.opening_balance, c.opening_balance);
//       if (r.changes > 0 && c.opening_balance > 0) {
//         insertCustLedger.run(r.lastInsertRowid, 'OPENING', 'Opening balance', c.opening_balance, c.opening_balance);
//       }
//     });

//     // === EMPLOYEES ===
//     const employees = [
//       { name: 'Ahmed Khan', phone: '0300-1111111', designation: 'Dye Master', department: 'DYEING', basic_salary: 45000, joining_date: '2023-01-15' },
//       { name: 'Bilal Shah', phone: '0300-2222222', designation: 'Machine Operator', department: 'PRODUCTION', basic_salary: 35000, joining_date: '2023-03-01' },
//       { name: 'Careem Ali', phone: '0300-3333333', designation: 'Chemical Engineer', department: 'CHEMICAL', basic_salary: 55000, joining_date: '2022-06-01' },
//       { name: 'Danish Raza', phone: '0300-4444444', designation: 'Store Keeper', department: 'STORE', basic_salary: 30000, joining_date: '2023-08-15' },
//       { name: 'Ehsan Malik', phone: '0300-5555555', designation: 'Accountant', department: 'FINANCE', basic_salary: 50000, joining_date: '2022-01-01' },
//     ];
//     const insertEmp = db.prepare('INSERT OR IGNORE INTO employees (employee_code, name, phone, designation, department, basic_salary, joining_date) VALUES (?,?,?,?,?,?,?)');
//     employees.forEach((e, idx) => {
//       insertEmp.run(`EMP-${1001 + idx}`, e.name, e.phone, e.designation, e.department, e.basic_salary, e.joining_date);
//     });

//     // === PURCHASES & LOTS (Story 1 - Raw Yarn Purchase) ===
//     const today = new Date().toISOString().split('T')[0];
//     const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

//     // Purchase 1: Raw yarn from Ali Textile Mills
//     const po1Num = 'PO-SEED-001';
//     db.prepare('INSERT OR IGNORE INTO purchases (purchase_number, supplier_id, date, total_amount, status) VALUES (?,?,?,?,?)').run(po1Num, 1, yesterday, 250000, 'RECEIVED');
//     const po1 = db.prepare('SELECT id FROM purchases WHERE purchase_number = ?').get(po1Num);
//     if (po1) {
//       const lot1Num = 'RY-SEED-001';
//       db.prepare('INSERT OR IGNORE INTO lots (lot_number, product_id, purchase_id, status, location, initial_quantity, current_quantity, cost_per_unit) VALUES (?,?,?,?,?,?,?,?)').run(lot1Num, 1, po1.id, 'IN_STORE', 'STORE', 1000, 1000, 250);
//       const lot1 = db.prepare('SELECT id FROM lots WHERE lot_number = ?').get(lot1Num);
//       if (lot1) {
//         db.prepare('INSERT OR IGNORE INTO purchase_items (purchase_id, product_id, lot_id, quantity, rate, amount) VALUES (?,?,?,?,?,?)').run(po1.id, 1, lot1.id, 1000, 250, 250000);
//         db.prepare('INSERT OR IGNORE INTO inventory (product_id, lot_id, location, quantity, unit) VALUES (?,?,?,?,?)').run(1, lot1.id, 'STORE', 1000, 'KG');
//       }
//       // Update supplier ledger
//       db.prepare('UPDATE suppliers SET current_balance = current_balance + 250000 WHERE id = 1');
//     }

//     // Purchase 2: Dyed yarn (Story 3 — direct dyed yarn purchase)
//     const po2Num = 'PO-SEED-002';
//     db.prepare('INSERT OR IGNORE INTO purchases (purchase_number, supplier_id, date, total_amount, status) VALUES (?,?,?,?,?)').run(po2Num, 1, yesterday, 180000, 'RECEIVED');
//     const po2 = db.prepare('SELECT id FROM purchases WHERE purchase_number = ?').get(po2Num);
//     if (po2) {
//       const lot2Num = 'DY-SEED-001';
//       db.prepare('INSERT OR IGNORE INTO lots (lot_number, product_id, purchase_id, status, location, initial_quantity, current_quantity, shade_code, cost_per_unit) VALUES (?,?,?,?,?,?,?,?,?)').run(lot2Num, 4, po2.id, 'READY_FOR_SALE', 'FINISHED_STORE', 600, 600, 'RX-101', 300);
//       const lot2 = db.prepare('SELECT id FROM lots WHERE lot_number = ?').get(lot2Num);
//       if (lot2) {
//         db.prepare('INSERT OR IGNORE INTO purchase_items (purchase_id, product_id, lot_id, quantity, rate, amount) VALUES (?,?,?,?,?,?)').run(po2.id, 4, lot2.id, 600, 300, 180000);
//         db.prepare('INSERT OR IGNORE INTO inventory (product_id, lot_id, location, quantity, unit) VALUES (?,?,?,?,?)').run(4, lot2.id, 'FINISHED_STORE', 600, 'KG');
//       }
//     }

//     // Purchase 3: Chemical raw material (Story 4)
//     const po3Num = 'PO-SEED-003';
//     db.prepare('INSERT OR IGNORE INTO purchases (purchase_number, supplier_id, date, total_amount, status) VALUES (?,?,?,?,?)').run(po3Num, 2, today, 50000, 'RECEIVED');
//     const po3 = db.prepare('SELECT id FROM purchases WHERE purchase_number = ?').get(po3Num);
//     if (po3) {
//       const lot3Num = 'CR-SEED-001';
//       db.prepare('INSERT OR IGNORE INTO lots (lot_number, product_id, purchase_id, status, location, initial_quantity, current_quantity, cost_per_unit) VALUES (?,?,?,?,?,?,?,?)').run(lot3Num, 6, po3.id, 'IN_STORE', 'CHEMICAL_STORE', 500, 500, 100);
//       const lot3 = db.prepare('SELECT id FROM lots WHERE lot_number = ?').get(lot3Num);
//       if (lot3) {
//         db.prepare('INSERT OR IGNORE INTO purchase_items (purchase_id, product_id, lot_id, quantity, rate, amount) VALUES (?,?,?,?,?,?)').run(po3.id, 6, lot3.id, 500, 100, 50000);
//         db.prepare('INSERT OR IGNORE INTO inventory (product_id, lot_id, location, quantity, unit) VALUES (?,?,?,?,?)').run(6, lot3.id, 'CHEMICAL_STORE', 500, 'KG');
//       }
//     }

//     // === MANUFACTURING (Dyeing example with wastage) ===
//     const rawLot = db.prepare('SELECT * FROM lots WHERE lot_number = ?').get('RY-SEED-001');
//     if (rawLot && rawLot.current_quantity >= 500) {
//       // Create a dyeing batch of 500 KG from lot RY-SEED-001
//       const mfgResult = db.prepare('INSERT INTO manufacturing_processes (lot_id, process_type, status, input_weight, expected_output, actual_output, shade_code, start_date, end_date) VALUES (?,?,?,?,?,?,?,?,?)').run(rawLot.id, 'DYEING', 'COMPLETED', 500, 480, 465, 'BL-205', yesterday, today);
//       const mfgId = mfgResult.lastInsertRowid;

//       // Record wastage: expected 480, actual 465 = 15 KG waste
//       db.prepare('INSERT INTO wastage (lot_id, manufacturing_id, process_stage, input_weight, expected_output, actual_output, wastage_amount, wastage_percentage, cost_per_unit, wastage_cost) VALUES (?,?,?,?,?,?,?,?,?,?)').run(rawLot.id, mfgId, 'DYEING', 500, 480, 465, 15, 3.0, 250, 3750);

//       // Create output lot (dyed yarn)
//       const outLotNum = 'DY-SEED-002';
//       db.prepare('INSERT OR IGNORE INTO lots (lot_number, product_id, status, location, initial_quantity, current_quantity, shade_code, cost_per_unit) VALUES (?,?,?,?,?,?,?,?)').run(outLotNum, 5, 'READY_FOR_SALE', 'FINISHED_STORE', 465, 465, 'BL-205', 268.82);
//       const outLot = db.prepare('SELECT id FROM lots WHERE lot_number = ?').get(outLotNum);
//       if (outLot) {
//         db.prepare('INSERT OR IGNORE INTO inventory (product_id, lot_id, location, quantity, unit) VALUES (?,?,?,?,?)').run(5, outLot.id, 'FINISHED_STORE', 465, 'KG');
//         db.prepare('UPDATE manufacturing_processes SET output_product_id = ?, output_lot_id = ? WHERE id = ?').run(5, outLot.id, mfgId);
//       }

//       // Reduce raw yarn lot
//       db.prepare('UPDATE lots SET current_quantity = 500, updated_at = datetime(\'now\') WHERE id = ?').run(rawLot.id);
//       db.prepare('UPDATE inventory SET quantity = 500 WHERE lot_id = ?').run(rawLot.id);
//     }

//     // === SALE (example — selling dyed yarn) ===
//     const saleLot = db.prepare('SELECT * FROM lots WHERE lot_number = ?').get('DY-SEED-001');
//     if (saleLot && saleLot.current_quantity >= 200) {
//       const slNum = 'SL-SEED-001';
//       const saleAmount = 200 * 400; // 80000
//       db.prepare('INSERT OR IGNORE INTO sales (sale_number, customer_id, date, total_amount, net_amount, status) VALUES (?,?,?,?,?,?)').run(slNum, 1, today, saleAmount, saleAmount, 'DISPATCHED');
//       const sale = db.prepare('SELECT id FROM sales WHERE sale_number = ?').get(slNum);
//       if (sale) {
//         db.prepare('INSERT OR IGNORE INTO sale_items (sale_id, product_id, lot_id, quantity, rate, amount) VALUES (?,?,?,?,?,?)').run(sale.id, 4, saleLot.id, 200, 400, saleAmount);
//         // Gate pass
//         const gpNum = 'GP-SEED-001';
//         const gpResult = db.prepare('INSERT OR IGNORE INTO gate_passes (gate_pass_number, sale_id, date, lot_ids, total_quantity, verified_by, vehicle_number) VALUES (?,?,?,?,?,?,?)').run(gpNum, sale.id, today, '["DY-SEED-001"]', 200, 'Danish Raza', 'LHR-1234');
//         // Update sale with gate pass
//         const gp = db.prepare('SELECT id FROM gate_passes WHERE gate_pass_number = ?').get(gpNum);
//         if (gp) db.prepare('UPDATE sales SET gate_pass_id = ? WHERE id = ?').run(gp.id, sale.id);

//         // Update lot & inventory
//         db.prepare('UPDATE lots SET current_quantity = current_quantity - 200, status = ? WHERE id = ?').run('PARTIALLY_SOLD', saleLot.id);
//         db.prepare('UPDATE inventory SET quantity = quantity - 200 WHERE lot_id = ?').run(saleLot.id);

//         // Customer ledger
//         db.prepare('UPDATE customers SET current_balance = current_balance + ? WHERE id = 1').run(saleAmount);
//       }
//     }

//     // === ATTENDANCE (last 5 days for all employees) ===
//     const empIds = db.prepare('SELECT id FROM employees').all();
//     for (let d = 0; d < 5; d++) {
//       const date = new Date(Date.now() - d * 86400000).toISOString().split('T')[0];
//       for (const emp of empIds) {
//         const existing = db.prepare('SELECT id FROM attendance WHERE employee_id = ? AND date = ?').get(emp.id, date);
//         if (existing) continue;
//         const isAbsent = Math.random() < 0.1;
//         if (isAbsent) {
//           db.prepare('INSERT OR IGNORE INTO attendance (employee_id, date, status) VALUES (?,?,?)').run(emp.id, date, 'ABSENT');
//         } else {
//           const timeIn = `0${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 30).toString().padStart(2, '0')}`;
//           const hours = 7 + Math.random() * 4;
//           const totalMins = Math.floor(hours * 60);
//           const [hIn, mIn] = timeIn.split(':').map(Number);
//           const outMins = hIn * 60 + mIn + totalMins;
//           const timeOut = `${Math.floor(outMins / 60).toString().padStart(2, '0')}:${(outMins % 60).toString().padStart(2, '0')}`;
//           const wh = Math.round(hours * 100) / 100;
//           const ot = hours > 8 ? Math.round((hours - 8) * 100) / 100 : 0;
//           let status = 'PRESENT';
//           if (wh < 4) status = 'HALF_DAY';
//           else if (ot > 0) status = 'OVERTIME';
//           db.prepare('INSERT OR IGNORE INTO attendance (employee_id, date, time_in, time_out, working_hours, overtime_hours, status) VALUES (?,?,?,?,?,?,?)').run(emp.id, date, timeIn, timeOut, wh, ot, status);
//         }
//       }
//     }

//     // === LOAN (example) ===
//     db.prepare('INSERT OR IGNORE INTO loans (employee_id, amount, monthly_deduction, total_paid, remaining, status, notes) VALUES (?,?,?,?,?,?,?)').run(2, 100000, 10000, 20000, 80000, 'ACTIVE', 'Personal loan');

//     // === EXPENSES ===
//     db.prepare('INSERT OR IGNORE INTO expenses (category, description, amount, date) VALUES (?,?,?,?)').run('UTILITIES', 'Electricity bill - January', 45000, today);
//     db.prepare('INSERT OR IGNORE INTO expenses (category, description, amount, date) VALUES (?,?,?,?)').run('MAINTENANCE', 'Machine repair - Dyeing unit', 15000, yesterday);
//     db.prepare('INSERT OR IGNORE INTO expenses (category, description, amount, date) VALUES (?,?,?,?)').run('TRANSPORT', 'Delivery vehicle fuel', 8000, today);

//     console.log('Seed completed successfully!');
//   });

//   txn();
// }

// seed();
// process.exit(0);
/**
 * seed/seed.js
 *
 * Seeds default data:
 *   1. Yarn categories: Viscose, Polyester, Bobbin
 *   2. Per category × per shade: RAW_YARN (no shade_code) + DYED_YARN (shade_code = shade)
 *   3. 6 default chemical products (no category)
 *
 * Run once:  node seed/seed.js
 * Safe to re-run — uses INSERT OR IGNORE.
 */

const Database = require('better-sqlite3');
const path     = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'yarnchem.db');

// ── Data ──────────────────────────────────────────────────────────────────────

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

// ── Seed ──────────────────────────────────────────────────────────────────────

function seed() {
  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  console.log('\n🌱  Seeding GH & Sons ERP database...\n');

  // ── 1. Yarn categories ──────────────────────────────────────────────────────
  const insertCat = db.prepare(`INSERT OR IGNORE INTO product_categories (name) VALUES (?)`);
  for (const name of YARN_CATEGORIES) {
    insertCat.run(name);
    console.log(`  📁  Category: ${name}`);
  }

  // Fetch category IDs
  const catMap = {};
  for (const name of YARN_CATEGORIES) {
    const row = db.prepare(`SELECT id FROM product_categories WHERE name = ?`).get(name);
    if (row) catMap[name] = row.id;
  }

  // ── 2. Yarn products ────────────────────────────────────────────────────────
  // RAW_YARN: name = shade, shade_code = NULL  (undyed — shade field hidden in UI)
  // DYED_YARN: name = shade, shade_code = shade
  const insertYarn = db.prepare(`
    INSERT OR IGNORE INTO yarn_products
      (name, category_id, type, unit, shade_code, is_active)
    VALUES (?, ?, ?, 'No Of Cones', ?, 1)
  `);

  let yarnCount = 0;
  const seedYarn = db.transaction(() => {
    for (const cat of YARN_CATEGORIES) {
      const catId = catMap[cat];
      if (!catId) { console.warn(`  ⚠️  Category "${cat}" not found, skipping`); continue; }
      for (const shade of YARN_SHADES) {
        insertYarn.run(shade, catId, 'RAW_YARN',  null);   // undyed
        insertYarn.run(shade, catId, 'DYED_YARN', shade);  // dyed
        yarnCount += 2;
      }
    }
  });
  seedYarn();
  console.log(`\n  🧵  Yarn products: ${yarnCount} created`);
  console.log(`       (${YARN_SHADES.length} shades × ${YARN_CATEGORIES.length} categories × 2 types)`);

  // ── 3. Chemical products (no category) ─────────────────────────────────────
  const insertChem = db.prepare(`
    INSERT OR IGNORE INTO chem_products
      (name, category_id, type, unit, is_active)
    VALUES (?, NULL, 'CHEMICAL_RAW', 'Kg', 1)
  `);
  console.log('');
  for (const name of CHEMICAL_PRODUCTS) {
    insertChem.run(name);
    console.log(`  🧪  Chemical: ${name}`);
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  const cats  = db.prepare(`SELECT COUNT(*) AS c FROM product_categories`).get().c;
  const yarns = db.prepare(`SELECT COUNT(*) AS c FROM yarn_products`).get().c;
  const chems = db.prepare(`SELECT COUNT(*) AS c FROM chem_products`).get().c;

  console.log('\n──────────────────────────────────────────');
  console.log(`  Categories     : ${cats}`);
  console.log(`  Yarn products  : ${yarns}`);
  console.log(`  Chem products  : ${chems}`);
  console.log('──────────────────────────────────────────');
  console.log('✅  Seed complete!\n');

  db.close();
}

seed();