import { Router } from 'express';

import { auth, requirePermissions } from '@/auth/auth.middleware';
import { EPermissionAction, EPermissionSubject } from '@/auth/types';

import * as dispatcherController from '../dispatcher/dispatcher.controller';
import * as placeController from '../place/place.controller';
import * as vehicleController from '../vehicle/vehicle.controller';

const router = Router();

router.get('/', auth(), dispatcherController.list);
// router.post(
//   '/',
//   auth(),
//   requirePermissions([[EPermissionAction.Create, EPermissionSubject.Dispatcher]]),
//   dispatcherController.create,
// );
router.post('/email', auth(), dispatcherController.email);
router.post('/commission/search', auth(), dispatcherController.commissionSearch);

// place
router.get('/:id/place', auth(), placeController.list);
router.put('/:id/place', auth(), placeController.updateMany);

// dispatcherVehicles
router.get('/:id/vehicle/', auth(), vehicleController.listVehicles);
router.put('/:id/vehicle/', auth(), vehicleController.updateVehicle);

router.get(
  '/:id',
  auth(),
  requirePermissions([[EPermissionAction.Read, EPermissionSubject.Dispatcher]]),
  dispatcherController.get,
);
// router.put(
//   '/:id',
//   auth(),
//   requirePermissions([[EPermissionAction.Update, EPermissionSubject.Dispatcher]]),
//   dispatcherController.patch,
// );

export default router;
