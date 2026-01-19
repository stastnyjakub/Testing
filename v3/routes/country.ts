import { Router } from 'express';

import * as countryController from '@/country/country.controller';

const router = Router();

router.get('/', countryController.listCountries);

export default router;
