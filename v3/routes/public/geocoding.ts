import { Router } from 'express';

import { authApiKey, requirePermissions } from '@/auth/auth.middleware';
import { EPermissionAction, EPermissionSubject } from '@/auth/types';
import * as geocodingController from '@/geocoding/geocoding.controller';
import { rateLimiter } from '@/middleware/rateLimiter';
import { ETimeUnit, getTimeInMs } from '@/utils';

const router = Router();

router.get(
  '/forward',
  rateLimiter(getTimeInMs(1, ETimeUnit.Minutes), 100),
  authApiKey(),
  requirePermissions([[EPermissionAction.Read, EPermissionSubject.Geocoding]]),
  geocodingController.forward,
);

export default router;
