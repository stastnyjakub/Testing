import { NextFunction, Request, Response } from 'express';

import { UnauthenticatedException } from '@/errors';
import { Namespace, t } from '@/middleware/i18n';
import { validateEntityId } from '@/utils';

import {
  searchForDispatchersForCommission,
  transformDispatcherSearchObjects,
} from './commissionSearch/commissionSearch.service';
import { CommissionDispatcherSearchBody } from './commissionSearch/commissionSearch.types';
import { validateCommissionSearchBody, validateEmailBody } from './dispatcher.model';
import * as dispatcherService from './dispatcher.service';
import { buildAndSendEmail } from './dispatcher.service';

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dispatcherId = validateEntityId(req.params.id);

    // If user is dispatcher, he can get his own dispatcher only
    // If user is onboarding, he can get his own dispatcher only if there is an onboarding token for it
    // const isAuthorized = await checkDispatcherAccess(req.auth.payload, Number(id), req.auth.token);
    // if (!isAuthorized) {
    //   return res.status(403).json({
    //     message: t('dispatcher.notAuthorized', req.lang, undefined, Namespace.VALIDATION),
    //   });
    // }

    const dispatcher = await dispatcherService.getDispatcher({ dispatcherId });
    if (!dispatcher) {
      return res
        .status(404)
        .json({ message: t('dispatcher.notFound', req.lang, { id: dispatcherId }, Namespace.VALIDATION) });
    }

    return res.json(dispatcher);
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Dispatcher']
    #swagger.description = 'List dispatchers'
    #swagger.operationId = 'listDispatchers'
    #swagger.parameters['x-auth-token'] = {
        in: 'header',
        description: 'JWT token',
    }
    #swagger.responses[200] = {
        schema: {
          $ref: '#/definitions/DispatcherList'
        }
      }
  */
  try {
    const dispatchers = await dispatcherService.listDispatchers();
    return res.json(dispatchers);
  } catch (error) {
    next(error);
  }
};

// export const create = async (req: Request, res: Response) => {
//   /*
//     #swagger.tags = ['Dispatcher']
//     #swagger.description = 'Create dispatcher'
//     #swagger.operationId = 'createDispatcher'
//     #swagger.parameters['x-auth-token'] = {
//         in: 'header',
//         description: 'JWT token',
//     }
//     #swagger.requestBody = {
//         required: true,
//         schema: {
//           $ref: '#/definitions/DispatcherCreateBody'
//         }
//     }
//     #swagger.responses[200] = {
//         schema: {
//           $ref: '#/definitions/DispatcherGet'
//         }
//       }
//   */
//   try {
//     const { error } = validateCreateBody(req.body);
//     if (error) {
//       return res
//         .status(400)
//         .json({ message: t('invalidBody', req.lang, undefined, Namespace.VALIDATION), details: error.details });
//     }
//     const body = req.body as DispatcherCreateBody;

//     // const isAuthorized = await checkDispatcherAccess(req.auth.payload, undefined, req.auth.token);
//     // if (!isAuthorized) {
//     //   return res
//     //     .status(403)
//     //     .json({ message: t('dispatcher.notAuthorized', req.lang, undefined, Namespace.VALIDATION) });
//     // }

//     // If user is onboarding, he can create dispatcher only for his carrier
//     // if (req.auth.payload.role === AuthRole.ONBOARDING && req.auth.payload.carrier_id !== body.carrier_id) {
//     //   return res.status(403).json({
//     //     message: t('dispatcher.notAuthorizedTiCreateForAnotherCarrier', req.lang, undefined, Namespace.VALIDATION),
//     //   });
//     // }

//     const carrierExists = await getCarrier(body.carrier_id);
//     if (!carrierExists) {
//       return res
//         .status(400)
//         .json({ message: t('carrier.notFound', req.lang, { id: body.carrier_id }, Namespace.VALIDATION) });
//     }

//     const dispatcher = await createDispatcher(body);

//     // if (req.auth.payload.role === AuthRole.ONBOARDING) {
//     //   await solveOnboardingToken(req.auth.token);
//     // }

//     return res.json(dispatcher);
//   } catch (error) {
//     logger.logError(res, error);
//   }
// };

// export const patch = async (req: Request, res: Response) => {
//   /*
//     #swagger.tags = ['dispatcher']
//     #swagger.description = 'Patch dispatcher'
//     #swagger.operationId = 'patchDispatcher'
//     #swagger.parameters['x-auth-token'] = {
//         in: 'header',
//         description: 'JWT token',
//     }
//     #swagger.parameters['id'] = {
//         in: 'path',
//         required: true,
//     }
//     #swagger.requestBody = {
//         required: true,
//         schema: {
//           $ref: '#/definitions/DispatcherPatchBody'
//         }
//     }
//     #swagger.responses[200] = {
//         schema: {
//           $ref: '#/definitions/DispatcherGet'
//         }
//     }
//   */
//   try {
//     const { id } = req.params;
//     const isIdValid = validateId(id);
//     if (!isIdValid) {
//       return res.status(400).json({ message: t('invalidId', req.lang, { id }, Namespace.VALIDATION) });
//     }

//     // If user is dispatcher, he can patch his own dispatcher only
//     // If user is onboarding, he can patch his own dispatcher only if there is an onboarding token for it
//     // const isAuthorized = await checkDispatcherAccess(req.auth.payload, Number(id), req.auth.token);
//     // if (!isAuthorized) {
//     //   return res.status(403).json({
//     //     message: t('dispatcher.notAuthorized', req.lang, undefined, Namespace.VALIDATION),
//     //   });
//     // }

//     const { error } = validatePatchBody(req.body);
//     if (error) {
//       return res
//         .status(400)
//         .json({ message: t('invalidBody', req.lang, undefined, Namespace.VALIDATION), details: error.details });
//     }
//     const body = req.body as DispatcherPatchBody;

//     const dispatcherExists = await getDispatcher({
//       where: { dispatcher_id: Number(id) },
//     });
//     if (!dispatcherExists) {
//       return res.status(404).json({ message: t('dispatcher.notFound', req.lang, { id }, Namespace.VALIDATION) });
//     }

//     const dispatcher = await patchDispatcher({
//       ...body,
//       dispatcher_id: Number(id),
//     });

//     // if (req.auth.payload.role === AuthRole.ONBOARDING) {
//     //   await solveOnboardingToken(req.auth.token);
//     // }

//     return res.json(dispatcher);
//   } catch (error) {
//     logger.logError(res, error);
//   }
// };

export const email = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Dispatcher']
    #swagger.description = 'contact dispatcher via email'
    #swagger.parameters['x-auth-token'] = {
        in: 'header',
        description: 'JWT token',
    }
    #swagger.requestBody = {
        required: true,
        schema: {
          $ref: '#/definitions/DispatcherEmailBody'
        }
    }
  */
  try {
    const body = validateEmailBody(req.body);

    if (req.auth.payload === undefined) {
      throw new UnauthenticatedException();
    }

    const lang = await dispatcherService.getDispatcherLang(body.dispatcherId);
    await buildAndSendEmail({ ...body, lang }, req.auth.payload.userId);

    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
};

export const commissionSearch = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Dispatcher']
    #swagger.description = 'Search for dispatchers for commission'
    #swagger.operationId = 'commissionSearch'
    #swagger.parameters['x-auth-token'] = {
        in: 'header',
        description: 'JWT token',
    }
    #swagger.requestBody = {
        required: true,
        schema: {
          $ref: '#/definitions/CommissionDispatcherSearchBody'
        }
    }
    #swagger.responses[200] = {
        schema: {
          $ref: '#/definitions/CommissionDispatcherSearchResponse'
        }
      }
  */
  try {
    validateCommissionSearchBody(req.body);
    const body = req.body as CommissionDispatcherSearchBody;
    const foundDispatcherSearchObjects = await searchForDispatchersForCommission(body);
    const transformedResponseWithMetadata = transformDispatcherSearchObjects(foundDispatcherSearchObjects);
    res.json(transformedResponseWithMetadata);
  } catch (e) {
    next(e);
  }
};
