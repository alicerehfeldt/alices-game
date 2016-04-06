'use strict';
var GameServer = require('../../server/class-game-server');

class ExampleServer extends GameServer {

  initialSetup() {
    let owner = this.getPlayer(this.ownerId);
    this.gameData = {
      rolls: [],
      turn: owner
    };

    // If the owner is connected prompt them for their turn
    if (this.playerIsConnected(owner.id)) {
      this._promptCurrentPlayer();
    }
  }

  getCurrentGameData() {
    return this.gameData;
  }

  persistGameData(data) {
    this.gameData = data;
  }

  playerConnected(player) {
    // If it is this player's turn, prompt them
    if (player.id === this.gameData.turn.id) {
      this._promptCurrentPlayer();
    }
  }

  inputReceived(player, data) {
    let roll = {
      roll: data.roll,
      player: player.name
    }
    this._log(`${player.name} rolled a ${data.roll}`);
    this.gameData.rolls.push(roll);
    if (roll.roll === 20) {
      this.gameData.winner = player;
      this.gameOver(this.gameData);
    } else {
      this._nextPlayerTurn();
    }
  }

  _nextPlayerTurn() {
    let currentPlayerId = this.gameData.turn.id;
    let index = this.playerIds.indexOf(currentPlayerId);
    index++;
    if (index >= this.playerIds.length) {
      index = 0;
    }
    let newPlayer = this.getPlayer(this.playerIds[index]);
    this.gameData.turn = newPlayer;
    this.updateGameData(this.gameData);
    if(this.playerIsConnected(newPlayer.id)) {
      this._promptCurrentPlayer();
    }
  }


  _promptCurrentPlayer() {
    let currentPlayerId = this.gameData.turn.id;
    this.requestPlayerInput(currentPlayerId);
  }


}

module.exports = ExampleServer;
