import { Router } from 'express';
import { createAccountController, closeAccountController } from '../controllers/account.controller.js';
import { depositController, withdrawController } from '../controllers/transaction.controller.js';
import { transferController } from '../controllers/transfer.controller.js';
import { isCustomer } from '../middleware.js';

const router = Router();

router.use(isCustomer);

router.post('/accounts', createAccountController);
router.post('/account/close', closeAccountController);
router.post('/account/deposit', depositController);
router.post('/account/withdraw', withdrawController);
router.post('/account/transfer', transferController);

export default router;
