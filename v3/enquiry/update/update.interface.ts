import { EnquiryState, TEnquiryParameters } from '../enquiry.interface';

export type UpdateParams = TUpdateRequestBody & {
  enquiry_id: number;
};

export type TUpdateRequestBody = {
  state?: EnquiryState;
  note?: string | null;
  parameters?: TEnquiryParameters;
  contactedDispatchers?: {
    add?: number[];
    remove?: number[];
  };
};
