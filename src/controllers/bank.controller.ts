import { type Request, type Response } from 'express';
import { BankService } from '../services/bank.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const bankService = new BankService();

export const getBankCapitalController = asyncHandler(async (req: Request, res: Response) => {
  const capitalBreakdown = await bankService.getCapitalBreakdown();
  res.status(200).json(capitalBreakdown);
});
