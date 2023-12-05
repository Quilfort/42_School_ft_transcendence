const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 250;
const DEFAULT_PADDLE_WIDTH = 10;
const DEFAULT_PADDLE_HEIGHT = 50;
const PADDLE_OFFSET = 10;
const BALL_WIDTH = 10;

enum Direction {
	NONE,
	UP,
	DOWN
}

enum Side {
	LEFT,
	RIGHT
}

class Paddle {
	y: number;
	height: number;

	constructor (y: number, height: number) {
		this.y = y;
		this.height = height;
	}
}

class Ball {
	x: number;
	y: number;
	x_dir: number;
	y_dir: number;
	width: number;

	constructor (x: number, y: number) {
		this.x = x;
		this.y = y;
		this.x_dir = 0;
		this.y_dir = 0;
		this.width = BALL_WIDTH;
	}
}

export class Field {
	width: number;
	height: number;
	paddleWidth: number
	paddleHeight: number;
	paddleOffset: number;
	ball: Ball;
	paddles: Paddle[];

	constructor () {
		this.width = DEFAULT_WIDTH;
		this.height = DEFAULT_HEIGHT;
		this.paddleHeight = DEFAULT_PADDLE_HEIGHT;
		this.paddleWidth = DEFAULT_PADDLE_WIDTH;
		this.paddleOffset = PADDLE_OFFSET;

		this.ball = new Ball(this.width / 2, this.height / 2);
		this.ball.x_dir = -1;

		this.paddles = [
			new Paddle(this.height / 2, this.paddleHeight),
			new Paddle(this.height / 2, this.paddleHeight)
		];
	}

	reset = () => {
		this.ball.x = this.width / 2;
		this.ball.y = this.height / 2;
		this.paddles[0].y = this.height / 2;
		this.paddles[1].y = this.height / 2;

		this.ball.x_dir = -.5;
		this.ball.y_dir = .1;
	}

	movePaddle = (side: Side, direction: Direction, moveSize: number) => {
		if (direction == Direction.NONE)
			return;

		if (direction == Direction.UP)
			moveSize *= -1; // up is - in pixels, top left is (0, 0)

		this.paddles[side].y += moveSize;

		const paddle = this.paddles[side];
		const paddle_top = paddle.y - paddle.height / 2;
		const paddle_bot = paddle.y + paddle.height / 2;

		// reset to field boundaries
		if (paddle_top < 0)
			this.paddles[side].y = paddle.height / 2;
		if (paddle_bot > this.height)
			this.paddles[side].y = this.height - (paddle.height / 2);
	}

	// move ball handles y collisions itself, x is relevant for paddles only anyways
	moveBall = (moveSize: number) => {
		let new_x = this.ball.x + ( this.ball.x_dir * moveSize );
		let new_y = this.ball.y + ( this.ball.y_dir * moveSize );

		this.ball.x = new_x;
		this.ball.y = new_y;

		const ball_top = this.ball.y - this.ball.width / 2;
		const ball_bot = this.ball.y + this.ball.width / 2;

		if (ball_top < 0) {
			const overshot = ball_top * -1;

			new_y = (this.ball.width / 2) + overshot;
			this.ball.y_dir *= -1;
		}

		if (ball_bot > this.height) {
			const overshot = ball_bot - this.height;

			new_y = this.height - (this.ball.width / 2) - overshot;
			this.ball.y_dir *= -1;
		}

		this.ball.x = new_x;
		this.ball.y = new_y;
	}

	// returns -1 if no col, 0 or 1 if a paddle scored
	checkCollisions = () => {
		const ball_left = this.ball.x - this.ball.width / 2;
		const ball_right = this.ball.x + this.ball.width / 2;
		const ball_top = this.ball.y - this.ball.width / 2;
		const ball_bot = this.ball.y + this.ball.width / 2;

		if (this.ball.x == this.width / 2)
			return -1;
		let paddleToCheck = 0; // left
		if (this.ball.x > this.width / 2)
			paddleToCheck = 1; // right

		let paddle_x = this.paddleOffset + this.paddleWidth; // we will rotate the ball so this is static
		let ball_x = paddleToCheck ?
			ball_right :	// if paddle is right, check right side of ball
			ball_left;

		// rotate x of ball
		ball_x = paddleToCheck ? this.width - ball_x : ball_x;

		const paddle = this.paddles[paddleToCheck];
		const paddle_top = paddle.y - paddle.height / 2;
		const paddle_bot = paddle.y + paddle.height / 2;

		if (ball_x > paddle_x)
			return -1;

		if (ball_bot < paddle_top || ball_top > paddle_bot)
			return paddleToCheck ? 0 : 1;

		this.ball.x_dir *= -1;

		return -1;
	}
}

export default Field;