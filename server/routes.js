// server/routes.js
const express = require('express');
const router = express.Router();
const { getNetworkTime } = require('../backend-utils/timeSync');
const { backupSignal } = require('../backend-utils/cloudBackup');
const { send, formatSignal } = require('../core/telegramNotifier');
const { broadcast } = require('../core/websocketServer');

router.get('/health', async (req,res)=> res.json({ ok:true, server_time: await getNetworkTime() }));
router.get('/status', (req,res)=> res.json({ ok:true, mode: process.env.MODE || 'normal' }));

router.post('/debug/force-test', express.json(), async (req,res)=>{
  if((process.env.ALLOW_TEST||'false') !== 'true') return res.status(403).json({ ok:false, message: 'test disabled' });
  const sig = req.body.signal || {
    pair: 'EUR/USD', direction: 'CALL', confidence: 90, entry: 1.0953,
    sl: 1.0940, tp: 1.0975, entry_ts: Math.floor(Date.now()/1000),
    expiry_ts: Math.floor(Date.now()/1000) + 60, mode: 'normal', notes: 'debug'
  };
  try{
    await backupSignal(sig);
    broadcast({ type:'signal', data: sig });
    await send(formatSignal(sig));
    res.json({ ok:true, sent:true });
  }catch(e){ res.status(500).json({ ok:false, err: e.message }); }
});

module.exports = router;
