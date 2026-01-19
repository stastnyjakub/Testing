const { validateParams, getLanguageCodes } = require('../model/state-model');

const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

router.get('/languages', auth, async (req, res) => {
  /*
    #swagger.tags = ['State Languages']
    #swagger.description = 'Get all languages';
    #swagger.operationId = 'getLanguages';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/StateLanguagesGet'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.query);
  if (error) return res.status(400).send(error.details[0].message);
  const language = await getLanguageCodes();
  if (language.error_code)
    return res.status(language.error_code).send(language.error_message);
  res.send(language);
});

router.get('/languages/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['State Languages']
    #swagger.description = 'Get language by ID';
    #swagger.operationId = 'getLanguage';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Language ID',
      type: 'integer',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/StateLanguageGet'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.query);
  if (error) return res.status(400).send(error.details[0].message);
  const language = await getLanguageCodes(req.params.id);
  if (language.error_code)
    return res.status(language.error_code).send(language.error_message);
  res.send(language);
});

module.exports = router;
