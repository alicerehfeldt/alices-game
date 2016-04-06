'use strict';

const games = {
  'example': {
    name: 'First to 20',
    description: 'Everyone rolls a 20-sided die, first to 20 wins!',
    server: require('../games/example')
  }
}

class Registry {
  getGameByType(type) {
    let game = games[type] ? games[type] : false;
    return game;
  }
}

let registryInstance = new Registry();

module.exports = registryInstance;
