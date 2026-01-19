import { NextFunction, Request, Response } from 'express';
import moment from 'moment-timezone';

import { downloadCsv, validateEntityId, validateId } from '@/utils';

import { getDispatcherLang, getDispatchersByIds } from '../dispatcher/dispatcher.service';
import { Entity, InvalidBodyException, NotFoundException } from '../errors';
import { TBaseMail } from '../mail/mail.interface';
import * as userService from '../user/user.service';
import { invalidateTag } from '../websockets';

import { buildAndCreateEnquiry, sendEnquiryMail } from './enquiryEmail/enquiryEmail.service';
import { validateListCarriersRequestBody } from './listCarriers/listCarriers.model';
import { OnboardingEmailBody } from './onboarding/onboarding.interface';
import { generateOnboardingTokens, sendOnboardingMails } from './onboarding/onboarding.service';
import { getCarrierList } from './search/search.service';
import { CarrierEmailEnquiryEmailRequestBody } from './carrier.interface';
import { validateEnquiryEmailBody, validateOnboardingEmailBody, validateParameters } from './carrier.model';
import * as carrierService from './carrier.service';

export const getCarrier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const carrierId = validateEntityId(req.params.id);
    const carrier = await carrierService.getCarrier(carrierId);
    if (!carrier) throw new NotFoundException(Entity.CARRIER);

    res.status(200).json(carrier);
  } catch (error) {
    next(error);
  }
};

export const listCarries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset, search, ...filters } = validateListCarriersRequestBody(req.query);

    const carriers = await carrierService.listCarriers({
      limit,
      offset,
      search,
      ...filters,
    });

    res.status(200).json(carriers);
  } catch (error) {
    next(error);
  }
};

// export const carrierPost = async (req: Request, res: Response, next: NextFunction) => {
//   /*
//     #swagger.tags = ['V3 - Carrier']
//     #swagger.description = 'Create carrier'
//     #swagger.operationId = 'createCarrier'
//     #swagger.parameters['x-auth-token'] = {
//       in: 'header',
//       description: 'JWT token',
//     }
//     #swagger.requestBody = {
//       required: true,
//       schema: {$ref: '#/definitions/V3CarrierCreateBody'}
//     }
//     #swagger.responses[200] = {
//       schema: {$ref: '#/definitions/V3CarrierCreate'}
//     }
//   */
//   const { error } = validateRequestBodyCreate(req.body);
//   if (error) return res.status(400).send(error.details[0].message);
//   const { dispatchers, dispatcherVehicles, places, ...carrier } = req.body as CarrierBodyCreate;
//   try {
//     const createdCarrier = await createCarrier(carrier, dispatchers, dispatcherVehicles, places);

//     invalidateTag('Carriers');
//     invalidateTag('Carriers');
//     return res.json(createdCarrier);
//   } catch (e: any) {
//     next(e);
//   }
// };

// export const carrierUpdate = async (req: Request, res: Response, next: NextFunction) => {
//   /*
//     #swagger.tags = ['V3 - Carrier']
//     #swagger.description = 'Update carrier'
//     #swagger.operationId = 'updateCarrier'
//     #swagger.parameters['x-auth-token'] = {
//       in: 'header',
//       description: 'JWT token',
//     }
//     #swagger.parameters['id'] = {
//       in: 'path',
//       description: 'Carrier ID',
//       required: true,
//     }
//     #swagger.requestBody = {
//       required: true,
//       schema: {$ref: '#/definitions/V3CarrierUpdateBody'}
//     }
//     #swagger.responses[200] = {
//       schema: {$ref: '#/definitions/V3CarrierUpdate'}
//     }
//   */
//   const validatedCarrierId = validateId(req.params.id);
//   if (typeof validatedCarrierId == 'string') {
//     return res.status(400).send({ message: 'Neplatné id' });
//   }
//   const { error } = validateRequestBodyUpdate(req.body);
//   if (error) {
//     return res.status(400).send(error.details[0].message);
//   }
//   const { dispatchers, dispatcherVehicles, places, ...carrier } = req.body as CarrierBodyUpdate;
//   try {
//     const updatedCarrier = await updateCarrier(validatedCarrierId, carrier, dispatchers, dispatcherVehicles, places);
//     if (updatedCarrier === null) return res.status(404).send({ message: 'Dopravce s požadovaným ID neexistuje' });

//     invalidateTag('Carriers');
//     res.json(updatedCarrier);
//   } catch (e: any) {
//     next(e);
//   }
// };

export const carrierDelete = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['V3 - Carrier']
    #swagger.description = 'Delete carrier'
    #swagger.operationId = 'deleteCarrier'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Carrier ID',
      required: true,
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/V3CarrierDelete'}
    }
  */
  const validatedCarrierId = validateId(req.params.id);
  if (typeof validatedCarrierId == 'string') return res.status(400).send({ message: 'Neplatné id' });
  if (typeof validatedCarrierId == 'string') return res.status(400).send({ message: 'Neplatné id' });

  try {
    const removedCarrier = await carrierService.deleteCarrier(validatedCarrierId);

    invalidateTag('Carriers');
    invalidateTag('Carriers');
    res.json(removedCarrier);
  } catch (e: any) {
    next(e);
  }
};

export const carriersList = async (_req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['V3 - Carrier']
    #swagger.description = 'Get list of carriers'
    #swagger.operationId = 'getCarrierList'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/V3CarrierList'},
    }
    */

  try {
    const carrierList = await getCarrierList();
    return res.json(carrierList);
  } catch (e: any) {
    next(e);
  }
};

export const carriersExportToCsv = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['V3 - Carrier']
    #swagger.description = 'Get carriers and export to CSV'
    #swagger.operationId = 'getCarriersCsv'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
  */
  const { error } = validateParameters(req.query);
  if (error) return res.status(400).send({ message: error.details[0].message });
  try {
    const { carriers } = await carrierService.listCarriers(req.query);
    if (carriers == null || carriers.length === 0) {
      return res.status(404).send({ message: 'Dopravce se nepodařilo načíst' });
    }
    const fields = [
      { label: 'číslo', value: 'number' },
      { label: 'firma', value: 'company' },
      { label: 'ulice', value: 'place.street' },
      { label: 'psč', value: 'place.postalCode' },
      { label: 'země', value: 'place.country' },
      {
        label: 'poslední změna',
        value: 'ts_edited',
        formatter: (val: number) =>
          moment
            .unix(Math.floor(Number(val) / 1000))
            .tz('Europe/Prague')
            .format('DD.MM.YYYY'),
      },
      { label: 'poznámka', value: 'note' },
    ];
    return downloadCsv(res, 'carriers', fields, carriers);
  } catch (e: any) {
    next(e);
  }
};

export const carrierEmailEnquiry = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['V3 - Carrier']
    #swagger.description = 'Send enquiry email to multiple carriers and create enquiry'
    #swagger.operationId = 'sendEnquiryEmail'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.requestBody = {
      required: true,
      schema: {$ref: '#/definitions/V3CarrierEnquiryEmailBody'}
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/V3CarrierEnquiryEmailResponse'}
    }
  */
  try {
    const { error } = validateEnquiryEmailBody(req.body);
    if (error) throw new InvalidBodyException(error.details);

    const body = req.body as CarrierEmailEnquiryEmailRequestBody;

    const createdEnquiry = await buildAndCreateEnquiry(body);

    const receivers = await getDispatchersByIds(body.to.map(({ dispatcherId }) => dispatcherId));

    const sentStates: Record<string, boolean> = {};

    const dispatcherUser = await userService.getUser({ email: req.body.dispatcher.email });
    if (!dispatcherUser) {
      throw new NotFoundException(Entity.USER);
    }
    const sender = await userService.getQaplineUserInfoForEmail(dispatcherUser.user_id);
    if (!sender) throw new NotFoundException(Entity.USER);

    for (const receiver of receivers) {
      if (sentStates[receiver.user.email]) {
        continue;
      }
      const lang = await getDispatcherLang(receiver.dispatcher_id);
      const email: TBaseMail = {
        sender,
        to: [receiver.user.email],
        attachments: [],
      };

      //const emailBody = await addLinkToEnquiryEmail(receiver, body.body[lang], createdEnquiry.enquiry_id);
      const emailBody = body.body[lang];

      try {
        await sendEnquiryMail(email, emailBody, req.body.subject);
        sentStates[receiver.user.email] = true;
      } catch (error) {
        sentStates[receiver.user.email] = false;
      }
    }

    res.send({ sentStates, enquiry: createdEnquiry });
  } catch (e) {
    next(e);
  }
};

export const carrierSendOnboardingEmail = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['V3 - Carrier']
    #swagger.description = 'Send onboarding email to multiple carriers'
    #swagger.operationId = 'sendOnboardingEmail'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.requestBody = {
      required: true,
      schema: {$ref: '#/definitions/V3CarrierOnboardingEmailBody'}
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/V3CarrierOnboardingEmailResponse'}
    }
  */
  try {
    const { error } = validateOnboardingEmailBody(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const { to, carrier_id, dispatcher } = req.body as OnboardingEmailBody;

    const carrierExists = await carrierService.getCarrier(carrier_id);
    if (!carrierExists) {
      return res.status(404).send({
        message: `Dopravce s id[${carrier_id}] neexistuje`,
      });
    }

    const tokens = await generateOnboardingTokens(to, carrier_id);
    const responses = await sendOnboardingMails(to, tokens, dispatcher);

    const response: Record<string, boolean> = {};

    responses.forEach(({ rejectedEmails, successfulEmails }) => {
      successfulEmails.forEach((email) => {
        response[email] = true;
      });
      rejectedEmails.forEach((email) => {
        response[email] = false;
      });
    });

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
