import { PrismaClient, Role } from '@prisma/client';
import { channelMembership } from './channelMembership';

const prisma = new PrismaClient();

async function channelMember() {
  for (const member of channelMembership) {
    const { role, user_id, channel_id } = member;
    await prisma.channelMembership.create({
      data: {
        role: role as Role,
        user_id,
        channel_id,
      },
    });
  }
}

export default channelMember;
