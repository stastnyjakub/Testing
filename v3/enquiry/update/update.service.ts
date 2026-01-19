import * as commissionService from '@/commission/commission.service';
import prisma from '@/db/client';
import * as dispatcherService from '@/dispatcher/dispatcher.service';
import { Entity, HttpException, NotFoundException } from '@/errors';
import { t } from '@/middleware/i18n';
import { Lang } from '@/types';
import { getUserSelect } from '@/user/user.utils';
import { generateLoginLink } from '@/utils';

import { getEnquiry } from '../enquiry.service';

import { TUpdateRequestBody, UpdateParams } from './update.interface';

export type IUpdateEnquiryOptions =
  | {
      notifyDispatchersOnParamsChange?: false;
    }
  | {
      notifyDispatchersOnParamsChange: true;
      adminId: number;
    };
export const updateEnquiry = async (data: UpdateParams, options: IUpdateEnquiryOptions = {}) => {
  // Check if enquiry exists
  const enquiryBeforeUpdate = await getEnquiry(data.enquiry_id);

  const dispatchersToAdd =
    data.contactedDispatchers?.add?.map((dispatcher_id) => ({
      dispatcher_id: dispatcher_id,
    })) || [];

  dispatchersToAdd.forEach(async (dispatcherToAdd) => {
    const found = await prisma.dispatcher.findUnique({ where: { dispatcher_id: dispatcherToAdd.dispatcher_id } });
    if (!found)
      throw new HttpException(400, {
        key: 'enquiry.cannotAddDispatcher',
        values: { id: dispatcherToAdd.dispatcher_id },
      });
  });

  const contactedDispatchers = await prisma.enquirydispatcher.findMany({
    where: {
      enquiry_id: data.enquiry_id,
    },
  });

  if (data?.contactedDispatchers?.add && data.contactedDispatchers.add.length > 0) {
    const alreadyContacted = contactedDispatchers.find((cd) =>
      data.contactedDispatchers?.add?.includes(cd.dispatcher_id),
    );
    if (alreadyContacted)
      throw new HttpException(400, {
        key: 'enquiry.dispatcherAlreadyContacted',
        values: { id: alreadyContacted.dispatcher_id },
      });
  }

  const dispatchersToRemove =
    data.contactedDispatchers?.remove?.map((dispatcher_id) => ({
      enquirydispatcher_id: (function () {
        const found = contactedDispatchers.find((cd) => cd.dispatcher_id === dispatcher_id);
        if (!found)
          throw new HttpException(400, { key: 'enquiry.cannotRemoveDispatcher', values: { id: dispatcher_id } });

        return found.enquirydispatcher_id;
      })(),
    })) || [];

  const updatedEnquiry = await prisma.enquiry.update({
    where: {
      enquiry_id: data.enquiry_id,
    },
    data: {
      state: data.state,
      parameters: data.parameters,
      note: data.note,
      contactedDispatchers: {
        createMany: {
          data: dispatchersToAdd,
        },
        deleteMany: dispatchersToRemove,
      },
    },
  });

  if (options.notifyDispatchersOnParamsChange) {
    await checkParametersAndNotifyDispatchers(
      data.enquiry_id,
      options.adminId,
      enquiryBeforeUpdate.parameters as TUpdateRequestBody['parameters'],
    );
  }

  return updatedEnquiry;
};

export const checkParametersAndNotifyDispatchers = async (
  enquiryId: number,
  adminId: number,
  oldParameters?: TUpdateRequestBody['parameters'],
) => {
  const {
    parameters: newParameters,
    contactedDispatchers,
    number: enquiryNumber,
    commission_id,
  } = await getEnquiry(enquiryId);
  const commission = await commissionService.getOneCommission(commission_id);
  if (!commission) throw new NotFoundException(Entity.COMMISSION);

  const isSomePropertyDifferent = JSON.stringify(oldParameters) !== JSON.stringify(newParameters);
  if (!isSomePropertyDifferent) return;

  const firstLoadingCity = commission.commissionloading?.[0]?.location?.city || '-';
  const lastDischargeCity =
    commission.commissiondischarge?.[commission.commissiondischarge?.length - 1]?.location?.city || '-';

  return await Promise.all(
    contactedDispatchers.map(async ({ dispatcher_id }) => {
      const searchedDispatcher = await prisma.dispatcher.findUnique({
        where: {
          dispatcher_id,
        },
        include: {
          user: {
            select: getUserSelect(),
          },
        },
      });
      if (!searchedDispatcher) throw new NotFoundException(Entity.DISPATCHER);
      const languageCode = searchedDispatcher.user.contactInfo?.language.languageCode;
      if (!languageCode) throw new NotFoundException(Entity.LANGUAGE);

      const loginLinkToEnquiry = generateLoginLink({ enquiryId: enquiryId, email: searchedDispatcher.user.email });

      return dispatcherService.buildAndSendEmail(
        {
          body: t('enquiryParametersChangeMail.body', languageCode, {
            enquiryNumber: enquiryNumber,
            loadingCity: firstLoadingCity,
            dischargeCity: lastDischargeCity,
            link: loginLinkToEnquiry,
          }),
          dispatcherId: dispatcher_id,
          subject: t('enquiryParametersChangeMail.subject', languageCode, {
            enquiryNumber: enquiryNumber,
          }),
          lang: languageCode as Lang,
        },
        adminId,
      );
    }),
  );
};
