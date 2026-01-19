import { Prisma } from '@prisma/client';

import { EnquiryState, EnquiryStateForDispatcher } from '../enquiry.interface';

const isNumber = (value: any) => !isNaN(Number(value));

const createInsensitiveContainsQuery = (value: string): Prisma.StringFilter => ({
  contains: value,
  mode: 'insensitive',
});

const createDispatcherQuery = (value: string): Prisma.DispatcherWhereInput => ({
  user: {
    OR: [
      { name: createInsensitiveContainsQuery(value) },
      { surname: createInsensitiveContainsQuery(value) },
      { email: createInsensitiveContainsQuery(value) },
      { contactInfo: { phone: createInsensitiveContainsQuery(value) } },
    ],
  },
});

const createLocationQuery = (value: string) => ({
  OR: [
    {
      company: createInsensitiveContainsQuery(value),
    },
    {
      city: createInsensitiveContainsQuery(value),
    },
  ],
});

export const getSearchQuery = (searchValue?: any, dispatcherId?: number | null) => {
  if (!searchValue) return [];
  const searchString: string = searchValue.toString();
  const searchQuery: {
    where: {
      OR: Array<Prisma.enquiryWhereInput>;
    };
  } = {
    where: { OR: [] },
  };

  if (isNumber(searchValue)) {
    searchQuery.where.OR.push({
      number: {
        equals: Number(searchValue),
      },
    });
  }

  const isSearchStringEnquiryState = [EnquiryState.OPENED, EnquiryState.CLOSED].some(
    (state) => state === searchString.toUpperCase(),
  );
  if (dispatcherId && isSearchStringEnquiryState) {
    searchQuery.where.OR.push({ state: { equals: searchString.toUpperCase() as EnquiryState } });
  }

  const isSearchStringEnquiryStateForDispatcher = [
    EnquiryStateForDispatcher.NEW,
    EnquiryStateForDispatcher.CLOSED,
    EnquiryStateForDispatcher.RESPONDED,
    EnquiryStateForDispatcher.WON,
  ].some((state) => state === searchString.toUpperCase());
  if (dispatcherId && isSearchStringEnquiryStateForDispatcher) {
    searchQuery.where.OR.push({
      contactedDispatchers: {
        some: {
          OR: [
            {
              state: { equals: searchString.toUpperCase() as EnquiryStateForDispatcher },
            },
          ],
        },
      },
    });
  }

  searchQuery.where.OR.push({
    note: createInsensitiveContainsQuery(searchString),
  });

  searchQuery.where.OR.push({
    commission: {
      OR: [
        ...(isNumber(searchValue)
          ? [
              {
                number: {
                  equals: Number(searchValue),
                },
              },
            ]
          : []),
        {
          commissiondischarge: {
            some: {
              location: createLocationQuery(searchString),
            },
          },
        },
        {
          commissionloading: {
            some: {
              location: createLocationQuery(searchString),
            },
          },
        },
      ],
    },
  });

  searchQuery.where.OR.push({
    offers: {
      some: {
        OR: [
          {
            note: createInsensitiveContainsQuery(searchString),
          },
          {
            dispatcher: createDispatcherQuery(searchString),
          },
        ],
      },
    },
  });

  return [searchQuery.where];
};
