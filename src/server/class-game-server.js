'use strict';
let colors = require('colors');

class GameServer {
  constructor(runner, gameInfo) {
    this.runner = runner;
    this.gameId = gameInfo.gameId;
    this.type = gameInfo.type;
    this.ownerId = gameInfo.ownerId;
    this.playerIds = gameInfo.playerIds;
    this.connectedPlayers = [];
  }

  initialSetup() {
    // [REQUIRED] To be implemented by the game
  }

  getCurrentGameData() {
    // [REQUIRED] To be implemented by the game
  }

  inputReceived(player, data) {
    // [REQUIRED] To be implemented by the game
  }

  eventReceived(type, data) {
    // [REQUIRED] To be implemented by the game
  }

  playerConnected(player) {
    // [OPTIONAL]
  }

  playerDisconnected(player) {
    // [OPTIONAL]
  }

  /**
   * @return {Integer} - Number of milliseconds to sleep before next run, or null to not run again
   */
  mainLoop() {
    // {OPTIONAL} To be implemented by the game
  }

  persistData(data) {
    // {OPTIONAL} To be implemented by the game
  }

  gameOver(data) {
    this.runner.gameOver(data);
  }

  triggerMainLoop() {
    this.runner.triggerMainLoop(this);
  }

  getPlayer(playerId) {
    return this.runner.getPlayer(playerId);
  }

  playerIsConnected(playerId) {
    let index = this.connectedPlayers.indexOf(playerId);
    return index !== -1;
  }

  updateGameData(data) {
    // Can be overidden by the game
    this.runner.updateGameData(data);
    this.persistData(data);
  }

  requestPlayerInput(playerId, data) {
    this._log(`requestPlayerInput ${playerId}, ${data}`);
    this.runner.requestPlayerInput(playerId, data);
  }


  _connectPlayer(player) {
    this.connectedPlayers.push(player.id);
    this.playerConnected(player);
  }

  _disconnectPlayer(player) {
    let index = this.connectedPlayers.indexOf(player.id);
    if (index !== -1) {
      this.connectedPlayers.splice(index, 1);
    }
    this.playerDisconnected(player);
  }

  _log(message) {
    console.log(colors.magenta(`[GAME][${this.type}][${this.gameId}] ${message}`));
  }

}

module.exports = GameServer;

