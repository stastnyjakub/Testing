const { validateRate, getRates, updateRates } = require('../model/rate-model');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

//geters
router.get('/', auth, async (req, res) => {
  /*
    #swagger.tags = ['Rate']
    #swagger.description = 'Get rates';  
    #swagger.operationId = 'getRates';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/RateGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  //get rates
  const rates = await getRates();

  if (rates.error_code)
    return res.status(rates.error_code).send(rates.error_message);
  res.send(rates);
});

router.put('/', auth, async (req, res) => {
  /*
    #swagger.tags = ['Rate']
    #swagger.description = 'Update rates';  
    #swagger.operationId = 'updateRates';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Rate data',
      schema: { $ref: '#/definitions/RateUpdateBody' },
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/RateGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error } = validateRate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const rates = await updateRates(req.body);

  if (rates.error_code)
    return res.status(rates.error_code).send(rates.error_message);
  res.send(rates);
});

module.exports = router;
