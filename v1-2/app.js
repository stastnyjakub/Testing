const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const carriers = require('./routes/carrier');
const rates = require('./routes/rate');
const customers = require('./routes/customer');
const customer_contacts = require('./routes/customer_contact');
const dispatchers = require('./routes/dispatcher');
const places = require('./routes/place');
const logins = require('./routes/login');
const loadings = require('./routes/loading');
const discharges = require('./routes/discharge');
const users = require('./routes/user');
const commissions = require('./routes/commission');
const commissionLoadings = require('./routes/commission_loading');
const commissionDischarges = require('./routes/commission_discharge');
const commissionItems = require('./routes/commission_item');
const requestDischarges = require('./routes/request_discharge');
const requestLoadings = require('./routes/request_loading');
const requests = require('./routes/request');
const notifications = require('./routes/notification');
const dispatcherVehicle = require('./routes/dispatcher_vehicle');
const dispatcherVehicleFeature = require('./routes/dispatcher_vehicle_feature');
const states = require('./routes/state');
const invoices = require('./routes/invoice');
const v2invoices = require('./routes/v2/invoice');
const v3invoices = require('../v3/routes/invoice');
const refreshToken = require('../v3/routes/refreshToken');
const v3carrier = require('../v3/routes/carrier');
const v3vehicleType = require('../v3/routes/vehicleTypes');
const v3login = require('../v3/routes/login');
const v3customer = require('../v3/routes/customer');
const v3dispatcher = require('../v3/routes/dispatcher');
const v3commission = require('../v3/routes/commission');
const helmet = require('helmet');
const expressWs = require('express-ws')(app);

const corsOptions = {
  origin: [
    'https://app.qapline.com',
    'https://qapline.koala42.com',
    'https://qapline.k42.dev',
  ],
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const corsOptionsDev = {
  origin: [
    'https://app.qapline.com',
    'https://qapline.koala42.com',
    'https://qapline.k42.dev',
    'http://localhost:5173',
    'http://localhost:4200',
  ],
  credentials: true,
};

//seting middleware
if (process.env.QLSTATE == 'production') {
  app.use(cors(corsOptions));
} else {
  app.use(cors(corsOptionsDev));
}
app.use(
  helmet.hsts({
    maxAge: 5184000,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(
  morgan(
    '[:date[iso]] :status :method :url :res[content-length] - :response-time ms',
  ),
);

//routes
app.use('/api/login', logins);
app.use('/api/carrier', carriers);
app.use('/api/rate', rates);
app.use('/api/customer', customers);
app.use('/api/customer_contact', customer_contacts);
app.use('/api/dispatcher', dispatchers);
app.use('/api/place', places);
app.use('/api/loading', loadings);
app.use('/api/discharge', discharges);
app.use('/api/user', users);
app.use('/api/commission', commissions);
app.use('/api/commission_loading', commissionLoadings);
app.use('/api/commission_discharge', commissionDischarges);
app.use('/api/commission_item', commissionItems);
app.use('/api/request_discharge', requestDischarges);
app.use('/api/request_loading', requestLoadings);
app.use('/api/request', requests);
app.use('/api/notification', notifications); //web socket
app.use('/api/dispatcher_vehicle', dispatcherVehicle);
app.use('/api/dispatcher_vehicle_feature', dispatcherVehicleFeature);
app.use('/api/state', states);
app.use('/api/invoice', invoices);
app.use('/api/v2/invoice', v2invoices);
app.use('/api/v3/customer', v3customer);
app.use('/api/v3/invoice', v3invoices);
app.use('/api/v3/login', v3login);
app.use('/api/v3/refresh', refreshToken);
app.use('/api/v3/carrier', v3carrier);
app.use('/api/v3/vehicle_type', v3vehicleType);
app.use('/api/v3/dispatcher', v3dispatcher);
app.use('/api/v3/commission', v3commission);

process.on('unhandledRejection', (error, promise) => {
  console.log(
    'Oh Lord! We forgot to handle a promise rejection here: ',
    promise,
  );
  console.log('The error was: ', error);
});

module.exports = app;
