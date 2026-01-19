import * as carrierController from '../../../v3/carrier/carrier.controller';
import * as carrierService from '../../../v3/carrier/carrier.service';
import * as carrierSearchService from '../../../v3/carrier/search/search.service';
import { mockNext, mockRequest, mockResponse } from '../utility/mockResReq';
import {
  AllCarriersResponse,
  CarrierBodyCreate,
  CarrierBodyUpdate,
  Carrier,
} from '../../../v3/carrier/carrier.interface';

describe('Carrier controller unit tests', () => {
  describe('get 1 carrier', () => {
    const mockCarrier = {
      carrier_id: 10,
      addedBy: '1',
      city: 'Praha',
      company: 'Spur',
      companyRegistrationNumber: 123123n,
      country: 'Kongo',
      countryCode: 'CD',
      editedBy: '1',
      note: 'note',
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
      phone: 'phone',
      place: {
        city: 'Praha',
        street: 'street',
        country: 'Kongo',
        latitude: 1,
        longitude: 1,
        postalCode: '123',
        countryCode: 'CD',
      },
      postalCode: '123',
      qid: 1,
      number: 1,
      street: 'street',
      taxId: 'taxId',
      ts_edited: 1n,
      ts_added: 1n,
      deleted: false,
      dispatcher: [],
      dispatchervehicle: [],
      places: [],
    } as Carrier;
    const mockService = jest.spyOn(carrierService, 'getCarrier');

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return 200', async () => {
      const req = mockRequest();
      req.params.id = '10';
      const res = mockResponse();
      const next = mockNext();

      mockService.mockReturnValue(Promise.resolve(mockCarrier));
      await carrierController.carrierGet(req, res, next);

      expect(mockService).toHaveBeenCalledWith(10);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockCarrier);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it('should return 400 - invalid ID', async () => {
      const req = mockRequest();
      req.params.id = 'asd';
      const res = mockResponse();
      const next = mockNext();

      await carrierController.carrierGet(req, res, next);
      expect(mockService).toHaveBeenCalledTimes(0);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    it('should return 404 - not found', async () => {
      const req = mockRequest();
      req.params.id = '10';
      const res = mockResponse();
      const next = mockNext();

      mockService.mockReturnValue(Promise.resolve(null));
      await carrierController.carrierGet(req, res, next);

      expect(mockService).toHaveBeenCalledWith(10);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    it('should return 500 - prisma error', async () => {
      const req = mockRequest();
      req.params.id = '10';
      const res = mockResponse();
      const next = mockNext();
      mockService.mockReturnValue(Promise.reject({ message: 'error' }));
      await carrierController.carrierGet(req, res, next);
      expect(mockService).toHaveBeenCalledWith(10);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('get multiple carriers', () => {
    const mockCarriers = {
      data: [
        {
          carrier_id: 2717,
        },
      ],
      totalRows: 1,
    } as AllCarriersResponse;
    const mockService = jest.spyOn(carrierSearchService, 'getCarriers');
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return 200', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      mockService.mockReturnValue(Promise.resolve(mockCarriers));
      await carrierController.carriersGet(req, res, next);

      expect(mockService).toHaveBeenCalledWith(req.query);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockCarriers);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it('should return 400 - invalid ID', async () => {
      const req = mockRequest();
      req.query = { invalid: 'invalid' };
      const res = mockResponse();
      const next = mockNext();

      await carrierController.carriersGet(req, res, next);
      expect(mockService).toHaveBeenCalledTimes(0);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    it('should return 404 - not found', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      mockService.mockReturnValue(Promise.resolve(null));
      await carrierController.carriersGet(req, res, next);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    it('should return 500 - prisma error', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      mockService.mockReturnValue(Promise.reject({ message: 'error' }));
      await carrierController.carriersGet(req, res, next);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('create carrier', () => {
    const mockCarrier = {
      company: 'company',
      dispatcher: [],
    } as Carrier;
    const mockService = jest.spyOn(carrierService, 'createCarrier');
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return 200', async () => {
      const mockCarrierBody = {
        company: 'company',
        dispatchers: {},
      } as CarrierBodyCreate;
      const req = mockRequest();
      req.body = mockCarrierBody;
      const res = mockResponse();
      const next = mockNext();

      mockService.mockReturnValue(Promise.resolve(mockCarrier));
      await carrierController.carrierPost(req, res, next);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockCarrier);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it('should return 400 - invalid body', async () => {
      const mockCarrierBody = {} as CarrierBodyCreate;
      const req = mockRequest();
      req.body = mockCarrierBody;
      const res = mockResponse();
      const next = mockNext();

      await carrierController.carrierPost(req, res, next);
      expect(mockService).toHaveBeenCalledTimes(0);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });
    it('should return 500 - prisma error', async () => {
      const mockCarrierBody = {
        company: 'company',
        dispatchers: {},
      } as CarrierBodyCreate;
      const req = mockRequest();
      req.body = mockCarrierBody;
      const res = mockResponse();
      const next = mockNext();

      mockService.mockReturnValue(Promise.reject({ message: 'error' }));
      await carrierController.carrierPost(req, res, next);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('update carrier', () => {
    const mockCarrier = {
      company: 'company',
    } as Carrier;
    const mockService = jest.spyOn(carrierService, 'updateCarrier');
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return 200', async () => {
      const mockCarrierBody = {
        company: 'company',
      } as CarrierBodyUpdate;
      const req = mockRequest();
      req.body = mockCarrierBody;
      req.params.id = '10';
      const res = mockResponse();
      const next = mockNext();

      mockService.mockReturnValue(Promise.resolve(mockCarrier));
      await carrierController.carrierUpdate(req, res, next);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockCarrier);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it('should return 400 - invalid id', async () => {
      const req = mockRequest();
      req.params.id = 'asd';
      const res = mockResponse();
      const next = mockNext();

      await carrierController.carrierUpdate(req, res, next);
      expect(mockService).toHaveBeenCalledTimes(0);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    it('should return 400 - invalid body', async () => {
      const mockCarrierBody = {} as CarrierBodyUpdate;
      const req = mockRequest();
      req.body = mockCarrierBody;
      req.params.id = '10';
      const res = mockResponse();
      const next = mockNext();

      await carrierController.carrierUpdate(req, res, next);
      expect(mockService).toHaveBeenCalledTimes(0);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    it('should return 404 - not found', async () => {
      const mockCarrierBody = {
        company: 'company',
        dispatchers: {},
      } as CarrierBodyUpdate;
      const req = mockRequest();
      req.body = mockCarrierBody;
      req.params.id = '10';
      const res = mockResponse();
      const next = mockNext();

      mockService.mockReturnValue(Promise.resolve(null));
      await carrierController.carrierUpdate(req, res, next);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    it('should return 500 - prisma error', async () => {
      const mockCarrierBody = {
        company: 'company',
        dispatchers: {},
      } as CarrierBodyUpdate;
      const req = mockRequest();
      req.body = mockCarrierBody;
      req.params.id = '10';
      const res = mockResponse();
      const next = mockNext();

      mockService.mockReturnValue(Promise.reject({ message: 'error' }));
      await carrierController.carrierUpdate(req, res, next);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete carrier', () => {
    const mockCarrier = {
      company: 'company',
      carrier_id: 10,
    } as Carrier;
    const mockService = jest.spyOn(carrierService, 'removeCarrier');
    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should return 200', async () => {
      const req = mockRequest();
      req.params.id = '10';
      const res = mockResponse();
      const next = mockNext();

      mockService.mockReturnValue(Promise.resolve(mockCarrier));
      await carrierController.carrierDelete(req, res, next);
      expect(res.json).toHaveBeenCalledWith(mockCarrier);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it('should return 400 - invalid ID', async () => {
      const req = mockRequest();
      req.params.id = 'asd';
      const res = mockResponse();
      const next = mockNext();

      await carrierController.carrierDelete(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    it('should return 404 - not found', async () => {
      const req = mockRequest();
      req.params.id = '10';
      const res = mockResponse();
      const next = mockNext();

      mockService.mockReturnValue(Promise.resolve(null));
      await carrierController.carrierDelete(req, res, next);
      //expect(next).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it('should return 500 - prisma error', async () => {
      const req = mockRequest();
      req.params.id = '10';
      const res = mockResponse();
      const next = mockNext();

      mockService.mockReturnValue(Promise.reject({ message: 'error' }));
      await carrierController.carrierDelete(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
