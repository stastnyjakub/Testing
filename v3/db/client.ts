import { PrismaClient } from '@prisma/client';
import { createSoftDeleteMiddleware } from 'prisma-soft-delete-middleware';

if (!global.prisma) {
  global.prisma = new PrismaClient();
  global.prisma.$use(
    createSoftDeleteMiddleware({
      models: {
        Customer: true,
        Carrier: true,
        location: true,
        Dispatcher: true,
        Attachment: true,
        User: true,
        CustomerUser: true,
      },
    }),
  );
}

export const prisma = global.prisma;
export default prisma;
