import { type Request, type Response } from 'express';
import { accountService } from '../services/account.service.js';
import { formatAmount } from '../utils/formatters.js';

export const getMeController = async (req: Request, res: Response) => {
  const account = await accountService.getUserOpenAccount(req.user.id);

  res.status(200).json({
    user: req.user.email,
    ...(account && {
      account: {
        amount: formatAmount(account.amount),
        type: account.type,
        status: account.status,
      },
    }),
  });
};
