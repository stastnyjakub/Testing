import { NextFunction, Request, Response } from 'express';

import * as apiKeyService from '@/apiKey/apiKey.service';
import { UnauthenticatedException, UnauthorizedException } from '@/errors';

import { PermissionsService } from './permissions/permissions.service';
import * as authService from './tokens/tokens.service';
import { EAuthRole, TMongoAbility } from './types/permissions';

export const auth = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.header('x-auth-token');
      if (!token) throw new UnauthenticatedException();

      const tokenPayload = await authService.verifyAccessToken(token);

      const permissionsService = new PermissionsService(tokenPayload.role);

      req.permissionsService = permissionsService;
      req.auth = {
        token,
        payload: tokenPayload,
      };

      next();
    } catch (_error) {
      next(new UnauthenticatedException());
    }
  };
};

/**
 * @param roles - User only needs to have one of the roles
 * @description Middleware to check if the user has the required role.
 */
export const allowRoles = (...roles: EAuthRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const permissionsService = req?.permissionsService;
      if (!permissionsService) throw new UnauthenticatedException();

      const userRole = permissionsService.getRole();
      if (!userRole) throw new UnauthenticatedException();

      const userHasRole = roles.includes(userRole);
      if (!userHasRole) throw new UnauthorizedException();

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * @param permissions - User needs to have all the permissions
 * @description Middleware to check if the user has the required permissions.
 */
export const requirePermissions = (permissions: TMongoAbility[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const permissionsService = req?.permissionsService;
      if (!permissionsService) throw new UnauthenticatedException();

      for (const permission of permissions) {
        const [action, subject] = permission;
        permissionsService.checkCanOrThrow(action, subject);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authApiKey = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const apiKey = req.header('x-api-key');
      if (!apiKey) throw new UnauthenticatedException();

      const apiKeyEntity = await apiKeyService.getValidatedApiKeyOrThrow(apiKey);
      await apiKeyService.useApiKey(apiKey);

      const permissionsService = new PermissionsService(apiKeyEntity.role as EAuthRole);

      req.permissionsService = permissionsService;
      req.auth = {
        apiKey: apiKeyEntity,
      };

      next();
    } catch (_error) {
      next(new UnauthenticatedException());
    }
  };
};
