enum BallRadius {
	Small = 10,
	Medium = 20,
	Large = 30,
  }

export class Ball {

	private spawn_pos_x:    number;
    private spawn_pos_y:    number;
    private spawn_speed_x:  number;
    private spawn_speed_y:  number;
	
    pos_x:                  number;
    pos_y:      			number;
    speed_x:    			number;
    speed_y:    			number;
    alive:      			boolean;
	radius: 				BallRadius;
	
    constructor() {
		this.spawn_pos_x = 50;
		this.spawn_pos_y = 25;
		this.spawn_speed_x = (0.1 * (Math.random() > 0.5 ? 1 : -1));
		this.spawn_speed_y = (0.1 * (Math.random() > 0.5 ? 1 : -1));
		this.alive = true;
		this.radius = BallRadius.Medium
        this.resetGame();

		this.pos_x = this.spawn_pos_x;
		this.pos_y = this.spawn_pos_y;
		this.speed_x = this.spawn_speed_x;
		this.speed_y = this.spawn_speed_y;
    }

	public checkAlive = () => {
		if (!this.alive) {
			this.resetGame();
		}
	}

	public moveBall = (Paddle1: any, Paddle2: any) => {

		// CONTROLEREN NEXT POS VOORDAT IK HET AANPAS

		if (!Paddle1.alive || !Paddle2.alive)
				this.alive = false;
	
		const next_pos_y = this.pos_y + this.speed_y;
		const next_pos_x = this.pos_x + this.speed_x;

		if (next_pos_x <= 10 + 1 && next_pos_x >= 10 - 1) {
			if (((Paddle1.pos_y) <= this.pos_y && (Paddle1.pos_y + 16) >= this.pos_y) && ((Paddle1.pos_x + 1) >= this.pos_x)) {
				this.speed_x = -1 * (this.speed_x - 0.05);
				if (Paddle1.speed_y !== 0) {
					this.speed_y += Math.round((Paddle1.speed_y / 10) * 10) / 10;
				}
			}
		}

		if (next_pos_x >= 90 - 2 && next_pos_x <= 90) {
			if (((Paddle2.pos_y) <= this.pos_y && (Paddle2.pos_y + 16) >= this.pos_y) && ((Paddle2.pos_x - 2) <= this.pos_x)) {
				this.speed_x = -1 * (this.speed_x + 0.05);
				if (Paddle2.speed_y !== 0) {
					this.speed_y += Math.round((Paddle2.speed_y / 10) * 10) / 10;
				}
			}
		}

		if (this.speed_x <= -Math.SQRT1_2) {
			this.speed_x = -Math.SQRT1_2
		}

		if (this.speed_x >= Math.SQRT1_2) {
			this.speed_x = Math.SQRT1_2
		}

		if (this.speed_y <= -Math.SQRT2) {
			this.speed_y = -Math.SQRT2
		}
		if (this.speed_y >= Math.SQRT2) {
			this.speed_y = Math.SQRT2
		}

		this.collisionTopBottom(next_pos_y)

		this.pos_x = this.pos_x + this.speed_x;
		this.pos_y = this.pos_y + this.speed_y;

		//Check Collision here? of geen info pas terug nadat Collision is gecheck

		
	}

	private collisionTopBottom = (next_pos_y: number) => {
		if (next_pos_y <= 0) {
			this.pos_y = 0;
			this.speed_y = -1 * this.speed_y;
		}
		if (next_pos_y >= 48) {
			this.pos_y = 48;
			this.speed_y = -1 * this.speed_y; 
		}
	}

    public resetGame = () => {
		this.pos_x = this.spawn_pos_x;
		this.pos_y = this.spawn_pos_y;
		this.speed_x = this.spawn_speed_x;
		this.speed_y = this.spawn_speed_y;
		this.alive = true;
    }
}

export default Ball;