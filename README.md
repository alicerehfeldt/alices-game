# Alice's Game Server

A server for running game things

## TODO

* Add way to get list of supported games via websocket event
* Add way to get list of players via websocket event
* Add persistent storage for game data via redis
* Clean up readme with API for game server
* Probably a bunch of missing or broken stuff to fix

#### How to run

`make start`

#### How to develop

`make develop`

## Websocket Events

### Server -> Client

#### `needPlayerData`

Prompts game client to send `sendPlayerData`

#### `notAttachedToGame`

Sent when player is not attached to any running games

#### `connectedToGame`

Sent when the player is connected to the game, should start the game on the client. Game might be in progress (if reconnecting)

* `{Object} data`
* `{Object} data.gameId` - Game id
* `{Object} data.type` - Game type
* `{Object} data.gameData` - Current game data

#### `gameDataUpdate`

Sent when game data is updated

* `{Object} data` - updated game data object

#### `inputRequested`

Sent when the game is prompting the player for input

* `{Object} data` - context information on the input requested

#### `serverError`

General error has occurred

* `{String} message` - Error message

***

### Client -> Server

#### `sendPlayerData`

Sends player data on connection

#### `createGame`

Player wants to create a game

* `{Object} data`
* `{String} data.type` - Game type key
* `{Array}  data.playerIds` - Array of players intended to be attached to the game

#### `playerInput`

Player has sent input to a game

* `{Object} data` - Player's input



