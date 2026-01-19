import * as customerController from '../../../v3/customer/customer.controller';
import * as customerService from '../../../v3/customer/customer.service';
import { mockNext, mockRequest, mockResponse } from '../utility/mockResReq';
import { AllCustomers, ECustomerType } from '../../../v3/customer/customer.interface';
import { customer, customercontact, location } from '@prisma/client';

describe('Customer controller unit tests', () => {
  describe('get 1 customer', () => {
    const mockCustomer: customer & {
      customercontact: customercontact[];
      location: location[];
    } = {
      customer_id: 1,
      addedBy: 'machan@qapline.com',
      city: 'Colombo',
      company: 'Qapline',
      type: ECustomerType.Active,
      country: 'Sri Lanka',
      countryCode: 'LK',
      editedBy: 'machan@qapline.com',
      note: 'This is a note',
      companyRegistrationNumber: 12n,
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
      phone: 'phone',
      postalCode: 'postalCode',
      street: 'street',
      deleted: false,
      qid: 123,
      number: 123,
      taxId: 'taxId',
      ts_added: 1n,
      ts_edited: 1n,
      defaultDueDate: 1,
      place: {
        city: 'city',
        street: 'street',
        country: 'country',
        latitude: 1,
        longitude: 1,
        postalCode: 'postalCode',
        countryCode: 'countryCode',
      },
      customercontact: [
        {
          customerContact_id: 1,
          email: 'email',
          firstName: 'firstName',
          lastName: 'lastName',
          phone: 'phone',
          deleted: false,
          customer_id: 1,
        },
      ],
      location: [
        {
          location_id: 2170,
          city: null,
          company: 'discharge company',
          country: null,
          countryCode: null,
          customer_id: 105,
          email: null,
          firstName: null,
          lastName: null,
          gps: null,
          latitude: null,
          longitude: null,
          note: null,
          phone: null,
          postalCode: null,
          street: null,
          loading: false,
          discharge: false,
          deleted: false,
        },
      ],
    };
    const mockService = jest.spyOn(customerService, 'getOneCustomer');

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return 200 and the customer', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';

      mockService.mockResolvedValue(mockCustomer);
      await customerController.customerGet(req, res, next);

      expect(mockService).toBeCalledTimes(1);
      expect(mockService).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockCustomer);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if invalid id', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await customerController.customerGet(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith({ message: 'Neplatné ID' });
      expect(res.send).toHaveBeenCalledTimes(1);
    });
    it('should return 404 if customer not found', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';

      mockService.mockResolvedValue(null);
      await customerController.customerGet(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Zákazníka se nepodařilo najít',
      });
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if error', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';

      mockService.mockRejectedValue('error');
      await customerController.customerGet(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('get all customers', () => {
    const mockAllCustomers: AllCustomers = {
      data: [
        {
          customer_id: 10,
          addedBy: 'jindrich.machan@qapline.com',
          city: 'Zlín',
          company: 'CENTROPROJEKT GROUP a.s.',
          companyRegistrationNumber: 1n,
          country: 'Česká republika',
          countryCode: 'CZ',
          type: ECustomerType.Active,
          editedBy: 'jindra.machan@qapline.com',
          note: '----',
          email: null,
          firstName: 'Vladimír',
          lastName: 'Jonášek',
          phone: null,
          place: {
            city: 'Zlín',
            street: 'Štefánikova 167',
            country: 'Česká republika',
            postalCode: '760 01',
            countryCode: 'CZ',
          },
          postalCode: '760 01',
          qid: 10,
          number: 10,
          street: 'Štefánikova 167',
          taxId: 'CZ01643541',
          ts_edited: 11n,
          ts_added: 11n,
          deleted: false,
          defaultDueDate: 60,
        },
      ],
      totalRows: 1,
    };
    const mockService = jest.spyOn(customerService, 'getCustomers');

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return 200 and the customers', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      mockService.mockResolvedValue(mockAllCustomers);
      await customerController.customersGet(req, res, next);

      expect(mockService).toBeCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockAllCustomers);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if invalid query', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.query = { invalid: 'invalid' };

      await customerController.customersGet(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if no customers found', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      mockService.mockResolvedValue({ data: [], totalRows: 0 });
      await customerController.customersGet(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Nebyli nalezeni žádní zákazníci',
      });
      expect(res.send).toHaveBeenCalledTimes(1);
    });
    it('should return 500 if error', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      mockService.mockRejectedValue('error');
      await customerController.customersGet(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('create 1 customer', () => {
    const mockCustomer: customer & {
      customercontact: customercontact[];
      location: location[];
    } = {
      customer_id: 105,
      addedBy: null,
      city: null,
      company: 'test',
      companyRegistrationNumber: null,
      country: null,
      countryCode: null,
      type: ECustomerType.Active,
      editedBy: null,
      note: null,
      email: null,
      firstName: null,
      lastName: null,
      phone: null,
      place: null,
      postalCode: null,
      qid: null,
      number: null,
      street: null,
      taxId: null,
      ts_edited: null,
      ts_added: null,
      deleted: false,
      defaultDueDate: null,
      customercontact: [],
      location: [],
    };
    const mockService = jest.spyOn(customerService, 'createCustomer');

    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should return 200 and the customer', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.body = {
        company: 'test',
        locations: {},
        customerContacts: {},
      };

      mockService.mockResolvedValue(mockCustomer);
      await customerController.customerPost(req, res, next);

      expect(mockService).toBeCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockCustomer);
      expect(res.json).toHaveBeenCalledTimes(1);
    });
    it('should return 400 if invalid request body', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.body = {};

      await customerController.customerPost(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });
    it('should return 500 if error', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.body = {
        company: 'test',
        locations: {},
        customerContacts: {},
      };

      mockService.mockRejectedValue('error');
      await customerController.customerPost(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('update 1 customer', () => {
    const mockCustomer: customer & {
      customercontact: customercontact[];
      location: location[];
    } = {
      customer_id: 105,
      addedBy: null,
      city: null,
      company: 'test',
      type: ECustomerType.Active,
      companyRegistrationNumber: null,
      country: null,
      countryCode: null,
      editedBy: null,
      note: null,
      email: null,
      firstName: null,
      lastName: null,
      phone: null,
      place: null,
      postalCode: null,
      qid: null,
      number: null,
      street: null,
      taxId: null,
      ts_edited: null,
      ts_added: null,
      deleted: false,
      defaultDueDate: null,
      customercontact: [],
      location: [],
    };
    const mockService = jest.spyOn(customerService, 'updateCustomer');

    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should return 200 and the customer', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';
      req.body = {
        company: 'test',
        locations: {},
        customerContacts: {},
      };

      mockService.mockResolvedValue(mockCustomer);
      await customerController.customerPut(req, res, next);

      expect(mockService).toBeCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockCustomer);
      expect(res.json).toHaveBeenCalledTimes(1);
    });
    it('should return 400 if invalid id', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = 'invalid';

      await customerController.customerPut(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });
    it('should return 400 if invalid request body', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';
      req.body = {};

      await customerController.customerPut(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });
    it('should return 500 if error', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';
      req.body = {
        company: 'test',
        locations: {},
        customerContacts: {},
      };

      mockService.mockRejectedValue('error');
      await customerController.customerPut(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete 1 customer', () => {
    const mockCustomer: customer & {
      customercontact: customercontact[];
      location: location[];
    } = {
      customer_id: 105,
      addedBy: null,
      type: ECustomerType.Active,
      city: null,
      company: 'test',
      companyRegistrationNumber: null,
      country: null,
      countryCode: null,
      editedBy: null,
      note: null,
      email: null,
      firstName: null,
      lastName: null,
      phone: null,
      place: null,
      postalCode: null,
      qid: null,
      number: null,
      street: null,
      taxId: null,
      ts_edited: null,
      ts_added: null,
      deleted: false,
      defaultDueDate: null,
      customercontact: [],
      location: [],
    };
    const mockService = jest.spyOn(customerService, 'removeCustomer');

    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should return 200', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';

      mockService.mockResolvedValue();
      await customerController.customerDelete(req, res, next);

      expect(mockService).toBeCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });
    it('should return 400 if invalid id', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = 'invalid';

      await customerController.customerDelete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });
    it('should return 500 if error', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';

      mockService.mockRejectedValue('error');
      await customerController.customerDelete(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
