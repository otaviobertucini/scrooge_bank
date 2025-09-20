import { type Request, type Response } from 'express';
import { TransferService } from '../services/transfer.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateRecipient, validateAmount } from '../utils/validation.js';
import { formatAmount } from '../utils/formatters.js';

const transferService = new TransferService();

export const transferController = asyncHandler(async (req: Request, res: Response) => {
  const { recipient, amount } = req.body;

  validateRecipient(recipient);
  validateAmount(amount);

  const { newBalance, transactionId } = await transferService.transfer(req.user.id, recipient, amount);

  res.status(200).json({
    message: 'Transfer successful',
    newBalance: formatAmount(newBalance),
    transactionId,
  });
});
