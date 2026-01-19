const {
  validateParams,
  validateRequestDischarge,
  getRequestDischarge,
  updateRequestDischarge,
  saveRequestDischarge,
  deleteRequestDischarge
} = require("../model/request-discharge-model");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

//geters
router.get("/", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request - Discharge']
    #swagger.description = 'Get all request's discharges'
    #swagger.operationId = 'getRequestDischarges'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.responses[200] = {
      schema:{
        data: {$ref: "#/definitions/RequestDischargesGet"},
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
  const requestDischarge = await getRequestDischarge("all", req.query);

  if (requestDischarge.error_code)
    return res
      .status(requestDischarge.error_code)
      .send(requestDischarge.error_message);
  res.send(requestDischarge);
});

router.get("/:id", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request - Discharge']
    #swagger.description = 'Get request discharge by id'
    #swagger.operationId = 'getRequestDischarge'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Request Discharge id',
      type: 'string'
    }
    #swagger.responses[200] = {
      schema: {$ref: "#/definitions/RequestDischargeGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const requestDischarge = await getRequestDischarge(req.params.id, "");
  if (requestDischarge.error_code)
    return res
      .status(requestDischarge.error_code)
      .send(requestDischarge.error_message);
  res.send(requestDischarge);
});

//seters
router.post("/", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request - Discharge']
    #swagger.description = 'Create a new request discharge'
    #swagger.operationId = 'addRequestDischarge'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['requestDischarge'] = {
      in: 'body',
      description: 'Request discharge data',
      schema: {$ref: "#/definitions/RequestDischargeCreate"},
    }
    #swagger.responses[200] = {
      schema: {$ref: "#/definitions/RequestDischargeGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateRequestDischarge(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const requestDischarge = await saveRequestDischarge(req.body);
  if (requestDischarge.error)
    return res.status(500).send(requestDischarge.error);

  return res.send(requestDischarge);
});

router.put("/:id", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request - Discharge']
    #swagger.description = 'Update a new request discharge'
    #swagger.operationId = 'updateRequestDischarge'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Request Discharge id',
      type: 'string'
    }
    #swagger.parameters['requestDischarge'] = {
      in: 'body',
      description: 'Request discharge data',
      schema: {$ref: "#/definitions/RequestDischargeUpdate"},
    }
    #swagger.responses[200] = {
      schema: {$ref: "#/definitions/RequestDischargeGet"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let { error: requestDischargeError } = validateRequestDischarge(req.body);
  if (requestDischargeError)
    return res.status(400).send(customerError.details[0].message);

  const requestDischarge = await updateRequestDischarge(
    req.params.id,
    req.body
  );
  if (requestDischarge.error_code)
    return res
      .status(requestDischarge.error_code)
      .send(requestDischarge.error_message);
  return res.send(requestDischarge);
});

//delete
router.delete("/:id", auth, async (req, res) => {
  /*
    #swagger.tags = ['Request - Discharge']
    #swagger.description = 'Delete a request discharge'
    #swagger.operationId = 'deleteRequestDischarge'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
      type: 'string'
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Request Discharge id',
      type: 'string'
    }
    #swagger.responses[200] = {
      schema: {$ref: "#/definitions/RequestDischargeDelete"},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const requestDischarge = await deleteRequestDischarge(req.params.id);

  if (requestDischarge.error_code)
    return res
      .status(requestDischarge.error_code)
      .send(requestDischarge.error_message);
  return res.send(requestDischarge);
});

module.exports = router;
