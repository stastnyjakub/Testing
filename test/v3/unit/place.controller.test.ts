import * as placeController from '../../../v3/place/place.controller';
import * as placeService from '../../../v3/place/place.service';
import { mockNext, mockRequest, mockResponse } from '../utility/mockResReq';
import { dispatcher } from '@prisma/client';
import { PlaceUpdateBody } from '../../../v3/place/place.interface';

describe('Place controller unit test', () => {
  describe('get all places', () => {
    const mockPlace = {
      dispatcher_id: 1,
    } as dispatcher;

    const mockService = jest.spyOn(placeService, 'getPlaces');
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return 200', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';

      mockService.mockReturnValue(Promise.resolve(mockPlace));
      await placeController.placesGet(req, res, next);

      expect(mockService).toHaveBeenCalledWith(1);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockPlace);
    });
    it('should return 400 - bad ID', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = 'a';

      await placeController.placesGet(req, res, next);

      expect(mockService).toHaveBeenCalledTimes(0);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Neplatné id');
    });
    it('should return 500 - error', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';

      mockService.mockReturnValue(Promise.reject({ message: 'error' }));
      await placeController.placesGet(req, res, next);

      expect(mockService).toHaveBeenCalledWith(1);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
  describe('update places', () => {
    const mockPlace = {
      dispatcher_id: 1,
    } as dispatcher;
    const mockUpdatePlaceBody = {
      places: {},
    } as PlaceUpdateBody;

    const mockService = jest.spyOn(placeService, 'updatePlaces');
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return 200', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';
      req.body = mockUpdatePlaceBody;

      mockService.mockReturnValue(Promise.resolve(mockPlace));
      await placeController.placesUpdate(req, res, next);

      expect(mockService).toHaveBeenCalledWith(1, mockUpdatePlaceBody);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith(mockPlace);
    });
    it('should return 400 - bad ID', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = 'a';

      await placeController.placesUpdate(req, res, next);

      expect(mockService).toHaveBeenCalledTimes(0);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Neplatné id');
    });

    it('should return 400 - bad request body', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';
      req.body = {
        invalid: 'invalid',
      };

      await placeController.placesUpdate(req, res, next);
      expect(mockService).toHaveBeenCalledTimes(0);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });
    it('should return 500 - error', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.params.id = '1';
      req.body = mockUpdatePlaceBody;

      mockService.mockReturnValue(Promise.reject({ message: 'error' }));
      await placeController.placesUpdate(req, res, next);

      expect(mockService).toHaveBeenCalledWith(1, mockUpdatePlaceBody);
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
