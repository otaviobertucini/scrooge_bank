import request from 'supertest';
import { app, server } from '../../index.js';
import { type User } from '../../../generated/prisma/index.js';

describe('Account Endpoints', () => {
  let user: User;
  let token: string;
  const now = new Date();
  const uniqueSuffix = now.getTime();

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  beforeAll(async () => {
    const res = await request(app)
      .post('/users')
      .send({
        email: `account-test-${uniqueSuffix}@example.com`,
        ssn: `${uniqueSuffix}`,
        phone: `${uniqueSuffix}`,
      });
    user = res.body.user;
    token = res.body.token;
  });

  describe('POST /accounts', () => {
    it('should create a new checking account', async () => {
      const res = await request(app).post('/accounts').set('Authorization', `Bearer ${token}`).send({
        type: 'CHECKING',
      });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('accountId');
      expect(res.body.message).toBe('Account created successfully');
    });

    it('should not allow creating a second account', async () => {
      const res = await request(app).post('/accounts').set('Authorization', `Bearer ${token}`).send({
        type: 'CHECKING',
      });
      expect(res.statusCode).toEqual(409);
      expect(res.body.error).toBe('User already has an open account');
      expect(res.body.code).toBe('ACCOUNT_ALREADY_EXISTS');
    });

    it('should not allow creating an account with invalid type', async () => {
      const res = await request(app).post('/accounts').set('Authorization', `Bearer ${token}`).send({
        type: 'INVALID_TYPE',
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Account type validation failed');
      expect(res.body).toHaveProperty('fields');
      expect(res.body.code).toBe('INVALID_ACCOUNT_TYPE_VALUE');
    });
  });

  describe('POST /account/deposit', () => {
    it('should deposit money into the account', async () => {
      const res = await request(app).post('/account/deposit').set('Authorization', `Bearer ${token}`).send({
        amount: 100,
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.newBalance).toBe(100.0);
    });

    it('should not allow depositing negative amounts', async () => {
      const res = await request(app).post('/account/deposit').set('Authorization', `Bearer ${token}`).send({
        amount: -50,
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Amount validation failed');
      expect(res.body.code).toBe('INVALID_AMOUNT');
      expect(res.body.fields[0].reason).toBe('Amount must be a positive number');
    });

    it('should not allow depositing zero amounts', async () => {
      const res = await request(app).post('/account/deposit').set('Authorization', `Bearer ${token}`).send({
        amount: 0,
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Amount validation failed');
      expect(res.body.code).toBe('INVALID_AMOUNT');
      expect(res.body.fields[0].reason).toBe('Amount must be a positive number');
    });

    it('should not allow depositing non-numeric amounts', async () => {
      const res = await request(app).post('/account/deposit').set('Authorization', `Bearer ${token}`).send({
        amount: 'fifty',
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Amount validation failed');
      expect(res.body.code).toBe('INVALID_AMOUNT');

      expect(res.body.fields[0].reason).toBe('Amount must be a valid number');
    });

    it('should not allow depositing transactions without amount', async () => {
      const res = await request(app).post('/account/deposit').set('Authorization', `Bearer ${token}`).send({});
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Amount validation failed');
      expect(res.body.code).toBe('INVALID_AMOUNT');
      expect(res.body.fields[0].reason).toBe('Amount is required');
    });
  });

  describe('POST /account/withdraw', () => {
    it('should withdraw money from the account', async () => {
      const res = await request(app).post('/account/withdraw').set('Authorization', `Bearer ${token}`).send({
        amount: 50,
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.newBalance).toBe(50.0);
    });

    it('should not allow withdrawing more than the balance', async () => {
      const res = await request(app).post('/account/withdraw').set('Authorization', `Bearer ${token}`).send({
        amount: 10000,
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Insufficient funds');
      expect(res.body.code).toBe('INSUFFICIENT_FUNDS');
    });

    it('should not allow withdrawing negative amounts', async () => {
      const res = await request(app).post('/account/withdraw').set('Authorization', `Bearer ${token}`).send({
        amount: -50,
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Amount validation failed');
      expect(res.body.code).toBe('INVALID_AMOUNT');
      expect(res.body.fields[0].reason).toBe('Amount must be a positive number');
    });

    it('should not allow withdrawing zero amounts', async () => {
      const res = await request(app).post('/account/withdraw').set('Authorization', `Bearer ${token}`).send({
        amount: 0,
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Amount validation failed');
      expect(res.body.code).toBe('INVALID_AMOUNT');
      expect(res.body.fields[0].reason).toBe('Amount must be a positive number');
    });

    it('should not allow withdrawing non-numeric amounts', async () => {
      const res = await request(app).post('/account/withdraw').set('Authorization', `Bearer ${token}`).send({
        amount: 'fifty',
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Amount validation failed');
      expect(res.body.code).toBe('INVALID_AMOUNT');
      expect(res.body.fields[0].reason).toBe('Amount must be a valid number');
    });

    it('should not allow withdrawing transactions without amount', async () => {
      const res = await request(app).post('/account/withdraw').set('Authorization', `Bearer ${token}`).send({});
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Amount validation failed');
      expect(res.body.code).toBe('INVALID_AMOUNT');
      expect(res.body.fields[0].reason).toBe('Amount is required');
    });
  });

  describe('POST /account/close', () => {
    it('should not close the account if there is money', async () => {
      const res = await request(app).post('/account/close').set('Authorization', `Bearer ${token}`).send({
        reason: 'I am closing my account',
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Account must have zero balance before closing');
      expect(res.body.code).toBe('ACCOUNT_NOT_EMPTY');
    });

    it('should close the account with zero balance', async () => {
      const { body: userData } = await request(app).get('/me').set('Authorization', `Bearer ${token}`);

      await request(app)
        .post('/account/withdraw')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: userData.account.amount,
        });

      const res = await request(app).post('/account/close').set('Authorization', `Bearer ${token}`).send({
        reason: 'I am closing my account',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('accountId');
      expect(res.body.message).toBe('Account closed successfully');
    });

    it('should not allow closing an already closed account', async () => {
      const res = await request(app).post('/account/close').set('Authorization', `Bearer ${token}`).send({
        reason: 'I am closing my account again',
      });
      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toBe('User does not have an open account');
      expect(res.body.code).toBe('ACCOUNT_NOT_FOUND');
    });
  });
});
