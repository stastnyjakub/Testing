const {
  validateCommission,
  validateParams,
  validateDispatecherSearch,
  getCommission,
  saveCommission,
  updateCommission,
  deleteCommission,
  commissionFulltextSearch,
  dispatcherSearch,
  getCommissionBy,
} = require('../model/commission-model');
const {
  validateCommissionLoading,
  getCommissionLoading,
  saveCommissionLoading,
  updateCommissionLoading,
} = require('../model/commission-loading-model');
const {
  validateCommissionDischarge,
  getCommissionDischarge,
  saveCommissionDischarge,
  updateCommissionDischarge,
} = require('../model/commission-discharge-model');
const {
  validateCommissionItem,
  getCommissionItem,
  saveCommissionItem,
  updateCommissionItem,
} = require('../model/commission-item-model');
//const { getPlace, savePlace, validatePlace, updatePlace } = require("../model/place-model");
const broadcast = require('../model/web-socket-model.js');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

//geters
router.get('/', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commissions']
    #swagger.description = 'Get all commissions';
    #swagger.operationId = 'getCommissions';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['limit'] = {
      description: 'Number of commissions to return',
      type: 'number',
    }
    #swagger.parameters['after'] = {
      description: 'Page number',
      type: 'number',
    }
    #swagger.parameters['order_by'] = {
      description: 'Order by',
      enum: ['id', 'week', 'year', 'loading_date', 'loading_city', 'loading_zip', 'discharge_date', 'discharge_city', 'discharge_zip', 'total_weight', 'total_loading_meters', 'priceCustomer', 'priceCarrier', 'carrier_company', 'customer_company', 'provision', 'added_by', 'note', 'carrier_vat', 'vat', 'notification', 'invNumber', 'invoiced', 'currency'],
    }
    #swagger.parameters['ordering'] = {
      description: 'Ordering',
      enum: ['asc', 'desc'],
    }
    #swagger.parameters['relation'] = {
      description: 'Relation',
      type: 'string',
      example: 'CZCZ'
    }
    #swagger.parameters['week'] = {
      description: 'Week (created)',
      type: 'number',
    }
    #swagger.parameters['year'] = {
      description: 'Year (created)',
      type: 'number',
    }
    #swagger.parameters['loading_date'] = {
      description: 'Loading date',
      type: 'number',
    }
    #swagger.parameters['loading_city'] = {
      description: 'Loading city (name)',
      type: 'string',
    }
    #swagger.parameters['loading_zip'] = {
      description: 'Loading zip',
      type: 'string',
    }
    #swagger.parameters['discharge_date'] = {
      description: 'Discharge date',
      type: 'number',
    }
    #swagger.parameters['discharge_city'] = {
      description: 'Discharge city (name)',
      type: 'string',
    }
    #swagger.parameters['discharge_zip'] = {
      description: 'Discharge zip',
      type: 'string',
    }
    #swagger.parameters['total_weight'] = {
      description: 'Total weight',
      type: 'number',
    }
    #swagger.parameters['total_loading_meters'] = {
      description: 'Total loading meters',
      type: 'number',
    }
    #swagger.parameters['priceCustomer'] = {
      description: 'Price customer',
      type: 'number',
    }
    #swagger.parameters['priceCarrier'] = {
      description: 'Price carrier',
      type: 'number',
    }
    #swagger.parameters['carrier_company'] = {
      description: 'Carrier company',
      type: 'string',
    }
    #swagger.parameters['customer_company'] = {
      description: 'Customer company',
      type: 'string',
    }
    #swagger.parameters['provision'] = {
      description: 'Provision',
      type: 'number',
    }
    #swagger.parameters['added_by'] = {
      description: 'Added by',
      type: 'string',
    }
    #swagger.parameters['note'] = {
      description: 'Note',
      type: 'string',
    }
    #swagger.parameters['carrier_vat'] = {
      description: 'Carrier vat',
      type: 'number',
    }
    #swagger.parameters['vat'] = {
      description: 'Vat',
      type: 'number',
    }
    #swagger.parameters['notification'] = {
      description: 'Notification',
      type: 'boolean',
    }
    #swagger.parameters['invoiced'] = {
      description: 'Invoiced',
      type: 'boolean',
    }
    #swagger.parameters['currency'] = {
      description: 'Currency',
      type: 'string',
    }
    #swagger.responses[200] = {
      schema: {
        data: { $ref: '#/definitions/CommissionsGet' },
        next_cursor: 2,
      }
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.query);
  if (error) return res.status(400).send(error.details[0].message);

  //get commissions
  const commission = await getCommission('all', req.query);

  if (commission.error_code)
    return res.status(commission.error_code).send(commission.error_message);
  res.send(commission);
});

//search
router.get('/fulltext_search', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commissions']
    #swagger.description = 'Fulltext search';
    #swagger.operationId = 'commissionFulltextSearch';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['year'] = {
      in: 'query',
      description: 'Fulltext search - year',
      required: true,
      type: 'string',
    }
    #swagger.parameters['parameter'] = {
      in: 'query',
      description: 'Fulltext search - word',
      required: true,
      type: 'string',
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const response = await commissionFulltextSearch(req.query);

  if (response.error_code)
    return res.status(response.error_code).send(response.error_message);
  res.send(response);
});

router.get('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commissions']
    #swagger.description = 'Get commission by ID';
    #swagger.operationId = 'getCommission';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Commission ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: {
        data: { $ref: '#/definitions/CommissionGet' },
        next_curosor: "2"
      },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }

  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const commission = await getCommission(req.params.id, '');
  if (commission && commission.error_code)
    return res.status(commission.error_code).send(commission.error_message);
  res.send(commission);
});

router.get('/:id/commission_loading', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commission - Loading']
    #swagger.description = 'Get all commission's loading';
    #swagger.operationId = 'getCommissionLoading';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Commission ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: {
        data: { $ref: '#/definitions/CommissionLoadingsGet' },
        next_cursor: 2,
      }
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const commission_loading = await getCommissionLoading(
    '',
    req.query,
    req.params.id,
  );
  if (commission_loading.error_code)
    return res
      .status(commission_loading.error_code)
      .send(commission_loading.error_message);

  res.send(commission_loading);
});

router.get('/:id/commission_discharge', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commission - Discharge']
    #swagger.description = 'Get all commission's Discharge';
    #swagger.operationId = 'getCommissionDischarge';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Commission ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: {
        data: { $ref: '#/definitions/CommissionDischargesGet' },
        next_cursor: 2,
      },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const commission_discharge = await getCommissionDischarge(
    '',
    req.query,
    req.params.id,
  );
  if (commission_discharge.error_code)
    return res
      .status(commission_discharge.error_code)
      .send(commission_discharge.error_message);

  res.send(commission_discharge);
});

router.get('/:id/commission_item', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commission - Item']
    #swagger.description = 'Get all commission's item';
    #swagger.operationId = 'getCommissionItem';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Commission ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: {
        data: { $ref: '#/definitions/CommissionItemsGet' },
        next_cursor: 2,
      }, 
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  const commission_item = await getCommissionItem('', req.query, req.params.id);
  if (commission_item.error_code)
    return res
      .status(commission_item.error_code)
      .send(commission_item.error_message);

  res.send(commission_item);
});

//seters
router.post('/', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commissions']
    #swagger.description = 'Creates commission';
    #swagger.operationId = 'addCommission';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Commission data',
      required: true,
      schema: { $ref: '#/definitions/CommissionCreate' },
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CommissionCreate' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateCommission(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  req.body.addedBy = req.user.email;

  let commission = await saveCommission(req.body, false, req.user.user_id);
  if (commission.error) return res.status(500).send(commission.error);

  // broadcast propper data
  const broadcastCommission = await getCommissionBy(
    'commission_id',
    req.params.id,
  );
  if (!broadcastCommission.error && broadcastCommission.length > 0)
    broadcast(broadcastCommission);

  res.send(commission);
});

router.post('/:id/commission_loading', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commission - Loading']
    #swagger.description = 'Create commission's loading';
    #swagger.operationId = 'addCommissionLoading';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Commission ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Commission loading data',
      required: true,
      schema: { $ref: '#/definitions/CommissionLoadingCreate' },
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CommissionLoadingsGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  let commission_loading = [];

  for await (const item of req.body) {
    let { error: commission_loadingError } = validateCommissionLoading(item);
    if (commission_loadingError)
      return res.status(400).send(commission_loadingError.details[0].message);

    let response = await saveCommissionLoading(item, req.params.id);

    if (response.error)
      return res.status(response.error_code).send(response.error_message);
    commission_loading.push(response);
  }

  const broadcastCommission = await getCommissionBy(
    'commission_id',
    req.params.id,
  );
  if (!broadcastCommission.error && broadcastCommission.length > 0)
    broadcast(broadcastCommission);

  res.send(commission_loading);
});

router.post('/:id/commission_discharge', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commission - Discharge']
    #swagger.description = 'Create commission's Discharge';
    #swagger.operationId = 'addCommissionDischarge';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Commission ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Commission Discharge data',
      required: true,
      schema: { $ref: '#/definitions/CommissionDischargeCreate' },
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CommissionDischargesGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  let commission_discharge = [];

  for await (const item of req.body) {
    let { error: commission_dischargeError } =
      validateCommissionDischarge(item);
    if (commission_dischargeError)
      return res.status(400).send(commission_dischargeError.details[0].message);

    let response = await saveCommissionDischarge(item, req.params.id);
    if (response.error)
      return res.status(response.error_code).send(response.error_message);
    commission_discharge.push(response);
  }

  const broadcastCommission = await getCommissionBy(
    'commission_id',
    req.params.id,
  );
  if (!broadcastCommission.error && broadcastCommission.length > 0)
    broadcast(broadcastCommission);

  res.send(commission_discharge);
});

router.post('/:id/commission_item', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commission - Item']
    #swagger.description = 'Create commission's item';
    #swagger.operationId = 'addCommissionItem';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Commission ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Commission item data',
      required: true,
      schema: { $ref: '#/definitions/CommissionItemCreate' },
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CommissionItemsGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  let commission_item = [];

  for await (const item of req.body) {
    let { error: commission_itemError } = validateCommissionItem(item);
    if (commission_itemError)
      return res.status(400).send(commission_itemError.details[0].message);

    let response = await saveCommissionItem(item, req.params.id);
    if (response.error)
      return res.status(response.error_code).send(response.error_message);
    commission_item.push(response);
  }

  const broadcastCommission = await getCommissionBy(
    'commission_id',
    req.params.id,
  );
  if (!broadcastCommission.error && broadcastCommission.length > 0)
    broadcast(broadcastCommission);

  res.send(commission_item);
});

router.post('/dispatcher_search', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commission - Dispatcher Search']
    #swagger.description = 'Search commission by dispatcher';
    #swagger.operationId = 'searchCommissionByDispatcher';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Commission search data',
      required: true,
      schema:{ $ref: '#/definitions/CommissionDispatcherSearchBody'},
    },
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error } = validateDispatecherSearch(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let response = await dispatcherSearch(req.body);
  if (response.error_code)
    return res.status(response.error_code).send(response.error_message);
  res.send(response);
});

router.put('/:id/commission_loading', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commission - Loading']
    #swagger.description = 'Update commission's loading';
    #swagger.operationId = 'updateCommissionLoading';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Commission ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Commission loading data',
      required: true,
      schema: { $ref: '#/definitions/CommissionLoadingUpdate' },
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CommissionLoadingsGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let commission_loading = [];

  for await (const item of req.body) {
    let { error: commission_loadingError } = validateCommissionLoading(item);
    if (commission_loadingError)
      return res.status(400).send(commission_loadingError.details[0].message);

    let response = await updateCommissionLoading('', item);
    if (response.error_code)
      return res.status(response.error_code).send(response.error_message);
    commission_loading.push(response);
  }

  const broadcastCommission = await getCommissionBy(
    'commission_id',
    req.params.id,
  );
  if (!broadcastCommission.error && broadcastCommission.length > 0)
    broadcast(broadcastCommission);

  res.send(commission_loading);
});

router.put('/:id/commission_discharge', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commission - Discharge']
    #swagger.description = 'Update commission's Discharge';
    #swagger.operationId = 'updateCommissionDischarge';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Commission ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Commission Discharge data',
      required: true,
      schema: { $ref: '#/definitions/CommissionDischargeUpdate' },
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CommissionDischargesGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let commission_discharge = [];

  for await (const item of req.body) {
    let { error: commission_dischargeError } =
      validateCommissionDischarge(item);
    if (commission_dischargeError)
      return res.status(400).send(commission_dischargeError.details[0].message);

    let response = await updateCommissionDischarge('', item);
    if (response.error_code)
      return res.status(response.error_code).send(response.error_message);
    commission_discharge.push(response);
  }

  const broadcastCommission = await getCommissionBy(
    'commission_id',
    req.params.id,
  );
  if (!broadcastCommission.error && broadcastCommission.length > 0)
    broadcast(broadcastCommission);

  res.send(commission_discharge);
});

router.put('/:id/commission_item', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commission - Item']
    #swagger.description = 'Update commission's item';
    #swagger.operationId = 'updateCommissionItem';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Commission ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Commission Item data',
      required: true,
      schema: { $ref: '#/definitions/CommissionItemUpdate' },
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/CommissionItemsGet' },
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let commission_item = [];

  for await (const item of req.body) {
    let { error: commission_itemError } = validateCommissionItem(item);
    if (commission_itemError)
      return res.status(400).send(commission_itemError.details[0].message);

    let response = await updateCommissionItem('', item);
    if (response.error_code)
      return res.status(response.error_code).send(response.error_message);
    commission_item.push(response);
  }

  const broadcastCommission = await getCommissionBy(
    'commission_id',
    req.params.id,
  );
  if (!broadcastCommission.error && broadcastCommission.length > 0)
    broadcast(broadcastCommission);

  res.send(commission_item);
});

router.put('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commissions']
    #swagger.description = 'Updates a commission';
    #swagger.operationId = 'updateCommission';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Commission ID',
      type: 'number',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Commission data',
      schema:{$ref: '#/definitions/CommissionUpdate'}
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/CommissionUpdate'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error: idError } = validateParams(req.params);
  if (idError) return res.status(400).send(idError.details[0].message);

  let { error: commissionError } = validateCommission(req.body);

  if (commissionError)
    return res.status(400).send(commissionError.details[0].message);

  req.body.editedBy = req.user.email;

  let commission = await updateCommission(req.params.id, req.body);
  if (commission.error_code)
    return res.status(commission.error_code).send(commission.error_message);

  // proper broadcast data
  const broadcastCommission = await getCommissionBy(
    'commission_id',
    req.params.id,
  );
  if (!broadcastCommission.error && broadcastCommission.length > 0)
    broadcast(broadcastCommission);

  res.send(commission);
});

//delete
router.delete('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Commissions']
    #swagger.description = 'Deletes a commission';
    #swagger.operationId = 'deleteCommission';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Commission ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/CommissionDelete'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);

  let commission = await deleteCommission(req.params.id);

  if (commission.error_code)
    return res.status(commission.error_code).send(commission.error_message);

  if (process.env.NODE_ENV != 'TEST') broadcast([commission]);

  // return all commission as request from frontend
  res.send(commission);
});

module.exports = router;
