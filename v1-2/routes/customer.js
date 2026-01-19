const {
  validateCustomer,
  validateParams,
  getCustomer,
  saveCustomer,
  updateCustomer,
  deleteCustomer,
  customerFulltextSearch,
} = require('../model/customer-model');
const {
  getCustomerContact,
  validateCustomerContact,
  saveCustomerContact,
  updateCustomerContact,
} = require('../model/customer-contact-model');
const {
  getLoading,
  validateLoading,
  saveLoading,
  updateLoading,
  loadingPagination,
} = require('../model/loading-model');
const {
  getDischarge,
  validateDischarge,
  saveDischarge,
  updateDischarge,
  dischargePagination,
} = require('../model/discharge-model');
const auth = require('../middleware/auth');
const { getCommissionBy } = require('../model/commission-model');
const express = require('express');
const { custom } = require('@hapi/joi');
const router = express.Router();

//geters
router.get('/', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer']
    #swagger.description = 'Get customers';
    #swagger.operationId = 'getCustomers';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    limit, after, order_by, ordering
    "number",
    "company",
    "street",
    "postalCode",
    "country",
    "phone",
    "email",
    "note"
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of customers to return',
      type: 'number',
    }
    #swagger.parameters['after'] = {
      in: 'query',
      description: 'Customer id to start from',
      type: 'number',
    }
    #swagger.parameters['order_by'] = {
      in: 'query',
      description: 'Order by',
      enum: ['number', 'company', 'street', 'postalCode', 'country', 'phone', 'email', 'note'],
    }
    #swagger.parameters['ordering'] = {
      in: 'query',
      description: 'Ordering',
      enum: ['asc', 'desc'],
    }
    #swagger.parameters['number'] = {
      in: 'query',
      description: 'Customer number',
      type: 'number',
    }
    #swagger.parameters['company'] = {
      in: 'query',
      description: 'Customer company',
      type: 'string',
    }
    #swagger.parameters['street'] = {
      in: 'query',
      description: 'Customer street',
      type: 'string',
    }
    #swagger.parameters['postalCode'] = {
      in: 'query',
      description: 'Customer postal code',
      type: 'string',
    }
    #swagger.parameters['country'] = {
      in: 'query',
      description: 'Customer country',
      type: 'string',
    }
    #swagger.parameters['phone'] = {
      in: 'query',
      description: 'Customer phone',
      type: 'string',
    }
    #swagger.parameters['email'] = {
      in: 'query',
      description: 'Customer email',
      type: 'string',
    }
    #swagger.parameters['note'] = {
      in: 'query',
      description: 'Customer note',
      type: 'string',
    }
    #swagger.responses[200] = {
      schema: {
        data: { $ref: '#/definitions/CustomersGet' },
        next_cursor: 91,
      }
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.query);
  if (error) return res.status(400).send(error.details[0].message);

  //get customers
  const customer = await getCustomer('all', req.query);

  if (customer.error_code)
    return res.status(customer.error_code).send(customer.error_message);
  res.send(customer);
});

//search
router.get('/fulltext_search', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer']
    #swagger.description = 'Fulltext search';
    #swagger.operationId = 'customersFullTextSearch';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['parameter'] = {
      in: 'query',
      description: 'Search parameter',
      type: 'string',
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CustomersGet' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const response = await customerFulltextSearch(req.query.parameter);

  if (response.error_code)
    return res.status(response.error_code).send(response.error_message);
  return res.send(response);
});

router.get('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer']
    #swagger.description = 'Get customer by ID';
    #swagger.operationId = 'getCustomer';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/CustomerGet'}
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await getCustomer(req.params.id, '');
  if (customer.error_code)
    return res.status(customer.error_code).send(customer.error_message);
  res.send(customer);
});

router.get('/:id/customer_contact', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer - Contact']
    #swagger.description = 'Get customer contact';
    #swagger.operationId = 'getCustomerContact';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/CustomerContactsGet'}
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const customerContact = await getCustomerContact('', req.params.id);
  const customer = await getCustomer(req.params.id, '');
  if (!customer) {
    return res.status(400).send('Považovaný zákazník nebyl nalezen.');
  }

  if (customerContact.error_code)
    return res
      .status(customerContact.error_code)
      .send(customerContact.error_message);

  return res.send(customerContact);
});

router.get('/:id/loading', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer - Loading']
    #swagger.description = 'Get customer loading';
    #swagger.operationId = 'getCustomerLoading';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer ID',
      type: 'number',
    }
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number loadings to return',
      type: 'number',
    }
    #swagger.parameters['after'] = {
      in: 'query',
      description: 'Cursor for pagination',
      type: 'number',
    }
    #swagger.parameters['order_by'] = {
      in: 'query',
      description: 'Order by',
      enum: ['loading_id', 'company', 'country', 'countryCode', 'email', 'street', 'postalCode'],
    }
    #swagger.parameters['ordering'] = {
      in: 'query',
      description: 'Ordering',
      enum: ['asc', 'desc'],
    }
    #swagger.responses[200] = {
      schema: {
        data: {$ref: '#/definitions/CustomerLoadingsGet'},  
        next_cursor: ""
      }
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
   */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  //cursor pagination
  const pagination = loadingPagination(req.query);

  const loading = await getLoading('', pagination, req.params.id);

  if (loading.error_code)
    return res.status(loading.error_code).send(loading.error_message);

  return res.send(loading);
});

router.get('/:id/discharge', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer - Discharge']
    #swagger.description = 'Get customer discharge';
    #swagger.operationId = 'getCustomerDischarge';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer ID',
      type: 'number',
    }
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number discharges to return',
      type: 'number',
    }
    #swagger.parameters['after'] = {
      in: 'query',
      description: 'Cursor for pagination',
      type: 'number',
    }
    #swagger.parameters['order_by'] = {
      in: 'query',
      description: 'Order by',
      enum: ['discharge_id', 'company', 'country', 'countryCode', 'email', 'street', 'postalCode'],
    }
    #swagger.parameters['ordering'] = {
      in: 'query',
      description: 'Ordering',
      enum: ['asc', 'desc'],
    }
    #swagger.responses[200] = {
      schema: {
        data: {$ref: '#/definitions/CustomerDischargesGet'},
        next_cursor: ""
      }
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }

  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  //cursor pagination
  const pagination = dischargePagination(req.query);

  const discharge = await getDischarge('', pagination, req.params.id);

  if (discharge.error_code)
    return res.status(discharge.error_code).send(discharge.error_message);

  return res.send(discharge);
});

//seters
router.post('/', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer']
    #swagger.description = 'Create customer';
    #swagger.operationId = 'createCustomer';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Customer data',
      schema: { $ref: '#/definitions/CustomerCreate' }
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CustomerGet' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  req.body.addedBy = req.user.email;

  const customer = await saveCustomer(req.body);
  if (customer.error) return res.status(500).send(customer.error);

  return res.send(customer);
});

router.post('/:id/customer_contact', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer - Contact']
    #swagger.description = 'Create customer contact';
    #swagger.operationId = 'addCustomerContact';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Customer contact data',
      schema: { $ref: '#/definitions/CustomerContactCreate' }
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/CustomerContactsGet'}
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  let customerContact = [];

  for await (const item of req.body) {
    let { error: customerContactError } = validateCustomerContact(item);
    if (customerContactError)
      return res.status(400).send(customerContactError.details[0].message);

    let response = await saveCustomerContact(item, req.params.id);
    if (response.error)
      return res.status(response.error_code).send(response.error_message);
    customerContact.push(response);
  }

  return res.send(customerContact);
});

router.post('/:id/loading', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer - Loading']
    #swagger.description = 'Create customer loading';
    #swagger.operationId = 'addCustomerLoading';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Customer loading data',
      schema: { $ref: '#/definitions/CustomerLoadingCreate' }
    }
    #swagger.responses[200] = {
      schema: {
        data: {$ref: '#/definitions/CustomerLoadingsGet'},
        next_cursor: "",
      }
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  let loading = [];

  for await (const item of req.body) {
    let { error: loadingError } = validateLoading(item);
    if (loadingError)
      return res.status(400).send(loadingError.details[0].message);

    let response = await saveLoading(item, req.params.id);
    if (response.error)
      return res.status(response.error_code).send(response.error_message);
    loading.push(response);
  }

  return res.send(loading);
});

router.post('/:id/discharge', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer - Discharge']
    #swagger.description = 'Create customer discharge';
    #swagger.operationId = 'addCustomerDischarge';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Customer discharge data',
      schema: { $ref: '#/definitions/CustomerDischargeCreate' }
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/CustomerDischargesGet'}
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  let discharge = [];

  for await (const item of req.body) {
    let { error: dischargeError } = validateDischarge(item);
    if (dischargeError)
      return res.status(400).send(dischargeError.details[0].message);

    let response = await saveDischarge(item, req.params.id);
    if (response.error)
      return res.status(response.error_code).send(response.error_message);
    discharge.push(response);
  }

  return res.send(discharge);
});

router.put('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer']
    #swagger.description = 'Update customer';
    #swagger.operationId = 'updateCustomer';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer id',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Customer data',
      schema: { $ref: '#/definitions/CustomerUpdate' }
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CustomerGet' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let { error: customerError } = validateCustomer(req.body);
  if (customerError)
    return res.status(400).send(customerError.details[0].message);

  req.body.editedBy = req.user.email;

  const customer = await updateCustomer(req.params.id, req.body);
  if (customer.error_code)
    return res.status(customer.error_code).send(customer.error_message);

  return res.send(customer);
});

router.put('/:id/customer_contact', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer - Contact']
    #swagger.description = 'Update customer contact';
    #swagger.operationId = 'updateCustomerContact';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Customer contact data',
      schema: { $ref: '#/definitions/CustomerContactUpdate' }
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/CustomerContactsGet'}
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let customerContact = [];

  for await (const item of req.body) {
    let { error: customerContactError } = validateCustomerContact(item);
    if (customerContactError)
      return res.status(400).send(customerContactError.details[0].message);

    let response = await updateCustomerContact('', item);
    if (response.error_code)
      return res.status(response.error_code).send(response.error_message);
    customerContact.push(response);
  }

  return res.send(customerContact);
});

router.put('/:id/loading', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer - Loading']
    #swagger.description = 'Update customer loading';
    #swagger.operationId = 'updateCustomerLoading';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Customer loading data',
      schema: { $ref: '#/definitions/CustomerLoadingUpdate' }
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/CustomerLoadingsGet'}
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let loading = [];

  for await (const item of req.body) {
    let { error: loadingError } = validateLoading(item);
    if (loadingError)
      return res.status(400).send(loadingError.details[0].message);

    let response = await updateLoading('', item);
    if (response.error_code)
      return res.status(response.error_code).send(response.error_message);
    loading.push(response);
  }

  return res.send(loading);
});

router.put('/:id/discharge', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer - Discharge']
    #swagger.description = 'Update customer discharge';
    #swagger.operationId = 'updateCustomerDischarge';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Customer discharge data',
      schema: { $ref: '#/definitions/CustomerDischargeUpdate' }
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/CustomerDischargesGet'}
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let discharge = [];

  for await (const item of req.body) {
    let { error: dischargeError } = validateDischarge(item);
    if (dischargeError)
      return res.status(400).send(dischargeError.details[0].message);

    let response = await updateDischarge('', item);
    if (response.error_code)
      return res.status(response.error_code).send(response.error_message);
    discharge.push(response);
  }

  return res.send(discharge);
});

//delete
router.delete('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Customer']
    #swagger.description = 'Delete customers';
    #swagger.operationId = 'deleteCustomers';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer id',
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CustomerGet' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await deleteCustomer(req.params.id);

  if (customer.error_code)
    return res.status(customer.error_code).send(customer.error_message);
  return res.send(customer);
});

module.exports = router;
