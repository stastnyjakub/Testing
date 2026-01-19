import { Router } from 'express';

import { auth } from '@/auth/auth.middleware';

import * as carrierController from '../carrier/carrier.controller';

const router = Router();

router.get('/', auth(), carrierController.listCarries);
router.get('/list', auth(), carrierController.carriersList);
router.get('/csv', auth(), carrierController.carriersExportToCsv);
router.get('/:id', auth(), carrierController.getCarrier);
//router.post('/', auth(), carrierController.carrierPost);
router.post('/enquiry', auth(), carrierController.carrierEmailEnquiry);
router.post('/sendOnboardingEmail', auth(), carrierController.carrierSendOnboardingEmail);
//router.put('/:id', auth(), carrierController.carrierUpdate);
router.delete('/:id', auth(), carrierController.carrierDelete);

export default router;
