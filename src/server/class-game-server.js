'use strict';
let colors = require('colors');

class GameServer {
  constructor(runner, gameId, gameOwnerId, playerIds) {
    this.gameId = gameId;
    this.runner = runner;
    this.ownerId = gameOwnerId;
    this.playerIds = playerIds;
    this.initialSetup();
  }

  initialSetup() {
    // To be implemented by the game
  }

  mainLoop() {
    // To be implemented by the game
  }

  inputReceived(player, data) {
    // To be implemented by the game
  }

  eventReceived(type, data) {

  }

  playerConnected(player) {
    // To be implemented by the game
  }

  playerDisconnected(player) {
    // To be implemented by the game
  }

  getCurrentGameData() {
    // To be implemented by the game
    // Super naive implementation here
    return this.gameData
  }

  updateGameData(data, persist) {
    this.runner.updateGameData(data);
    if (!!persist) {
      this.persistData(data);
    }
  }

  persistData(data) {
    // To be implemented by the game
    this.gameData = data;
  }

  promptForInput(playerId, data) {
    this._log(`promptForInput ${playerId}, ${data}`);
    this.runner.requestPlayerInput(playerId, data);
  }

  gameOver() {
    // Notify all players
  }


  _log(message) {
    console.log(colors.magenta(`[GAME][${this.gameInfo.name}][${this.gameInfo.id}] ${message}`));
  }

}

module.exports = GameServer;

