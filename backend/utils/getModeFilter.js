// utils/getModeFilter.js
function getModeTypes(mode) {
  if (mode === 'YARN')     return ['RAW_YARN', 'DYED_YARN'];
  if (mode === 'CHEMICAL') return ['CHEMICAL_RAW', 'CHEMICAL_FINISHED'];
  return ['RAW_YARN', 'DYED_YARN', 'CHEMICAL_RAW', 'CHEMICAL_FINISHED']; // ALL (no mode)
}

function getModeLocations(mode) {
  if (mode === 'YARN')     return ['STORE', 'DYEING', 'FINISHED_STORE'];
  if (mode === 'CHEMICAL') return ['CHEMICAL_STORE'];
  return ['STORE', 'DYEING', 'FINISHED_STORE', 'CHEMICAL_STORE'];
}

// Builds a SQL IN clause placeholder string like (?,?,?)
function sqlIn(arr) {
  return `(${arr.map(() => '?').join(',')})`;
}

module.exports = { getModeTypes, getModeLocations, sqlIn };