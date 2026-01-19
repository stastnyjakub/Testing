import { Router } from 'express';

import { auth } from '@/auth/auth.middleware';

import * as aresController from '../ares/ares.controller';
const router = Router();

router.get('/', auth(), aresController.getSubjectDetail);
export default router;
