import request from 'supertest';
import { app } from '../../index.js';

describe('User Endpoints', () => {
  describe('POST /users', () => {
    it('should create a new user and return a token', async () => {
      const res = await request(app).post('/users').send({
        email: 'test@example.com',
        ssn: '12345678900',
        phone: '1234567890',
      });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should return an error if email is already in use', async () => {
      const res = await request(app).post('/users').send({
        email: 'test@example.com',
        ssn: '98765432100',
        phone: '9876543210',
      });
      expect(res.statusCode).toEqual(409);
      expect(res.body.message).toBe('A user with this email already exists.');
    });

    it('should return an error if ssn is already in use', async () => {
      const res = await request(app).post('/users').send({
        email: 'test2@example.com',
        ssn: '12345678900',
        phone: '0987654321',
      });
      expect(res.statusCode).toEqual(409);
      expect(res.body.message).toBe('A user with this SSN already exists.');
    });

    it('should return an error for invalid email', async () => {
      const res = await request(app).post('/users').send({
        email: 'invalid-email',
        ssn: '11122233344',
        phone: '1112223333',
      });
      expect(res.statusCode).toEqual(400);
    });
  });
});
