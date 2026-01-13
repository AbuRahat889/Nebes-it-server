// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
// export default prisma;

import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `prisma` for hot reload in development
  var prisma: PrismaClient | undefined;
}

// explicitly type `prisma`
const prisma: PrismaClient = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
