// core/signalEngineCore.js
// High-level orchestrator: for each pair fetch candles from adapter -> run fusion -> emit signals
const { info, warn } = require('../backend-utils/logger');
const { computeSignal } = require('../server/computeEngine'); // we'll add computeEngine in routes (or move)
const { backupSignal } = require('../backend-utils/cloudBackup');
const { send, formatSignal } = require('./telegramNotifier');
const { broadcast } = require('./websocketServer');
const { recordResult } = require('./aiEngine');
const { initAdapters } = require('./brokerAutoConnect');

const WATCH = (process.env.WATCH_SYMBOLS || 'EUR/USD,GBP/USD,USD/JPY,AUD/USD,USD/CAD,USD/CHF,NZD/USD').split(',').map(s=>s.trim());
const SCAN_INTERVAL = parseInt(process.env.SCAN_INTERVAL_MS || '4000', 10);
const MIN_CONF = parseInt(process.env.MIN_CONFIDENCE || '80', 10);

let activeAdapters = [];

function sleep(ms){ return new Promise(res=>setTimeout(res, ms)); }

async function fetchCandles(adapterObj, pair){
  try{
    return await adapterObj.adapter.fetchRecentCandles(pair, 500);
  }catch(e){ throw e; }
}

async function startLoop(){
  activeAdapters = await initAdapters();
  if(!activeAdapters || activeAdapters.length === 0){
    warn('No adapters active — system in safe-mode (no live signals)');
  }
  info('Signal scan loop starting...');
  while(true){
    try{
      if(activeAdapters.length === 0){
        await sleep(3000); continue;
      }
      for(const pair of WATCH){
        try{
          // try adapters in order
          let candles = null;
          for(const a of activeAdapters){
            try{
              candles = await fetchCandles(a, pair);
              if(candles && candles.length) break;
            }catch(_){}
          }
          if(!candles) continue;
          const sig = await computeSignal(pair, candles, { mode: process.env.MODE || 'normal' });
          if(sig && sig.status === 'ok'){
            // apply AI weight
            const { getWeight } = require('./aiEngine');
            sig.confidence = Math.min(99, Math.round((sig.confidence||50) * getWeight()));
            sig.mode = process.env.MODE || 'normal';
            sig.id = Date.now() + Math.floor(Math.random()*9999);
            if(sig.confidence >= MIN_CONF){
              // emit
              backupSignal(sig).catch(()=>{});
              broadcast({ type:'signal', data: sig });
              await send(formatSignal(sig));
              // wait expiry + small buffer
              const waitSec = Math.max(5, (sig.expiry_ts - Math.floor(Date.now()/1000)) + 2);
              // resolver scheduled in server computeEngine (or here)
              await sleep(waitSec*1000 + 1000);
            }
          }
        }catch(e){
          warn('pair loop error: ' + e.message);
        }
      }
    }catch(e){ warn('scan outer error: ' + e.message); }
    await sleep(SCAN_INTERVAL);
  }
}

module.exports = { startLoop };
