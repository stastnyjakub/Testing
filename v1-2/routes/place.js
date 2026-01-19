const { validateParams, deletePlace } = require('../model/place-model');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

//delete
router.delete('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Carrier - Place']
    #swagger.description = 'Delete carrier place';
    #swagger.operationId = 'deleteCarrierPlace';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'CarrierPlace ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CarrierPlaceDelete' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const place = await deletePlace(req.params.id);

  if (place.error_code)
    return res.status(place.error_code).send(place.error_message);
  return res.send(place);
});

module.exports = router;
