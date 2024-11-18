import { _decorator, Component, Node, instantiate, Prefab, EventTouch, Vec3, CCBoolean, director, game } from 'cc';
const { ccclass, property } = _decorator;
import { Player } from './Player';

export enum Chess {
    Red = 1,
    Blue = 2
}

@ccclass('CoGanhBoard')
export class CoGanhBoard extends Component {
    public static Instance: CoGanhBoard = null; // Singleton

    @property(Prefab)
    public redChess: Prefab = null!;
    @property(Prefab)
    public blueChess: Prefab = null!;
    @property(Prefab)
    public whiteChess: Prefab = null!;
    @property(Prefab)
    public option: Prefab = null!;

    @property(CCBoolean)
    public isPvE: boolean = false;

    public map: number[][]
    public moveRules: number[][][] = []

    public redNodes: Node[] = []
    public blueNodes: Node[] = []

    public turn: number = 0 // Color of player

    public options: Node[] = []
    public selectedChess: Node = null

    start() {
        CoGanhBoard.Instance = this;
        if (this.isPvE) {
            this.turn = Chess.Red
            this.takeTurn()
        }
    }
    onLoad() {
        this.map = []
        this.moveRules = []
        if (this.redNodes.length > 0) {
            for (var node of this.redNodes) {
                node.destroy()
            }
        }
        this.redNodes = []
        if (this.blueNodes.length > 0) {
            for (var node of this.blueNodes) {
                node.destroy()
            }
        }
        this.blueNodes = []
        if (this.options.length > 0) {
            for (var node of this.options) {
                node.destroy()
            }
        }
        this.options = []
        if (this.selectedChess) {
            this.selectedChess.destroy()
            this.selectedChess = null
        }
        this.initBoard()
        this.spawnChess()
        this.initMoveRules()
        CoGanhBoard.Instance = this;
    }

    initBoard() {
        this.map = [[Chess.Red, Chess.Red, Chess.Red, Chess.Red, Chess.Red],
        [Chess.Red, 0, 0, 0, Chess.Red],
        [Chess.Blue, 0, 0, 0, Chess.Red],
        [Chess.Blue, 0, 0, 0, Chess.Blue],
        [Chess.Blue, Chess.Blue, Chess.Blue, Chess.Blue, Chess.Blue]]
    }

    initMoveRules() {
        this.moveRules[0] = [[0, 1], [1, 0], [1, 1]]
        this.moveRules[1] = [[0, 0], [1, 1], [0, 2]]
        this.moveRules[2] = [[0, 1], [1, 1], [1, 2], [0, 3], [1, 3]]
        this.moveRules[3] = [[0, 2], [1, 3], [0, 4]]
        this.moveRules[4] = [[0, 3], [1, 3], [1, 4]]
        this.moveRules[5] = [[0, 0], [1, 1], [2, 0]]
        this.moveRules[6] = [[0, 0], [1, 0], [0, 1], [2, 1], [1, 2], [2, 2], [0, 2], [2, 0]]
        this.moveRules[7] = [[1, 1], [1, 3], [2, 2], [0, 2]]
        this.moveRules[8] = [[0, 2], [1, 2], [0, 3], [2, 4], [1, 4], [2, 3], [0, 4], [2, 2]]
        this.moveRules[9] = [[0, 4], [1, 3], [2, 4]]
        this.moveRules[10] = [[1, 0], [1, 1], [2, 1], [3, 1], [3, 0]]
        this.moveRules[11] = [[2, 0], [1, 1], [2, 2], [3, 1]]
        this.moveRules[12] = [[1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [2, 1]]
        this.moveRules[13] = [[1, 3], [2, 4], [3, 3], [2, 2]]
        this.moveRules[14] = [[1, 4], [1, 3], [2, 3], [3, 3], [3, 4]]
        this.moveRules[15] = [[2, 0], [3, 1], [4, 0]]
        this.moveRules[16] = [[2, 0], [2, 1], [2, 2], [3, 2], [4, 2], [4, 1], [4, 0], [3, 0]]
        this.moveRules[17] = [[2, 2], [3, 3], [4, 2], [3, 1]]
        this.moveRules[18] = [[2, 2], [2, 3], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [3, 2]]
        this.moveRules[19] = [[2, 4], [3, 3], [4, 4]]
        this.moveRules[20] = [[3, 0], [3, 1], [4, 1]]
        this.moveRules[21] = [[4, 0], [3, 1], [4, 2]]
        this.moveRules[22] = [[4, 1], [3, 1], [3, 2], [3, 3], [4, 3]]
        this.moveRules[23] = [[4, 2], [3, 3], [4, 4]]
        this.moveRules[24] = [[4, 3], [3, 3], [3, 4]]
    }

    spawnChess() {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (this.map[i][j] == 1) {
                    let chess = instantiate(this.redChess);
                    chess.parent = this.node;
                    let realPos = CoGanhBoard.posFictionToReal(i, j)
                    chess.setPosition(realPos[0], realPos[1], 0);
                    this.redNodes = [...this.redNodes, chess]
                }
                else if (this.map[i][j] == 2) {
                    let chess = instantiate(this.blueChess);
                    chess.parent = this.node;
                    let realPos = CoGanhBoard.posFictionToReal(i, j)
                    chess.setPosition(realPos[0], realPos[1], 0);
                    this.blueNodes = [...this.blueNodes, chess]
                }
            }
        }
    }

    static posRealToFiction(x: number, y: number) {
        return [(y - 280) / (-140), (x + 280) / 140]
    }

    static posFictionToReal(i: number, j: number) {
        return [140 * j - 280, -140 * i + 280]
    }

    takeTurn() {
        for (var node of (this.turn === Chess.Red ? this.redNodes : this.blueNodes)) {
            node.on(Node.EventType.TOUCH_END, (e: EventTouch) => {
                console.log((e.target as Node).getPosition())

                // Clear current selected node
                if (this.selectedChess) {
                    this.selectedChess.destroy()
                    this.selectedChess = null
                }

                // Highlight selected node
                this.selectedChess = instantiate(this.whiteChess)
                this.selectedChess.parent = this.node
                this.selectedChess.setPosition((e.target as Node).getPosition().x, (e.target as Node).getPosition().y)

                // Clear all current options
                if (this.options.length > 0) {
                    for (var option of this.options) {
                        option.destroy()
                    }
                }
                this.options = []

                // Gen options for current selected node
                this.genOptions((e.target as Node))
            })
        }
    }

    genOptions(selectedNode: Node) {
        let ficPosNode = CoGanhBoard.posRealToFiction(selectedNode.getPosition().x, selectedNode.getPosition().y)
        for (var movablePos of this.moveRules[ficPosNode[0] * 5 + ficPosNode[1]]) {
            if (this.map[movablePos[0]][movablePos[1]] === 0) {
                let option = instantiate(this.option)
                option.parent = this.node
                let realPosOption = CoGanhBoard.posFictionToReal(movablePos[0], movablePos[1])
                option.setPosition(realPosOption[0], realPosOption[1], 0)
                this.options = [...this.options, option]
                option.on(Node.EventType.TOUCH_END, (e: EventTouch) => {
                    // Calculate gameState from move
                    this.move(selectedNode, (e.target as Node).getPosition())

                    // Clear
                    this.selectedChess.destroy()
                    this.selectedChess = null
                    for (var option of this.options) {
                        option.destroy()
                    }
                    this.options = []

                    // Turn off touch events
                    this.passTurn()

                    if (this.isPvE) {
                        this.turn = this.turn === Chess.Red ? Chess.Blue : Chess.Red
                        console.log('Bot turn')
                        this.botMove()
                    }
                    else {
                        // Player send move to server
                        Player.Instance.makeMove(selectedNode.getPosition(), (e.target as Node).getPosition())
                    }

                    if ((this.turn === Chess.Red ? this.blueNodes : this.redNodes).length === 0) {
                        Player.Instance.win()
                    }
                })
            }
        }
    }

    move(selectedNode: Node, realToPos: Vec3) { // selectedNode: chess selected by player to make move, realToPos: real position selectedNode is moved to
        // Update the move to current game state
        let ficToPos = CoGanhBoard.posRealToFiction(realToPos.x, realToPos.y)
        this.map[ficToPos[0]][ficToPos[1]] = this.turn
        let ficSelectedNodePos = CoGanhBoard.posRealToFiction(selectedNode.getPosition().x, selectedNode.getPosition().y)
        this.map[ficSelectedNodePos[0]][ficSelectedNodePos[1]] = 0
        selectedNode.setPosition(realToPos)

        // Change game state because of move
        // Manage Gánh
        let ganhNodesPos = CoGanhBoard.Instance.getGanhNodes(ficToPos[0], ficToPos[1])
        for (var pos of ganhNodesPos) {
            this.map[pos[0]][pos[1]] = this.turn
            for (var node of (this.turn === Chess.Red ? this.blueNodes : this.redNodes)) {
                let ficNodePos = CoGanhBoard.posRealToFiction(node.getPosition().x, node.getPosition().y)
                if (ficNodePos[0] == pos[0] && ficNodePos[1] == pos[1]) {
                    let chess = instantiate(this.turn === Chess.Red ? this.redChess : this.blueChess)
                    chess.setPosition(node.getPosition())
                    chess.parent = this.node;
                    (this.turn === Chess.Red ? this.redNodes : this.blueNodes).push(chess);
                    (this.turn === Chess.Red ? this.blueNodes : this.redNodes).splice((this.turn === Chess.Red ? this.blueNodes : this.redNodes).indexOf(node), 1)
                    node.destroy()
                    break
                }
            }
        }
        // Manage Chẹt
        let chetNodesPos = CoGanhBoard.Instance.getChetNodes()
        for (var pos of chetNodesPos) {
            this.map[pos[0]][pos[1]] = this.turn
            for (var node of (this.turn === Chess.Red ? this.blueNodes : this.redNodes)) {
                let ficNodePos = CoGanhBoard.posRealToFiction(node.getPosition().x, node.getPosition().y)
                if (ficNodePos[0] == pos[0] && ficNodePos[1] == pos[1]) {
                    let chess = instantiate(this.turn === Chess.Red ? this.redChess : this.blueChess)
                    chess.setPosition(node.getPosition())
                    chess.parent = this.node;
                    (this.turn === Chess.Red ? this.redNodes : this.blueNodes).push(chess);
                    (this.turn === Chess.Red ? this.blueNodes : this.redNodes).splice((this.turn === Chess.Red ? this.blueNodes : this.redNodes).indexOf(node), 1)
                    node.destroy()
                    break
                }
            }
        }
    }

    getGanhNodes(posX: number, posY: number) { // (Fiction toPosition of node chosen for moving) => Get list fiction positions of nodes should change color for gánh
        let ganhNodes = []
        let nodesHasOpposite = {}

        for (var adjPos of this.moveRules[posX * 5 + posY]) {
            if (nodesHasOpposite[adjPos[0] * 5 + adjPos[1]] !== undefined) {
                continue
            }

            let oppositePosX = adjPos[0] + 2 * (posX - adjPos[0])
            let oppositePosY = adjPos[1] + 2 * (posY - adjPos[1])
            if (oppositePosX > 4 || oppositePosY > 4 || oppositePosX < 0 || oppositePosY < 0) {
                continue
            }
            nodesHasOpposite[oppositePosX * 5 + oppositePosY] = adjPos
            if (this.map[adjPos[0]][adjPos[1]] !== 0 && this.map[adjPos[0]][adjPos[1]] !== this.turn && this.map[adjPos[0]][adjPos[1]] === this.map[oppositePosX][oppositePosY]) {
                ganhNodes = [...ganhNodes, adjPos, [oppositePosX, oppositePosY]]
            }
        }

        return ganhNodes
    }

    getChetNodes() { // Get list fiction positions of nodes should change color for chẹt
        let chetNodes = []
        for (var node of (this.turn === Chess.Red ? this.blueNodes : this.redNodes)) {
            let ficNodePos = CoGanhBoard.posRealToFiction(node.getPosition().x, node.getPosition().y)
            let inSomeChetCluster = false
            for (var pos of chetNodes) {
                if (pos[0] === ficNodePos[0] && pos[1] === ficNodePos[1]) {
                    inSomeChetCluster = true
                    break;
                }
            }
            if (inSomeChetCluster) {
                continue
            }
            let chetCluster = this.findChetCluster(ficNodePos, [])
            chetNodes = [...chetNodes, ...chetCluster]
        }
        return chetNodes
    }

    findChetCluster(ficPosNode: number[], testedChetNodes: number[][]) {
        let sameColorNodesBlockWays = []
        for (var adjPos of this.moveRules[ficPosNode[0] * 5 + ficPosNode[1]]) {
            if (this.map[adjPos[0]][adjPos[1]] === 0) return []
            if (this.map[adjPos[0]][adjPos[1]] !== this.turn) {
                let hasBeenTested = false
                for (var pos of testedChetNodes) {
                    if (pos[0] === adjPos[0] && pos[1] === adjPos[1]) {
                        hasBeenTested = true
                        break
                    }
                }
                if (!hasBeenTested) {
                    sameColorNodesBlockWays = [...sameColorNodesBlockWays, adjPos]
                }
            }
        }

        if (sameColorNodesBlockWays.length === 0) {
            return [...testedChetNodes, ficPosNode]
        }

        let result = this.findChetCluster(sameColorNodesBlockWays[0], [...testedChetNodes, ficPosNode])
        if (result.length === 0) {
            return []
        }

        sameColorNodesBlockWays.splice(0, 1)
        for (var nodePos of sameColorNodesBlockWays) {
            result = this.findChetCluster(nodePos, result)
            if (result.length === 0) {
                return []
            }
        }
        return result
    }

    passTurn() {
        for (var node of (this.turn === Chess.Red ? this.redNodes : this.blueNodes)) {
            node.off(Node.EventType.TOUCH_END)
        }
    }
    passTurnToBot(fromPos: Vec3, toPos: Vec3) {
        for (var node of (this.turn === Chess.Red ? this.redNodes : this.blueNodes)) {
            node.off(Node.EventType.TOUCH_END)
        }
        let opponentMove = {
            fromPos: [fromPos.x, fromPos.y],
            toPos: [toPos.x, toPos.y],
            gameState: CoGanhBoard.Instance.map
        }
        this.updateGameState(opponentMove)

        this.turn = this.turn === Chess.Red ? Chess.Blue : Chess.Red
        console.log('Bot turn')
        this.botMove()
    }

    staticEval(turn: number) {
        if (turn == Chess.Red) {
            if (this.redNodes.length === 0) {
                return -Infinity
            }
            else if (this.blueNodes.length === 0) {
                return Infinity
            }
            else {
                return this.redNodes.length - this.blueNodes.length
            }
        }
        else if (turn == Chess.Blue) {
            if (this.blueNodes.length === 0) {
                return -Infinity
            }
            else if (this.redNodes.length === 0) {
                return Infinity
            }
            else {
                return this.blueNodes.length - this.redNodes.length
            }
        }
        else {
            return NaN
        }
    }

    botMove() {
        if (this.redNodes.length === 0) {
            Player.Instance.lose()
        }
        else if (this.blueNodes.length === 0) {
            Player.Instance.win()
        }
        else {
            if (Player.Instance.botMode === 1) {
                this.randomMove()
            }
            else if (Player.Instance.botMode === 2) {
                this.minimaxMove()
            }

            this.turn = this.turn === Chess.Red ? Chess.Blue : Chess.Red // pass turn to Player
            this.takeTurn()
        }
    }

    minimaxMove() {
        let bestMove = []
        let bestValue = -Infinity
        let depth = 2

        for (var node of this.blueNodes) {
            let ficPosNode = CoGanhBoard.posRealToFiction(node.getPosition().x, node.getPosition().y)
            for (var movablePos of this.moveRules[ficPosNode[0] * 5 + ficPosNode[1]]) {
                if (this.map[movablePos[0]][movablePos[1]] === 0) {
                    let newBoard = new Board()
                    newBoard.init(Chess.Blue)
                    newBoard.turn = Chess.Blue
                    newBoard.map = newBoard.copyMap(this.map)
                    let option = instantiate(this.option)
                    let realPosOption = CoGanhBoard.posFictionToReal(movablePos[0], movablePos[1])
                    option.setPosition(realPosOption[0], realPosOption[1], 0)
                    newBoard.move(node, option.getPosition())

                    console.log(newBoard.map)
                    let value = this.minValue(bestValue, Infinity, depth - 1, newBoard.map)
                    if (value >= bestValue) {
                        bestValue = value
                        bestMove = [...bestMove, [node, option.getPosition()]]
                    }
                }
            }
        }
        console.log('Best move: ', bestMove.length)
        let randomIndex = Math.floor(Math.random() * bestMove.length)
        let res = bestMove[randomIndex]
        console.log('Bot choose node: ', res)
        this.move(res[0], res[1])
    }

    minValue(alpha: number, beta: number, depth: number, map: number[][]) {
        if (depth === 0) {
            return this.staticEval(Chess.Red)
        }
        let bestValue = Infi  nity

        for (var node of this.redNodes) {
            let ficPosNode = CoGanhBoard.posRealToFiction(node.getPosition().x, node.getPosition().y)
            for (var movablePos of this.moveRules[ficPosNode[0] * 5 + ficPosNode[1]]) {
                if (this.map[movablePos[0]][movablePos[1]] === 0) {
                    let newBoard = new Board()
                    newBoard.init(Chess.Red)
                    newBoard.turn = Chess.Red
                    newBoard.map = newBoard.copyMap(this.map)
                    let option = instantiate(this.option)
                    let realPosOption = CoGanhBoard.posFictionToReal(movablePos[0], movablePos[1])
                    option.setPosition(realPosOption[0], realPosOption[1], 0)
                    newBoard.move(node, option.getPosition())
                    let value = this.maxValue(alpha, beta, depth - 1, newBoard.map)
                    if (value < bestValue) {
                        bestValue = value
                    }
                    beta = Math.min(beta, value)
                    if (alpha >= beta) {
                        break
                    }
                }
            }
        }
        return bestValue
    }

    maxValue(alpha: number, beta: number, depth: number, map: number[][]) {
        if (depth === 0) {
            return this.staticEval(Chess.Blue)
        }
        let bestValue = -Infinity

        for (var node of this.redNodes) {
            let ficPosNode = CoGanhBoard.posRealToFiction(node.getPosition().x, node.getPosition().y)
            for (var movablePos of this.moveRules[ficPosNode[0] * 5 + ficPosNode[1]]) {
                if (this.map[movablePos[0]][movablePos[1]] === 0) {
                    let newBoard = new Board()
                    newBoard.init(Chess.Blue)
                    newBoard.turn = Chess.Blue
                    newBoard.map = newBoard.copyMap(this.map)
                    let option = instantiate(this.option)
                    let realPosOption = CoGanhBoard.posFictionToReal(movablePos[0], movablePos[1])
                    option.setPosition(realPosOption[0], realPosOption[1], 0)
                    newBoard.move(node, option.getPosition())
                    console.log(newBoard.map)
                    let value = this.maxValue(alpha, beta, depth - 1, newBoard.map)
                    if (value > bestValue) {
                        bestValue = value
                    }
                    alpha = Math.max(alpha, bestValue)
                    if (alpha >= beta) {
                        break
                    }
                }
            }
        }
        return bestValue
    }

    randomMove() {
        let count = 0
        let isMoved = false
        while (!isMoved && count < 100) {
            count++
            isMoved = this.randomBotMove()
        }
        console.log('Count: ', count)
    }

    randomBotMove() {
        // random in range this.blueNodes
        let randomIndex = Math.floor(Math.random() * this.blueNodes.length)
        let count = 0
        for (var node of this.blueNodes) {
            count++
            if (count == randomIndex) {
                console.log('Bot choose node: ', node.getPosition())
                let ficPosNode = CoGanhBoard.posRealToFiction(node.getPosition().x, node.getPosition().y)

                for (var movablePos of this.moveRules[ficPosNode[0] * 5 + ficPosNode[1]]) {
                    if (this.map[movablePos[0]][movablePos[1]] === 0) {
                        let option = instantiate(this.option)
                        let realPosOption = CoGanhBoard.posFictionToReal(movablePos[0], movablePos[1])
                        option.setPosition(realPosOption[0], realPosOption[1], 0)
                        this.move(node, option.getPosition())
                        return true
                    }
                }
            }
        }
        return false
    }

    updateGameState(opponentMove) {
        this.selectedChess = instantiate(this.whiteChess)
        this.selectedChess.parent = this.node
        this.selectedChess.setPosition(opponentMove.fromPos[0], opponentMove.fromPos[1])

        // Wait for 1 second before continue
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > 2000) {
                break;
            }
        }

        this.map = opponentMove.gameState
        for (var node of [...this.redNodes, ...this.blueNodes]) {
            node.destroy()
        }
        this.redNodes = []
        this.blueNodes = []
        this.spawnChess()
        if ((this.turn === Chess.Red ? this.redNodes : this.blueNodes).length === 0) {
            Player.Instance.lose()
        }
        this.selectedChess.destroy()
        this.selectedChess = null
    }

    playerClickBackButton() {
        Player.Instance.onClickBackButton()
    }

    pauseGame() {
        game.pause()
    }

    resumeGame() {
        game.resume()
    }
}

@ccclass('Board')
export class Board {
    public map: number[][]
    public moveRules: number[][][] = []
    public turn: number = 0 // Color of player

    init(turn: number) {
        this.map = []
        this.moveRules = []
        this.turn = turn
        this.initMoveRules()
    }
    initMoveRules() {
        this.moveRules[0] = [[0, 1], [1, 0], [1, 1]]
        this.moveRules[1] = [[0, 0], [1, 1], [0, 2]]
        this.moveRules[2] = [[0, 1], [1, 1], [1, 2], [0, 3], [1, 3]]
        this.moveRules[3] = [[0, 2], [1, 3], [0, 4]]
        this.moveRules[4] = [[0, 3], [1, 3], [1, 4]]
        this.moveRules[5] = [[0, 0], [1, 1], [2, 0]]
        this.moveRules[6] = [[0, 0], [1, 0], [0, 1], [2, 1], [1, 2], [2, 2], [0, 2], [2, 0]]
        this.moveRules[7] = [[1, 1], [1, 3], [2, 2], [0, 2]]
        this.moveRules[8] = [[0, 2], [1, 2], [0, 3], [2, 4], [1, 4], [2, 3], [0, 4], [2, 2]]
        this.moveRules[9] = [[0, 4], [1, 3], [2, 4]]
        this.moveRules[10] = [[1, 0], [1, 1], [2, 1], [3, 1], [3, 0]]
        this.moveRules[11] = [[2, 0], [1, 1], [2, 2], [3, 1]]
        this.moveRules[12] = [[1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [2, 1]]
        this.moveRules[13] = [[1, 3], [2, 4], [3, 3], [2, 2]]
        this.moveRules[14] = [[1, 4], [1, 3], [2, 3], [3, 3], [3, 4]]
        this.moveRules[15] = [[2, 0], [3, 1], [4, 0]]
        this.moveRules[16] = [[2, 0], [2, 1], [2, 2], [3, 2], [4, 2], [4, 1], [4, 0], [3, 0]]
        this.moveRules[17] = [[2, 2], [3, 3], [4, 2], [3, 1]]
        this.moveRules[18] = [[2, 2], [2, 3], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [3, 2]]
        this.moveRules[19] = [[2, 4], [3, 3], [4, 4]]
        this.moveRules[20] = [[3, 0], [3, 1], [4, 1]]
        this.moveRules[21] = [[4, 0], [3, 1], [4, 2]]
        this.moveRules[22] = [[4, 1], [3, 1], [3, 2], [3, 3], [4, 3]]
        this.moveRules[23] = [[4, 2], [3, 3], [4, 4]]
        this.moveRules[24] = [[4, 3], [3, 3], [3, 4]]
    }

    genOptions(node: Node) {
        let canMovePos = []
        for (var movablePos of this.moveRules[node[0] * 5 + node[1]]) {
            if (this.map[movablePos[0]][movablePos[1]] === 0) {
                canMovePos = [...canMovePos, movablePos]
            }
        }
        return canMovePos
    }

    move(node: Node, realToPos: Vec3) {
        let ficPosNode = CoGanhBoard.posRealToFiction(node.getPosition().x, node.getPosition().y)
        let toPos = CoGanhBoard.posRealToFiction(realToPos.x, realToPos.y)
        this.map[toPos[0]][toPos[1]] = this.turn
        this.map[ficPosNode[0]][ficPosNode[1]] = 0

        // Manage Gánh
        let ganhNodesPos = this.getGanhNodes(ficPosNode[0], ficPosNode[1])
        for (var pos of ganhNodesPos) {
            this.map[pos[0]][pos[1]] = this.turn
        }
        // Manage Chẹt
        let chetNodesPos = this.getChetNodes()
        for (var pos of chetNodesPos) {
            this.map[pos[0]][pos[1]] = this.turn
        }

    }
    getGanhNodes(posX: number, posY: number) {
        let ganhNodes = []
        let nodesHasOpposite = {}

        for (var adjPos of this.moveRules[posX * 5 + posY]) {
            if (nodesHasOpposite[adjPos[0] * 5 + adjPos[1]] !== undefined) {
                continue
            }

            let oppositePosX = adjPos[0] + 2 * (posX - adjPos[0])
            let oppositePosY = adjPos[1] + 2 * (posY - adjPos[1])
            if (oppositePosX > 4 || oppositePosY > 4 || oppositePosX < 0 || oppositePosY < 0) {
                continue
            }
            nodesHasOpposite[oppositePosX * 5 + oppositePosY] = adjPos
            if (this.map[adjPos[0]][adjPos[1]] !== 0 && this.map[adjPos[0]][adjPos[1]] !== this.turn && this.map[adjPos[0]][adjPos[1]] === this.map[oppositePosX][oppositePosY]) {
                ganhNodes = [...ganhNodes, adjPos, [oppositePosX, oppositePosY]]
            }
        }

        return ganhNodes
    }

    getChetNodes() { // Get list fiction positions of nodes should change color for chẹt
        let opponent = this.turn === Chess.Red ? Chess.Blue : Chess.Red
        let chetNodes = []
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (opponent === this.map[i][j]) {
                    let inSomeChetCluster = false
                    for (var pos of chetNodes) {
                        if (pos[0] === i && pos[1] === j) {
                            inSomeChetCluster = true
                            break;
                        }
                    }
                    if (inSomeChetCluster) {
                        continue
                    }
                    let chetCluster = this.findChetCluster([i, j], [])
                    chetNodes = [...chetNodes, ...chetCluster]
                }
            }
        }
        return chetNodes
    }
    findChetCluster(ficPosNode: number[], testedChetNodes: number[][]) {
        let sameColorNodesBlockWays = []
        for (var adjPos of this.moveRules[ficPosNode[0] * 5 + ficPosNode[1]]) {
            if (this.map[adjPos[0]][adjPos[1]] === 0) return []
            if (this.map[adjPos[0]][adjPos[1]] !== this.turn) {
                let hasBeenTested = false
                for (var pos of testedChetNodes) {
                    if (pos[0] === adjPos[0] && pos[1] === adjPos[1]) {
                        hasBeenTested = true
                        break
                    }
                }
                if (!hasBeenTested) {
                    sameColorNodesBlockWays = [...sameColorNodesBlockWays, adjPos]
                }
            }
        }

        if (sameColorNodesBlockWays.length === 0) {
            return [...testedChetNodes, ficPosNode]
        }

        let result = this.findChetCluster(sameColorNodesBlockWays[0], [...testedChetNodes, ficPosNode])
        if (result.length === 0) {
            return []
        }

        sameColorNodesBlockWays.splice(0, 1)
        for (var nodePos of sameColorNodesBlockWays) {
            result = this.findChetCluster(nodePos, result)
            if (result.length === 0) {
                return []
            }
        }
        return result
    }

    copyMap(map: Number[][]) {
        let newMap = []
        for (let i = 0; i < 5; i++) {
            newMap[i] = []
            for (let j = 0; j < 5; j++) {
                newMap[i][j] = map[i][j]
            }
        }
        return newMap
    }
}

