import { NextFunction, Request, Response } from 'express';

import { validateLoginRequestBody, validateRefreshTokenRequestCookies } from './auth.model';
import * as authService from './auth.service';

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = validateRefreshTokenRequestCookies(req.cookies);

    const { accessToken, newRefreshToken } = await authService.getRefreshedAuthTokens({ refreshToken });

    if (newRefreshToken) {
      authService.setRefreshTokenCookie(res, newRefreshToken);
    }

    res.status(200).json({
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = validateLoginRequestBody(req.body);

    const { accessToken, refreshToken } = await authService.handleLogin({ email, password });
    authService.setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    authService.setRefreshTokenCookie(res, '', 0);
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
};
