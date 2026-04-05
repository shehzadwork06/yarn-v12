/**
 * Seed script to add:
 * 1. Yarn categories: Viscose, Polyester, Bobbin
 * 2. Yarn products: 135 products x 3 categories x 2 types (dyed/undyed) = ~810 products
 * 3. Chemical products: 6 direct products (no category)
 */

const { initializeDatabase } = require('../config/database');
const db = initializeDatabase();

// Product codes list
const productCodes = [
  '0032', '1001', '1003', '1012', '1017', '1019', '1020', '1021', '1024', '1025',
  '1026', '1027', '1028', '1032', '1043', '1052', '1054', '1055', '1056', '1057',
  '1058', '1060', '1063', '1065', '1070', '1074', '1080', '1084', '1088', '1089',
  '1100', '1103', '1105', '1108', '1110', '1111', '1116', '1118', '1119', '1122',
  '1123', '1126', '1128', '1140', '1144', '1145', '1147', '1154', '1155', '1156',
  '1157', '1166', '1181', '1187', '1188', '1191', '1226', '1243', '1278', '1306',
  '1309', '1311', '1313', '1321', '1359', '1380', '1384', '1386', '1388', '1510',
  '2071', '2072', '2150', '2191', '2226', '3000', '3012', '3019', '3053', '3055',
  '3062', '3071', '3082', '3084', '3098', '3100', '3106', '3126', '3127', '3128',
  '3133', '3147', '3181', '3186', '3190', '3227', '3243', '3337', '3363', '3385',
  '3390', '3394', '3798', '4071', '4192', '4197', '4215', '4242', '4272', '4288',
  '4298', '4314', '4346', '4387', '4441', '4550', '4589', '5048', '5089', '5221',
  '5306', '5390', '5441', '5792', '6008', '6011', '6020', '6108', '7012', '7065',
  '8012', '8056', '9024', '9025', 'DM102'
];

// Yarn categories
const yarnCategories = ['Viscose', 'Polyester', 'Bobbin'];

// Chemical products (direct, no category)
const chemicalProducts = [
  { name: 'Acidic Buffer', type: 'CHEMICAL_RAW', unit: 'KG' },
  { name: 'Dispersing Agent', type: 'CHEMICAL_RAW', unit: 'KG' },
  { name: 'UMT Finishing Agent', type: 'CHEMICAL_FINISHED', unit: 'KG' },
  { name: 'Tamol NN', type: 'CHEMICAL_RAW', unit: 'KG' },
  { name: 'SNF', type: 'CHEMICAL_RAW', unit: 'KG' },
  { name: 'BTG', type: 'CHEMICAL_RAW', unit: 'KG' }
];

function seedProducts() {
  console.log('🌱 Starting product seeding...');
  
  const txn = db.transaction(() => {
    // ═══════════════════════════════════════════════════════════════════════
    // 1. Create Yarn Categories
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📁 Creating yarn categories...');
    const insertCategory = db.prepare(
      'INSERT OR IGNORE INTO product_categories (name, description) VALUES (?, ?)'
    );
    
    const categoryIds = {};
    for (const catName of yarnCategories) {
      insertCategory.run(catName, `${catName} yarn products`);
      const cat = db.prepare('SELECT id FROM product_categories WHERE name = ?').get(catName);
      if (cat) {
        categoryIds[catName] = cat.id;
        console.log(`  ✓ Category "${catName}" - ID: ${cat.id}`);
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 2. Create Yarn Products (RAW_YARN and DYED_YARN for each category)
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n🧵 Creating yarn products...');
    
    const insertYarnProduct = db.prepare(`
      INSERT OR IGNORE INTO yarn_products 
      (name, category_id, type, unit, shade_code, description, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    
    let yarnProductCount = 0;
    
    for (const category of yarnCategories) {
      const categoryId = categoryIds[category];
      if (!categoryId) {
        console.log(`  ⚠ Category "${category}" not found, skipping...`);
        continue;
      }
      
      for (const code of productCodes) {
        // Create RAW_YARN (undyed) product
        const rawName = `${code}`;
        insertYarnProduct.run(
          rawName,
          categoryId,
          'RAW_YARN',
          'No Of Cones',
          code, // shade_code same as name
          `${category} - ${code} (Undyed)`,
        );
        yarnProductCount++;
        
        // Create DYED_YARN product
        const dyedName = `${code}`;
        insertYarnProduct.run(
          dyedName + ' (Dyed)',
          categoryId,
          'DYED_YARN',
          'No Of Cones',
          code, // shade_code same as name
          `${category} - ${code} (Dyed)`,
        );
        yarnProductCount++;
      }
      
      console.log(`  ✓ Created ${productCodes.length * 2} products for "${category}"`);
    }
    
    console.log(`  📊 Total yarn products created: ${yarnProductCount}`);

    // ═══════════════════════════════════════════════════════════════════════
    // 3. Create Chemical Products (no category required)
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n🧪 Creating chemical products...');
    
    const insertChemProduct = db.prepare(`
      INSERT OR IGNORE INTO chem_products 
      (name, category_id, type, unit, description, is_active) 
      VALUES (?, NULL, ?, ?, ?, 1)
    `);
    
    for (const chem of chemicalProducts) {
      insertChemProduct.run(
        chem.name,
        chem.type,
        chem.unit,
        `${chem.name} - ${chem.type === 'CHEMICAL_RAW' ? 'Raw Chemical' : 'Finished Chemical'}`
      );
      console.log(`  ✓ Created "${chem.name}" (${chem.type})`);
    }
    
    console.log(`  📊 Total chemical products created: ${chemicalProducts.length}`);

    // ═══════════════════════════════════════════════════════════════════════
    // Summary
    // ═══════════════════════════════════════════════════════════════════════
    const yarnCount = db.prepare('SELECT COUNT(*) as count FROM yarn_products').get();
    const chemCount = db.prepare('SELECT COUNT(*) as count FROM chem_products').get();
    const catCount = db.prepare('SELECT COUNT(*) as count FROM product_categories').get();
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 SEEDING SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Categories:        ${catCount.count}`);
    console.log(`  Yarn Products:     ${yarnCount.count}`);
    console.log(`  Chemical Products: ${chemCount.count}`);
    console.log('═══════════════════════════════════════════════════════════\n');
  });
  
  try {
    txn();
    console.log('✅ Product seeding completed successfully!\n');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seedProducts();
process.exit(0);
