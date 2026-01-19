import { Router } from 'express';

import { auth, requirePermissions } from '@/auth/auth.middleware';
import { EPermissionAction, EPermissionSubject } from '@/auth/types';
import * as userController from '@/user/user.controller';
const router = Router();

router.get('/check-token', auth(), userController.checkTokenValidity);
router.get(
  '/check-email',
  auth(),
  requirePermissions([[EPermissionAction.Read, EPermissionSubject.EmailAvailability]]),
  userController.checkEmailAvailability,
);
router.get('/list', auth(), userController.getUsersList);

export default router;
