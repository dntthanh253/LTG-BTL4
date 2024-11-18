import { _decorator, CCBoolean, Component, director, EditBox, Label, Node, Vec3} from 'cc';
const { ccclass, property } = _decorator;
import { SceneManager } from './SceneManager';
import { CoGanhBoard } from './CoGanhBoard';

export enum WsTags {
    invalid = 0,
    login = 1,
    loginRsp = 2,
    userInfo = 3,
    roomInfo = 4,
    run = 5,
    stop = 6,
}

export interface event {
    data: any;
}

@ccclass('Player')
export class Player extends Component {

    static Instance: Player = null // Singleton

    @property(EditBox)
    gameIdBox: EditBox = null

    @property(Number)
    botMode: Number = 0

    private socket: WebSocket = null
    private gameId: string

    onLoad() {
        director.addPersistRootNode(this.node);
        this.socket = new WebSocket('ws://localhost:8000')
        
        this.socket.onopen = () => {
            console.log('Connected to server');
        }
        
        this.socket.onerror = (err) => {
            console.log(err);
        }

        this.socket.onmessage = (message) => {
            let data;
            try {
                data = JSON.parse(message.data);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return;
            }

            switch (data.event) {
                case 'createNewGame': 
                    this.gameId = data.gameId
                    SceneManager.loadWaitPlayer(data.gameId)
                    break
                case 'playerJoinedRoom':
                    this.gameId = data.gameId
                    break
                case 'gameStart': 
                    SceneManager.loadPlayScene(data.turn)
                    break
                case 'firstTurn': 
                    this.takeTurn()
                    break
                case 'opponentMove': 
                    CoGanhBoard.Instance.updateGameState(data.opponentMove)
                    this.takeTurn()
                    break
                case 'opponentLeftGame': 
                    console.log('opponent left game')
                    this.win()
                    break
            }
        }

        this.socket.onclose = (e) => {
            console.log('Disconnected to server with code:', e.code);
        }

        Player.Instance = this;
    }

    start(){
        Player.Instance = this;
    }

    joinGame() {
        const gameId = this.gameIdBox.string
        this.socket.send(JSON.stringify({ 
            event: 'playerJoinGame', 
            gameId: gameId
        }))
        console.log('client join game', gameId);
    }
    
    createGame() {
        this.socket.send(JSON.stringify({ 
            event: 'createNewGame',
        }))
        console.log('client create game') 
    }

    ready() {
        this.socket.send(JSON.stringify({ 
            event: 'ready',
            gameId: this.gameId
        }))
        console.log('client ready') 
    }

    takeTurn() {
        director.getScene().getChildByName('Canvas').getChildByName('Turn').getComponent(Label).string = 'Your turn'
        CoGanhBoard.Instance.takeTurn()
        console.log('my turn')
    }

    makeMove(realFromPos: Vec3, realToPos: Vec3) { 
        this.socket.send(JSON.stringify({ 
            event: 'makeMove',
            move: {
                fromPos: [realFromPos.x, realFromPos.y],
                toPos: [realToPos.x, realToPos.y],
                gameState: CoGanhBoard.Instance.map
            },
            gameId: this.gameId
        }))
        CoGanhBoard.Instance.passTurn()
        director.getScene().getChildByName('Canvas').getChildByName('Turn').getComponent(Label).string = 'Opponent\'s turn'
        console.log('client make move')
    }

    makeMoveBotMode(realFromPos: Vec3, realToPos: Vec3) {
        director.getScene().getChildByName('Canvas').getChildByName('Turn').getComponent(Label).string = 'Opponent\'s turn'
        console.log('client make bot move')
        CoGanhBoard.Instance.passTurnToBot(realFromPos, realToPos)
    }

    win() {
        this.leftGame()
        SceneManager.loadWin()
    }

    lose() {
        this.leftGame()
        SceneManager.loadLose()
    }

    leftGame() {
        this.socket.send(JSON.stringify({ 
            event: 'leftGame',
            gameId: this.gameId
        }))
        console.log('client left game')
    }

    onClickBackButton() {
        this.socket.send(JSON.stringify({ 
            event: 'leftGame',
            gameId: this.gameId
        }))
        console.log('client left game')
        SceneManager.loadMenuScene()
    }

    playWithEasyBot() {
        director.loadScene('EasyBot')
        this.botMode = 1
    }

    playWithHardBot() {
        director.loadScene('HardBot')
        this.botMode = 2
    }
}
