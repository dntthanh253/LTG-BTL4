const express = require('express')
const http = require('http')
const WebSocket = require('ws');
const gameLogic = require('./GameLogic')

const app = express()
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 8000

const gameRooms = {}

wss.on('connection', (ws) => {
    console.log('player connect')
    gameLogic.initializeGame(wss, ws, gameRooms)
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})