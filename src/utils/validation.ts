import { ValidationError, type ValidationFieldError } from './errors.js';

export enum AccountType {
  CHECKING = 'CHECKING',
  PERSONAL_LOAN = 'PERSONAL_LOAN'
}

export function validateAccountType(type: any): asserts type is AccountType {
  if (!type) {
    throw new ValidationError(
      'Account type validation failed',
      'MISSING_ACCOUNT_TYPE',
      [{
        field: 'type',
        reason: 'Account type is required',
        receivedValue: type
      }]
    );
  }

  if (typeof type !== 'string') {
    throw new ValidationError(
      'Account type validation failed',
      'INVALID_ACCOUNT_TYPE_FORMAT',
      [{
        field: 'type',
        reason: 'Account type must be a string',
        receivedValue: type
      }]
    );
  }

  if (!Object.values(AccountType).includes(type as AccountType)) {
    throw new ValidationError(
      'Account type validation failed',
      'INVALID_ACCOUNT_TYPE_VALUE',
      [{
        field: 'type',
        reason: `Account type must be one of: ${Object.values(AccountType).join(', ')}`,
        receivedValue: type
      }]
    );
  }
}

export function validateClosureReason(reason?: any): void {
  if (reason === undefined || reason === null) {
    return;
  }
  
  const fieldErrors: ValidationFieldError[] = [];
  
  if (typeof reason !== 'string') {
    fieldErrors.push({
      field: 'reason',
      reason: 'Closure reason must be a string',
      receivedValue: reason
    });
  } else {
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 5) {
      fieldErrors.push({
        field: 'reason',
        reason: 'Closure reason must be at least 5 characters long',
        receivedValue: reason
      });
    }
    if (trimmedReason.length > 30) {
      fieldErrors.push({
        field: 'reason',
        reason: 'Closure reason must not exceed 30 characters',
        receivedValue: reason
      });
    }
  }
  
  if (fieldErrors.length > 0) {
    throw new ValidationError(
      'Closure reason validation failed',
      'INVALID_CLOSURE_REASON',
      fieldErrors
    );
  }
}

export function validateAccountId(accountIdParam: any): number {
  if (!accountIdParam) {
    throw new ValidationError(
      'Account ID validation failed',
      'MISSING_ACCOUNT_ID',
      [{
        field: 'id',
        reason: 'Account ID parameter is required',
        receivedValue: accountIdParam
      }]
    );
  }

  const accountId = parseInt(accountIdParam, 10);

  if (isNaN(accountId)) {
    throw new ValidationError(
      'Account ID validation failed',
      'INVALID_ACCOUNT_ID_FORMAT',
      [{
        field: 'id',
        reason: 'Account ID must be a valid number',
        receivedValue: accountIdParam
      }]
    );
  }

  if (accountId <= 0) {
    throw new ValidationError(
      'Account ID validation failed',
      'INVALID_ACCOUNT_ID_VALUE',
      [{
        field: 'id',
        reason: 'Account ID must be a positive number',
        receivedValue: accountId
      }]
    );
  }

  return accountId;
}

export function validateEmail(email: any): void {
  if (!email) {
    throw new ValidationError(
      'Email validation failed',
      'MISSING_EMAIL',
      [{
        field: 'email',
        reason: 'Email is required',
        receivedValue: email
      }]
    );
  }

  if (typeof email !== 'string') {
    throw new ValidationError(
      'Email validation failed',
      'INVALID_EMAIL_FORMAT',
      [{
        field: 'email',
        reason: 'Email must be a string',
        receivedValue: email
      }]
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError(
      'Email validation failed',
      'INVALID_EMAIL_PATTERN',
      [{
        field: 'email',
        reason: 'Email must be a valid email address',
        receivedValue: email
      }]
    );
  }
}

export function validateAmount(amount: any): void {
  const fieldErrors: ValidationFieldError[] = [];

  if (amount === undefined || amount === null) {
    fieldErrors.push({
      field: 'amount',
      reason: 'Amount is required',
      receivedValue: amount
    });
  } else if (typeof amount !== 'number' || !isFinite(amount)) {
    fieldErrors.push({
      field: 'amount',
      reason: 'Amount must be a valid number',
      receivedValue: amount
    });
  } else if (amount <= 0) {
    fieldErrors.push({
      field: 'amount',
      reason: 'Amount must be a positive number',
      receivedValue: amount
    });
  }

  if (fieldErrors.length > 0) {
    throw new ValidationError(
      'Amount validation failed',
      'INVALID_AMOUNT',
      fieldErrors
    );
  }
}

export function validateSsn(ssn: any): string {
  if (!ssn) {
    throw new ValidationError(
      'SSN validation failed',
      'MISSING_SSN',
      [{
        field: 'ssn',
        reason: 'SSN is required',
        receivedValue: ssn
      }]
    );
  }

  if (typeof ssn !== 'string') {
    throw new ValidationError(
      'SSN validation failed',
      'INVALID_SSN_FORMAT',
      [{
        field: 'ssn',
        reason: 'SSN must be a string',
        receivedValue: ssn
      }]
    );
  }

  const sanitizedSsn = ssn.replace(/\D/g, '');
  if (sanitizedSsn.length === 0) {
    throw new ValidationError(
      'SSN validation failed',
      'INVALID_SSN_PATTERN',
      [{
        field: 'ssn',
        reason: 'SSN must contain digits',
        receivedValue: ssn
      }]
    );
  }

  return sanitizedSsn;
}

export function validatePhone(phone: any): string | null {
  if (phone === undefined || phone === null) {
    return null;
  }

  if (typeof phone !== 'string') {
    throw new ValidationError(
      'Phone validation failed',
      'INVALID_PHONE_FORMAT',
      [{
        field: 'phone',
        reason: 'Phone must be a string',
        receivedValue: phone
      }]
    );
  }

  const sanitizedPhone = phone.replace(/\D/g, '');
  if (sanitizedPhone.length === 0 && phone.length > 0) {
    throw new ValidationError(
      'Phone validation failed',
      'INVALID_PHONE_PATTERN',
      [{
        field: 'phone',
        reason: 'Phone must contain digits',
        receivedValue: phone
      }]
    );
  }

  return sanitizedPhone.length > 0 ? sanitizedPhone : null;
}

export function validateRecipient(recipient: any): void {
  if (!recipient) {
    throw new ValidationError(
      'Recipient validation failed',
      'MISSING_RECIPIENT',
      [{
        field: 'recipient',
        reason: 'Recipient is required',
        receivedValue: recipient
      }]
    );
  }

  if (typeof recipient !== 'string') {
    throw new ValidationError(
      'Recipient validation failed',
      'INVALID_RECIPIENT_FORMAT',
      [{
        field: 'recipient',
        reason: 'Recipient must be a string',
        receivedValue: recipient
      }]
    );
  }
}