import { PrismaClient, TransactionType, AccountStatus } from '../../generated/prisma/index.js';
import { AuthorizationError, InsufficientFundsError, NotFoundError } from '../utils/errors.js';
import { Decimal } from '../../generated/prisma/runtime/library.js';

const prisma = new PrismaClient();

export class TransactionService {
  async deposit(userId: number, amount: number) {
    return prisma.$transaction(async (tx) => {
      const account = await tx.account.findFirst({
        where: {
          userId,
          status: AccountStatus.OPEN,
        },
      });

      if (!account) {
        throw new NotFoundError('No open account found', 'ACCOUNT_NOT_FOUND');
      }

      const updatedAccount = await tx.account.update({
        where: { id: account.id },
        data: { amount: { increment: amount } },
      });

      const transaction = await tx.transaction.create({
        data: {
          accountId: account.id,
          type: TransactionType.DEPOSIT,
          amount,
        },
      });

      return transaction;
    });
  }

  async withdraw(userId: number, amount: number) {
    return prisma.$transaction(async (tx) => {
      const account = await tx.account.findFirst({
        where: {
          userId,
          status: AccountStatus.OPEN,
        },
      });

      if (!account) {
        throw new NotFoundError('No open account found', 'ACCOUNT_NOT_FOUND');
      }

      if (account.amount.lessThan(new Decimal(amount))) {
        throw new InsufficientFundsError('Insufficient funds');
      }

      const updatedAccount = await tx.account.update({
        where: { id: account.id },
        data: { amount: { decrement: amount } },
      });

      const transaction = await tx.transaction.create({
        data: {
          accountId: account.id,
          type: TransactionType.WITHDRAWAL,
          amount,
        },
      });

      return transaction;
    });
  }
}
