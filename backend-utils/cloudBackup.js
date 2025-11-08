// backend-utils/cloudBackup.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { info, warn } = require('./logger');
const FIREBASE_DB_URL = (process.env.FIREBASE_DB_URL || '').replace(/\/$/,'');
const LOCAL_DIR = path.join(__dirname, '..', 'data');
const LOCAL_FILE = path.join(LOCAL_DIR, 'backup_signals.json');

function ensureLocal(){ if(!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive:true }); if(!fs.existsSync(LOCAL_FILE)) fs.writeFileSync(LOCAL_FILE, JSON.stringify([])); }

async function pushToFirebase(node, payload){
  if(!FIREBASE_DB_URL) throw new Error('FIREBASE_DB_URL not configured');
  const url = `${FIREBASE_DB_URL}/${node}.json`;
  await axios.post(url, payload, { timeout:10000 });
}

function saveLocal(node, payload){
  try{
    ensureLocal();
    const arr = JSON.parse(fs.readFileSync(LOCAL_FILE));
    arr.push({ node, payload, t: new Date().toISOString() });
    fs.writeFileSync(LOCAL_FILE, JSON.stringify(arr, null, 2));
    info('Saved backup locally');
  }catch(e){ warn('saveLocal failed: '+e.message); }
}

async function backupSignal(payload){
  try{
    if(!payload) throw new Error('no payload');
    if(FIREBASE_DB_URL){
      await pushToFirebase('signals', payload);
      info('Backed up to Firebase');
    } else {
      saveLocal('signals', payload);
    }
  }catch(e){
    warn('backupSignal failed: '+e.message);
    try{ saveLocal('signals', payload); }catch(_){}
  }
}

module.exports = { backupSignal };
