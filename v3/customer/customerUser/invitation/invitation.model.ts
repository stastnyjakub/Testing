import { z } from 'zod';

export const sendCustomerUserInvitationRequestBodySchema = z.object({
  customerUserInvitationId: z.number(),
});
export type TSendCustomerUserInvitationRequestBody = z.infer<typeof sendCustomerUserInvitationRequestBodySchema>;

export const registerCustomerUserRequestBodySchema = z.object({
  name: z.string().min(1),
  surname: z.string().min(1),
  phone: z.string().nullable().optional(),
  password: z.string().min(8),
});
export type TRegisterCustomerUserRequestBody = z.infer<typeof registerCustomerUserRequestBodySchema>;
