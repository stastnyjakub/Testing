import { Response } from 'express';
export const mockRequest = () => {
  const req = {
    params: jest.fn(() => req),
    body: jest.fn(() => req),
  };
  return req;
};

export const mockResponse = () => {
  const res = {
    json: jest.fn(),
    status: jest.fn(() => res),
    send: jest.fn(() => res),
    cookie: jest.fn(() => res),
  } as unknown as Response;
  return res;
};

export const mockNext = () => {
  const next = jest.fn(() => next);
  return next;
};
