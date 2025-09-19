import { Decimal } from '@prisma/client/runtime/library.js';

export function formatAmount(amount: Decimal): number {
  return parseFloat(amount.toFixed(2));
}

export function formatCurrency(amount: number | Decimal): string {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount.toFixed(2));
  return numericAmount.toFixed(2);
}
