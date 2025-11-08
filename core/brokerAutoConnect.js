// core/brokerAutoConnect.js
// Orchestrate connection attempts: prefer WS if URL given, else Puppeteer login fallback
const { info, warn } = require('../backend-utils/logger');
const quotexAdapter = require('../adapters/quotexAdapter');
const exnessAdapter = require('../adapters/exnessAdapter');

async function initAdapters(){
  const active = [];
  try{
    if((process.env.USE_REAL_QUOTEX||'false') === 'true'){
      const ok = await quotexAdapter.init();
      if(ok) { active.push({ name:'quotex', adapter:quotexAdapter }); info('Quotex adapter initialized'); }
      else warn('Quotex adapter failed init');
    }
    if((process.env.USE_REAL_EXNESS||'false') === 'true'){
      const ok = await exnessAdapter.init();
      if(ok) { active.push({ name:'exness', adapter:exnessAdapter }); info('Exness adapter initialized'); }
      else warn('Exness adapter failed init');
    }
  }catch(e){ warn('initAdapters error: '+e.message); }
  return active;
}

module.exports = { initAdapters };
