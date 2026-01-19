import { NextFunction, Request, Response } from 'express';

import { sendEnquiryMail } from '@/carrier/enquiryEmail/enquiryEmail.service';
import { getDispatcherLang, getDispatchersByIds } from '@/dispatcher/dispatcher.service';
import { Entity, NotFoundException } from '@/errors';
import { TBaseMail } from '@/mail/mail.interface';
import * as userService from '@/user/user.service';
import { getParamsId } from '@/utils';
import { assertAuthenticatedUser } from '@/utils/validation/assertAuthenticated';

import { listEnquiries } from './list/list.service';
import { updateEnquiry } from './update/update.service';
import { TCreateRequestBody, TEnquiryParameters } from './enquiry.interface';
import {
  validateCloseBody,
  validateContactDispatchersBody,
  validateCreateBody,
  validateListQuery,
  validateUpdateBody,
} from './enquiry.model';
import { closeEnquiry, createEnquiry, deleteEnquiry, getEnquiry, reopenEnquiry } from './enquiry.service';

export const get = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Enquiry']
    #swagger.description = 'Lets you get an enquiry by ID'
      #swagger.parameters['x-auth-token'] = {
        in: 'header',
        description: 'JWT token',
      }
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'enquiry ID',
        required: true,
      }
      #swagger.responses[200] = {
        schema: {$ref: '#/definitions/EnquiryGetResponse'},
      }
   */
  try {
    const enquiryId = getParamsId(req);
    // const isDispatcher = req.auth.payload.role === AuthRole.DISPATCHER;
    // const dispatcherId: number | null = isDispatcher
    //   ? (req.auth.payload as TokenPayloadDispatcher).dispatcher_id
    //   : null;

    // if (isDispatcher) {
    //   const canView = await authorizeDispatcherForEnquiryGet(req.auth.payload as TokenPayloadDispatcher, enquiryId);
    //   if (!canView) throw new UnauthorizedException();
    // }

    const enquiry = await getEnquiry(enquiryId);

    res.json(enquiry);
  } catch (e) {
    next(e);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Enquiry']
    #swagger.description = 'List enquiries'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['state'] = {
      in: 'query',
      description: 'Filter by state',
      type: 'string'
    }
    #swagger.parameters['search'] = {
      in: 'query',
      description: 'Search by fields',
      type: 'string'
    }
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Limit the number of results',
      type: 'number'
    }
    #swagger.parameters['offset'] = {
      in: 'query',
      description: 'Skip the first N results',
      type: 'number'
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/EnquiryListResponse'},
    }
   */
  try {
    const query = validateListQuery(req.query);

    // const dispatcherId: number | null =
    //   req.auth.payload.role === AuthRole.DISPATCHER ? req.auth.payload.dispatcher_id : null;

    const enquiries = await listEnquiries(query);

    res.json(enquiries);
  } catch (e) {
    next(e);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Enquiry']
    #swagger.description = 'Create enquiry'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.requestBody = {
      required: true,
      schema: {$ref: '#/definitions/EnquiryCreateRequest'}
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/EnquirySimpleResponse'},
    }
  */
  try {
    const body = validateCreateBody(req.body);

    const enquiry = await createEnquiry(body);

    return res.json(enquiry);
  } catch (e) {
    next(e);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Enquiry']
    #swagger.description = 'Update enquiry'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.requestBody = {
      required: true,
      schema: {$ref: '#/definitions/EnquiryUpdateRequest'}
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/EnquirySimpleResponse'},
    }
  */
  try {
    const enquiryId = getParamsId(req);
    const body = validateUpdateBody(req.body);

    const updatedEnquiry = await updateEnquiry(
      { ...body, enquiry_id: enquiryId },
      // { notifyDispatchersOnParamsChange: true, adminId: (req.auth.payload as TokenPayloadUser).user_id },
    );

    res.json(updatedEnquiry);
  } catch (e) {
    next(e);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Enquiry']
    #swagger.description = 'Delete enquiry'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token'
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'enquiry ID',
      required: true,
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/EnquirySimpleResponse'},
    }
  */
  try {
    const enquiryId = getParamsId(req);

    const deletedCommission = await deleteEnquiry(enquiryId);

    res.json(deletedCommission);
  } catch (e) {
    next(e);
  }
};

export const contactDispatchers = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Enquiry']
    #swagger.description = 'Contact dispatchers'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token'
    }
    #swagger.requestBody = {
      required: true,
      schema: {$ref: '#/definitions/EnquiryContactDispatchersRequest'}
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/EnquiryContactDispatchersResponse'},
    }
  */
  try {
    const { enquiryId, body, dispatcher, dispatcherIds, subject, parameters } = validateContactDispatchersBody(
      req.body,
    );

    // Check if enquiry exists
    const enquiry = await getEnquiry(enquiryId);

    const mergedParameters: TEnquiryParameters = {
      ...(enquiry.parameters as NonNullable<TCreateRequestBody['parameters']>),
    };

    if (parameters) {
      Object.keys(parameters).forEach((key) => {
        const value = parameters[key as keyof typeof parameters];
        if (value !== undefined) {
          (mergedParameters as any)[key] = value;
        }
      });
    }

    const receivers = await getDispatchersByIds(dispatcherIds);
    // Add contacted dispatchers to the enquiry
    const _updatedEnquiry = await updateEnquiry({
      enquiry_id: enquiryId,
      parameters: mergedParameters,
      contactedDispatchers: {
        add: dispatcherIds,
      },
    });

    // Send emails to dispatchers
    const sentStates: Record<string, boolean> = {};

    const dispatcherUser = await userService.getUser({ email: dispatcher.email });
    if (!dispatcherUser) throw new NotFoundException(Entity.USER);

    const sender = await userService.getQaplineUserInfoForEmail(dispatcherUser.user_id);
    if (!sender) throw new NotFoundException(Entity.USER);

    for (const receiver of receivers) {
      const lang = await getDispatcherLang(receiver.dispatcher_id);
      const email: TBaseMail = {
        to: [receiver.user.email],
        sender: sender,
        attachments: [],
        lang,
      };
      //const emailBody = await addLinkToEnquiryEmail(receiver, body[lang], updatedEnquiry.enquiry_id);
      const emailBody = body[lang];

      try {
        await sendEnquiryMail(email, emailBody, subject);
        sentStates[receiver.user.email] = true;
      } catch (_) {
        sentStates[receiver.user.email] = false;
      }
    }

    // Remove dispatchers that did not receive the email
    const didNotReceive = receivers.filter((receiver) => !sentStates[receiver.user.email]);
    if (didNotReceive.length > 0) {
      await updateEnquiry({
        enquiry_id: enquiryId,
        contactedDispatchers: {
          remove: didNotReceive.map((receiver) => receiver.dispatcher_id),
        },
      });
    }

    res.json(sentStates);
  } catch (e) {
    next(e);
  }
};

export const close = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Enquiry']
    #swagger.description = 'Close enquiry'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token'
    }
    #swagger.requestBody = {
      required: true,
      schema: {$ref: '#/definitions/EnquiryCloseRequest'}
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/EnquirySimpleResponse'},
    }
  */
  try {
    assertAuthenticatedUser(req.auth);
    const body = validateCloseBody(req.body);

    const enquiry = await closeEnquiry(body, req.auth.payload.userId);
    res.status(200).json(enquiry);
  } catch (e) {
    next(e);
  }
};

export const reopen = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Enquiry']
    #swagger.description = 'Reopen enquiry'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token'
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'enquiry ID',
      required: true,
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/EnquirySimpleResponse'},
    }
  */
  try {
    const enquiryId = getParamsId(req);

    const enquiry = await reopenEnquiry(enquiryId);
    res.status(200).json(enquiry);
  } catch (e) {
    next(e);
  }
};
