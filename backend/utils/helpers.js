
// function generateLotNumber(db, lotsTable) {
//   const row = db.prepare(`SELECT MAX(CAST(lot_number AS INTEGER)) AS mx FROM ${lotsTable}`).get();
//   const next = ((row && row.mx) ? parseInt(row.mx) : 0) + 1;
//   return String(next).padStart(9, '0');
// }

// /**
//  * Generate a document/reference number (PO, SL, GP…).
//  * e.g. generateNumber('PO') → 'PO-1716000000000'
//  */
// function generateNumber(prefix) {
//   return `${prefix}-${Date.now()}`;
// }

// module.exports = { generateLotNumber, generateNumber };
/**
 * utils/helpers.js
 */

/**
 * Generate next numeric zero-padded lot number from the given lots table.
 * Format: 000000001, 000000002, ...
 */
function generateLotNumber(db, lotsTable) {
  const row = db.prepare(`SELECT MAX(CAST(lot_number AS INTEGER)) AS mx FROM ${lotsTable}`).get();
  const next = ((row && row.mx) ? parseInt(row.mx) : 0) + 1;
  return String(next).padStart(9, '0');
}

/**
 * Generate a document/reference number (PO, SL, GP…).
 * e.g. generateNumber('PO') → 'PO-1716000000000'
 */
function generateNumber(prefix) {
  return `${prefix}-${Date.now()}`;
}

/**
 * Calculate working hours between two time strings (HH:MM or HH:MM:SS).
 * Returns a float, e.g. 8.5
 */
function calcWorkingHours(timeIn, timeOut) {
  if (!timeIn || !timeOut) return 0;
  const toMinutes = (t) => {
    const parts = t.split(':').map(Number);
    return parts[0] * 60 + parts[1];
  };
  const diff = toMinutes(timeOut) - toMinutes(timeIn);
  return diff > 0 ? diff / 60 : 0;
}

module.exports = { generateLotNumber, generateNumber, calcWorkingHours };