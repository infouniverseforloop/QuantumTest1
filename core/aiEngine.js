// core/aiEngine.js
// Lightweight learner — adjusts strategy weight based on recent history
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'learner.json');
const { info } = require('../backend-utils/logger');

function ensure(){
  if(!fs.existsSync(path.dirname(FILE))) fs.mkdirSync(path.dirname(FILE), { recursive: true });
  if(!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({ weight:1.0, history:[] }, null, 2));
}
function load(){ ensure(); return JSON.parse(fs.readFileSync(FILE)); }
function save(o){ fs.writeFileSync(FILE, JSON.stringify(o, null, 2)); }

function getWeight(){ return load().weight || 1.0; }

function recordResult(sig, result){
  const data = load();
  data.history = data.history || [];
  data.history.push({ t: new Date().toISOString(), id: sig.id, pair: sig.pair, conf: sig.confidence, result });
  const recent = data.history.slice(-100);
  const wins = recent.filter(r=>r.result==='WIN').length;
  const losses = recent.filter(r=>r.result==='LOSS').length;
  if(losses > wins + 5) data.weight = Math.max(0.5, data.weight * 0.95);
  if(wins > losses + 5) data.weight = Math.min(2.0, data.weight * 1.03);
  save(data);
  info('aiEngine weight updated: ' + data.weight);
}

module.exports = { getWeight, recordResult, load };
