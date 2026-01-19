import { ApiKey } from '@prisma/client';

import { PermissionsService } from '../auth.service';

import { TAuthTokenPayload } from './tokens';

declare module 'express-serve-static-core' {
  interface Request {
    permissionsService?: PermissionsService;
    auth: {
      payload?: TAuthTokenPayload;
      token?: string;
      apiKey?: ApiKey;
    };
  }
}
