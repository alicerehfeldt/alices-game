'use strict';
let registry = require('./registry.js');

let idAutoInc = 1000;

let getNextGameId = function() {
  idAutoInc++;
  return idAutoInc;
}


class Runner {

  constructor() {
    // playerId => player
    this.players = new Map();
    // playerId => socket
    this.playerSockets = new Map();

    // gameId => game
    this.runningGames = new Map();
    // playerId => gameId
    this.playerGameMap = new Map();
    // gameId => [playerId, playerId...]
    this.gamePlayersMap = new Map();

  }

  // Called by index.js when player connects
  newPlayer(player, socket) {
    let playerId = player.id;
    this.log(`newPlayer ${playerId}`);
    this.players.set(playerId, player);
    this.playerSockets.set(playerId, socket);
    this._attachSocketListeners(playerId, socket);

    // Is this player in a running game?
    let gameId = this._getRunningGameIdForPlayer(playerId);
    if (gameId === false) {
      this._emit(playerId, 'notAttachedToGame');
    } else {
      this._connectPlayerToGame(playerId, gameId);
    }
  }

  createGame(type, playerId, playerIds) {
    this._log(`createGame ${type} ${playerId} ${playerIds}`);
    let gameObject = registry.getGameByType(type);
    if (!gameObject) {
      return;
    }
    let gameId = getNextGameId();

    let serverDependency = {
      requestPlayerInput: function(pId, data) {
        this._requestPlayerInput(gameId, pId, data);
      },

      updateGameData: function(data) {
        this._updateGameData(gameId, data);
      },

      triggerMainLoop: function() {
        this._triggerMainLoop(gameId);
      }
    }
    let server = new gameObject.server(serverDependency, gameId, playerId, playerIds);
    this.runningGames.set(gameId, server);

    this._connectPlayerToGame(playerId, gameId);
    this.gamePlayersMap.set(gameId, playerIds);
    playerIds.forEach((pId) => {
      this.playerGameMap.set(pId, gameId);
    });

    // TODO: Send game created event to each player's sockets (if we have them)
  }

  // Called when player is connecting to game
  _connectPlayerToGame(playerId, gameId) {
    this.log(`_connectPlayerToGame`, playerId, gameId);




  }


  // called by game to send input to player
  _requestPlayerInput(gameId, playerId, data) {

  }

  // called by game to send new data to all players
  _updateGameData(gameId, data) {

  }


  // Called by game to trigger its main game loop
  // Done this way so we can gracefully handle the setTimeout return stuff
  _triggerMainLoop(gameId) {

  }

  // Called when player socket sends a disconnect event
  _playerDisconnected(player) {

  }

  _getRunningGameIdForPlayer(playerId) {
    let gameId = this.playerGameMap.get(playerId);
    if (!gameId) {
      return false;
    }
  }

  _attachSocketListeners(playerId, socket) {
    socket.on('createGame', (data) => {
      let type = data.type;
      let playerIds = data.playerIds;
      this.createGame(type, playerId, playerIds);
    });

    socket.on('playerInput', (data) => {
      let player = this.players.get(playerId);
      let game = this._getRunningGameForPlayer(playerId);
      if (!player || !game) {
        return;
      }
      game.inputReceived(player, data);
    });

    socket.on('disconnect', () => {
      let player = this.players.get(playerId);
      this.playerDisconnected(player);
    });
  }


  _sendError(playerId, error) {
    this._emit(playerId, 'error', error);
  }

  _emit(playerId, type, data) {
    let playerSocket = this.playerSockets.get(playerId);
    if (!playerSocket) {
      this._error(`Could not emit for ${playerId}, could not find socket`);
      return;
    }
    playerSocket.emit(type, data);
    this._log()
  }

  _error(message) {
    console.error('[RUNNER]', message);
  }

  _log(message) {
    console.log('[RUNNER]', message);
  }

}

module.exports = Runner;
