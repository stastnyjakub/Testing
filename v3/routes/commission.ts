import { Router } from 'express';

import { auth, requirePermissions } from '@/auth/auth.middleware';
import { EPermissionAction, EPermissionSubject } from '@/auth/types';
import * as commissionController from '@/commission/commission.controller';
const router = Router();

router.get('/', auth(), commissionController.commissionsGet);
router.get('/csv', auth(), commissionController.commissionsExportToCsv);
router.get(
  '/summary',
  auth(),
  requirePermissions([[EPermissionAction.Read, EPermissionSubject.AdminMetrics]]),
  commissionController.getSummary,
);
router.get('/numbers', auth(), commissionController.listCommissionNumbers);
router.get('/:id', auth(), commissionController.commissionGet);
router.put('/:id', auth(), commissionController.commissionPut);
router.post('/', auth(), commissionController.commissionPost);
router.delete('/:id', auth(), commissionController.commissionDelete);

export default router;
