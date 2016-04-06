'use strict';
let colors = require('colors');
let registry = require('./registry.js');

let idAutoInc = 1000;

let getNextGameId = function() {
  idAutoInc++;
  return idAutoInc;
}


class Runner {

  constructor() {
    // playerId => player
    this.players = {};
    // playerId => socket
    this.playerSockets = {};

    // gameId => game
    this.runningGames = {};
    // playerId => gameId
    this.playerGameMap = {};
    // gameId => [playerId, playerId...]
    this.gamePlayersMap = {};

  }

  // Called by index.js when player connects
  newPlayer(player, socket) {
    let playerId = player.id;
    this.players[playerId] = player;
    this.playerSockets[playerId] =  socket;
    this._attachSocketListeners(playerId, socket);

    // Is this player in a running game?
    let gameId = this._getRunningGameIdForPlayer(playerId);
    this._log(`newPlayer ${playerId} ${gameId}`);
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
      this._sendError(playerId, `Could not create game type ${type}`);
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
    // This is a weird place to do this, but whatever
    server.type = type;
    this.runningGames[gameId] =  server;

    this._connectPlayerToGame(playerId, gameId);
    this.gamePlayersMap[gameId] =  playerIds;

    playerIds.forEach((pId) => {
      pId = pId + '';
      this.playerGameMap[pId] =  gameId;
    });

    // TODO: Send game created event to each player's sockets (if we have them)
  }

  _attachSocketListeners(playerId, socket) {
    socket.on('createGame', (data) => {
      let type = data.type;
      let playerIds = data.playerIds;
      this.createGame(type, playerId, playerIds);
    });

    socket.on('playerInput', (data) => {
      let player = this.players[playerId];
      let game = this._getRunningGameForPlayer(playerId);
      if (!player || !game) {
        return;
      }
      game.inputReceived(player, data);
    });

    socket.on('disconnect', () => {
      let player = this.players[playerId];
      this._playerDisconnected(player);
    });
  }

  // Called when player is connecting to game
  _connectPlayerToGame(playerId, gameId) {
    this._log(`_connectPlayerToGame ${playerId} ${gameId}`);

    let player = this.players[playerId];
    let game = this.runningGames[gameId];
    if (!player || !game) {
      this._error('Could not connect player ${playerId} to game ${gameId}');
      return;
    }

    game.playerConnected(player);

    // Get current game data
    let gameData = game.getCurrentGameData();
    let gameType = game.type;

    let packet = {
      gameId: gameId,
      type: gameType,
      gameData: gameData
    };
    this._emit(playerId, 'connectedToGame', packet);
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

  _getGame(gameId) {
    let game = this.runningGames[gameId];
    return game ? game : false;
  }

  _getRunningGameIdForPlayer(playerId) {
    let gameId = this.playerGameMap[playerId];
    this._log(`_getRunningGameIdForPlayer ${playerId} ${gameId}`);
    return gameId ? gameId : false;
  }

  _sendError(playerId, error) {
    this._emit(playerId, 'serverError', error);
  }

  _emit(playerId, type, data) {
    this._log(`_emit ${playerId} ${type} ${data}`);
    let playerSocket = this.playerSockets[playerId];
    if (!playerSocket) {
      this._error(`Could not emit for ${playerId}, could not find socket`);
      return;
    }
    playerSocket.emit(type, data);
  }

  _error(message) {
    console.error(colors.red(`[RUNNER] ${message}`));
  }

  _log(message) {
    console.log(colors.cyan(`[RUNNER] ${message}`));
  }

}

module.exports = Runner;
