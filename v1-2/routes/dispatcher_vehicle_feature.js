const {
  getDispatcherVehicleFeature,
  getDispatcherVehicleTypeFeature,
  saveDispatcherVehicleFeature,
  updateDispatcherVehicleFeature,
  deleteDispatcherVehicleFeature,
  validateParams,
  validateDispatcherVehicleFeature,
} = require('../model/dispatcher-vehicle-feature-model');

const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

//getters
router.get('/', auth, async (req, res) => {
  /*
    #swagger.tags = ['Dispatcher Vehicle Feature']
    #swagger.description = 'Get all dispatcher vehicle features'
    #swagger.operationId = 'getDispatcherVehicleFeature'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['limit'] = { 
      description: 'Number of records to return', 
      type: 'number' 
    }
    #swagger.parameters['after'] = {
      description: 'Cursor to start after',
      type: 'number'
    }
    #swagger.parameters['ordering'] = {
      description: 'Ordering of the records',
      enum: ['asc', 'desc']
    }
    #swagger.parameters['order_by'] = {
      description: 'Order by',
      type: 'string'
    }
    #swagger.responses[200] = {
      schema:{$ref: "#/definitions/DispatcherVehicleFeaturesGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  // router.get("/", async (req, res) => {
  const { error } = validateParams(req.query);
  if (error) return res.status(400).send(error.details[0].message);

  //get dispatcherVehicleFeatures
  const dispatcherVehicleFeature = await getDispatcherVehicleFeature(
    'all',
    req.query,
  );

  if (dispatcherVehicleFeature.error_code)
    return res
      .status(dispatcherVehicleFeature.error_code)
      .send(dispatcherVehicleFeature.error_message);

  res.send(dispatcherVehicleFeature);
});

//router.get("/feature", async (req, res) => {
router.get('/feature', async (req, res) => {
  /*
    #swagger.tags = ['Dispatcher Vehicle Feature']
    #swagger.description = 'Get all dispatcher vehicle features'
    #swagger.operationId = 'getDispatcherVehicleFeatures'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['limit'] = {
      description: 'Number of records to return',
      type: 'number'
    }
    #swagger.parameters['after'] = {
      description: 'Cursor to start after',
      type: 'number'
    }
    #swagger.parameters['ordering'] = {
      description: 'Ordering of the records',
      enum: ['asc', 'desc']
    }
    #swagger.parameters['order_by'] = {
      description: 'Order by',
      type: 'string'
    }
    #swagger.responses[200] = {
      schema:{$ref: "#/definitions/DispatcherVehicleFeaturesJoinedGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
    
  */
  const { error } = validateParams(req.query);
  if (error) return res.status(400).send(error.details[0].message);

  //get dispatcherVehicleTypeFeature
  const dispatcherVehicleTypeFeature = await getDispatcherVehicleTypeFeature();
  if (dispatcherVehicleTypeFeature.error_code)
    return res
      .status(dispatcherVehicleTypeFeature.error_code)
      .send(dispatcherVehicleTypeFeature.error_message);

  res.send(dispatcherVehicleTypeFeature);
  // res.send([
  //     { vehicleFeature_id: 1, feature: ""  },
  // ]);
});

router.get('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Dispatcher Vehicle Feature']
    #swagger.description = 'Get a dispatcher vehicle feature by dispatcherVehicleFeature_id'
    #swagger.operationId = 'getDispatcherVehicleFeatureById'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['id'] = {
      description: 'Dispatcher Vehicle Feature ID',
      type: 'number'
    }
    #swagger.responses[200] = {
      schema:{$ref: "#/definitions/DispatcherVehicleFeatureGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
    */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const dispatcherVehicleFeature = await getDispatcherVehicleFeature(
    req.params.id,
    '',
  );
  if (dispatcherVehicleFeature.error_code)
    return res
      .status(dispatcherVehicleFeature.error_code)
      .send(dispatcherVehicleFeature.error_message);

  res.send(dispatcherVehicleFeature);
});

// setters
router.post('/', auth, async (req, res) => {
  /*
    #swagger.tags = ['Dispatcher Vehicle Feature']
    #swagger.description = 'Add a dispatcher vehicle feature'
    #swagger.operationId = 'addDispatcherVehicleFeature'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Dispatcher Vehicle Feature data',
      schema: {$ref: "#/definitions/DispatcherVehicleFeatureCreate"}
    }
    #swagger.responses[200] = {
      schema:{$ref: "#/definitions/DispatcherVehicleFeaturesGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let dispatcherVehicleFeature = [];

  // return res.send(dispatcherVehicle);
  for await (const item of req.body) {
    let { error: dispatcherVehicleFeatureError } =
      validateDispatcherVehicleFeature(item);
    if (dispatcherVehicleFeatureError)
      return res
        .status(400)
        .send(dispatcherVehicleFeatureError.details[0].message);

    let response = await saveDispatcherVehicleFeature(item);
    if (response.error)
      return res.status(response.error_code).send(response.error_message);
    dispatcherVehicleFeature.push(response);
  }

  res.send(dispatcherVehicleFeature);
});

router.put('/', auth, async (req, res) => {
  /*
    #swagger.tags = ['Dispatcher Vehicle Feature']
    #swagger.description = 'Update multiple dispatcher vehicle feature'
    #swagger.operationId = 'updateDispatcherVehicleFeatures'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['body'] = { 
      in: 'body',
      description: 'Dispatcher Vehicle Feature Data',
      schema: {$ref: "#/definitions/DispatcherVehicleFeaturesUpdate" }
    }
    #swagger.responses[200] = {
      schema:{$ref: "#/definitions/DispatcherVehicleFeaturesGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  // router.put("/", async (req, res) => {
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let dispatcherVehicleFeature = [];

  for await (const item of req.body) {
    let { error: dispatcherVehicleFeatureError } =
      validateDispatcherVehicleFeature(item);
    if (dispatcherVehicleFeatureError)
      return res
        .status(400)
        .send(dispatcherVehicleFeatureError.details[0].message);
    let response = await updateDispatcherVehicleFeature('', item);
    if (response.error_code)
      return res.status(response.error_code).send(response.error_message);
    dispatcherVehicleFeature.push(response);
  }

  res.send(dispatcherVehicleFeature);
});

router.put('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Dispatcher Vehicle Feature']
    #swagger.description = 'Update a dispatcher vehicle feature'
    #swagger.operationId = 'updateDispatcherVehicleFeature'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['id'] = {
      description: 'Dispatcher Vehicle Feature ID',
      type: 'number'
    }
    #swagger.parameters['body'] = { 
      in: 'body',
      description: 'Dispatcher Vehicle Feature Data',
      schema: {$ref: "#/definitions/DispatcherVehicleFeatureUpdate" }
    }
    #swagger.responses[200] = {
      schema:{$ref: "#/definitions/DispatcherVehicleFeaturesGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error } = validateDispatcherVehicleFeature(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const dispatcherVehicleFeature = await updateDispatcherVehicleFeature(
    req.params.id,
    req.body,
  );
  if (dispatcherVehicleFeature.error_code)
    return res
      .status(dispatcherVehicleFeature.error_code)
      .send(dispatcherVehicleFeature.error_message);

  res.send(dispatcherVehicleFeature);
});

//delete
router.delete('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Dispatcher Vehicle Feature']
    #swagger.description = 'Delete a dispatcher vehicle feature'
    #swagger.operationId = 'deleteDispatcherVehicleFeature'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['id'] = {
      description: 'Dispatcher Vehicle Feature ID',
      type: 'number'
    }
    #swagger.responses[200] = {
      schema:{$ref: "#/definitions/DispatcherVehicleFeatureDelete"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }

  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);
  const dispatcherVehicleFeature = await deleteDispatcherVehicleFeature(
    req.params.id,
  );
  if (dispatcherVehicleFeature.error_code)
    return res
      .status(dispatcherVehicleFeature.error_code)
      .send(dispatcherVehicleFeature.error_message);

  return res.send(dispatcherVehicleFeature);
});

module.exports = router;
