const {
  validateParams,
  validateRequestLoading,
  getRequestLoading,
  updateRequestLoading,
  saveRequestLoading,
  deleteRequestLoading
} = require("../model/request-loading-model");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

//geters
router.get("/", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request - Loading']
    #swagger.description = 'Get all request's loadings'
    #swagger.operationId = 'getRequestLoadings'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Request id',
      type: 'string'
    }
    #swagger.responses[200] = {
      schema:{
        data: {$ref: "#/definitions/RequestLoadingsGet"},
        next_cursor: 2
      },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.query);
  if (error) return res.status(400).send(error.details[0].message);

  //get customers
  const requestloading = await getRequestLoading("all", req.query);

  if (requestloading.error_code)
    return res
      .status(requestloading.error_code)
      .send(requestloading.error_message);
  res.send(requestloading);
});

router.get("/:id", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request - Loading']
    #swagger.description = 'Get request loading by id'
    #swagger.operationId = 'getRequestLoading'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'RequestLoading id',
      type: 'string'
    }
    #swagger.responses[200] = {
      schema: {$ref: "#/definitions/RequestLoadingGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const requestloading = await getRequestLoading(req.params.id, "");
  if (requestloading.error_code)
    return res
      .status(requestloading.error_code)
      .send(requestloading.error_message);
  res.send(requestloading);
});

//seters
router.post("/", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request - Loading']
    #swagger.description = 'Add new request loading'
    #swagger.operationId = 'addRequestLoading'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Request loading data',
      schema: {
        $ref: "#/definitions/RequestLoadingCreate"
      }
    }
    #swagger.responses[200] = {
      schema: {$ref: "#/definitions/RequestLoadingGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateRequestLoading(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const requestloading = await saveRequestLoading(req.body);
  if (requestloading.error) return res.status(500).send(requestloading.error);

  return res.send(requestloading);
});

router.put("/:id", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request - Loading']
    #swagger.description = 'Update request loading'
    #swagger.operationId = 'updateRequestLoading'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'RequestLoading id',
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Request loading data',
      schema: {
        $ref: "#/definitions/RequestLoadingUpdate"
      }
    }
    #swagger.responses[200] = {
      schema: {$ref: "#/definitions/RequestLoadingGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let { error: requestloadingError } = validateRequestLoading(req.body);
  if (requestloadingError)
    return res.status(400).send(customerError.details[0].message);

  const requestloading = await updateRequestLoading(req.params.id, req.body);
  if (requestloading.error_code)
    return res
      .status(requestloading.error_code)
      .send(requestloading.error_message);
  return res.send(requestloading);
});

//delete
router.delete("/:id", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request - Loading']
    #swagger.description = 'Delete request loading'
    #swagger.operationId = 'deleteRequestLoading'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'RequestLoading id',
      type: 'string'
    }
    #swagger.responses[200] = {
      schema: {$ref: "#/definitions/RequestLoadingDelete"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const requestloading = await deleteRequestLoading(req.params.id);

  if (requestloading.error_code)
    return res
      .status(requestloading.error_code)
      .send(requestloading.error_message);
  return res.send(requestloading);
});

module.exports = router;
