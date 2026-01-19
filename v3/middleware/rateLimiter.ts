import rateLimit from 'express-rate-limit';

import { HttpException } from '@/errors';

/**
 * Rate limiter middleware
 * Based on ip address
 * @param windowMs - Time window in milliseconds. Use getTimeInMs function
 * @param max - Maximum number of requests in the window
 * @returns Rate limiter middleware
 */
export const rateLimiter = (windowMs: number, max: number) =>
  rateLimit({
    max,
    windowMs,
    keyGenerator: (req) => req.ip,
    handler: (req, res, next) => {
      next(new HttpException(429, 'tooManyRequests'));
    },
  });
