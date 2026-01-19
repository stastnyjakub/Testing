import * as refreshTokenController from '../../../v3/refreshToken/refreshToken.controller';
import { mockNext, mockRequest, mockResponse } from '../utility/mockResReq';
import jwt from 'jsonwebtoken';
import * as authHelpers from '../../../v3/utils/authHelpers';

describe('Refresh Token controller unit tests', () => {
  describe('create refresh token', () => {
    const mockJwt = jest.spyOn(jwt, 'verify');
    const mockGenAuthToken = jest.spyOn(authHelpers, 'generateAuthToken');
    const mockGenRefreshToken = jest.spyOn(authHelpers, 'generateRefreshToken');
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should return 200', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.cookies = {
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoidXNlciIsImVtYWlsIjoiamluZHJhLm1hY2hhbkBxYXBsaW5lLmNvbSIsIm51bWJlciI6MSwiZW1haWxQYXNzd29yZCI6IjZacnZjanFxIiwibW9iaWxlUGhvbmUiOiIrNDIwNzc0MDA5OTMzIiwiam9iVGl0bGUiOiJwb3ppY2UiLCJuYW1lIjoiSmluZHJhIiwic3VybmFtZSI6Ik1hY2hhbiIsInVzZXJuYW1lIjoiamluZHJhLm1hY2hhbiIsImlhdCI6MTcxMTAzMjYyOX0.6Fv_axLIVRjsDc-d0hVVeQafYiBFsB_1wLM6jF2333E',
      };

      const decoded: any = { user_id: 1, isPayload: true, role: 'user' };
      mockJwt.mockReturnValue(decoded);
      mockGenAuthToken.mockReturnValue('valid-auth-token');
      mockGenRefreshToken.mockReturnValue('valid-refresh-token');

      await refreshTokenController.refreshTokenPost(req, res, next);
      expect(mockJwt).toHaveBeenCalledTimes(1);
      expect(mockGenAuthToken).toHaveBeenCalledTimes(1);
      expect(mockGenRefreshToken).toHaveBeenCalledTimes(1);
      expect(res.cookie).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ authToken: 'valid-auth-token' });
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it('should return 401 - invalid refresh token', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.cookies = {
        refreshToken: 'invalid token',
      };

      mockJwt.mockImplementation(() => {
        throw new Error('invalid token');
      });
      await refreshTokenController.refreshTokenPost(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    it('should return 401 - missing refresh token', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await refreshTokenController.refreshTokenPost(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Nebyl poskytnut žádný autorizační token',
      });
      expect(res.send).toHaveBeenCalledTimes(1);
    });
  });
});
