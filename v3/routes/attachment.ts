import { Router } from 'express';

import { auth, requirePermissions } from '@/auth/auth.middleware';
import { EPermissionAction, EPermissionSubject } from '@/auth/types';

import * as attachmentController from '../attachment/attachment.controller';
import { initializeUploadMiddleware } from '../attachment/attachment.multer';
const router = Router();

async function initializeEndpointsWithUploadMiddleware() {
  const { attachmentCreateMiddleware, attachmentUploadMiddleware } = await initializeUploadMiddleware();
  router.post('/', auth(), attachmentCreateMiddleware, attachmentController.create);
  router.post(
    '/upload',
    auth(),
    requirePermissions([[EPermissionAction.Upload, EPermissionSubject.Attachment]]),
    attachmentUploadMiddleware,
    attachmentController.uploadAttachments,
  );
}
initializeEndpointsWithUploadMiddleware();

router.get('/upload-link/:commissionId', auth(), attachmentController.getAttachmentUploadLink);
router.get(
  '/check-upload-token',
  auth(),
  requirePermissions([[EPermissionAction.Read, EPermissionSubject.AttachmentUploadToken]]),
  attachmentController.checkUploadToken,
);
router.get(
  '/',
  auth(),
  requirePermissions([[EPermissionAction.List, EPermissionSubject.Attachment]]),
  attachmentController.list,
);
router.get('/file/:attachmentId', auth(), attachmentController.getFile);
router.get('/:attachmentId', auth(), attachmentController.get);
router.post('/mail/:attachmentId', auth(), attachmentController.mailFile);
router.put('/:attachmentId', auth(), attachmentController.update);
router.delete('/:attachmentId', auth(), attachmentController.remove);

export default router;
