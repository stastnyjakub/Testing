import { Prisma } from '@prisma/client';
import moment from 'moment';

import prisma from '@/db/client';
import { EnquiryStateForDispatcher } from '@/enquiry/enquiry.interface';
import { getEnquiry } from '@/enquiry/enquiry.service';
import { Entity, NotFoundException } from '@/errors';
import { performTransaction } from '@/utils';

import { checkDispatcherCanCreateOffer, checkOfferAlreadyCreated } from './offer.helpers';
import { CreateBody, UpdateOfferParams } from './offer.interface';

export const findOffer = async (where: Prisma.offerWhereInput, include?: Prisma.offerInclude) => {
  const enquiry = await prisma.offer.findFirst({
    where,
    include,
  });

  return enquiry;
};

export const getOffer = async (offerId: number) => {
  const offer = await prisma.offer.findUnique({
    where: {
      offer_id: offerId,
    },
    include: {
      dispatcher: true,
      enquiry: true,
    },
  });

  if (!offer) throw new NotFoundException(Entity.OFFER);

  return offer;
};

export const createOffer = async (data: CreateBody) => {
  // Check if enquiry exists
  await getEnquiry(data.enquiryId);

  // Dispatcher must have been contacted to make an offer
  await checkDispatcherCanCreateOffer(data);

  await checkOfferAlreadyCreated(data.enquiryId, data.dispatcherId);

  const result = await performTransaction(async (transaction) => {
    const createdOffer = await transaction.offer.create({
      data: {
        currency: data.currency,
        price: data.price ?? 0,
        response: data.response,
        preferenced: false,
        enquiry: {
          connect: {
            enquiry_id: data.enquiryId,
          },
        },
        dispatcher: {
          connect: {
            dispatcher_id: data.dispatcherId,
          },
        },
        tsAdded: moment().unix(),
      },
      include: {
        dispatcher: true,
        enquiry: true,
      },
    });
    await transaction.enquirydispatcher.updateMany({
      where: {
        dispatcher_id: data.dispatcherId,
        enquiry_id: data.enquiryId,
      },
      data: {
        state: EnquiryStateForDispatcher.RESPONDED,
      },
    });
    return createdOffer;
  });
  return result;
};

export const updateOffer = async (data: UpdateOfferParams) => {
  // Check if offer exists
  await getOffer(data.offerId);

  const updatedOffer = await prisma.offer.update({
    where: {
      offer_id: data.offerId,
    },
    data: {
      preferenced: data.preferenced,
      note: data.note,
    },
  });

  return updatedOffer;
};

export const deleteOffer = async (offerId: number) => {
  // Check if offer exists
  await getOffer(offerId);

  const result = await performTransaction(async (transaction) => {
    const deletedOffer = await transaction.offer.delete({
      where: {
        offer_id: offerId,
      },
    });
    await transaction.enquirydispatcher.updateMany({
      where: {
        dispatcher_id: deletedOffer.dispatcher_id,
        enquiry_id: deletedOffer.enquiry_id,
      },
      data: {
        state: EnquiryStateForDispatcher.NEW,
      },
    });
    return deletedOffer;
  });

  return result;
};
