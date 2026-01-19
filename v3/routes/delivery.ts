import { Router } from 'express';

import { auth } from '@/auth/auth.middleware';

import * as deliveryController from '../delivery/delivery.controller';
const router = Router();

router.post('/', auth(), deliveryController.create);
router.post('/pdf', auth(), deliveryController.previewPdf);
router.post('/email', auth(), deliveryController.sendDeliveryMail);

export default router;
