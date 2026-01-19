import moduleAlias from 'module-alias';
moduleAlias.addAlias('@', __dirname + '/');
moduleAlias.addAlias('@templates', __dirname + '/../templates/');

//? Must be imported and initialized first
import * as SentryService from './sentry/sentry.service';
SentryService.initSentry();

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs/promises';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import { additions } from './middleware/additions';
import { defaultContentType } from './middleware/contentType';
import { errorHandler } from './middleware/logger';
import sentryRouter from './routes/sentry';
import CronService from './cron';
import env from './env';
import { initializeRoutes } from './routes';
import { configureWSS, initializeWSS } from './websockets';

const app = express();

const corsOptions = {
  origin: [
    'https://app.qapline.com',
    'https://qapline.koala42.com',
    'https://qapline.k42.dev',
    'https://qapline.k42.app',
    'https://qapline.appspot.com',
  ],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};

const corsOptionsDev = {
  origin: [
    'https://app.qapline.com',
    'https://qapline.koala42.com',
    'https://admin.qapline.k42.dev',
    'https://customer.qapline.k42.dev',
    'https://dispatcher.qapline.k42.dev',
    'https://qapline.k42.dev',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:4200',
    'http://localhost:3004',
    'http://127.0.0.1:5500',
    'https://qapline.webflow.io',
    'https://qapline.k42.app',
    'https://qapline.appspot.com',
  ],
  credentials: true,
};

// Serve static files for email templates and other static files
app.use('/static', express.static(path.join(__dirname, 'static')));

if (env().ENVIRONMENT == 'prod') {
  app.use(cors(corsOptions));
} else {
  app.use(cors(corsOptionsDev));
}

app.use(
  '/api/v3/sentry',
  bodyParser.raw({
    type: () => true,
    limit: '50mb',
  }),
  sentryRouter,
);

// Middleware to set default Content-Type if not provided
app.use(defaultContentType());

// ,
app.use(express.json());
app.use(express.raw({ type: ['application/octet-stream', 'text/plain'], limit: 300000 }));
app.use(
  helmet.hsts({
    maxAge: 5184000,
  }),
);
app.use(cookieParser());
app.use(morgan('[:date[iso]] :status :method :url :res[content-length] - :response-time ms'));
app.use(additions);

//web sockets
export const { server: wsServer, wss } = configureWSS(app);
initializeWSS(wss);

initializeRoutes(app);

CronService.start();

SentryService.setupErrorHandler(app);

// must be last
app.use(errorHandler);

process.on('unhandledRejection', (error, promise) => {
  console.log('Oh Lord! We forgot to handle a promise rejection here: ', promise);
  console.log('The error was: ', error);
});

// Graceful shutdown - resolves port being still in use by nodemon even after it was restarted
process.once('SIGUSR2', function () {
  process.kill(process.pid, 'SIGUSR2');
});

// this is only called on ctrl+c, not restart
// resolves port being in use by the nodemon even after it was killed
process.on('SIGINT', function () {
  process.kill(process.pid, 'SIGINT');
});

import * as swaggerUi from 'swagger-ui-express';

import './utils/bigintToString';

import { generateSwaggerJson } from './middleware/swaggerAutogen';
import { Environment, getEnvironment, isDebugMode } from './utils/getEnvironment';

if (getEnvironment() === Environment.DEV && isDebugMode()) {
  // Generate Swagger docs
  generateSwaggerJson()
    .then(async () => {
      const swaggerJsonPath = path.resolve(__dirname, './middleware/swagger-output.json');
      let swaggerJson = {};

      try {
        // Check if the Swagger JSON file exists
        await fs.access(swaggerJsonPath);

        // Import the Swagger JSON if it exists
        const importedJson = await import(swaggerJsonPath);
        swaggerJson = importedJson.default || importedJson;
      } catch (err) {
        console.warn('Swagger JSON file not found or could not be loaded. Using an empty object as fallback.');
      }

      // Use Swagger UI with the loaded or fallback Swagger JSON
      app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerJson));
    })
    .catch((err) => {
      console.error('Error generating Swagger JSON:', err);
    });
}
export default app;
