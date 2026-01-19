const {
  validateRequest,
  validateParams,
  getRequest,
  saveRequest,
  updateRequest,
  deleteRequest,
  requestFulltextSearch
} = require("../model/request-model");
const {
  validateRequestDischarge,
  getRequestDischarge,
  updateRequestDischarge,
  saveRequestDischarge
} = require("../model/request-discharge-model");
const {
  validateRequestLoading,
  getRequestLoading,
  updateRequestLoading,
  saveRequestLoading
} = require("../model/request-loading-model");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

//geters
router.get("/", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request']
    #swagger.description = 'Get all requests'
    #swagger.operationId = 'getRequest'
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
    #swagger.parameters['addedBy'] = {
      in: 'query',
      description: 'Added by',
      type: 'string'
    }
    #swagger.parameters['editedBy'] = {
      in: 'query',
      description: 'Edited by',
      type: 'string'
    }
    #swagger.parameters['carriers'] = {
      in: 'query',
      description: 'Carriers',
      type: 'array'
    }
    #swagger.parameters['discharge'] = {
      in: 'query',
      description: 'Discharge',
      type: 'object'
    }
    #swagger.parameters['dispatchers'] = {
      in: 'query',
      description: 'Dispatchers',
      type: 'array'
    }
    #swagger.parameters['loading'] = {
      in: 'query',
      description: 'Loading',
      type: 'object'
    }
    #swagger.parameters['loadingDateFrom'] = {
      in: 'query',
      description: 'Loading date from',
      type: 'number'
    }
    #swagger.parameters['loadingDateTo'] = {
      in: 'query',
      description: 'Loading date to',
      type: 'number'
    }
    #swagger.parameters['loadingRadius'] = {
      in: 'query',
      description: 'Loading radius',
      type: 'number'
    }
    #swagger.parameters['number'] = {
      in: 'query',
      description: 'Number',
      type: 'number'
    }
    #swagger.parameters['qid'] = {
      in: 'query',
      description: 'Qid',
      type: 'string'
    }
    #swagger.parameters['relation'] = {
      in: 'query',
      description: 'Relation',
      type: 'string'
    }
    #swagger.parameters['week'] = {
      in: 'query',
      description: 'Week',
      type: 'number'
    }
    #swagger.parameters['year'] = {
      in: 'query',
      description: 'Year',
      type: 'number'
    }
    #swagger.responses[200] = {
      schema:{
        data: {$ref: "#/definitions/RequestsGet"},
        next_cursor: 2
      },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }

  */
  const { error } = validateParams(req.query);
  if (error) return res.status(400).send(error.details[0].message);

  //get requests
  const request = await getRequest("all", req.query);

  if (request.error_code)
    return res.status(request.error_code).send(request.error_message);
  res.send(request);
});

//search
router.get("/fulltext_search", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request']
    #swagger.description = 'Fulltext search requests'
    #swagger.operationId = 'fulltextSearchRequest'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['parameter'] = {
      in: 'query',
      description: 'Word to search',
      type: 'string'
    }
    #swagger.parameters['year'] = {
      in: 'query',
      description: 'Year',
      type: 'number'
    }
    #swagger.responses[200] = {
      schema:{$ref: "#/definitions/RequestsGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }

  */
  const response = await requestFulltextSearch(req.query);

  if (response.error_code)
    return res.status(response.error_code).send(response.error_message);
  return res.send(response);
});

router.get("/:id", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request']
    #swagger.description = 'Get request by id'
    #swagger.operationId = 'getRequestById'
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
      schema:{$ref: "#/definitions/RequestGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const request = await getRequest(req.params.id, "");
  if (request.error_code)
    return res.status(request.error_code).send(request.error_message);
  res.send(request);
});

router.get("/:id/request_loading", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request - Loading']
    #swagger.description = 'Get all request's loadings'
    #swagger.operationId = 'getRequestRequestLoadings'
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
        data: {$ref: "#/definitions/RequestRequestLoadingsGet"},
        next_cursor: 2
      },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const request_loading = await getRequestLoading("", req.query, req.params.id);
  if (request_loading.error_code)
    return res
      .status(request_loading.error_code)
      .send(request_loading.error_message);

  return res.send(request_loading);
});

router.get("/:id/request_discharge", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request - Discharge']
    #swagger.description = 'Get all request's discharges'
    #swagger.operationId = 'getRequestRequestDsicharges'
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
        data: {$ref: "#/definitions/RequestRequestDischargesGet"},
        next_cursor: 2
      },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const request_discharge = await getRequestDischarge(
    "",
    req.query,
    req.params.id
  );
  if (request_discharge.error_code)
    return res
      .status(request_discharge.error_code)
      .send(request_discharge.error_message);

  return res.send(request_discharge);
});

//seters
router.post("/", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request']
    #swagger.description = 'Add request'
    #swagger.operationId = 'addRequest'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Request object',
      schema: {$ref: "#/definitions/RequestCreate"}
    }
    #swagger.responses[200] = {
      schema:{$ref: "#/definitions/RequestGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }

  */
  const { error } = validateRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  req.body.addedBy = req.user.email;

  const request = await saveRequest(req.body);
  if (request.error) return res.status(500).send(request.error);

  return res.send(request);
});

router.post("/:id/request_loading", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request - Loading']
    #swagger.description = 'Add request loading'
    #swagger.operationId = 'addRequestRequestLoadings'
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
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Request loading object',
      schema: {$ref: "#/definitions/RequestRequestLoadingsCreate"}
    }
    #swagger.responses[200] = {
      schema:{$ref: "#/definitions/RequestRequestLoadingsGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  let request_loading = [];

  for await (const item of req.body) {
    let { error: request_loadingError } = validateRequestLoading(item);
    if (request_loadingError)
      return res.status(400).send(request_loadingError.details[0].message);

    let response = await saveRequestLoading(item, req.params.id);
    if (response.error)
      return res.status(response.error_code).send(response.error_message);
    request_loading.push(response);
  }

  return res.send(request_loading);
});

router.post("/:id/request_discharge", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request - Discharge']
    #swagger.description = 'Add request discharge'
    #swagger.operationId = 'addRequestRequestDischarges'
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
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Request discharge object',
      schema: {$ref: "#/definitions/RequestRequestDischargesCreate"}
    }
    #swagger.responses[200] = {
      schema:{$ref: "#/definitions/RequestRequestDischargesGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  let request_discharge = [];

  for await (const item of req.body) {
    let { error: request_dischargeError } = validateRequestDischarge(item);
    if (request_dischargeError)
      return res.status(400).send(request_dischargeError.details[0].message);

    let response = await saveRequestDischarge(item, req.params.id);
    if (response.error)
      return res.status(response.error_code).send(response.error_message);
    request_discharge.push(response);
  }

  return res.send(request_discharge);
});

router.put("/:id/request_loading", auth, async (req, res) => {
    /*
    #swagger.tags = ['Request - Loading']
    #swagger.description = 'Update request loading'
    #swagger.operationId = 'updateRequestRequestLoadings'
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
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Request loading object',
      schema: {$ref: "#/definitions/RequestRequestLoadingsUpdate"}
    }
    #swagger.responses[200] = {
      schema:{$ref: "#/definitions/RequestRequestLoadingsGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let request_loading = [];

  for await (const item of req.body) {
    let { error: request_loadingError } = validateRequestLoading(item);
    if (request_loadingError)
      return res.status(400).send(request_loadingError.details[0].message);

    let response = await updateRequestLoading("", item);
    if (response.error_code)
      return res.status(response.error_code).send(response.error_message);
    request_loading.push(response);
  }

  return res.send(request_loading);
});

router.put("/:id/request_discharge", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request - Discharge']
    #swagger.description = 'Update request discharge'
    #swagger.operationId = 'updateRequestRequestDischarges'
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
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Request discharge object',
      schema: {$ref: "#/definitions/RequestRequestDischargesUpdate"}
    }
    #swagger.responses[200] = {
      schema:{$ref: "#/definitions/RequestRequestDischargesGet"},
    }
    #swagger.responses[500] = { 
      description: 'Internal server error',
    }
  */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let request_discharge = [];

  for await (const item of req.body) {
    let { error: request_dischargeError } = validateRequestDischarge(item);
    if (request_dischargeError)
      return res.status(400).send(request_dischargeError.details[0].message);

    let response = await updateRequestDischarge("", item);
    if (response.error_code)
      return res.status(response.error_code).send(response.error_message);
    request_discharge.push(response);
  }

  return res.send(request_discharge);
});

router.put("/:id", auth, async (req, res) => {
  /* 
    #swagger.tags = ['Request']
    #swagger.description = 'Update request'
    #swagger.operationId = 'updateRequest'
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
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Request object',
      schema: {$ref: "#/definitions/RequestUpdate"}
    }
    #swagger.responses[200] = {
      schema:{$ref: "#/definitions/RequestGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let { error: requestError } = validateRequest(req.body);
  if (requestError)
    return res.status(400).send(requestError.details[0].message);

  req.body.editedBy = req.user.email;

  const request = await updateRequest(req.params.id, req.body);
  if (request.error_code)
    return res.status(request.error_code).send(request.error_message);
  return res.send(request);
});

//delete
router.delete("/:id", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request']
    #swagger.description = 'Delete request'
    #swagger.operationId = 'deleteRequest'
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
      schema:{$ref: "#/definitions/RequestDelete"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const request = await deleteRequest(req.params.id);

  if (request.error_code)
    return res.status(request.error_code).send(request.error_message);
  return res.send(request);
});

module.exports = router;
