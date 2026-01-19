import { Router } from 'express';

import { auth } from '@/auth/auth.middleware';

import * as orderController from '../order/order.controller';
const router = Router();

router.post('/', auth(), orderController.create);
router.post('/pdf', auth(), orderController.previewPdf);
router.post('/email', auth(), orderController.sendMail);
router.post('/confirmationEmail', auth(), orderController.sendConfirmationMail);

export default router;
