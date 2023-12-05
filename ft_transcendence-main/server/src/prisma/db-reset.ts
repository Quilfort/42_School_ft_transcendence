const tableNames = ['User', 'Message', 'Channel', 'Game', 'ChannelMembership'];

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  for (const tableName of tableNames)
    await prisma.$queryRawUnsafe(
      `Truncate "${tableName}" restart identity cascade;`,
    );
}

main().finally(async () => {
  await prisma.$disconnect();
});
