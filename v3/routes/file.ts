import { Router } from 'express';

import * as fileController from '../file/file.controller';
const router = Router();
import multer from 'multer';

import { auth } from '@/auth/auth.middleware';

const upload = multer();

router.get('/', auth(), fileController.download);
router.post('/', [auth, upload.single('file')], fileController.upload);
router.delete('/', auth(), fileController.remove);
router.get('/list', auth(), fileController.list);

export default router;
