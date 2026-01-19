import { Router } from 'express';

import { authApiKey, requirePermissions } from '@/auth/auth.middleware';
import { EPermissionAction, EPermissionSubject } from '@/auth/types';
import { rateLimiter } from '@/middleware/rateLimiter';
import * as enquiryFormController from '@/public/enquiryForm/enquiryForm.controller';
import { ETimeUnit, getTimeInMs } from '@/utils';
const router = Router();

router.get('/download/enquiryFormScript.js', enquiryFormController.downloadEnquiryFormScript);
router.post(
  '/calculate-estimation',
  rateLimiter(getTimeInMs(1, ETimeUnit.Minutes), 100),
  authApiKey(),
  requirePermissions([[EPermissionAction.Read, EPermissionSubject.EnquiryForm]]),
  enquiryFormController.calculateCommissionPriceEstimation,
);
router.post(
  '/submit',
  rateLimiter(getTimeInMs(1, ETimeUnit.Minutes), 10),
  authApiKey(),
  requirePermissions([[EPermissionAction.Write, EPermissionSubject.EnquiryForm]]),
  enquiryFormController.handleEnquiryForm,
);

export default router;
