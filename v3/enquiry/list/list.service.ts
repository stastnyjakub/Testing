import { Prisma } from '@prisma/client';

import prisma from '../../db/client';
import { getExcludeDeletedDispatchers } from '../enquiry.helpers';
import {
  EnquiryState,
  EnquiryStateForDispatcher,
  IGetEnquiryForAdminResult,
  IGetEnquiryForDispatcherResult,
} from '../enquiry.interface';

import { getSearchQuery } from './list.helpers';
import { TListRequestQuery } from './list.interface';

export async function listEnquiries(
  data: Partial<TListRequestQuery>,
  dispatcherId: number,
): Promise<{ data: IGetEnquiryForDispatcherResult[]; totalCount: number }>;
export async function listEnquiries(
  data: Partial<TListRequestQuery>,
  dispatcherId?: null,
): Promise<{ data: IGetEnquiryForAdminResult[]; totalCount: number }>;
export async function listEnquiries(
  data: Partial<TListRequestQuery>,
  dispatcherId: number | null = null,
): Promise<{ data: (IGetEnquiryForDispatcherResult | IGetEnquiryForAdminResult)[]; totalCount: number }> {
  const mandatoryFilterCriteria: Prisma.enquiryWhereInput[] = [];
  if (data.state && !dispatcherId) {
    mandatoryFilterCriteria.push({
      state: {
        in: data.state as EnquiryState[],
      },
    });
  }

  if (dispatcherId) {
    mandatoryFilterCriteria.push({
      contactedDispatchers: {
        some: {
          AND: [
            {
              dispatcher_id: {
                equals: dispatcherId,
              },
            },
            ...(data.state ? [{ state: { equals: data.state[0] as EnquiryStateForDispatcher } }] : []),
          ],
        },
      },
    });
  }

  const searchQuery = getSearchQuery(data?.search, dispatcherId);

  const enquiries = await prisma.enquiry.findMany({
    where: {
      AND: [...searchQuery, ...mandatoryFilterCriteria],
    },
    orderBy: {
      tsAdded: 'desc',
    },
    ...(data.offset && { skip: Number(data.offset) }),
    ...(data.limit && { take: Number(data.limit) }),
    include: {
      contactedDispatchers: {
        ...getExcludeDeletedDispatchers(),
        include: {
          dispatcher: {
            include: {
              carrier: true,
              place: true,
            },
          },
        },
      },
      offers: {
        where: {
          AND: [
            getExcludeDeletedDispatchers().where,
            ...(dispatcherId
              ? [
                  {
                    dispatcher_id: dispatcherId,
                  },
                ]
              : []),
          ],
        },
        include: {
          dispatcher: {
            include: {
              carrier: true,
            },
          },
        },
      },
      commission: {
        include: {
          commissionitem: true,
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
        },
      },
    },
  });
  const enquiriesCount = await prisma.enquiry.count({
    where: {
      AND: [...searchQuery, ...mandatoryFilterCriteria],
    },
  });

  if (!dispatcherId) {
    return {
      data: enquiries as unknown as IGetEnquiryForAdminResult[],
      totalCount: enquiriesCount,
    };
  }

  const result = enquiries.map((enquiry) => {
    const state = enquiry.contactedDispatchers.find(({ dispatcher_id }) => dispatcher_id === dispatcherId)?.state;
    return {
      ...enquiry,
      // Remove fields which are not supposed to be sent to the dispatcher
      contactedDispatchers: undefined,
      state,
    };
  }) as unknown as IGetEnquiryForDispatcherResult[];
  return {
    data: result,
    totalCount: enquiriesCount,
  };
}
