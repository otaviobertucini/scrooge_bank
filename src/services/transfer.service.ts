import { PrismaClient, type User, AccountStatus, TransactionType, Role } from '../../generated/prisma/index.js';
import { NotFoundError, AuthorizationError, InsufficientFundsError  } from '../utils/errors.js';
import { Decimal } from '../../generated/prisma/runtime/library.js';

const prisma = new PrismaClient();

export class TransferService {
  async transfer(senderId: number, recipientIdentifier: string, amount: number) {
    return prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUnique({ where: { id: senderId } });

      if (!sender || sender.role !== Role.CUSTOMER) {
        throw new AuthorizationError('User not authorized to make a transfer.');
      }

      let recipient: User | null = null;
      if (recipientIdentifier.includes('@')) {
        recipient = await tx.user.findUnique({ where: { email: recipientIdentifier } });
      } else {
        recipient = await tx.user.findUnique({ where: { phone: recipientIdentifier } });
      }

      if (!recipient) {
        throw new NotFoundError('Recipient not found.', 'RECIPIENT_NOT_FOUND');
      }

      if (sender.id === recipient.id) {
        throw new AuthorizationError('Cannot transfer funds to yourself.', 'SELF_TRANSFER_NOT_ALLOWED');
      }

      const senderAccount = await tx.account.findFirst({
        where: { userId: sender.id, status: AccountStatus.OPEN },
      });

      const recipientAccount = await tx.account.findFirst({
        where: { userId: recipient.id, status: AccountStatus.OPEN },
      });

      if (!senderAccount || !recipientAccount) {
        throw new NotFoundError('Sender or recipient does not have an open account.', 'ACCOUNT_NOT_FOUND');
      }

      if (senderAccount.amount.lessThan(new Decimal(amount))) {
        throw new InsufficientFundsError('Insufficient funds.');
      }

      const updatedSenderAccount = await tx.account.update({
        where: { id: senderAccount.id },
        data: { amount: { decrement: amount } },
      });

      await tx.account.update({
        where: { id: recipientAccount.id },
        data: { amount: { increment: amount } },
      });

      const transaction = await tx.transaction.create({
        data: {
          accountId: senderAccount.id,
          type: TransactionType.TRANSFER_OUT,
          amount,
        },
      });

      await tx.transaction.create({
        data: {
          accountId: recipientAccount.id,
          type: TransactionType.TRANSFER_IN,
          amount,
        },
      });

      return {
        newBalance: updatedSenderAccount.amount,
        transactionId: transaction.id,
      };
    });
  }
}
