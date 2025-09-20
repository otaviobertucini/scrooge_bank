import { type Request, type Response } from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateEmail, validateSsn, validatePhone } from '../utils/validation.js';
import { ConflictError } from '../utils/errors.js';

const prisma = new PrismaClient();

export const createUserController = asyncHandler(async (req: Request, res: Response) => {
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
});
