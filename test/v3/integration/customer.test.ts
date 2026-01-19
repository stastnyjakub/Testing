import server from '../../../v3/app';
import request from 'supertest';
import { createMockUser } from '../utility/user';
import prisma from '../../../v3/db/client';
import { Prisma, customercontact, location } from '@prisma/client';

const endpoint = 'v3/customer';
let userId: number,
  token: string,
  customerId: number,
  customer: Prisma.customerCreateInput & {
    customerContacts: {
      toCreate: Prisma.customercontactCreateInput[];
    };
    locations: {
      toCreate: Prisma.locationCreateInput[];
    };
  },
  customerUpdate: Prisma.customerCreateInput & {
    customerContacts: {
      toCreate: Prisma.customercontactCreateInput[];
      toUpdate: customercontact[];
      toDelete: customercontact[];
    };
    locations: {
      toCreate: Prisma.locationCreateInput[];
      toUpdate: location[];
      toDelete: location[];
    };
  };

beforeAll(async () => {
  const userData = {
    number: 0,
    email: 'miroslav.sirina@koala42.com',
    password: 'lezlevel',
    emailPassword: 'asdad',
    jobTitle: 'developer',
    mobilePhone: '777932681',
    name: 'Miroslav',
    surname: 'Šiřina',
    username: 'miroslav.sirina',
  };
  const user = await createMockUser(userData);
  userId = user.user_id;

  //login and assign token
  const response = await request(server).post('/api/v3/login').send({
    email: userData.email,
    password: 'lezlevel',
  });
  token = response.body.authToken;

  customer = {
    company: 'Company',
    customerContacts: {
      toCreate: [{ email: 'Customer contact email' }, { email: 'Customer contact email 2' }],
    },
    locations: {
      toCreate: [{ email: 'Loading email' }, { email: 'Loading email 2' }],
    },
  };

  customerUpdate = {
    company: 'Company updated',
    customerContacts: {
      toCreate: [{ email: 'Customer contact email' }],
      toUpdate: [],
      toDelete: [],
    },
    locations: {
      toCreate: [{ email: 'Loading email' }],
      toUpdate: [],
      toDelete: [],
    },
  };
});

afterAll(async () => {
  try {
    await prisma.users.delete({
      where: {
        user_id: userId,
      },
    });
    await prisma.customer.delete({
      where: {
        customer_id: customerId,
      },
    });
  } catch (error) {
    if (error.code === 'P2025') return;
    console.warn(error);
  }
});

describe(`/api/${endpoint}`, () => {
  describe('POST', () => {
    it('Should create customer', async () => {
      const response = await request(server).post(`/api/${endpoint}`).set('x-auth-token', token).send(customer);
      customerId = response.body.customer_id;
      customerUpdate.customerContacts.toUpdate.push(response.body.customercontact[0]);
      customerUpdate.customerContacts.toDelete.push(response.body.customercontact[1]);
      customerUpdate.locations.toUpdate.push(response.body.location[0]);
      customerUpdate.locations.toDelete.push(response.body.location[1]);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('customer_id');
      expect(response.body).toHaveProperty('company', customer.company);
      expect(response.body).toHaveProperty('customercontact');
      expect(response.body.customercontact.length).toBe(2);
      expect(response.body.customercontact[0]).toHaveProperty('email', 'Customer contact email');
      expect(response.body.customercontact[1]).toHaveProperty('email', 'Customer contact email 2');
      expect(response.body).toHaveProperty('location');
      expect(response.body.location.length).toBe(2);
      expect(response.body.location[0]).toHaveProperty('email', 'Loading email');
      expect(response.body.location[1]).toHaveProperty('email', 'Loading email 2');
    });
  });
  describe('PUT /:id', () => {
    it('Should update customer', async () => {
      customerUpdate.customerContacts.toUpdate[0].email = 'Customer contact email updated';
      customerUpdate.locations.toUpdate[0].email = 'Loading email updated';

      const response = await request(server)
        .put(`/api/${endpoint}/${customerId}`)
        .set('x-auth-token', token)
        .send(customerUpdate);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('customer_id', customerId);
      expect(response.body).toHaveProperty('company', customerUpdate.company);
      expect(response.body).toHaveProperty('customercontact');
      expect(response.body.customercontact.length).toBe(2);
      expect(response.body.customercontact[1]).toHaveProperty('email', 'Customer contact email updated');
      expect(response.body.customercontact[0]).toHaveProperty('email', 'Customer contact email');
      expect(response.body).toHaveProperty('location');
      expect(response.body.location.length).toBe(2);
      expect(response.body.location[1]).toHaveProperty('email', 'Loading email updated');
      expect(response.body.location[0]).toHaveProperty('email', 'Loading email');
    });
  });
  describe('GET', () => {
    it('Should get all customers', async () => {
      const response = await request(server).get(`/api/${endpoint}`).set('x-auth-token', token);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0]).toHaveProperty('customer_id', customerId);
      expect(response.body.data[0]).toHaveProperty('company', customerUpdate.company);
      expect(response.body).toHaveProperty('totalRows', 1);
    });
  });
  describe('GET /:id', () => {
    it('Should get customer by id', async () => {
      const response = await request(server).get(`/api/${endpoint}/${customerId}`).set('x-auth-token', token);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('customer_id', customerId);
      expect(response.body).toHaveProperty('company', customerUpdate.company);
      expect(response.body).toHaveProperty('customercontact');
      expect(response.body.customercontact.length).toBe(2);
      expect(response.body.customercontact[1]).toHaveProperty('email', 'Customer contact email updated');
      expect(response.body.customercontact[0]).toHaveProperty('email', 'Customer contact email');
      expect(response.body).toHaveProperty('location');
      expect(response.body.location.length).toBe(2);
      expect(response.body.location[1]).toHaveProperty('email', 'Loading email updated');
      expect(response.body.location[0]).toHaveProperty('email', 'Loading email');
    });
  });

  describe('GET /csv', () => {
    it('should return all customers in csv', async () => {
      const mockResponse = '"číslo","firma","ulice","psč","země","poznámka"' + `\n${customerId},"Company updated",,,,`;
      const response = await request(server).get(`/api/${endpoint}/csv`).set('x-auth-token', token);
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
      expect(response.text).toBe(mockResponse);
    });
  });

  describe('DELETE /:id', () => {
    it('Should delete customer by id', async () => {
      const response = await request(server).delete(`/api/${endpoint}/${customerId}`).set('x-auth-token', token);

      expect(response.status).toBe(200);
    });
  });
  describe('GET /:id', () => {
    it('Should get 1 customer', async () => {
      const response = await request(server).get(`/api/${endpoint}/${customerId}`).set('x-auth-token', token);
      expect(response.status).toBe(200);
    });
  });
});
