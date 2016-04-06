'use strict';


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

  playerAdded(player) {
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

  }

  playerDisconnected(player) {
    // To be implemented by the game
  }

  updateGameData(data, persist) {
    this.runner.updateGameData(data);
    if (!!persist) {
      this.persistData(data);
    }
  }

  persistData(data) {
    // TODO: Put this in redis or something
  }

  promptForInput(playerId, data) {
    this._log(`promptForInput ${playerId}, ${data}`);
    this.runner.requestPlayerInput(playerId, data);
  }

  gameOver() {
    // Notify all players
  }


  _log(message) {
    console.log(`[GAME][${this.gameInfo.name}][${this.gameInfo.id}]`, message);
  }

}

module.exports = GameServer;

