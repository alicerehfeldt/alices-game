'use strict';
let colors = require('colors');
let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let Runner = require('./server/runner');

let runner = new Runner();

io.on('connection', (socket) => { 
  console.log(colors.green('[SERVER] New socket connection!'));
  socket.on('sendPlayerData', (playerData) => {
    runner.newPlayer(playerData, socket);
  });
  socket.emit('needPlayerData', {'hi':'welcome'});

});

http.listen(3000, () => {
  console.log(colors.green('[SERVER] Server started on port 3000'));
});
