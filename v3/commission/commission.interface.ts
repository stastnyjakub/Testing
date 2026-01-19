import {
  commission,
  commissiondischarge,
  commissionitem,
  commissionloading,
  complete_commission,
  Prisma,
} from '@prisma/client';
export interface AllCommissions {
  data: commission[];
  totalRows: number;
}

export interface AllCommissionsResponse {
  data: complete_commission[];
  totalRows: number;
}

export interface CommissionBodyCreate extends Prisma.commissionCreateInput {
  commissionDischarges: {
    toCreate: Prisma.commissiondischargeCreateInput[];
  };
  commissionLoadings: { toCreate: Prisma.commissionloadingCreateInput[] };
  commissionItems: {
    toCreate: Prisma.commissionitemCreateInput[] &
      {
        dischargeIdx: number;
        loadingIdx: number;
      }[];
  };
}

export interface commissionitemExtended extends commissionitem {
  dischargeIdx: number;
  loadingIdx: number;
}

export interface CommissionBodyUpdate extends Prisma.commissionUpdateInput {
  commissionDischarges: {
    toCreate: Prisma.commissiondischargeUncheckedCreateInput[];
    toUpdate: commissiondischarge[];
    toDelete: { commissionDischarge_id: number }[];
  };
  commissionLoadings: {
    toCreate: Prisma.commissionloadingUncheckedCreateInput[];
    toUpdate: commissionloading[];
    toDelete: { commissionLoading_id: number }[];
  };
  commissionItems: {
    toCreate: Prisma.commissionitemUncheckedCreateInput[] &
      {
        dischargeIdx: number;
        loadingIdx: number;
      }[];
    toUpdate: commissionitemExtended[];
    toDelete: { commissionItem_id: number }[];
  };
}
