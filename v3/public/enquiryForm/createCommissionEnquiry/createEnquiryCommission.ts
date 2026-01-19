import { Customer, location, Prisma } from '@prisma/client';
import moment from 'moment';

import * as commissionService from '@/commission/commission.service';
import { ECommissionState, TCreateCommissionArgs } from '@/commission/types';
import { USERS } from '@/config/constants';
import prisma from '@/db/client';
import { timestamp } from '@/utils';

import { TEnquiryFormPoint } from '../types';

export type TCreateEnquiryCommissionArgs = {
  customer: Customer & {
    location: location[];
  };
  startPoint: TEnquiryFormPoint;
  endPoint: TEnquiryFormPoint;
  loadingMeters: number;
  goodsWeight: number;
  loadingDate: number;
  transactionClient?: Prisma.TransactionClient;
};
export const createEnquiryCommission = async ({
  customer,
  startPoint,
  endPoint,
  loadingMeters,
  goodsWeight,
  loadingDate,
  transactionClient = prisma,
}: TCreateEnquiryCommissionArgs) => {
  const commissionData: TCreateCommissionArgs['commission'] = {
    state: ECommissionState.Enquiry,
    relation: `${startPoint.countryCode}${endPoint.countryCode}`,
    addedBy_id: USERS.System.id,
    editedBy: 'system',
    notification: true,
    orderDate: moment().valueOf(),
    customer_id: customer.customer_id,
  };

  const commissionLoadingDate = timestamp(loadingDate);
  const commissionLoading: TCreateCommissionArgs['commissionLoadings'][number] = {
    location_id: customer.location.find(
      ({ loading, longitude, latitude }) =>
        // location must be loading and have the same coordinates as the loading location
        loading &&
        areCoordinatesIdentical({ longitude: Number(longitude), latitude: Number(latitude) }, { ...endPoint }),
    )?.location_id,
    date: commissionLoadingDate !== null ? commissionLoadingDate.valueOf() : undefined,
  };

  const commissionDischarge: TCreateCommissionArgs['commissionDischarges'][number] = {
    location_id: customer.location.find(
      ({ discharge, longitude, latitude }) =>
        // location must be discharge and have the same coordinates as the discharge location
        discharge &&
        areCoordinatesIdentical({ longitude: Number(longitude), latitude: Number(latitude) }, { ...endPoint }),
    )?.location_id,
  };
  const commissionItem: TCreateCommissionArgs['commissionItems'][number] = {
    loadingMeters,
    loadingIdx: 0,
    dischargeIdx: 0,
    weight: goodsWeight,
    weightBrutto: goodsWeight,
  };

  const createdCommission = await commissionService.createCommission(
    {
      commission: commissionData,
      commissionLoadings: [commissionLoading],
      commissionDischarges: [commissionDischarge],
      commissionItems: [commissionItem],
    },
    transactionClient,
  );

  return createdCommission;
};

type TCoordinates = {
  longitude: number | Prisma.Decimal;
  latitude: number | Prisma.Decimal;
};
const areCoordinatesIdentical = (
  { longitude: longitude1, latitude: latitude1 }: TCoordinates,
  { longitude: longitude2, latitude: latitude2 }: TCoordinates,
) => Number(longitude1) === Number(longitude2) && Number(latitude1) === Number(latitude2);
