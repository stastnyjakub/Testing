import { Router } from 'express';

import { auth } from '@/auth/auth.middleware';
import * as bankController from '@/bank/bank.controller';

const router = Router();

router.get('/kb/accounts', auth(), bankController.getKBAccounts);

export default router;
