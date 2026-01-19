import { Dispatcher, offer, Prisma } from '@prisma/client';
import moment from 'moment';

import * as commissionService from '@/commission/commission.service';
import { ECommissionState } from '@/commission/types';
import prisma from '@/db/client';
import { buildAndSendEmail, getDispatcherLang } from '@/dispatcher/dispatcher.service';
import * as dispatcherService from '@/dispatcher/dispatcher.service';
import { Entity, HttpException, NotFoundException } from '@/errors';
import { t } from '@/middleware/i18n';
import { findOffer } from '@/offer/offer.service';
import { generateLoginLink, omitObjectValues, performTransaction } from '@/utils';

import { getExcludeDeletedDispatchers } from './enquiry.helpers';
import {
  EnquiryState,
  EnquiryStateForDispatcher,
  IGetEnquiryForAdminResult,
  IGetEnquiryForDispatcherResult,
  TCloseRequestBody,
  TCreateRequestBody,
} from './enquiry.interface';

export const findEnquiry = async (where: Prisma.enquiryWhereInput) => {
  const enquiry = await prisma.enquiry.findFirst({
    where,
  });

  return enquiry;
};

export async function getEnquiry(id: number, dispatcherId: number): Promise<IGetEnquiryForDispatcherResult>;
export async function getEnquiry(id: number, dispatcherId?: null): Promise<IGetEnquiryForAdminResult>;
export async function getEnquiry(
  id: number,
  dispatcherId: number | null = null,
): Promise<IGetEnquiryForAdminResult | IGetEnquiryForDispatcherResult> {
  const enquiry = await prisma.enquiry.findUnique({
    where: {
      enquiry_id: id,
    },
    include: {
      ...(dispatcherId
        ? {
            offers: {
              where: {
                dispatcher_id: dispatcherId,
              },
            },
          }
        : {
            offers: {
              ...getExcludeDeletedDispatchers(),
              include: {
                dispatcher: {
                  include: {
                    carrier: true,
                    _count: {
                      select: {
                        vehicles: true,
                      },
                    },
                  },
                },
              },
            },
          }),
      contactedDispatchers: {
        ...getExcludeDeletedDispatchers(),
        include: {
          dispatcher: {
            include: {
              carrier: true,
              _count: {
                select: {
                  vehicles: true,
                },
              },
            },
          },
        },
      },
      commission: {
        include: {
          commissiondischarge: {
            include: {
              location: true,
            },
          },
          commissionloading: {
            include: {
              location: true,
            },
          },
          commissionitem: true,
        },
      },
    },
  });
  if (!enquiry) throw new NotFoundException(Entity.ENQUIRY);

  if (!dispatcherId) {
    return enquiry as unknown as IGetEnquiryForAdminResult;
  }

  const enquiryStateForDispatcher = enquiry.contactedDispatchers.find(
    ({ dispatcher_id }) => dispatcher_id === dispatcherId,
  )?.state as EnquiryStateForDispatcher;
  return {
    ...enquiry,
    contactedDispatchers: undefined,
    state: enquiryStateForDispatcher,
  } as unknown as IGetEnquiryForDispatcherResult;
}

export const createEnquiry = async (data: TCreateRequestBody) => {
  // Check if commission exists
  const commission = await commissionService.getOneCommission(data.commission_id);
  if (!commission) {
    throw new NotFoundException(Entity.COMMISSION);
  }

  // Check if enquiry already exists
  if (await findEnquiry({ commission_id: data.commission_id })) {
    throw new HttpException(400, 'enquiry.alreadyExists');
  }

  const enquiry = await prisma.enquiry.create({
    data: {
      number: commission.commission_id,
      commission: {
        connect: {
          commission_id: data.commission_id,
        },
      },
      contactedDispatchers: {
        createMany: {
          data: data.contactedDispatchers.map((id) => ({
            dispatcher_id: id,
          })),
        },
      },
      state: EnquiryState.OPENED,
      parameters: data.parameters ?? Prisma.JsonNull,
      tsAdded: moment().unix(),
    },
  });

  return enquiry;
};

export const deleteEnquiry = async (id: number) => {
  // Check if enquiry exists
  await getEnquiry(id);

  const enquiry = await prisma.enquiry.delete({
    where: {
      enquiry_id: id,
    },
  });

  return enquiry;
};

export const reopenEnquiry = async (enquiryId: number) => {
  // Check if enquiry exists
  const enquiry = await getEnquiry(enquiryId);

  if (enquiry.state !== EnquiryState.CLOSED) {
    throw new HttpException(400, 'enquiry.notClosed');
  }

  const { updatedEnquiry } = await executeReopenTransaction(enquiryId);

  return updatedEnquiry;
};

export const closeEnquiry = async (data: TCloseRequestBody, userId: number) => {
  const offer = await findOffer({
    offer_id: data.offerId,
  });
  if (!offer) throw new NotFoundException(Entity.OFFER);

  const enquiry = await getEnquiry(offer?.enquiry_id);
  if (!enquiry) throw new NotFoundException(Entity.ENQUIRY);

  const dispatcher = await dispatcherService.getDispatcher({ dispatcherId: offer.dispatcher_id });
  if (!dispatcher) throw new NotFoundException(Entity.DISPATCHER);

  if (enquiry.state === EnquiryState.CLOSED) {
    throw new HttpException(400, 'enquiry.alreadyClosed');
  }

  const { closedEnquiry } = await executeCloseTransaction(data, offer, userId);

  await Promise.all(
    closedEnquiry.offers.map(async (offer) => {
      const lang = await getDispatcherLang(offer.dispatcher_id);
      const enquiryLink = generateLoginLink({
        email: dispatcher.user.email,
        enquiryId: closedEnquiry.enquiry_id,
      });
      return buildAndSendEmail(
        {
          body: t(offer.preferenced ? 'enquiry.emailWinnerBody' : 'enquiry.emailLooserBody', lang, {
            enquiryNumber: closedEnquiry.number,
            enquiryLink: enquiryLink,
            loadingCity: closedEnquiry.commission.commissionloading?.[0]?.location?.city,
            dischargeCity: closedEnquiry.commission.commissiondischarge?.[0]?.location?.city,
          }),
          subject: t(offer.preferenced ? 'enquiry.emailWinnerSubject' : 'enquiry.emailLooserSubject', lang, {
            enquiryNumber: closedEnquiry.number,
          }),
          dispatcherId: offer.dispatcher_id,
          lang: await getDispatcherLang(offer.dispatcher_id),
        },
        userId,
      );
    }),
  );

  const trimmedClosedEnquiry = omitObjectValues(closedEnquiry, 'commission', 'offers');

  return trimmedClosedEnquiry;
};

const executeCloseTransaction = async (
  data: TCloseRequestBody,
  offer: offer & { dispatcher?: Dispatcher },
  userId: number,
) => {
  const { closedEnquiry, updatedCommission } = await performTransaction(async (transaction) => {
    const closedEnquiry = await transaction.enquiry.update({
      where: {
        enquiry_id: offer.enquiry_id,
      },
      data: {
        state: EnquiryState.CLOSED,
        offers: {
          update: {
            where: {
              offer_id: data.offerId,
            },
            data: {
              preferenced: true,
            },
          },
        },
        contactedDispatchers: {
          updateMany: [
            {
              where: {
                dispatcher_id: {
                  not: offer.dispatcher_id,
                },
              },
              data: {
                state: EnquiryStateForDispatcher.CLOSED,
              },
            },
            {
              where: {
                dispatcher_id: offer.dispatcher_id,
              },
              data: {
                state: EnquiryStateForDispatcher.WON,
              },
            },
          ],
        },
      },
      include: {
        commission: {
          include: {
            commissionloading: {
              take: 1,
              orderBy: {
                commissionLoading_id: 'asc',
              },
              include: {
                location: true,
              },
            },
            commissiondischarge: {
              take: 1,
              orderBy: {
                commissionDischarge_id: 'desc',
              },
              include: {
                location: true,
              },
            },
          },
        },
        offers: {
          ...getExcludeDeletedDispatchers(),
          include: {
            dispatcher: true,
          },
        },
      },
    });
    const commission = await commissionService.getOneCommission(closedEnquiry.commission_id);
    if (!commission) {
      throw new NotFoundException(Entity.COMMISSION);
    }
    const strippedCommission = omitObjectValues(
      commission,
      'commissionPriceEstimations',
      'attachments',
      'enquiry',
      'addedBy',
      'carrierAssignedBy',
    );

    const dispatcher = await dispatcherService.getDispatcher({ dispatcherId: offer.dispatcher_id });
    if (!dispatcher) {
      throw new NotFoundException(Entity.DISPATCHER);
    }

    const updatedCommission = await commissionService.updateCommission(
      closedEnquiry.commission_id,
      {
        ...strippedCommission,
        commissiondischarge: {},
        commissionitem: {},
        commissionloading: {},
        state: ECommissionState.Complete,
        carrier_id: dispatcher.carrier_id,
        carrierAssignedBy_id: userId,
        carrierDriver: null,
        carrierGsm: null,
        carrierRegistrationPlate: null,
        dispatcher_id: offer.dispatcher_id,
        priceCarrier: offer.price ? offer.price : null,
        currencyCarrier: offer.currency,
      },
      { toCreate: [], toUpdate: [], toDelete: [] },
      { toCreate: [], toUpdate: [], toDelete: [] },
      { toCreate: [], toUpdate: [], toDelete: [] },
      transaction,
    );

    return { closedEnquiry, updatedCommission };
  });
  return { closedEnquiry, updatedCommission };
};

const executeReopenTransaction = async (enquiryId: number) => {
  const { updatedCommission, updatedEnquiry } = await performTransaction(async (transaction) => {
    const enquiry = await getEnquiry(enquiryId);
    Promise.all(
      enquiry.contactedDispatchers.map(async (item) => {
        const offer = enquiry.offers.find((offer) => offer.dispatcher_id === item.dispatcher_id);
        return transaction.enquirydispatcher.update({
          where: {
            enquirydispatcher_id: item.enquirydispatcher_id,
          },
          data: {
            state: offer ? EnquiryStateForDispatcher.RESPONDED : EnquiryStateForDispatcher.NEW,
          },
        });
      }),
    );

    const updatedEnquiry = await transaction.enquiry.update({
      where: {
        enquiry_id: enquiryId,
      },
      data: {
        state: EnquiryState.OPENED,
        offers: {
          updateMany: [
            {
              where: {
                preferenced: true,
              },
              data: {
                preferenced: false,
              },
            },
          ],
        },
      },
      include: {
        commission: true,
        contactedDispatchers: {
          ...getExcludeDeletedDispatchers(),
          include: {
            dispatcher: true,
          },
        },
        offers: {
          ...getExcludeDeletedDispatchers(),
          include: {
            dispatcher: true,
          },
        },
      },
    });

    const updatedCommission = await commissionService.updateCommission(
      updatedEnquiry.commission_id,
      {
        commissiondischarge: {},
        commissionitem: {},
        commissionloading: {},
        state: ECommissionState.InComplete,
        carrier_id: null,
        carrierDriver: null,
        carrierGsm: null,
        carrierRegistrationPlate: null,
        carrierAssignedBy_id: null,
        dispatcher_id: null,
        priceCarrier: null,
        currencyCarrier: null,
      },
      { toCreate: [], toUpdate: [], toDelete: [] },
      { toCreate: [], toUpdate: [], toDelete: [] },
      { toCreate: [], toUpdate: [], toDelete: [] },
      transaction,
    );

    return { updatedEnquiry, updatedCommission };
  });
  return { updatedCommission, updatedEnquiry };
};
