import { PrismaClient } from '../../generated/prisma/index.js';
import { sFoxError, ConflictError, NotFoundError, AuthorizationError } from '../utils/errors.js';
import { AccountType } from '../utils/validation.js';

const prisma = new PrismaClient();

export class AccountService {
  async createAccount(userId: number, type: AccountType) {
    const existingAccount = await this.getUserOpenAccount(userId);
    if (existingAccount) {
      throw new ConflictError('User already has an open account', 'ACCOUNT_ALREADY_EXISTS');
    }

    try {
      const account = await prisma.account.create({
        data: {
          userId,
          type,
          status: 'OPEN',
          amount: 0.00,
        },
      });

      console.log(`Account created - User ID: ${userId}, Account ID: ${account.id}, Type: ${type}`);
      return account;
    } catch (error) {
      console.error(`Account creation failed - User ID: ${userId}, Type: ${type}`, error);
      throw new sFoxError('Failed to create account', 500, 'ACCOUNT_CREATION_FAILED');
    }
  }

  async closeAccount(userId: number, reason?: string) {
    const account = await this.getUserOpenAccount(userId);

    if (!account) {
      throw new NotFoundError('User does not have an open account', 'ACCOUNT_NOT_FOUND');
    }

    if (account.status === 'CLOSED') {
      throw new ConflictError('Account is already closed', 'ACCOUNT_ALREADY_CLOSED');
    }

    const accountBalance = account.amount.toNumber();

    if (accountBalance !== 0) {
      throw new sFoxError('Account must have zero balance before closing', 400, 'ACCOUNT_NOT_EMPTY');
    }

    try {
      const closedAccount = await (prisma as any).account.update({
        where: { id: account.id },
        data: {
          status: 'CLOSED',
          updatedAt: new Date(),
        },
      });

      console.log(
        `Account closed - User ID: ${userId}, Account ID: ${account.id}${
          reason ? `, Reason: ${reason}` : ''
        }`
      );
      return closedAccount;
    } catch (error) {
      console.error(`Account closure failed - User ID: ${userId}, Account ID: ${account.id}`, error);
      throw new sFoxError('Failed to close account', 500, 'ACCOUNT_CLOSURE_FAILED');
    }
  }

  async getAccount(accountId: number) {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundError('Account does not exist', 'ACCOUNT_NOT_FOUND');
    }

    return account;
  }

  async getUserOpenAccount(userId: number) {
    try {
      const account = await prisma.account.findFirst({
        where: {
          userId,
          status: 'OPEN',
        },
      });
      return account;
    } catch (error) {
      console.error(`Failed to get open account for user ${userId}`, error);
      return null;
    }
  }
}

export const accountService = new AccountService();