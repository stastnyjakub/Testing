import { Prisma, location, customercontact } from '@prisma/client';
import {
  createCustomer,
  updateCustomer,
  removeCustomer,
  getCustomers,
  getOneCustomer,
} from '../../../v3/customer/customer.service';

let customerId: number,
  location: location,
  customerContact: customercontact,
  locationDel: location,
  customerContactDel: customercontact;

const customer: Prisma.customerCreateInput = {
  company: 'Company',
};
const customerUpdated: Prisma.customerUpdateInput = {
  company: 'Company Updated',
};
const locations: Prisma.locationCreateInput[] = [{ email: 'Loading email' }, { email: 'Loading email 2' }];
const customerContacts: Prisma.customercontactCreateInput[] = [
  { email: 'Customer contact email' },
  { email: 'Customer contact email 2' },
];

beforeAll(async () => undefined);
afterAll(async () => undefined);

describe('Customer service tests', () => {
  it('Should create customer', async () => {
    const createdCustomer = await createCustomer({ customer, customerContacts, locations });

    customerId = createdCustomer.customer_id;
    location = createdCustomer.location[0];
    customerContact = createdCustomer.customercontact[0];
    locationDel = createdCustomer.location[1];
    customerContactDel = createdCustomer.customercontact[1];

    expect(createdCustomer).toHaveProperty('customer_id');
    expect(createdCustomer).toHaveProperty('company', customer.company);
    expect(createdCustomer).toHaveProperty('location');
    expect(createdCustomer).toHaveProperty('customercontact');
    expect(createdCustomer.location.length).toBe(2);
    expect(createdCustomer.location[0]).toHaveProperty('email', 'Loading email');
    expect(createdCustomer.location[1]).toHaveProperty('email', 'Loading email 2');
    expect(createdCustomer.customercontact.length).toBe(2);
    expect(createdCustomer.customercontact[0]).toHaveProperty('email', 'Customer contact email');
    expect(createdCustomer.customercontact[1]).toHaveProperty('email', 'Customer contact email 2');
  });

  it('Should update customer', async () => {
    location.email = 'Loading email updated';
    customerContact.email = 'Customer contact email updated';

    const customerContactcUpdate = {
      toCreate: [customerContacts[0]],
      toUpdate: [customerContact],
      toDelete: [customerContactDel],
    };
    const locationsUpdate = {
      toCreate: [locations[0]],
      toUpdate: [location],
      toDelete: [locationDel],
    };
    const updatedCustomer = await updateCustomer(customerId, customerUpdated, customerContactcUpdate, locationsUpdate);

    expect(updatedCustomer).toHaveProperty('customer_id');
    expect(updatedCustomer).toHaveProperty('company', customerUpdated.company);
    expect(updatedCustomer).toHaveProperty('location');
    expect(updatedCustomer).toHaveProperty('customercontact');
    expect(updatedCustomer.location.length).toBe(2);
    expect(updatedCustomer.location[0]).toHaveProperty('email', 'Loading email');
    expect(updatedCustomer.location[1]).toHaveProperty('email', 'Loading email updated');
    expect(updatedCustomer.customercontact.length).toBe(2);
    expect(updatedCustomer.customercontact[0]).toHaveProperty('email', 'Customer contact email');
    expect(updatedCustomer.customercontact[1]).toHaveProperty('email', 'Customer contact email updated');
  });
  it('Should get customers', async () => {
    const customers = await getCustomers({});
    expect(customers).toHaveProperty('data');
    expect(customers.data.length).toBe(1);
    expect(customers.data[0]).toHaveProperty('customer_id');
    expect(customers.data[0]).toHaveProperty('company', customerUpdated.company);
    expect(customers).toHaveProperty('totalRows', 1);
  });

  it('Should get one customer', async () => {
    const foundCustomer = await getOneCustomer(customerId);
    expect(foundCustomer).toHaveProperty('customer_id', customerId);
    expect(foundCustomer).toHaveProperty('company', customerUpdated.company);
    expect(foundCustomer).toHaveProperty('location');
    expect(foundCustomer).toHaveProperty('customercontact');
    expect(foundCustomer.location.length).toBe(2);
    expect(foundCustomer.location[0]).toHaveProperty('email', 'Loading email');
    expect(foundCustomer.location[1]).toHaveProperty('email', 'Loading email updated');
    expect(foundCustomer.customercontact.length).toBe(2);
    expect(foundCustomer.customercontact[0]).toHaveProperty('email', 'Customer contact email');
    expect(foundCustomer.customercontact[1]).toHaveProperty('email', 'Customer contact email updated');
  });

  it('Should remove customer', async () => {
    const removedCustomer = await removeCustomer(customerId);
    expect(removedCustomer).toBeUndefined();
  });
  it('Should get zero customer', async () => {
    const foundCustomer = await getOneCustomer(customerId);
    expect(foundCustomer.deleted).toBe(true);
  });
});
