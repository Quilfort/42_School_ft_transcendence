import { PrismaClient } from '@prisma/client';
import { channels } from './channels';

const prisma = new PrismaClient();

async function channel() {
  // Loop through channels and create records
  for (const channel of channels) {
    const { name, password } = channel;
    await prisma.channel.create({
      data: {
        name,
        password,
      },
    });
  }
}

export default channel;
