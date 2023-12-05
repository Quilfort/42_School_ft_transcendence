// Importing dependencies
import { PrismaClient } from '@prisma/client';
import user from './seeders/users/seeder';
import game from './seeders/games/seeder';
import channel from './seeders/channels/seeder';
import channelMember from './seeders/channelMembership/seeder';
import msg from './seeders/messages/seeder';

// Create prisma client instance
const prisma = new PrismaClient();

async function main() {
  try {
    // Call all the seeders sequentially
    await user();
    await game();
    await channel();
    await channelMember();
    await msg();

    // Disconnect the Prisma client only once when all seeding is done
    await prisma.$disconnect();
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
