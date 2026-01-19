import { Router } from 'express';

import * as sentryController from '../sentry/sentry.controller';

const router = Router();

router.post('/tunnel', sentryController.tunnel);

export default router;
