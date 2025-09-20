import { type Request, type Response } from 'express';
import { accountService } from '../services/account.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateAccountType, validateClosureReason, AccountType } from '../utils/validation.js';

export const createAccountController = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.body;

  validateAccountType(type);

  const account = await accountService.createAccount(req.user.id, type as AccountType);

  res.status(201).json({
    accountId: account.id,
    message: 'Account created successfully',
  });
});

export const closeAccountController = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body;

  validateClosureReason(reason);

  const closedAccount = await accountService.closeAccount(req.user.id, reason);

  res.status(200).json({
    accountId: closedAccount.id,
    message: 'Account closed successfully',
  });
});
