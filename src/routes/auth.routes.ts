import { Router } from 'express';
import { getMeController } from '../controllers/auth.controller.js';
import { getBankCapitalController } from '../controllers/bank.controller.js';
import { authMiddleware, isOperator } from '../middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/me', getMeController);
router.get('/bank/capital', isOperator, getBankCapitalController);

export default router;
