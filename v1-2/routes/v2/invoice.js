const auth = require('../../middleware/auth');
const express = require('express');
const router = express.Router();
const {
  validateId,
  validateRequestBody,
  makePointDate,
  validateText,
  findOne,
  find,
  update,
  makeInvoiceText,
} = require('../../model/v2/invoice-model');

// default respons paramas and relations
const responseParams = [
  'invoice_id',
  'canceled',
  'constantSymbol',
  'dueDate',
  'exported',
  'invoiceNumber',
  'invoiceSent',
  'invoice_id',
  'issueDate',
  'language',
  'paid',
  'paymentMethod',
  'pointDate',
  'reverseCharge',
  'text',
  'user_id',
  'valueAddedTax',
];
let relations = [
  {
    commission: {
      id: 'invoice_id',
      responseParams: [
        'commission_id',
        'currencyCarrier',
        'currencyCustomer',
        'customerContact_id',
        'customer_id',
        'exchangeRateCarrier',
        'exchangeRateCustomer',
        'orderDate',
        'orderNumber',
        'priceCustomer',
        'qid',
        'relation',
        'vat',
      ],
    },
  },
];

// validate params
// get data
// poputate relations
// models model - find, findOne, update, delete
// - find: find(['paramaters'],[relations]) res: { data: { invoces, users, whatever}}
// - findOne: find(id,['paramaters'],[relations]) res: { data: { invoces, users, whatever}}

router.get('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Invoice - V2']
    #swagger.description = 'Get invoice';
    #swagger.operationId = 'getInvoiceV2';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Invoice id',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/InvoiceGetV2'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateId(req.params);

  if (error)
    return res.status(404).send({
      message: error.details[0].message,
      messageDetail: error.details[0].message,
    });

  const invoice = await findOne(req.params.id, responseParams, relations);

  if (!invoice || invoice.error_code)
    return res.status(invoice.error_code).send({
      message: 'Fakturu se nepodařilo vytvořit',
      messageDetail: invoice.error_message,
    });

  res.send(invoice);
});

router.put('/:id', auth, async (req, res) => {
  /*
    #swagger.tags = ['Invoice - V2']
    #swagger.description = 'Update invoice';
    #swagger.operationId = 'updateInvoiceV2';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Invoice id',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Invoice data',
      schema: {$ref: '#/definitions/InvoiceUpdateV2'},
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/InvoiceUpdateV2'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error } = validateId(req.params);

  if (error)
    return res.status(404).send({
      message: error.details[0].message,
      messageDetail: error.details[0].message,
    });

  ({ error } = validateRequestBody(req.body));

  if (error)
    return res.status(404).send({
      message: error.details[0].message,
      messageDetail: error.details[0].message,
    });

  const invoice = await update(
    req.params.id,
    req.body,
    responseParams,
    relations,
  );

  if (!invoice || invoice.error_code)
    return res.status(invoice.error_code).send({
      message: 'Fakturu se nepodařilo upravit',
      messageDetail: invoice.error_message,
    });

  res.send(invoice);
});

router.get('/', auth, async (req, res) => {
  /*
    #swagger.tags = ['Invoice - V2']
    #swagger.description = 'Get all invoices';
    #swagger.operationId = 'getInvoicesV2';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    _limit, _sort, _search, _start,
    #swagger.parameters['_limit'] = {
      in: 'query',
      description: 'Number of invoices to return',
    }
    #swagger.parameters['_sort'] = {
      in: 'query',
      description: 'Sort by',
    }
    #swagger.parameters['_search'] = {
      in: 'query',
      description: 'Search by',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/InvoicesGetV2'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let findAllResponseParams = [
    ...responseParams,
    'customer_company',
    'orderDate',
    'orderNumber',
    'priceCustomer',
    'exchangeRateCustomer',
    'number',
    'customer_id',
  ];

  let invoices = await find(findAllResponseParams, req.query);

  for await (const invoice of invoices.data) {
    invoice.pointDate ||= String(await makePointDate(invoice));
    if (invoice.exchangeRateCustomer) {
      invoice.priceCustomer =
        Number(invoice.priceCustomer) / Number(invoice.exchangeRateCustomer);
    }
  }

  if (invoices.error_code)
    return res.status(invoices.error_code).send({
      message: 'Faktury se nepodařilo načíst',
      messageDetail: invoices.error_message,
    });
  res.send(invoices);
});

/**
 * Get language code
 * Address /api/v2/invoice/text/:invoice/:languageCode
 * Parameters
 * invoice - invoice id (number from 1 to 2147483647, required)
 * languageCode - 2 chars code (value "en", "de", "cs", required)
 * 
 * On Success response
 * res.status = 200,
 * res.body = {
 * text
 * } 
 * 
 * On validation error response 
* res.error = {
     status: 404,
     text: '{ 
      message,
      messageDetail 
    }',
  }
 * On  invoice error response
* res.error = {
    status: 404,
    text: '{
      message,
      messageDetail
    }',
  }
 */
router.get('/text/:invoice/:languageCode', auth, async (req, res) => {
  /*
    #swagger.tags = ['Invoice - V2']
    #swagger.description = 'Get invoice text';
    #swagger.operationId = 'getInvoiceTextV2';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['invoice'] = {
      in: 'path',
      description: 'Invoice id',
    }
    #swagger.parameters['languageCode'] = {
      in: 'path',
      description: 'Language code',
      enum: ['en', 'de', 'cs'],
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/InvoiceTextV2'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error } = validateText(req.params);

  if (error)
    return res.status(404).send({
      message: error.details[0].message,
      messageDetail: error.details[0].message,
    });

  const { languageCode = 'cs', invoice } = req.params;

  const text = await makeInvoiceText(languageCode, invoice);

  if (text.error_code)
    return res.status(text.error_code).send({
      message: 'Text se nepodařilo vytvořit',
      messageDetail: text.error_message,
    });

  res.send({ text });
});

module.exports = router;
