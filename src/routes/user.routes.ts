import { Router } from 'express';
import { createUserController } from '../controllers/user.controller.js';

const router = Router();

router.post('/users', createUserController);

export default router;
