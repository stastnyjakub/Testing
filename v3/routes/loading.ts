import { Router } from 'express';

import { auth } from '@/auth/auth.middleware';

import * as loadingController from '../loading/loading.controller';
const router = Router();

router.post('/', auth(), loadingController.create);
router.post('/pdf', auth(), loadingController.previewPdf);
router.post('/email', auth(), loadingController.sendLoadingMail);

export default router;
