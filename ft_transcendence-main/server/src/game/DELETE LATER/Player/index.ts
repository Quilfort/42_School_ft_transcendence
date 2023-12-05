import { Paddle } from '../Paddle';



export class Player {
	name:     	string;
  	score:    	number;
	paddle:		Paddle;
	winner:		false;

	constructor(name: string, player1: boolean) {

		this.name = name;
		this.score = 0;
		this.paddle = new Paddle(player1);
		this.winner = false;
	}





}

export default Player;





















// export interface User {
//   id: number;
//   intraId: number;
//   name: string;
//   avatar: string;
//   experience: number;
//   wins: number;
//   losses: number;
// }

// export class Player {
//   private _intraId: number;
//   private _ready: boolean;

//   id: number;
//   name: string;
//   experience: number;
//   avatar: string;
//   wins: number;
//   losses: number;

//   paddle: Paddle;

//   constructor(user: User) {
//     this.id = user.id;
//     this._intraId = user.intraId;
//     this.name = user.name;
//     this.avatar = user.avatar;
//     this.experience = user.experience;
//     this.wins = user.wins;
//     this.losses = user.losses;
//     this._ready = false;
//   }
// }


