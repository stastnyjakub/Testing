const {
  getDispatcherVehicle,
  saveDispatcherVehicle,
  updateDispatcherVehicle,
  deleteDispatcherVehicle,
  validateParams,
  validateDispatcherVehicle,
  getDispatcherVehicleType,
  saveWithFeatures,
  updateWithFeatures,
  validateDispatcherVehicleBody,
} = require('../model/dispatcher-vehicle-model');

const {
  validateDispatcherVehicleFeature,
} = require('../model/dispatcher-vehicle-feature-model');

const auth = require('../middleware/auth');
const verify = require('../middleware/verify');
const express = require('express');
const { validateCommission } = require('../model/commission-model');
const router = express.Router();

//getters
router.get('/', auth, async (req, res) => {
  /*
    #swagger.tags = ['Dispatcher Vehicle']
    #swagger.description = 'Get dispatcher vehicles'
    #swagger.operationId = 'getDispatcherVehicles'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of dispatcher vehicles to return',
      type: 'number',
    }
    #swagger.parameters['after'] = {
      in: 'query',
      description: 'Vehicle ID to start from',
      type: 'number',
    }
    #swagger.parameters['order_by'] = {
      in: 'query',
      description: 'Order by',
      type: 'string',
    }
    #swagger.parameters['ordering'] = {
      in: 'query',
      description: 'Ordering',
      enum: ['ASC', 'DESC'],
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/DispatcherVehiclesGet'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.query);
  if (error) return res.status(400).send(error.details[0].message);

  //get dispatcherVehicles
  const dispatcherVehicle = await getDispatcherVehicle('all', req.query);
  if (dispatcherVehicle.error_code)
    return res
      .status(dispatcherVehicle.error_code)
      .send(dispatcherVehicle.error_message);

  res.send(dispatcherVehicle);
});

router.get('/type', async (req, res) => {
  /*
    #swagger.tags = ['Dispatcher Vehicle']
    #swagger.description = 'Get dispatcher vehicles types'
    #swagger.operationId = 'getDispatcherVehiclesTypes'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/DispatcherVehiclesTypesGet'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  // router.get("/type", async (req, res) => {
  const { error } = validateParams(req.query);
  if (error) return res.status(400).send(error.details[0].message);

  //get dispatcherVehicles types
  const dispatcherVehicleType = await getDispatcherVehicleType(
    'all',
    req.query,
  );
  if (dispatcherVehicleType.error_code)
    return res
      .status(dispatcherVehicleType.error_code)
      .send(dispatcherVehicleType.error_message);

  res.send(dispatcherVehicleType);
});

router.get('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Dispatcher Vehicle']
    #swagger.description = 'Get dispatcher vehicle by ID'
    #swagger.operationId = 'getDispatcherVehicle'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Dispatcher vehicle ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/DispatcherVehicleGet'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const dispatcherVehicle = await getDispatcherVehicle(req.params.id, '');
  if (dispatcherVehicle.error_code)
    return res
      .status(dispatcherVehicle.error_code)
      .send(dispatcherVehicle.error_message);

  res.send(dispatcherVehicle);
});

router.post("/vehicles", auth, async (req, res) => {
  /*
    #swagger.tags = ['Dispatcher Vehicle']
    #swagger.description = 'Create dispatcher vehicles + features'
    #swagger.operationId = 'createDispatcherVehiclesWithFeatures'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Dispatcher vehicles to create',
      schema: {$ref: '#/definitions/DispatcherVehicleFeatureCreateMultiple'},
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/DispatcherVehicleFeatureCreateMultipleResponse'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */

  // check if each post has the right paramaters
  let { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  // validate body data
  error = null;
  ({ error } = validateDispatcherVehicleBody(req.body));
  if (error) return res.status(400).send(error.details[0].message);

  // prepare data for DB
  let toDB = [];

  req.body.all.forEach((nv) => {
    if (!nv.dispatcherVehicle_id) {
      // vehicle is not already in DB (post)
      toDB.push({
        dispatcher_id: nv.dispatcher_id ? nv.dispatcher_id : null,
        vehicleType_id: nv.vehicleType_id,
        maxHeight: nv.maxHeight,
        maxLength: nv.maxLength,
        maxWeight: nv.maxWeight,
        dispatcherVehicleFeature: nv.vehicleFeature_ids,
        carrier_id: nv.carrier_id,
      });
    }
  });

  const response = await saveWithFeatures(toDB);
  if (response.error_code) {
    return res.status(response.error_code).send(response.error_message); 
  }

  return res.send(response);
});

// public vehicles
router.post(["/vehicles/public", "/vehicles/public/:token"], verify, async (req, res) => {
  /*
    #swagger.start
    #swagger.path = '/dispatcher/vehicles/public/{token}'
    #swagger.method = 'post'
    #swagger.produces = ["application/json"]
    #swagger.tags = ['Dispatcher Vehicle']
    #swagger.description = 'Create dispatcher vehicles + features with token in path'
    #swagger.operationId = 'createDispatcherVehiclesWithFeaturesWithTokenInPath'
    #swagger.parameters['token'] = {
      in: 'path',
      description: 'Dispatcher token',
      required: true,
      default: 'b24c689e-0f8b-4721-8c53-5011d3d89207',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Dispatcher vehicles to create',
      schema: {$ref: '#/definitions/DispatcherVehicleFeatureCreateMultiple'},
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/DispatcherVehicleFeatureCreateMultipleResponse'},
    }
    #swagger.responses[400] = {
      description: 'Bad request',
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
    #swagger.end
  */
 /*
    #swagger.start
    #swagger.path = '/dispatcher/vehicles/public/'
    #swagger.method = 'post'
    #swagger.produces = ["application/json"]
    #swagger.tags = ['Dispatcher Vehicle']
    #swagger.description = 'Create dispatcher vehicles + features with token in body'
    #swagger.operationId = 'createDispatcherVehiclesWithFeaturesWithTokenInBody'
    
    default: 'b24c689e-0f8b-4721-8c53-5011d3d89207'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Dispatcher vehicles to create',
      schema: {$ref: '#/definitions/DispatcherVehicleFeatureCreateMultiplePublic'},
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/DispatcherVehicleFeatureCreateMultipleResponse'},
    }
    #swagger.responses[400] = {
      description: 'Bad request',
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
    #swagger.end
  */

  // check if each post has the right paramaters
  let { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  // validate body data
  error = null;
  ({ error } = validateDispatcherVehicleBody(req.body));
  if (error) return res.status(400).send(error.details[0].message);

  // prepare data for DB
  let toDB = [];
  let validDispatcher = true;

  for (const nv of req.body.all) {
    if (!nv.dispatcherVehicle_id) {
      // vehicle is not already in DB (post)
      // check if each post has the right dispatcher
      if (nv.dispatcher_id != req.dispatcher_id) {
        validDispatcher = false;
        break;
      }
      // check if each post has the right carrier
      if (nv.carrier_id != req.carrier_id) {
        validDispatcher = false;
        break;
      }
      
      toDB.push({
        dispatcher_id: nv.dispatcher_id ? nv.dispatcher_id : null,
        vehicleType_id: nv.vehicleType_id,
        maxHeight: nv.maxHeight,
        maxLength: nv.maxLength,
        maxWeight: nv.maxWeight,
        dispatcherVehicleFeature: nv.vehicleFeature_ids,
        carrier_id: req.carrier_id,
      });
    }
  };

  if (!validDispatcher) {
    return res
      .status(400)
      .send('S vaším tokenem není možné uložit data k danému dispečerovi');
  }

  const response = await saveWithFeatures(toDB);
  if(response.error_code){
    return res.status(response.error_code).send(response.error_message);
  }
  return res.send(response);
});

router.put("/vehicles", auth, async (req, res) => {
  /*
    #swagger.tags = ['Dispatcher Vehicle']
    #swagger.description = 'Update dispatcher vehicles + features'
    #swagger.operationId = 'updateDispatcherVehiclesWithFeatures'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Dispatcher vehicles to create',
      schema: {$ref: '#/definitions/DispatcherVehicleFeatureUpdateMultiple'},
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/DispatcherVehicleFeatureCreateMultipleResponse'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  // check if each post has the right paramaters
  let { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  // validate body data
  error = null;
  ({ error } = validateDispatcherVehicleBody(req.body));
  if (error) return res.status(400).send(error.details[0].message);

  // prepare data for DB
  let toDB = [];

  req.body.all.forEach((nv) => {
    if (nv.dispatcherVehicle_id) {
      // vehicle is already in DB (put)
      toDB.push({
        dispatcher_id: nv.dispatcher_id ? nv.dispatcher_id : null,
        vehicleType_id: nv.vehicleType_id,
        maxHeight: nv.maxHeight,
        maxLength: nv.maxLength,
        maxWeight: nv.maxWeight,
        dispatcherVehicleFeature: nv.vehicleFeature_ids,
        dispatcherVehicle_id: nv.dispatcherVehicle_id,
        deleted: nv.deleted,
        carrier_id: nv.carrier_id,
      });
    }
  });

  const response = await updateWithFeatures(toDB, req.body.features);

  if (response.error_code){
    return res.status(response.error_code).send(response.error_message);
  }
  res.send(response);
});

router.put(["/vehicles/public", "/vehicles/public/:token"], verify, async (req, res) => {
  /*
    #swagger.start
    #swagger.path = '/dispatcher/vehicles/public/{token}'
    #swagger.method = 'put'
    #swagger.produces = ["application/json"]
    #swagger.tags = ['Dispatcher Vehicle']
    #swagger.description = 'Update dispatcher vehicles + features with token in path'
    #swagger.operationId = 'updateDispatcherVehiclesWithFeaturesWithTokenInPath'
    #swagger.parameters['token'] = {
      in: 'path',
      description: 'Dispatcher token',
      required: true,
      default: 'b24c689e-0f8b-4721-8c53-5011d3d89207',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Dispatcher vehicles to create',
      schema: {$ref: '#/definitions/DispatcherVehicleFeatureUpdateMultiple'},
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/DispatcherVehicleFeatureCreateMultipleResponse'},
    }
    #swagger.responses[400] = {
      description: 'Bad request',
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
    #swagger.end
  */
 /*
    #swagger.start
    #swagger.path = '/dispatcher/vehicles/public/'
    #swagger.method = 'put'
    #swagger.produces = ["application/json"]
    #swagger.tags = ['Dispatcher Vehicle']
    #swagger.description = 'Update dispatcher vehicles + features with token in body'
    #swagger.operationId = 'updateDispatcherVehiclesWithFeaturesWithTokenInBody'
    
    default: 'b24c689e-0f8b-4721-8c53-5011d3d89207'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Dispatcher vehicles to create',
      schema: {$ref: '#/definitions/DispatcherVehicleFeatureUpdateMultiplePublic'},
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/DispatcherVehicleFeatureCreateMultipleResponse'},
    }
    #swagger.responses[400] = {
      description: 'Bad request',
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
    #swagger.end
  */
  // check if each post has the right paramaters
  let { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  // validate body data
  error = null;
  ({ error } = validateDispatcherVehicleBody(req.body));
  if (error) return res.status(400).send(error.details[0].message);
 
  // prepare data for DB
  let toDB = [];
  let validDispatcher = true;

  for (const nv of req.body.all) {
    if (nv.dispatcherVehicle_id) {
      // vehicle is already in DB (put)
      // check if each post has the right dispatcher
      if (nv.dispatcher_id != req.dispatcher_id) {
        validDispatcher = false;
        break;
      }
      // check if each post has the right carrier
      if (nv.carrier_id != req.carrier_id) {
        validDispatcher = false;
        break;
      }

      toDB.push({
        dispatcher_id: nv.dispatcher_id ? nv.dispatcher_id : null,
        vehicleType_id: nv.vehicleType_id,
        maxHeight: nv.maxHeight,
        maxLength: nv.maxLength,
        maxWeight: nv.maxWeight,
        dispatcherVehicleFeature: nv.vehicleFeature_ids,
        dispatcherVehicle_id: nv.dispatcherVehicle_id,
        deleted: nv.deleted,
        carrier_id: nv.carrier_id,
      });
    }
  };

  if (!validDispatcher) {
    return res
      .status(400)
      .send('S vaším tokenem není možné uložit data k danému dispečerovi');
  }

  const response = await updateWithFeatures(toDB, req.body.features);

  if (response && response.error_code)
    return res.status(response.error_code).send(response.error_message);

  res.send(response);
});

// setters
router.post('/', auth, async (req, res) => {
  /*
    #swagger.tags = ['Dispatcher Vehicle']
    #swagger.description = 'Create new dispatcher vehicle'
    #swagger.operationId = 'addDispatcherVehicle'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Dispatcher data',
      required: true,
      schema: {$ref: '#/definitions/DispatcherVehicleCreate'},
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/DispatcherVehicleGet'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let dispatcherVehicle = [];
  // return res.send(dispatcherVehicle);
  for await (const item of req.body) {
    let { error: dispatcherVehicleError } = validateDispatcherVehicle(item);
    if (dispatcherVehicleError)
      return res.status(400).send(dispatcherVehicleError.details[0].message);

    let response = await saveDispatcherVehicle(item);
    if (response.error)
      return res.status(response.error_code).send(response.error_message);
    dispatcherVehicle.push(response);
  }
  res.send(dispatcherVehicle);
});

// router.put("/", async (req, res) => {
router.put('/', auth, async (req, res) => {
  // #swagger.ignore = true
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let dispatcherVehicle = [];

  for await (const item of req.body) {
    let { error: dispatcherVehicleError } = validateDispatcherVehicle(item);
    if (dispatcherVehicleError)
      return res.status(400).send(dispatcherVehicleError.details[0].message);

    let response = await updateDispatcherVehicle('', item);
    if (response.error_code)
      return res.status(response.error_code).send(response.error_message);
    dispatcherVehicle.push(response);
  }

  res.send(dispatcherVehicle);
});

router.put('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Dispatcher Vehicle'] 
    #swagger.description = 'Update dispatcher vehicle'
    #swagger.operationId = 'updateDispatcherVehicle'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Dispatcher vehicle id',
      required: true,
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Dispatcher data',
      required: true,
      schema: {$ref: '#/definitions/DispatcherVehicleUpdate'},
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/DispatcherVehicleGet'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  // router.put("/:id", async (req, res) => {
  let { error } = validateDispatcherVehicle(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const dispatcherVehicle = await updateDispatcherVehicle(
    req.params.id,
    req.body,
  );

  if (dispatcherVehicle.error_code)
    return res
      .status(dispatcherVehicle.error_code)
      .send(dispatcherVehicle.error_message);

  res.send(dispatcherVehicle);
});

//delete
router.delete('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Dispatcher Vehicle']
    #swagger.description = 'Delete dispatcher vehicle'
    #swagger.operationId = 'deleteDispatcherVehicle'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Dispatcher vehicle id',
      required: true,
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/DispatcherVehicleGet'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  // router.delete("/:id", async (req, res) => {
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);
  const dispatcherVehicle = await deleteDispatcherVehicle(req.params.id);
  if (dispatcherVehicle.error_code)
    return res
      .status(dispatcherVehicle.error_code)
      .send(dispatcherVehicle.error_message);

  return res.send(dispatcherVehicle);
});

module.exports = router;
