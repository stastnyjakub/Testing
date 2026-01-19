import { mockNext, mockRequest, mockResponse } from '../utility/mockResReq';
import * as loginController from '../../../v3/login/login.controller';
import * as authHelpers from '../../../v3/utils/authHelpers';
import * as userService from '../../../v3/user/user.service';
import bcrypt from 'bcryptjs';

describe('Login controller unit tests', () => {
  describe('login', () => {
    const mockService = jest.spyOn(userService, 'getAdmin');
    const mockGenAuthToken = jest.spyOn(authHelpers, 'generateAuthToken');
    const mockGenRefreshToken = jest.spyOn(authHelpers, 'generateRefreshToken');
    const mockBcrypt = jest.spyOn(bcrypt, 'compare');

    it('should return 200', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.body = {
        email: 'valid-email',
        password: 'valid-password',
      };
      const user = {
        user_id: 1,
        number: 0,
        email: 'miroslav.sirina@koala42.com',
        password: 'lezlevel',
        emailPassword: 'asdad',
        jobTitle: 'developer',
        mobilePhone: '777932681',
        name: 'Miroslav',
        surname: 'Šiřina',
        username: 'miroslav.sirina',
        deleted: false,
        role: 1,
      };
      mockService.mockReturnValue(Promise.resolve(user));
      mockBcrypt.mockReturnValue(await Promise.resolve(true as any));
      mockGenAuthToken.mockReturnValue('valid-auth-token');
      mockGenRefreshToken.mockReturnValue('valid-refresh-token');

      await loginController.login(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ authToken: 'valid-auth-token' });
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it('should return 400', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await loginController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        details: expect.any(Array),
      });
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it('should return 401', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.body = {
        email: 'valid-email',
        password: 'valid-password',
      };

      mockService.mockReturnValue(Promise.resolve(null));
      await loginController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Uživatel s tímto emailem neexistuje',
      });
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it('should return 500', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();
      req.body = {
        email: 'valid-email',
        password: 'valid-password',
      };

      mockService.mockImplementation(() => {
        throw new Error('error');
      });
      await loginController.login(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
