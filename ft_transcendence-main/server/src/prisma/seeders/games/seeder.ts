// Importing dependencies
import { PrismaClient } from '@prisma/client';
import { games } from './games';

const prisma = new PrismaClient();

async function game() {
  // Loop through games and create records
  for (const game of games) {
    // Extract game data
    const { players, score, winner_id, loser_id } = game;

    // Fetch players data from the database
    const playersData = await prisma.user.findMany({
      where: {
        intra_id: {
          in: players,
        },
      },
    });

    // Find winner and loser based on players data
    const winner = playersData.find((player) => player.intra_id === winner_id);
    const loser = playersData.find((player) => player.intra_id === loser_id);

    // Create a game record with associated players, scores, and status
    await prisma.game.create({
      data: {
        players: {
          connect: playersData.map((player) => ({ id: player.id })),
        },
        score: { set: score },
        winner_id: winner ? winner.id : null,
        loser_id: loser ? loser.id : null,
      },
    });
  }
}

export default game;
