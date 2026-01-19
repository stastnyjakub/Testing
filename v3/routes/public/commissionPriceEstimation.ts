import { Router } from 'express';

import { authApiKey, requirePermissions } from '@/auth/auth.middleware';
import { EPermissionAction, EPermissionSubject } from '@/auth/types';
import * as commissionPriceEstimationController from '@/commissionPriceEstimation/commissionPriceEstimation.controller';
import { rateLimiter } from '@/middleware/rateLimiter';
import { ETimeUnit, getTimeInMs } from '@/utils';
const router = Router();

router.get(
  '/:estimationCode',
  rateLimiter(getTimeInMs(1, ETimeUnit.Minutes), 60),
  authApiKey(),
  requirePermissions([[EPermissionAction.Read, EPermissionSubject.CommissionPriceEstimation]]),
  commissionPriceEstimationController.getEstimation,
);

export default router;
