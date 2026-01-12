import { PrismaClient, UserRoleEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const exists = await prisma.user.findFirst({
    where: { role: UserRoleEnum.SUPERADMIN },
  });

  if (!exists) {
    const password = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD!, 12);
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password,
        role: UserRoleEnum.SUPERADMIN,
      },
    });
    console.log('Super Admin created.');
  } else {
    console.log('Super Admin already exists.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
