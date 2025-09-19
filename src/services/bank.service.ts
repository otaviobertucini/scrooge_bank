import { PrismaClient } from '../../generated/prisma/index.js';
import { formatCurrency } from '../utils/formatters.js';

const prisma = new PrismaClient();

export class BankService {
  async getCapitalBreakdown() {
    const bankCapitalRecord = await prisma.bankCapital.findFirst();
    const initialCapital = bankCapitalRecord?.amount ?? 0;

    const totalCustomerDepositsResult = await prisma.account.aggregate({
      _sum: {
        amount: true,
      },
    });
    const totalCustomerDeposits = totalCustomerDepositsResult._sum.amount ?? 0;

    const totalOnHand = Number(initialCapital) + Number(totalCustomerDeposits);

    return {
      totalOnHand: formatCurrency(totalOnHand),
      breakdown: {
        initialCapital: formatCurrency(initialCapital),
        totalCustomerDeposits: formatCurrency(totalCustomerDeposits),
      },
    };
  }
}
