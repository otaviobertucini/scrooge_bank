import { PrismaClient } from '../generated/prisma/index.js';
import dotenv from 'dotenv';
import express, { type Request, type Response, Router } from 'express';

import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, errorHandlerMiddleware, isOperator, isCustomer } from './middleware.js';
import { accountService } from './services/account.service.js';
import { BankService } from './services/bank.service.js';
import { TransactionService } from './services/transaction.service.js';
import { TransferService } from './services/transfer.service.js';
import {
  validateAccountType,
  validateClosureReason,
  validateEmail,
  validateAmount,
  AccountType,
  validateSsn,
  validatePhone,
  validateRecipient,
} from './utils/validation.js';
import { asyncHandler } from './utils/asyncHandler.js';
import { formatAmount } from './utils/formatters.js';
import { ConflictError } from './utils/errors.js';
import type { Server } from 'http';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();
const transactionService = new TransactionService();
const transferService = new TransferService();
const bankService = new BankService();

declare global {
  namespace Express {
    interface Request {
      user: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.post(
  '/users',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, ssn, phone } = req.body;

    validateEmail(email);
    const sanitizedSsn = validateSsn(ssn);
    const sanitizedPhone = validatePhone(phone);

    const existingUserEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserEmail) {
      throw new ConflictError('A user with this email already exists.', 'USER_ALREADY_EXISTS');
    }

    const existingUserSsn = await prisma.user.findUnique({ where: { ssn: sanitizedSsn } });
    if (existingUserSsn) {
      throw new ConflictError('A user with this SSN already exists.', 'USER_ALREADY_EXISTS');
    }

    const token = uuidv4();
    const newUser = await prisma.user.create({
      data: {
        email,
        ssn: sanitizedSsn,
        phone: sanitizedPhone,
        token,
      },
    });
    res.status(201).json({ user: newUser, token });
  })
);

const authRouter = Router();
authRouter.use(authMiddleware);

authRouter.get('/me', async (req: Request, res: Response) => {

  const account = await accountService.getUserOpenAccount(req.user.id);

  res.status(200).json({ user: req.user.email, ...(account && {
    account: {
      amount: formatAmount(account.amount),
      type: account.type,
      status: account.status,
    }
  }) });
});

authRouter.get(
  '/bank/capital',
  isOperator,
  asyncHandler(async (req: Request, res: Response) => {
    const capitalBreakdown = await bankService.getCapitalBreakdown();
    res.status(200).json(capitalBreakdown);
  })
);

const customerRouter = Router();
customerRouter.use(isCustomer);

customerRouter.post(
  '/accounts',
  asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.body;

    validateAccountType(type);

    const account = await accountService.createAccount(req.user.id, type as AccountType);

    res.status(201).json({
      accountId: account.id,
      message: 'Account created successfully',
    });
  })
);

customerRouter.post(
  '/account/close',
  asyncHandler(async (req: Request, res: Response) => {
    const { reason } = req.body;

    validateClosureReason(reason);

    const closedAccount = await accountService.closeAccount(req.user.id, reason);

    res.status(200).json({
      accountId: closedAccount.id,
      message: 'Account closed successfully',
    });
  })
);

customerRouter.post(
  '/account/deposit',
  asyncHandler(async (req: Request, res: Response) => {
    const { amount } = req.body;

    validateAmount(amount);

    const updatedAccount = await transactionService.deposit(req.user.id, amount);

    const account = await accountService.getAccount(updatedAccount.accountId);

    res.status(200).json({
      newBalance: formatAmount(account.amount),
      transactionId: updatedAccount.id,
      message: 'Deposit successful',
    });
  })
);

customerRouter.post(
  '/account/withdraw',
  asyncHandler(async (req: Request, res: Response) => {
    const { amount } = req.body;

    validateAmount(amount);

    const updatedAccount = await transactionService.withdraw(req.user.id, amount);

    const account = await accountService.getAccount(updatedAccount.accountId);

    res.status(200).json({
      newBalance: formatAmount(account.amount),
      transactionId: updatedAccount.id,
      message: 'Withdrawal successful',
    });
  })
);

customerRouter.post(
  '/account/transfer',
  asyncHandler(async (req: Request, res: Response) => {
    const { recipient, amount } = req.body;

    validateRecipient(recipient);
    validateAmount(amount);

    const { newBalance, transactionId } = await transferService.transfer(req.user.id, recipient, amount);

    res.status(200).json({
      message: 'Transfer successful',
      newBalance: formatAmount(newBalance),
      transactionId,
    });
  })
);

authRouter.use(customerRouter);

app.use(authRouter);

app.use(errorHandlerMiddleware);

let server: Server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

export { app, server };