const {
  validateParams,
  deleteCommissionItem,
} = require('../model/commission-item-model');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

//delete
router.delete('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commission - Item']
    #swagger.description = 'Delete commission's item';
    #swagger.operationId = 'deleteCommissionItem';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'CommissionItem ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CommissionItemDelete' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const item = await deleteCommissionItem(req.params.id);

  if (item.error_code)
    return res.status(item.error_code).send(item.error_message);
  return res.send(item);
});

module.exports = router;
