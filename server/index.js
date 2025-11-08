// server/index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const { attach, broadcast } = require('../core/websocketServer');
const { info, warn } = require('../backend-utils/logger');
const { startLoop } = require('../core/signalEngineCore');
const routes = require('./routes');

const app = express();
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', routes);

const server = http.createServer(app);
attach(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, async ()=> {
  info(`Quantum Apex listening on port ${PORT}`);
  try{
    // start engine
    startLoop().catch(e=>warn('startLoop error: '+e.message));
  }catch(e){
    warn('server error: '+e.message);
  }
});
