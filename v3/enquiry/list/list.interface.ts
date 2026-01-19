import { EnquiryState, EnquiryStateForDispatcher } from '../enquiry.interface';

export type TListRequestQuery = {
  state?: (EnquiryState | EnquiryStateForDispatcher)[];
  search?: string;
  limit: string;
  offset: string;
};
