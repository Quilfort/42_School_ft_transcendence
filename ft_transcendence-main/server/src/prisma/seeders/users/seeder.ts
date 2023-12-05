// Importing dependencies
import { PrismaClient } from '@prisma/client';
import { users } from './users';

const prisma = new PrismaClient();

async function user() {
  // Loop through users and create records
  for (const user of users) {
    const { name, intra_id, intra_name, experience, wins, losses } = user;
    await prisma.user.create({
      data: {
        name,
        intra_id,
        intra_name,
        experience,
        wins,
        losses,
      },
    });
  }
}

export default user;
