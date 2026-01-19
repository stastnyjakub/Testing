import { mockNext, mockRequest, mockResponse } from '../utility/mockResReq';
import { dispatcher } from '@prisma/client';
import * as dispatcherVehicleController from '../../../v3/dispatcherVehicle/dispatcherVehicle.controller';
import * as dispatcherVehicleService from '../../../v3/dispatcherVehicle/dispatcherVehicle.service';
import { Prisma } from '@prisma/client';

describe('Dispatcher Vehicle controller unit test', () => {
  describe('get all dispatcher vehicles', () => {
    const mockDispatcherVehicle = {
      dispatcher_id: 1,
    } as dispatcher;

    const mockService = jest.spyOn(dispatcherVehicleService, 'getVehicles');
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return 200', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';

      mockService.mockReturnValue(Promise.resolve(mockDispatcherVehicle));
      await dispatcherVehicleController.vehiclesGet(req, res, next);

      expect(mockService).toHaveBeenCalledWith(1);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockDispatcherVehicle);
    });
    it('should return 400 - bad ID', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = 'a';

      await dispatcherVehicleController.vehiclesGet(req, res, next);

      expect(mockService).toHaveBeenCalledTimes(0);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Neplatné id');
    });
    it('should return 404', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';

      mockService.mockReturnValue(Promise.resolve(null));
      await dispatcherVehicleController.vehiclesGet(req, res, next);

      expect(mockService).toHaveBeenCalledWith(1);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Vozidla nenalezena');
    });
    it('should return 500 - error', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';

      mockService.mockReturnValue(Promise.reject({ message: 'error' }));
      await dispatcherVehicleController.vehiclesGet(req, res, next);

      expect(mockService).toHaveBeenCalledWith(1);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
  describe('update dispatcher vehicles', () => {
    const mockService = jest.spyOn(dispatcherVehicleService, 'updateVehicles');
    const mockDispatcherVehicle = {
      dispatcher_id: 1,
    } as dispatcher;

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return 200', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';
      req.body = {
        dispatcherVehicles: {
          toCreate: [
            {
              vehicleType_id: 1,
              maxHeight: 1,
            },
          ],
        },
      } as Prisma.dispatchervehicleCreateInput;

      mockService.mockReturnValue(Promise.resolve(mockDispatcherVehicle));
      await dispatcherVehicleController.vehiclesUpdate(req, res, next);

      expect(mockService).toHaveBeenCalledWith(1, req.body);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockDispatcherVehicle);
    });
    it('should return 400 - bad ID', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = 'a';

      await dispatcherVehicleController.vehiclesUpdate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Neplatné id');
    });
    it('should return 400 - bad body', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';

      await dispatcherVehicleController.vehiclesUpdate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
    it('should return 500 - error', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';
      req.body = {
        dispatcherVehicles: {
          toCreate: [
            {
              vehicleType_id: 1,
              maxHeight: 1,
            },
          ],
        },
      } as Prisma.dispatchervehicleCreateInput;

      mockService.mockReturnValue(Promise.reject({ message: 'error' }));
      await dispatcherVehicleController.vehiclesUpdate(req, res, next);

      expect(mockService).toHaveBeenCalledWith(1, req.body);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
