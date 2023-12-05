import { PrismaClient } from '@prisma/client';
import { messages } from './messages';

const prisma = new PrismaClient();

async function msg() {
  // Loop through users and create records
  for (const message of messages) {
    const { content, sender_id, channel_id } = message;
    await prisma.message.create({
      data: {
        content,
        sender_id,
        channel_id,
      },
    });
  }
}

export default msg;
