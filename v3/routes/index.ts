import express from 'express';

import commissionPriceEstimationPublicRouter from './public/commissionPriceEstimation';
import enquiryFormPublicRouter from './public/enquiryForm';
import geocodingPublicRouter from './public/geocoding';
import kbPublicRouter from './public/kb';
import apiKeyRouter from './apiKey';
import aresRouter from './ares';
import attachmentRouter from './attachment';
import authRouter from './auth';
import bankRouter from './bank';
import carrierRouter from './carrier';
import commissionRouter from './commission';
import countryRouter from './country';
import customerRouter from './customer';
import deliveryRouter from './delivery';
import dischargeRouter from './discharge';
import dispatcherRouter from './dispatcher';
import enquiryRouter from './enquiry';
import fileRouter from './file';
import geocodingRouter from './geocoding';
import invoiceRouter from './invoice';
import jobRouter from './job';
import loadingRouter from './loading';
import metricsRouter from './metrics';
import offerRouter from './offer';
import orderRouter from './order';
import userRouter from './user';
import vehicleTypeRouter from './vehicleTypes';

export function initializeRoutes(app: express.Express) {
  // Private routes
  app.use('/api/v3/invoice', invoiceRouter);
  app.use('/api/v3/customer', customerRouter);
  app.use('/api/v3/auth', authRouter);
  app.use('/api/v3/carrier', carrierRouter);
  app.use('/api/v3/vehicle_type', vehicleTypeRouter);
  app.use('/api/v3/dispatcher', dispatcherRouter);
  app.use('/api/v3/commission', commissionRouter);
  app.use('/api/v3/file', fileRouter);
  app.use('/api/v3/delivery', deliveryRouter);
  app.use('/api/v3/loading', loadingRouter);
  app.use('/api/v3/order', orderRouter);
  app.use('/api/v3/discharge', dischargeRouter);
  app.use('/api/v3/ares', aresRouter);
  app.use('/api/v3/enquiry', enquiryRouter);
  app.use('/api/v3/attachment', attachmentRouter);
  app.use('/api/v3/offer', offerRouter);
  app.use('/api/v3/geocoding', geocodingRouter);
  app.use('/api/v3/api-key', apiKeyRouter);
  app.use('/api/v3/bank', bankRouter);
  app.use('/api/v3/user', userRouter);
  app.use('/api/v3/job', jobRouter);
  app.use('/api/v3/metrics', metricsRouter);
  app.use('/api/v3/country', countryRouter);

  // Public routes
  app.use('/api/v3/public/enquiry-form', enquiryFormPublicRouter);
  app.use('/api/v3/public/commission-price-estimation', commissionPriceEstimationPublicRouter);
  app.use('/api/v3/public/geocoding', geocodingPublicRouter);
  app.use('/api/v3/public/kb', kbPublicRouter);
}
