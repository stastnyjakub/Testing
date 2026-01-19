import { Router } from 'express';

import { auth, requirePermissions } from '@/auth/auth.middleware';
import { EPermissionAction, EPermissionSubject } from '@/auth/types';

import * as offerController from '../offer/offer.controller';
const router = Router();

router.post(
  '/',
  auth(),
  requirePermissions([[EPermissionAction.Create, EPermissionSubject.Offer]]),
  offerController.create,
);
router.put('/:id', auth(), offerController.update);
router.delete(
  '/:id',
  auth(),
  requirePermissions([[EPermissionAction.Delete, EPermissionSubject.Offer]]),
  offerController.remove,
);

export default router;
