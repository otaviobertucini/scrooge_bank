import { type Request, type Response } from 'express';
import { TransactionService } from '../services/transaction.service.js';
import { accountService } from '../services/account.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateAmount } from '../utils/validation.js';
import { formatAmount } from '../utils/formatters.js';

const transactionService = new TransactionService();

export const depositController = asyncHandler(async (req: Request, res: Response) => {
  const { amount } = req.body;

  validateAmount(amount);

  const updatedAccount = await transactionService.deposit(req.user.id, amount);

  const account = await accountService.getAccount(updatedAccount.accountId);

  res.status(200).json({
    newBalance: formatAmount(account.amount),
    transactionId: updatedAccount.id,
    message: 'Deposit successful',
  });
});

export const withdrawController = asyncHandler(async (req: Request, res: Response) => {
  const { amount } = req.body;

  validateAmount(amount);

  const updatedAccount = await transactionService.withdraw(req.user.id, amount);

  const account = await accountService.getAccount(updatedAccount.accountId);

  res.status(200).json({
    newBalance: formatAmount(account.amount),
    transactionId: updatedAccount.id,
    message: 'Withdrawal successful',
  });
});
