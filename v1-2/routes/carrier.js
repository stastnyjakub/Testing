const {
  validateCarrier,
  validateParams,
  getCarrier,
  saveCarrier,
  updateCarrier,
  deleteCarrier,
  carrierFultextSearch,
} = require('../model/carrier-model');
const {
  validateDispatcher,
  getDispatcher,
  saveDispatcher,
  updateDispatcher,
} = require('../model/dispatcher-model');
const {
  getPlace,
  savePlace,
  validatePlace,
  updatePlace,
} = require('../model/place-model');
const { getCarrierVehicle } = require('../model/dispatcher-vehicle-model');
const { getCommissionBy } = require('../model/commission-model');
const broadcast = require('../model/web-socket-model');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

//geters
router.get('/', auth, async (req, res) => {
  /*
    #swagger.tags = ['Carriers']
    #swagger.description = 'Get all carriers'
    #swagger.operationId = 'getCarriers'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['limit'] = {
      description: 'Number of records to return',
      type: 'number',
    }
    #swagger.parameters['after'] = {
      description: 'Page number',
      type: 'number',
    }
    #swagger.parameters['order_by'] = {
      description: 'Order by',
      enum: ['number', 'company', 'street', 'postalCode', 'country', 'phone', 'email', 'note']
    }
    #swagger.parameters['ordering'] = {
      description: 'Ordering',
      enum: ['asc', 'desc']
    }
    #swagger.parameters['number'] = {
      description: 'Carrier number',
      type: ['string', 'number'],
    }
    #swagger.parameters['company'] = {
      description: 'Carrier company',
      type: 'string',
    }
    #swagger.parameters['street'] = {
      description: 'Carrier street',
      type: 'string',
    }
    #swagger.parameters['postalCode'] = {
      description: 'Carrier postal code',
      type: 'string',
    }
    #swagger.parameters['country'] = {
      description: 'Carrier country',
      type: 'string',
    }
    #swagger.parameters['phone'] = {
      description: 'Carrier phone',
      type: 'string',
    }
    #swagger.parameters['email'] = {
      description: 'Carrier email',
      type: 'string',
    }
    #swagger.parameters['note'] = {
      description: 'Carrier note',
      type: 'string',
    }
    #swagger.responses[200] = {
      schema: { 
        data: {$ref: '#/definitions/CarriersGet'},
        next_cursor: 2,
      },
    }
    #swagger.responses[500] = {
      description: 'Internal server error'
    }
  */
  const { error } = validateParams(req.query);
  if (error) return res.status(400).send(error.details[0].message);

  //get carriers
  const carrier = await getCarrier('all', req.query);

  if (carrier.error_code)
    return res.status(carrier.error_code).send(carrier.error_message);

  res.send(carrier);
});

//search
router.get('/fulltext_search', auth, async (req, res) => {
  /*
    #swagger.tags = ['Carriers']
    #swagger.description = 'Fulltext search'
    #swagger.operationId = 'carrierFulltextSearch'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['parameter'] = {
      in: 'query',
      description: 'Fulltext search - word',
      required: true,
      type: 'string',
    }
    #swagger.responses[500] = {
      description: 'Internal server error'
    }
  */
  const response = await carrierFultextSearch(req.query.parameter);

  if (response.error_code)
    return res.status(response.error_code).send(response.error_message);
  res.send(response);
});

router.get('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Carriers']
    #swagger.description = 'Get carrier by ID'
    #swagger.operationId = 'getCarrier'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Carrier ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CarrierGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }

  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const carrier = await getCarrier(req.params.id, '');
  if (carrier && carrier.error_code)
    return res.status(carrier.error_code).send(carrier.error_message);

  res.send(carrier);
});

router.get('/:id/dispatcher', auth, async (req, res) => {
  /*
    #swagger.tags = ['Carrier - Dispatcher']
    #swagger.description = 'Get carrier dispatcher'
    #swagger.operationId = 'getCarrierDispatcher'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Carrier ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: {
        data: { $ref: '#/definitions/CarrierDispatchersGet' },
        next_cursor: 2,
      },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const dispatcher = await getDispatcher({ carrier_id: req.params.id });
  if (dispatcher.error_code)
    return res.status(dispatcher.error_code).send(dispatcher.error_message);

  res.send(dispatcher);
});

router.get('/:id/place', auth, async (req, res) => {
  /*
    #swagger.tags = ['Carrier - Place']
    #swagger.description = 'Get carrier place'
    #swagger.operationId = 'getCarrierPlace'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Carrier ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: {
        data: { $ref: '#/definitions/CarrierPlacesGet' },
        next_cursor: 2,
      },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const place = await getPlace(req.params.id);
  if (place.error_code)
    return res.status(place.error_code).send(place.error_message);

  res.send(place);
});

router.get('/:id/vehicle', auth, async (req, res) => {
  /*
    #swagger.tags = ['Carrier - Vehicle']
    #swagger.description = 'Get carrier vehicle'
    #swagger.operationId = 'getCarrierVehicle'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Carrier ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: [{$ref: '#/definitions/CarrierVehicleGet'}],
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
   */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const vehicle = await getCarrierVehicle(req.params.id);
  if (vehicle.error_code)
    return res.status(vehicle.error_code).send(vehicle.error_message);

  res.send(vehicle);
});

//seters
router.post('/', auth, async (req, res) => {
  /*
    #swagger.tags = ['Carriers']
    #swagger.description = 'Add carrier'
    #swagger.operationId = 'addCarrier'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Carrier data',
      required: true,
      schema: { $ref: '#/definitions/CarrierCreate' },
    }

    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CarrierGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateCarrier(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  req.body.addedBy = req.user.email;

  const carrier = await saveCarrier(req.body);
  if (carrier.error) return res.status(500).send(carrier.error);

  res.send(carrier);
});

router.post('/:id/dispatcher', auth, async (req, res) => {
  /*
    #swagger.tags = ['Carrier - Dispatcher']
    #swagger.description = 'Create carrier dispatcher'
    #swagger.operationId = 'addCarrierDispatcher'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Carrier ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Carrier dispatcher data',
      required: true,
      schema: { $ref: '#/definitions/CarrierDispatcherCreate' },
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CarrierDispatchersGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
   */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  let dispatcher = [];

  for await (const item of req.body) {
    let { error: dispatcherError } = validateDispatcher(item);
    if (dispatcherError)
      return res.status(400).send(dispatcherError.details[0].message);

    let response = await saveDispatcher(req.params.id, item);

    if (response.error_code)
      return res.status(response.error_code).send(response.error_message);
    dispatcher.push(response);
  }

  res.send(dispatcher);
});

router.put('/:id/dispatcher', auth, async (req, res) => {
  /*
    #swagger.tags = ['Carrier - Dispatcher']
    #swagger.description = 'Update carrier dispatcher'
    #swagger.operationId = 'updateCarrierDispatcher'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Carrier ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Carrier dispatcher data',
      required: true,
      schema: { $ref: '#/definitions/CarrierDispatcherUpdate' },
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CarrierDispatchersGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
   */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let dispatcher = [];

  for await (const item of req.body) {
    item.language_id = item.language_id ? item.language_id : null;
    let { error: dispatcherError } = validateDispatcher(item);

    if (dispatcherError)
      return res.status(400).send(dispatcherError.details[0].message);

    let response = await updateDispatcher('', item);
    if (response.error_code)
      return res.status(response.error_code).send(response.error_message);
    dispatcher.push(response);
  }

  res.send(dispatcher);
});

router.post('/:id/place', auth, async (req, res) => {
  /*
    #swagger.tags = ['Carrier - Place']
    #swagger.description = 'Create carrier place'
    #swagger.operationId = 'addCarrierPlace'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Carrier ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Carrier place data',
      required: true,
      schema: { $ref: '#/definitions/CarrierPlaceCreate' },
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CarrierPlacesGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
   */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  let place = [];

  for await (const item of req.body) {
    let { error: placeError } = validatePlace(item);
    if (placeError) return res.status(400).send(placeError.details[0].message);

    let response = await savePlace(req.params.id, item);
    if (response.error_code)
      return res.status(response.error_code).send(response.error_message);
    place.push(response);
  }

  res.send(place);
});

router.put('/:id/place', auth, async (req, res) => {
  /*
    #swagger.tags = ['Carrier - Place']
    #swagger.description = 'Update carrier place'
    #swagger.operationId = 'updateCarrierPlace'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Carrier ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Carrier place data',
      required: true,
      schema: { $ref: '#/definitions/CarrierPlaceUpdate' },
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CarrierPlacesGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
   */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let place = [];

  for await (const item of req.body) {
    let { error: placeError } = validatePlace(item);
    if (placeError) return res.status(400).send(placeError.details[0].message);

    let response = await updatePlace('', item);
    if (response.error_code)
      return res.status(response.error_code).send(response.error_message);
    place.push(response);
  }

  res.send(place);
});

router.put('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Carriers']
    #swagger.description = 'Update carrier'
    #swagger.operationId = 'updateCarrier'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Carrier ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Carrier data',
      required: true,
      schema: { $ref: '#/definitions/CarrierUpdate' },
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CarrierGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let { error: carrierError } = validateCarrier(req.body);
  if (carrierError)
    return res.status(400).send(carrierError.details[0].message);

  req.body.editedBy = req.user.email;

  const carrier = await updateCarrier(req.params.id, req.body);
  if (carrier.error_code)
    return res.status(carrier.error_code).send(carrier.error_message);

  // broadcast all changed commissions
  const broadcastCommission = await getCommissionBy(
    'carrier_id',
    req.params.id,
  );
  if (!broadcastCommission.error && broadcastCommission.length > 0)
    broadcast(broadcastCommission);

  res.send(carrier);
});

//delete
router.delete('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Carriers']
    #swagger.description = 'Delete carrier'
    #swagger.operationId = 'deleteCarrier'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Carrier ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CarrierGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const carrier = await deleteCarrier(req.params.id);

  if (carrier.error_code)
    return res.status(carrier.error_code).send(carrier.error_message);

  res.send(carrier);
});

module.exports = router;
