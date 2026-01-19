const { validateParams, deleteLoading } = require('../model/loading-model');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

//delete
router.delete('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer - Loading']
    #swagger.description = 'Delete customer loading';
    #swagger.operationId = 'deleteLoading';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer Loading ID',
      type: 'integer',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/CustomerLoadingDelete'},
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const loading = await deleteLoading(req.params.id);

  if (loading.error_code)
    return res.status(loading.error_code).send(loading.error_message);
  return res.send(loading);
});

module.exports = router;
