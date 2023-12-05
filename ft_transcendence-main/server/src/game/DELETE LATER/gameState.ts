import { Ball } from './Ball/index'
import { Player } from './Player/index'


export class GameState {
    gameID:             number;
    ball:               Ball;
    paused:             boolean;
    gameOver:           boolean;
    status:             string;
    player1:            Player;
    player2:            Player;
    gameInterval:       NodeJS.Timeout;

    constructor (gameID: number) {
        this.gameID = gameID;
        this.ball = new Ball;
        this.paused = false;
        this.gameOver= false;

    }

    public addPlayer(name: string, isPlayer1: boolean) {
        //WHEN ADDING PLAYERS

        if (isPlayer1)
           this.player1 = new Player(name, isPlayer1);
        if (!isPlayer1) {
            this.player2 = new Player(name, isPlayer1);
            //Placeholder
            this.status = "IN_PROGRESS";
        }
    }

    public  checkScore() {

        // Check for Score
        if (this.ball.pos_x <= 0) {
            this.player2.score += 1;
        }
        if (this.ball.pos_x >= 100) {
            this.player1.score += 1;
        }

        //Check for winner
        if (this.player1.score == 4 || this.player2.score == 4) {
            this.gameOver = true;
        }
    }

    public resetGame = () => {
        this.ball.resetGame();
        this.player1.paddle.resetGame();
        this.player2.paddle.resetGame();
    }
}

export default GameState;

