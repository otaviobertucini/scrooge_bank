import { Router } from 'express';
import userRoutes from './user.routes.js';
import authRoutes from './auth.routes.js';
import customerRoutes from './customer.routes.js';

const router = Router();

router.use(userRoutes);
router.use(authRoutes);
router.use(customerRoutes);

export default router;
