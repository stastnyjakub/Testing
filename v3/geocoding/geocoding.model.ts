import { z } from 'zod';

export const forwardRequestQuerySchema = z.object({
  search: z.string(),
});
export type TForwardRequestQuery = z.infer<typeof forwardRequestQuerySchema>;

export const reverseRequestQuerySchema = z.object({
  latitude: z.number({ coerce: true }),
  longitude: z.number({ coerce: true }),
});
export type TReverseRequestQuery = z.infer<typeof reverseRequestQuerySchema>;
