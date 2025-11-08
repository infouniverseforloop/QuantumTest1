// core/websocketServer.js
const WebSocket = require('ws');
const { info, dbg } = require('../backend-utils/logger');

let wss = null;
function attach(server){
  if(wss) return wss;
  wss = new WebSocket.Server({ server, path: '/dash-ws' });
  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    info(`WS client connected: ${ip}`);
    ws.send(JSON.stringify({ type:'hello', server_time: new Date().toISOString() }));
    ws.on('message', m => dbg('WS msg: ' + String(m).slice(0,200)));
    ws.on('close', ()=> info(`WS client disconnected: ${ip}`));
  });
  return wss;
}
function broadcast(obj){
  if(!wss) return;
  const raw = JSON.stringify(obj);
  wss.clients.forEach(c => { if(c.readyState === WebSocket.OPEN) try{ c.send(raw); }catch(e){} });
}
module.exports = { attach, broadcast };
