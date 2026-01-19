import { Router } from 'express';

import { auth, requirePermissions } from '@/auth/auth.middleware';
import { EPermissionAction, EPermissionSubject } from '@/auth/types';

import * as vehicleController from '../vehicle/vehicle.controller';

const router = Router();

router.get(
  '/',
  auth(),
  requirePermissions([[EPermissionAction.List, EPermissionSubject.VehicleType]]),
  vehicleController.listVehicleTypes,
);
router.get('/:id', auth(), vehicleController.getVehicleType);

export default router;
