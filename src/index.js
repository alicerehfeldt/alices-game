'use strict';
let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let Runner = require('./server/runner');

let runner = new Runner();

io.on('connection', (socket) => { 
  console.log('New socket connection!');
  socket.on('sendPlayerData', (playerData) => {
    runner.newPlayer(playerData, socket);
  });


  socket.on('hi2u', function(){
    console.log('hi2me');
  });
  socket.emit('what', 'come on');
  socket.emit('needPlayerData', {'hi':'welcome'});
  console.log('sent needPlayerData');

});

http.listen(3000, () => {
  console.log('Server started on port 3000');
});
