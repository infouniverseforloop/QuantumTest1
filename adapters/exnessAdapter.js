// adapters/exnessAdapter.js
const { warn } = require('../backend-utils/logger');
async function init(){ warn('Exness adapter skeleton — implement if you have Exness API'); return false; }
async function fetchRecentCandles(){ throw new Error('Exness not implemented'); }
module.exports = { init, fetchRecentCandles };
