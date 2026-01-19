import { findEnquiry } from '../enquiry/enquiry.service';
import { UnauthorizedException } from '../errors';

import { CreateBody } from './offer.interface';
import { findOffer } from './offer.service';

export const checkDispatcherCanCreateOffer = async (body: CreateBody) => {
  const isContacted = Boolean(
    await findEnquiry({
      enquiry_id: body.enquiryId,
      contactedDispatchers: {
        some: {
          dispatcher_id: body.dispatcherId,
        },
      },
    }),
  );
  if (!isContacted) throw new UnauthorizedException('offer.notContacted');
  return isContacted;
};

export const checkOfferAlreadyCreated = async (enquiryId: number, dispatcherId: number) => {
  const alreadyCreatedOffer = Boolean(
    await findOffer({
      enquiry_id: enquiryId,
      dispatcher_id: dispatcherId,
    }),
  );
  if (alreadyCreatedOffer) throw new UnauthorizedException('offer.alreadyCreated');
  return alreadyCreatedOffer;
};

export const checkDispatcherCanDelete = async (offerId: number, dispatcherId: number) => {
  const isCreator = Boolean(
    await findOffer({
      offer_id: offerId,
      dispatcher_id: dispatcherId,
    }),
  );
  if (!isCreator) throw new UnauthorizedException();
  return isCreator;
};
