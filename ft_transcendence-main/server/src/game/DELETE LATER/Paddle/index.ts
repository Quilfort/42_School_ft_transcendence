export class Paddle {

    private spawn_pos_x_left:   number;
    private spawn_pos_x_right:  number;
    private spawn_pos_y:        number;
    private spawn_speed_y:      number;
    private left_player:        boolean;

    // pos_x_left:                 number;
    // pos_x_right:                number;
    pos_x:                      number;
    pos_y:                      number;
    speed_y:                    number;			
    alive:                  	boolean;

    constructor(left: boolean) {

		this.spawn_pos_x_left = 	10;
		this.spawn_pos_x_right =	90;
		this.spawn_pos_y =			17;
		this.spawn_speed_y =		0;

		this.speed_y = 				this.spawn_speed_y;
		this.pos_y = 				this.spawn_pos_y;
		this.left_player = 			left;
		this.alive = 				true;
		this.resetGame();

		if (this.left_player) {
			this.pos_x = 			this.spawn_pos_x_left;
		}
		else {
			this.pos_x = 			this.spawn_pos_x_right;
		} 


    }

	public checkAlive = () => {
		if (!this.alive) {
			this.resetGame();
		}
	}

	public movePaddle = (KeyPress: any) => {
		
		//Testing
		if (this.left_player) {
			if (KeyPress.w)
				this.speed_y -= 0.02;
			if (KeyPress.s)
				this.speed_y += 0.02;
		}

		if (!this.left_player){
			if (KeyPress.ArrowUp)
				this.speed_y -= 0.02;
			if (KeyPress.ArrowDown)
				this.speed_y += 0.02;
		}

		
		// if (KeyPress.w || KeyPress.ArrowUp)
		// 	this.speed_y -= 0.02;
		// if (KeyPress.s || KeyPress.ArrowDown)
		// 	this.speed_y += 0.02;

		if (this.speed_y <= -0.2) 
			this.speed_y = -0.2;
		if (this.speed_y >= 0.2)
			this.speed_y = 0.2;

		this.pos_y = this.pos_y + this.speed_y;
	}

	public collisionTopBottom = (ball: any) => {
		if (this.pos_y <= 0) {
			this.pos_y = 0;
			this.speed_y = -0.1 * this.speed_y;	 
		}

		if (this.pos_y >= 34) {
			this.pos_y = 34;
			this.speed_y = -0.1 * this.speed_y;	
		}

		// Check for Ball Pos, anders, update pos

		//Player 1 died
		if (ball.pos_x <= 0) {
			this.alive = false;
		}

		//Player 2 died
		if (ball.pos_x >= 100) {
			this.alive = false;
		}

		this.pos_y += this.speed_y;
	}

	public resetGame = () => {
		if (this.left_player) {
			this.pos_x = 			this.spawn_pos_x_left;
		}
		else {
			this.pos_x = 			this.spawn_pos_x_right;
		}
		this.speed_y = 				this.spawn_speed_y;
		this.pos_y = 				this.spawn_pos_y;
		this.alive = 				true;
	}
}

export default Paddle;
