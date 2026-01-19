import { z } from 'zod';

export const sendCustomerUserInvitationRequestBodySchema = z.object({
  customerUserInvitationId: z.number(),
});
export type TSendCustomerUserInvitationRequestBody = z.infer<typeof sendCustomerUserInvitationRequestBodySchema>;
