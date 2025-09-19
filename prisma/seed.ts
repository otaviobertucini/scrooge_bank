import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const INITIAL_BANK_CAPITAL = 250000.0;

  await prisma.bankCapital.upsert({
    where: { id: 1 },
    update: {
      amount: INITIAL_BANK_CAPITAL,
    },
    create: {
      amount: INITIAL_BANK_CAPITAL,
    },
  });

  const BANK_OPERATOR_EMAIL = 'operator@scrooge-bank.com';
  const BANK_OPERATOR_UID = '0aaf8332-27a5-4c81-97ec-86be0eac0025';

  await prisma.user.upsert({
    where: { email: BANK_OPERATOR_EMAIL },
    update: {
      role: 'OPERATOR',
      token: BANK_OPERATOR_UID,
    },
    create: {
      email: BANK_OPERATOR_EMAIL,
      role: 'OPERATOR',
      token: BANK_OPERATOR_UID,
    },
  });

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
