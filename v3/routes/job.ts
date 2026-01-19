import { Router } from 'express';

import * as attachmentController from '@/attachment/attachment.controller';
import { authApiKey, requirePermissions } from '@/auth/auth.middleware';
import { EPermissionAction, EPermissionSubject } from '@/auth/types';
import * as invoiceController from '@/invoice/invoice.controller';
const router = Router();

router.post(
  '/attachment-compression',
  authApiKey(),
  requirePermissions([[EPermissionAction.Write, EPermissionSubject.Job]]),
  attachmentController.compressionJob,
);
router.post(
  '/invoice-payments',
  authApiKey(),
  requirePermissions([[EPermissionAction.Write, EPermissionSubject.Job]]),
  invoiceController.invoicePaymentsJob,
);
export default router;
