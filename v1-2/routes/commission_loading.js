const {
  validateParams,
  deleteCommissionLoading,
} = require('../model/commission-loading-model');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

//delete
router.delete('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commission - Loading']
    #swagger.description = 'Delete commission's loading';
    #swagger.operationId = 'deleteCommissionLoading';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'CommissionLoading ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CommissionLoadingDelete' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const loading = await deleteCommissionLoading(req.params.id);

  if (loading.error_code)
    return res.status(loading.error_code).send(loading.error_message);
  return res.send(loading);
});

module.exports = router;
