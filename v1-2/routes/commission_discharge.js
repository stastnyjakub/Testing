const {
  validateParams,
  deleteCommissionDischarge,
} = require('../model/commission-discharge-model');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

//delete
router.delete('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commission - Discharge']
    #swagger.description = 'Delete commission's Discharge';
    #swagger.operationId = 'deleteCommissionDischarge';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'CommissionDischarge ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CommissionDischargeDelete' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const discharge = await deleteCommissionDischarge(req.params.id);

  if (discharge.error_code)
    return res.status(discharge.error_code).send(discharge.error_message);
  return res.send(discharge);
});

module.exports = router;
