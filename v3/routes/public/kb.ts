import { Router } from 'express';

import { rateLimiter } from '@/middleware/rateLimiter';
import * as kbController from '@/public/kb/kb.controller';
import { ETimeUnit, getTimeInMs } from '@/utils';

const router = Router();

//! Temporarily use same logic as for /oauth2/authorization/callback to all other routes
router.get(
  '/client-registration/callback',
  rateLimiter(getTimeInMs(1, ETimeUnit.Minutes), 60),
  kbController.oauth2AuthorizationCallback,
);
router.get(
  '/oauth2/registration/callback',
  rateLimiter(getTimeInMs(1, ETimeUnit.Minutes), 60),
  kbController.oauth2AuthorizationCallback,
);
router.get(
  '/oauth2/authorization/callback',
  rateLimiter(getTimeInMs(1, ETimeUnit.Minutes), 60),
  kbController.oauth2AuthorizationCallback,
);

export default router;
