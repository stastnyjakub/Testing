const { validateParams, deleteDischarge } = require('../model/discharge-model');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

//delete
router.delete('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer - Discharge']
    #swagger.description = 'Delete customer discharge';
    #swagger.operationId = 'deleteDischarge';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer Discharge ID',
      type: 'integer',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/CustomerDischargeDelete'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const discharge = await deleteDischarge(req.params.id);

  if (discharge.error_code)
    return res.status(discharge.error_code).send(discharge.error_message);
  return res.send(discharge);
});

module.exports = router;
