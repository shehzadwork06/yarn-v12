/**
 * businessMode.js — Middleware
 *
 * Reads the X-Business-Mode header sent by the frontend on every request.
 * Attaches the following to req so every route can use them:
 *
 *   req.businessMode      — 'YARN' | 'CHEMICAL' | null (no filter)
 *   req.modeTypes         — array of product type strings for SQL IN clause
 *   req.modeLocations     — array of location strings for SQL IN clause
 *   req.modeProcessTypes  — array of manufacturing process_type strings
 *   req.modeSqlTypes      — helper: pre-built SQL placeholder "(?,?,?)"
 *   req.modeSqlLocations  — helper: pre-built SQL placeholder "(?,?)"
 */

/**
 * businessMode middleware
 *
 * Reads X-Business-Mode header (sent by frontend on every request).
 * Sets req.T = table-name map so every route uses the correct table.
 *
 *   YARN     → req.T.products = 'yarn_products',  req.T.purchases = 'yarn_purchases' …
 *   CHEMICAL → req.T.products = 'chem_products',  req.T.purchases = 'chem_purchases' …
 */

const YARN = {
  products:       'yarn_products',
  lots:           'yarn_lots',
  inventory:      'yarn_inventory',
  purchases:      'yarn_purchases',
  pur_items:      'yarn_purchase_items',
  sales:          'yarn_sales',
  sale_items:     'yarn_sale_items',
  gate_passes:    'yarn_gate_passes',
  manufacturing:  'yarn_manufacturing',
  wastage:        'yarn_wastage',
  pur_returns:    'yarn_purchase_returns',
  pur_ret_items:  'yarn_purchase_return_items',
  sale_returns:   'yarn_sale_returns',
  sale_ret_items: 'yarn_sale_return_items',
  // constraints
  validTypes:      ['RAW_YARN', 'DYED_YARN'],
  defaultLocation: 'STORE',
  defaultUnit:     'No Of Cones',
  poPrefix:        'PY',
  slPrefix:        'SY',
  gpPrefix:        'GY',
  prPrefix:        'RY',
  srPrefix:        'SRY',
  lotRawPrefix:    'RY',
  lotDyedPrefix:   'DY',
};

const CHEM = {
  products:       'chem_products',
  lots:           'chem_lots',
  inventory:      'chem_inventory',
  purchases:      'chem_purchases',
  pur_items:      'chem_purchase_items',
  sales:          'chem_sales',
  sale_items:     'chem_sale_items',
  gate_passes:    'chem_gate_passes',
  manufacturing:  'chem_manufacturing',
  wastage:        'chem_wastage',
  pur_returns:    'chem_purchase_returns',
  pur_ret_items:  'chem_purchase_return_items',
  sale_returns:   'chem_sale_returns',
  sale_ret_items: 'chem_sale_return_items',
  // constraints
  validTypes:      ['CHEMICAL_RAW', 'CHEMICAL_FINISHED'],
  defaultLocation: 'CHEMICAL_STORE',
  defaultUnit:     'KG',
  poPrefix:        'PC',
  slPrefix:        'SC',
  gpPrefix:        'GC',
  prPrefix:        'RC',
  srPrefix:        'SRC',
  lotRawPrefix:    'CR',
  lotDyedPrefix:   'CF',
};

function businessMode(req, res, next) {
  const header = (req.headers['x-business-mode'] || '').toUpperCase().trim();
  if (header === 'CHEMICAL') {
    req.businessMode = 'CHEMICAL';
    req.T = CHEM;
  } else {
    req.businessMode = 'YARN';
    req.T = YARN;
  }
  next();
}

module.exports = { businessMode };