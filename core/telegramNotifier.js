// core/telegramNotifier.js
const axios = require('axios');
const { info, warn } = require('../backend-utils/logger');

async function send(text){
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if(!token || !chat){ warn('Telegram not configured'); return false; }
  try{
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, { chat_id: chat, text, parse_mode: 'HTML' }, { timeout: 10000 });
    info('Telegram message sent');
    return true;
  }catch(e){ warn('Telegram send failed: '+(e.response&&e.response.data?JSON.stringify(e.response.data):e.message)); return false; }
}

function formatSignal(sig){
  const owner = (sig.branding && sig.branding.owner) || process.env.OWNER_NAME || 'Owner';
  const when = new Date((sig.entry_ts||Math.floor(Date.now()/1000))*1000).toLocaleString();
  const expiry = sig.expiry_ts ? new Date(sig.expiry_ts*1000).toLocaleString() : '-';
  const lines = [
    `<b>Quantum Apex — Signal</b>`,
    `Owner: <b>${owner}</b>`,
    `Pair: <b>${sig.pair}</b>`,
    `Mode: <b>${sig.mode || 'AUTO'}</b>`,
    `Type: <b>${sig.direction}</b>`,
    `Confidence: <b>${sig.confidence}%</b>`,
    `Entry: <code>${sig.entry}</code> at ${when}`,
    `SL: <code>${sig.sl || '-'}</code> | TP: <code>${sig.tp || '-'}</code>`,
    `Expiry: ${expiry}`,
    `Notes: ${sig.notes || '-'}`,
    `Branding: Quantum Apex System • ${owner}`
  ];
  if(sig.result) lines.push(`<b>Result: ${sig.result}</b>`);
  return lines.join('\n');
}

module.exports = { send, formatSignal };
