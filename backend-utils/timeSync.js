// backend-utils/timeSync.js
const axios = require('axios');
const { warn } = require('./logger');
async function getNetworkTime(){
  try{ const r = await axios.get('http://worldtimeapi.org/api/ip', { timeout:7000 }); return r.data.utc_datetime; }
  catch(e){ warn('timeSync failed: '+e.message); return new Date().toISOString(); }
}
module.exports = { getNetworkTime };
