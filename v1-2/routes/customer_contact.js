const {
  validateParams,
  deleteCustomerContact,
} = require('../model/customer-contact-model');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

//delete
router.delete('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer - Contact']
    #swagger.description = 'Delete customer contact';
    #swagger.operationId = 'deleteCustomerContact';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer Contact ID',
      type: 'integer',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/CustomerContactDelete'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const customerContact = await deleteCustomerContact(req.params.id);

  if (customerContact.error_code)
    return res
      .status(customerContact.error_code)
      .send(customerContact.error_message);
  return res.send(customerContact);
});

module.exports = router;
