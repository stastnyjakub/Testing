const {
  validateDispatcher,
  validateParams,
  saveDispatcher,
  getDispatcher,
  deleteDispatcher,
} = require('../model/dispatcher-model');
const auth = require('../middleware/auth');
const verify = require('../middleware/verify');
const express = require('express');
const router = express.Router();

router.get('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Carrier - Dispatcher']
    #swagger.description = 'Get carrier dispatcher by ID'
    #swagger.operationId = 'getDispatcher'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Dispatcher ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CarrierDispatchersGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { relations } = req.query;
  const { id: dispatcher_id } = req.params;

  const dispatcher = await getDispatcher({
    dispatcher_id,
    relations,
  });

  if (!dispatcher) return res.status(404).send('Dispečer nenalezen');

  if (dispatcher.error_code)
    return res.status(dispatcher.error_code).send(dispatcher.error_message);
  return res.send(dispatcher);
});

router.get('/public/:token', verify, async (req, res) => {
  /*
    #swagger.tags = ['Carrier - Dispatcher']
    #swagger.description = 'Get carrier dispatcher by token'
    #swagger.operationId = 'getDispatcherToken'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['token'] = {
      in: 'path',
      description: 'Dispatcher token',
      type: 'string',
    }
    #swagger.parameters['relations'] = {
      in: 'query',
      description: 'Relations',
      type: 'string',
    }
    #swagger.responses[200] = {
        schema: { $ref: '#/definitions/DispatcherGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  // midleware already checked if dispatcher exist
  const { relations } = req.query;
  const { dispatcher_id } = req;

  const dispatcher = await getDispatcher({
    dispatcher_id,
    relations,
  });

  if (dispatcher.error_code)
    return res.status(dispatcher.error_code).send(dispatcher.error_message);
  return res.send(dispatcher);
});

//delete
router.delete('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Carrier - Dispatcher']
    #swagger.description = 'Delete carrier dispatcher'
    #swagger.operationId = 'deleteCarrierDispatcher'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Carrier ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CarrierDispatcherGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const dispatcher = await deleteDispatcher(req.params.id);

  if (dispatcher.error_code)
    return res.status(dispatcher.error_code).send(dispatcher.error_message);
  return res.send(dispatcher);
});

module.exports = router;
