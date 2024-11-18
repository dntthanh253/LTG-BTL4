const { v1: uuidv1 } = require('uuid');
var gamesInSession = [] // Stores an array of all active socket connections

/*==============================
    gameRooms = {}
    gameRooms.key = gameId
    gameRooms.value = {
        clients: Websocket[],
        gameState: number[][]
    }
===============================*/

const initializeGame = (ws, client, gameRooms) => {
    gamesInSession.push(client)  // Add to array of all the active sockets.

    // Listen to client socket events
    client.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return;
        }
        console.log(data.event)

        switch (data.event) {
            case 'createNewGame': 
                playerCreateNewGame(gameRooms, client)
                break
            case 'playerJoinGame': 
                playerJoinsGame(data.gameId, gameRooms, client)
                break   
            case 'ready':
                console.log(client === gameRooms[data.gameId].clients[0])
                client === gameRooms[data.gameId].clients[0] && passFirstTurn(data.gameId, gameRooms)
                break
            case 'makeMove': 
                changeGameState(data.gameId, data.move, gameRooms)
                passTurnToOtherPlayer(data.gameId, data.move, gameRooms, client)
                break  
            case 'leftGame': 
                playerLeftRoom(data.gameId, gameRooms, client)
                break  
        }
    });

    client.on("close", () => playerDisconnect(gameRooms, client))

    client.on("new move", newMove)
}

function playerJoinsGame(gameId, gameRooms, wsc) {

    // Look up the room ID in gameRooms
    var room = gameRooms[gameId] // Return list of sockets in room 

    if (room === undefined) { // Room not found
        wsc.send(JSON.stringify({
            event: 'status',
            message: 'This game session does not exist'
        }))
        return
    }

    if (room.clients.length < 2) { // Room under 2 players
        // Join game
        gameRooms[gameId].clients = [...gameRooms[gameId].clients, wsc]
        console.log(gameRooms[gameId].clients.length)

        // Emit event notifying the clients that the player has joined the room to all players in room.
        for (var client of gameRooms[gameId].clients) {
            client.send(JSON.stringify({
                event: 'playerJoinedRoom',
                gameId: gameId,
            }))
        }

        if (gameRooms[gameId].clients.length === 2) {
            
            // InitialiZE game start state for gameId
            gameRooms[gameId].gameState = 
                [[1,1,1,1,1],
                 [1,0,0,0,1],
                 [2,0,0,0,1],
                 [2,0,0,0,2],
                 [2,2,2,2,2]]

            // Emit start game for all players in room if full room
            for (var i in gameRooms[gameId].clients) {
                gameRooms[gameId].clients[i].send(JSON.stringify({
                    event: 'gameStart',
                    gameId: gameId,
                    turn: Number(i) + 1
                }))
            }

            console.log('start game')
        }
    } else {
        // Otherwise, send an error message back to the player.
        wsc.send(JSON.stringify({
            event: 'status',
            message: 'There have already been 2 people playing in this room.'
        }))
    }
}

function playerCreateNewGame(gameRooms, wsc) {
    newGameId = uuidv1()
    wsc.send(JSON.stringify({ 
        event: 'createNewGame', 
        gameId: newGameId,
    }));
    gameRooms[newGameId] = {}
    gameRooms[newGameId].clients = [wsc]
    console.log(newGameId)
}

function newMove(move) {
    /**
     * First, we need to get the room ID in which to send this message. 
     * Next, we actually send this message to everyone except the sender
     * in this room. 
     */
    
    const gameId = move.gameId 
    
    io.to(gameId).emit('opponent move', move);
}

function passFirstTurn(gameId, gameRooms) {
    gameRooms[gameId].clients[0].send(JSON.stringify({ 
        event: 'firstTurn', 
        gameId: gameId,
    }))
    console.log('first turn')
}

function changeGameState(gameId, move, gameRooms) {
    gameRooms[gameId].gameState = move.gameState
}

function passTurnToOtherPlayer(gameId, move, gameRooms, wsc) {
    for (var client of gameRooms[gameId].clients) {
        if (client !== wsc) {
            client.send(JSON.stringify({ 
                event: 'opponentMove',  
                opponentMove: {
                    fromPos: move.fromPos, 
                    toPos: move.toPos,
                    gameState: move.gameState
                },
                gameId: gameId,
            }));
            console.log('switch turn')
            break
        } 
    }
}

function playerLeftRoom(gameId, gameRooms, wsc) {
    // Delete client from the room
    gameRooms[gameId].clients.splice(gameRooms[gameId].clients.indexOf(wsc), 1)
            
    // Delete room if all clients left
    if (gameRooms[gameId].clients.length === 0) { 
        delete gameRooms[gameId]
        return
    }

    // Broadcast to other players in room (only 1)
    gameRooms[gameId].clients[0].send(JSON.stringify({ 
        event: 'opponentLeftGame', 
        gameId: gameId,
    }));
}

function playerDisconnect(gameRooms, wsc) {
    var i = gamesInSession.indexOf(wsc);
    gamesInSession.splice(i, 1);

    // Check if player is joining any rooms and left room
    for (const gameId in gameRooms) {    
        if (gameRooms[gameId].clients.includes(wsc)) {
            playerLeftRoom(gameId, gameRooms, wsc)
            break
        }
    }
}

exports.initializeGame = initializeGame