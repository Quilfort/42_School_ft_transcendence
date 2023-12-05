export const games = [
  {
    players: [1, 2], // intra_id of players
    score: [10, 5], // example scores
    finished_at: new Date(),
    winner_id: 1, // intra_id of the winner player
    loser_id: 2, // intra_id of the loser player
  },
  {
    players: [3, 4],
    score: [7, 10],
    finished_at: new Date(),
    winner_id: 4,
    loser_id: 3,
  },
  {
    players: [5, 6],
    score: [2, 1],
    winner_id: null,
    loser_id: null,
  },
  {
    players: [7, 8],
    score: [0, 0],
    winner_id: null,
    loser_id: null,
  },
  {
    players: [2, 6],
    score: [7, 10],
    finished_at: new Date(),
    winner_id: 6,
    loser_id: 2,
  },
];
