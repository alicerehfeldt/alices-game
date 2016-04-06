'use strict';
var GameServer = require('../../server/class-game-server');

class ExampleServer extends GameServer {

  initialSetup() {

  }

  playerAdded(player) {

  }

  mainLoop() {
    // To be implemented by the game
  }

  inputReceived(player, data) {
    // To be implemented by the game
  }

  playerDisconnected(player) {
    // To be implemented by the game
  }


}

module.exports = ExampleServer;
