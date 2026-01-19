import z from 'zod';

export const booleanFromString = (def: 'false' | 'true' = 'false') =>
  z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default(def);
