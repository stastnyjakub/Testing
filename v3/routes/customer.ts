import { Router } from 'express';

import { allowRoles, auth, authApiKey } from '@/auth/auth.middleware';
import { EAuthRole } from '@/auth/types';
import { initializeUploadMiddleware } from '@/customer/customer.multer';

import * as customerController from '../customer/customer.controller';
import * as customerContactController from '../customer/customerContact/customerContact.controller';
import * as customerRegistrationController from '../customer/customerRegistration/customerRegistration.controller';
import * as customerUserController from '../customer/customerUser/customerUser.controller';
import * as locationController from '../customer/location/location.controller';

const router = Router();

// Customer registration routes
router.post('/registration/request', customerRegistrationController.processCustomerRegistrationRequest);
router.post('/registration/send', authApiKey(), customerRegistrationController.sendRegistration);
router.post(
  '/registration',
  auth(),
  allowRoles(EAuthRole.CustomerRegistration),
  customerRegistrationController.registerCustomer,
);
router.get(
  '/registration',
  auth(),
  allowRoles(EAuthRole.CustomerRegistration),
  customerRegistrationController.getCustomerRegistration,
);

// Location routes
router.get('/location/:locationId', auth(), locationController.getLocation);
router.get('/:customerId/location', auth(), locationController.listLocations);
router.post('/:customerId/location', auth(), locationController.createLocation);
router.put('/location/:locationId', auth(), locationController.updateLocation);
router.delete('/location/:locationId', auth(), locationController.deleteLocation);

// Customer contact routes
router.get('/customer-contact/:customerContactId', customerContactController.getCustomerContact);
router.get('/:customerId/customer-contact', customerContactController.listCustomerContacts);
router.post('/:customerId/customer-contact', customerContactController.createCustomerContact);
router.put('/customer-contact/:customerContactId', customerContactController.updateCustomerContact);
router.delete('/customer-contact/:customerContactId', customerContactController.deleteCustomerContact);

// Customer user registration routes
router.post('/customer-user/register', auth(), customerUserController.registerCustomerUser);
router.get('/customer-user/invitation/check', auth(), customerUserController.checkCustomerUserInvitation);
router.post('/customer-user/invitation/send', authApiKey(), customerUserController.sendCustomerUserInvitation);

// Customer user routes
router.get('/:customerId/customer-user', auth(), customerUserController.listCustomerUsers);
router.post('/:customerId/customer-user', auth(), customerUserController.createCustomerUser);
router.delete('/customer-user/:customerUserId', auth(), customerUserController.deleteCustomerUser);
router.get('/customer-user/:customerUserId', auth(), customerUserController.getCustomerUser);

// Customer routes
router.get('/', auth(), customerController.listCustomers);
router.get('/list', auth(), customerController.customersList);
router.get('/csv', auth(), customerController.customersExportToCsv);
router.get('/self', auth(), customerController.getCustomerSelf);
router.get('/:customerId/profile-picture', auth(), customerController.getCustomerProfilePicture);
router.get('/:id', auth(), customerController.getCustomer);
router.post('/', auth(), customerController.customerPost);
router.delete('/:id', auth(), customerController.customerDelete);

async function initializeEndpointsWithUploadMiddleware() {
  const { profilePictureCreateMiddleware } = await initializeUploadMiddleware();
  router.put('/:customerId', auth(), profilePictureCreateMiddleware, customerController.updateCustomer);
}
initializeEndpointsWithUploadMiddleware();

export default router;
