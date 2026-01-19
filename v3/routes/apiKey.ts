import { Router } from 'express';

import * as apiKeyController from '@/apiKey/apiKey.controller';
import { auth, requirePermissions } from '@/auth/auth.middleware';
import { EPermissionAction, EPermissionSubject } from '@/auth/types';

const router = Router();

router.post(
  '/create',
  auth(),
  requirePermissions([[EPermissionAction.Create, EPermissionSubject.ApiKey]]),
  apiKeyController.createApiKey,
);

export default router;
