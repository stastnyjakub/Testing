import { Router } from 'express';

import { auth } from '@/auth/auth.middleware';
import * as metricsController from '@/metrics/metrics.controller';

const router = Router();

router.get('/', auth(), metricsController.getMetrics);

export default router;
