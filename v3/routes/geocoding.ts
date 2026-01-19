import { Router } from 'express';

import { auth } from '@/auth/auth.middleware';

import * as geocodingController from '../geocoding/geocoding.controller';

const router = Router();

router.get('/forward', auth(), geocodingController.forward);
router.get('/reverse', auth(), geocodingController.reverse);

export default router;
