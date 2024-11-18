import { _decorator, Component, director, Label } from 'cc';
const { ccclass, property } = _decorator;
import { CoGanhBoard } from './CoGanhBoard';
import { Player } from './Player';

@ccclass('SceneManager')
export class SceneManager extends Component {
    static loadMenuScene(){
        director.loadScene('Menu');
    }
    static loadSelectPlayer(){
        director.loadScene('SelectPlayer');
    }
    static loadPlayScene(turn: number) {
        director.loadScene('Play', () => {
            CoGanhBoard.Instance.turn = turn
            Player.Instance.ready()
        });
    }
    static loadJoinRoom(){
        director.loadScene('JoinRoom');
    }
    static loadWaitPlayer(gameId: string){
        director.loadScene('WaitPlayer', () => director.getScene().getChildByName('Canvas').getChildByName('GameId').getComponent(Label).string = `Waiting for another player ...\nGameId: ${gameId}`)
    }
    loadPvEMenu(){
        director.loadScene('PvEMenu');
    }
    loadPvPMenu(){
        director.loadScene('PvPMenu');
    }
    static loadWin(){
        director.loadScene('Win');
    }
    static loadLose(){
        director.loadScene('Lose');
    }
}