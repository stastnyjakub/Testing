import * as vehicleTypeController from '../../../v3/vehicleType/vehicleType.controller';
import * as vehicleTypeService from '../../../v3/vehicleType/vehicleType.service';
import { mockNext, mockRequest, mockResponse } from '../utility/mockResReq';
import { VehicleType } from '../../../v3/vehicleType/vehicleType.interface';

describe('vehicleTypeController', () => {
  describe('get 1 vehicleType', () => {
    const mockVehicleType = {
      vehicleType_id: 1,
      type: 'vehicleType',
      heightMin: null,
      heightMax: null,
      heightStep: null,
      lengthMin: null,
      lengthMax: null,
      lengthStep: null,
      capacityMin: null,
      capacityMax: null,
      capacityStep: null,
      vehicleFeatures: [
        {
          vehicleTypeFeature_id: 1,
          vehicleFeature_id: 1,
          vehicleType_id: 1,
        },
      ],
    } as VehicleType;
    const mockService = jest.spyOn(vehicleTypeService, 'getVehicleType');
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return 200 and 1 vehicleType', async () => {
      const req = mockRequest();
      req.params.id = '1';
      const res = mockResponse();
      const next = mockNext();

      mockService.mockReturnValue(Promise.resolve(mockVehicleType));
      await vehicleTypeController.vehicleTypeGet(req, res, next);

      expect(mockService).toHaveBeenCalledWith(1);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockVehicleType);
      expect(res.json).toHaveBeenCalledTimes(1);
    });
    it('should return 400 if id is not a number', async () => {
      const req = mockRequest();
      req.params.id = 'a';
      const res = mockResponse();
      const next = mockNext();

      await vehicleTypeController.vehicleTypeGet(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Id číslo mezi 0-4',
      });
      expect(res.send).toHaveBeenCalledTimes(1);
    });
    it('should return 400 if id is not a number (1-4)', async () => {
      const req = mockRequest();
      req.params.id = '5';
      const res = mockResponse();
      const next = mockNext();

      await vehicleTypeController.vehicleTypeGet(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Id číslo mezi 0-4',
      });
      expect(res.send).toHaveBeenCalledTimes(1);
    });
    it('should return 500 if error', async () => {
      const req = mockRequest();
      req.params.id = '1';
      const res = mockResponse();
      const next = mockNext();

      mockService.mockReturnValue(Promise.reject('error'));
      await vehicleTypeController.vehicleTypeGet(req, res, next);

      expect(mockService).toHaveBeenCalledWith(1);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
  describe('get all vehicleTypes', () => {
    const mockVehicleTypes = [
      {
        vehicleType_id: 1,
        type: 'vehicleType',
        heightMin: null,
        heightMax: null,
        heightStep: null,
        lengthMin: null,
        lengthMax: null,
        lengthStep: null,
        capacityMin: null,
        capacityMax: null,
        capacityStep: null,
        vehicleFeatures: [
          {
            vehicleTypeFeature_id: 1,
            vehicleFeature_id: 1,
            vehicleType_id: 1,
          },
        ],
      },
    ] as VehicleType[];
    const mockService = jest.spyOn(vehicleTypeService, 'getVehicleTypes');
    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should return 200 and all vehicleTypes', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      mockService.mockReturnValue(Promise.resolve(mockVehicleTypes));
      await vehicleTypeController.vehicleTypesGet(req, res, next);

      expect(mockService).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockVehicleTypes);
      expect(res.json).toHaveBeenCalledTimes(1);
    });
    it('should return 500 if error', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      mockService.mockReturnValue(Promise.reject('error'));
      await vehicleTypeController.vehicleTypesGet(req, res, next);

      expect(mockService).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
