import { Router } from 'express';

import { auth, requirePermissions } from '@/auth/auth.middleware';
import { EPermissionAction, EPermissionSubject } from '@/auth/types';

import * as enquiryController from '../enquiry/enquiry.controller';
const router = Router();

router.get(
  '/',
  auth(),
  requirePermissions([[EPermissionAction.List, EPermissionSubject.Enquiry]]),
  enquiryController.list,
);
router.post('/', auth(), enquiryController.create);
router.post('/contact', auth(), enquiryController.contactDispatchers);
router.put('/close', auth(), enquiryController.close);
router.put('/reopen/:id', auth(), enquiryController.reopen);
router.get(
  '/:id',
  auth(),
  requirePermissions([[EPermissionAction.Read, EPermissionSubject.Enquiry]]),
  enquiryController.get,
);
router.put('/:id', auth(), enquiryController.update);
router.delete('/:id', auth(), enquiryController.remove);

export default router;
