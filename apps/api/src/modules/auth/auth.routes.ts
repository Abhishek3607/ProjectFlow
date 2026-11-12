import { Router } from 'express';
import { registerHandler, loginHandler } from './auth.controller';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);

export default router;