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
    if (!player || !player.id) {
      this._error(`newPlayer sent bad player ${player}`);
      return;
    }
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
      getPlayer: (pId) => {
        let rPlayer = this.players[pId];
        this._log(`getPlayer ${pId} ${rPlayer}`);
        return rPlayer ? rPlayer : false;
      },

      requestPlayerInput: (pId, data) => {
        this._requestPlayerInput(pId, data);
      },

      updateGameData: (data) => {
        this._updateGameData(gameId, data);
      },

      triggerMainLoop: (game) => {
        this._triggerMainLoop(game);
      },

      gameOver: (data) => {
        this._gameOver(gameId, data);
      }
    }
    let gameInfo = {
      gameId: gameId,
      type: type,
      ownerId: playerId,
      playerIds: playerIds
    }

    let server = new gameObject.server(serverDependency, gameInfo);
    this.runningGames[gameId] =  server;
    server.initialSetup();

    this.gamePlayersMap[gameId] =  playerIds;

    playerIds.forEach((pId) => {
      pId = pId + '';
      this.playerGameMap[pId] =  gameId;
      if (this.playerSockets[pId]) {
        this._connectPlayerToGame(pId, gameId);
      }
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
      let gameId = this._getRunningGameIdForPlayer(playerId);
      if (!player || !gameId) {
        return;
      }
      let game = this.runningGames[gameId];
      this._log(`playerInput ${playerId} ${data}`);
      game.inputReceived(player, data);
    });

    socket.on('disconnect', () => {
      this._playerDisconnected(playerId);
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

    // Get current game data
    let gameData = game.getCurrentGameData();
    let gameType = game.type;

    let packet = {
      gameId: gameId,
      type: gameType,
      gameData: gameData
    };
    this._emit(playerId, 'connectedToGame', packet);

    game._connectPlayer(player);
  }


  // called by game to send input to player
  _requestPlayerInput(playerId, data) {
    this._emit(playerId, 'inputRequested', data);
  }

  // called by game to send new data to all players
  _updateGameData(gameId, data) {
    let players = this.gamePlayersMap[gameId];
    if (!players) {
      return;
    }

    this._log(`_updateGameData ${gameId} ${data}`);
    players.forEach((playerId) => {
      // If we have a socket for them
      if (this.playerSockets[playerId]) {
        this._emit(playerId, 'gameDataUpdate', data);
      }
    });
  }

  // Called by game to signal game over
  _gameOver(gameId, data) {
    let players = this.gamePlayersMap[gameId];
    if (!players) {
      return;
    }
    this._log(`_gameOver ${gameId}, ${data}`);
    players.forEach((playerId) => {
      // If we have a socket for them
      if (this.playerSockets[playerId]) {
        this._emit(playerId, 'gameOver', data);
      }
    });

    // TODO: Clean up running game here?
  }


  // Called by game to trigger its main game loop
  // Done this way so we can gracefully handle the setTimeout return stuff
  _triggerMainLoop(game) {
    let sleep = game.mainLoop();

    if (typeof sleep === 'number') {
      sleep = parseInt(sleep, 10);
      setTimeout(() => {
        this._triggerMainLoop(game);
      }, sleep);
    }
  }

  // Called when player socket sends a disconnect event
  _playerDisconnected(playerId) {
    let player = this.players[playerId];
    let gameId = this._getRunningGameIdForPlayer(playerId);
    this._log(`_playerDisconnected ${playerId} ${gameId}`);
    if (gameId) {
      let game = this.runningGames[gameId];
      if (game) {
        game._disconnectPlayer(player);
      }
    }

    delete this.playerSockets[playerId];
  }


  _getRunningGameIdForPlayer(playerId) {
    let gameId = this.playerGameMap[playerId];
    //this._log(`_getRunningGameIdForPlayer ${playerId} ${gameId}`);
    return gameId ? gameId : false;
  }

  _sendError(playerId, error) {
    this._emit(playerId, 'serverError', error);
  }

  _emit(playerId, type, data) {
    this._log(`_emit ${playerId} ${type}`);// ${JSON.stringify(data)}`);
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
