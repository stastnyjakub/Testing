import { Router } from 'express';

import { auth } from '@/auth/auth.middleware';

import * as dischargeController from '../discharge/discharge.controller';
const router = Router();

router.post('/pdf', auth(), dischargeController.previewNeutralizedPdf);
router.post('/email', auth(), dischargeController.sendDischargeMail);

export default router;
