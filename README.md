# Alice's Game Server

A server for running game things

## How to run

`npm start`



## Websocket Events

### Server -> Client

#### `needPlayerData`

Prompts game client to send `sendPlayerData`

#### `notAttachedToGame`

Sent when player is not attached to any running games

#### `gameDataUpdate`

Sent when game data is updated

* `{Object} data` - updated game data object

#### `inputRequested`

Sent when the game is prompting the player for input

* `{Object} data` - context information on the input requested

#### `error`

General error has occurred

* `{String} message` - Error message

### Client -> Server

#### `sendPlayerData`

Sends player data on connection

#### `createGame`

Player wants to create a game

* `{Object} data`
* `{String} data.type` - Game type key
* `{Array} data.playerIds` - Array of players intended to be attached to the game

#### `playerInput`

Player has sent input to a game

* `{Object} data` - Player's input



