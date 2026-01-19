const {
  validateParams,
  validateInvoice,
  getInvoice,
  updateInvoice,
  getInvoices,
  validateExportBody,
  creatXmlInvoices
} = require("../model/invoice-model");
const { findOneInvoice } = require("../../v3/invoice/invoice.service");

const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

//geters
router.get("/", auth, async (req, res) => {
  /*
    #swagger.tags = ['Invoice - V1']
    #swagger.description = 'Get all invoices';
    #swagger.operationId = 'getInvoicesV1';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['year'] = {
      in: 'query',
      description: 'Year',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/InvoicesGetV1'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  const { error } = validateParams(req.query);

  if (error)
    return res.status(400).send({
      message: "Špatné vstupní parametry",
      messageDetail: error.details[0].message
    });

  //get invoices
  const invoices = await getInvoices(req.query.year);

  if (invoices.error_code)
    return res.status(invoices.error_code).send({
      message: "Faktury se nepodařilo načíst",
      messageDetail: invoices.error_message
    });
  res.send(invoices);
});

router.get("/:id", auth, async (req, res) => {
  /*
    #swagger.tags = ['Invoice - V1']
    #swagger.description = 'Get invoice by id';
    #swagger.operationId = 'getInvoiceV1';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Invoice id',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/InvoiceGetV1'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  // router.get("/:id", async (req, res) => {
  const { error } = validateParams(req.params);
  if (error)
    return res.status(404).send({
      message: error.details[0].message,
      messageDetail: error.details[0].message
    });

  const invoice = await getInvoice(req.params.id, "");

  if (invoice && invoice.error_code)
    return res.status(invoice.error_code).send({
      message: "Faktura neexistuje",
      messageDetail: invoice.error_message
    });
  res.send(invoice);
});

router.put("/:id", auth, async (req, res) => {
  /*
    #swagger.tags = ['Invoice - V1']
    #swagger.description = 'Update invoice';
    #swagger.operationId = 'updateInvoiceV1';
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
      schema: {$ref: '#/definitions/InvoiceUpdateV1'},
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/InvoiceGetV1'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error: idError } = validateParams(req.params);
  if (idError)
    return res.status(400).send({
      message: idError.details[0].message,
      messageDetail: idError.details[0].message
    });
  let { error: invoiceError } = validateInvoice(req.body.invoice);

  if (invoiceError)
    return res.status(400).send({
      message: "Špatné parametry faktury",
      messageDetail: invoiceError.details[0].message
    });

  req.body.invoice.issueDate = req.body.invoice.issueDate
    ? req.body.invoice.issueDate
    : null;
  req.body.invoice.pointDate = req.body.invoice.pointDate
    ? req.body.invoice.pointDate
    : null;
  // req.body.invoice.commission_id = req.body.invoice.commission_id ? req.body.invoice.commission_id : req.params.commissionId;

  req.body.invoice.dueDate = req.body.invoice.dueDate
    ? req.body.invoice.dueDate
    : null;

  const invoice = await updateInvoice(req.params.id, req.body.invoice);
  if (invoice.error_code)
    return res.status(invoice.error_code).send({
      message: "Nepodařilo se upravit fakturu",
      messageDetail: invoice.error_message
    });
  return res.send(invoice);
});

router.post("/export", auth, async (req, res) => {
  /*
    #swagger.tags = ['Invoice - V1']
    #swagger.description = 'Export invoices to xml';
    #swagger.operationId = 'exportInvoicesV1';
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Invoice ids',
      schema: {$ref: '#/definitions/InvoiceExportV1Body'},
    }
    #swagger.responses[500] = {
      description: 'Internal server error',
    }
  */
  let { error: exportError } = validateExportBody(req.body);
  if (exportError)
    return res.status(400).send({
      message: "Tělo musí obsahovat pole čísel",
      messageDetail: exportError.details[0].message
    });
  let validIds = [];
  for (const id of req.body) {
    const foundInvoice = await findOneInvoice(id);
    if (foundInvoice !== null && foundInvoice.totalCommissions > 0) validIds.push(id);
  }
  if (validIds.length === 0)
    return res.status(400).send({
      message: "Nebyly nalezeny žádné faktury",
      messageDetail: `Faktury s ${req.body} id nebyly nalezeny nebo neobsahují žádné zakázky`
    });
  const response = await creatXmlInvoices(validIds);
  if (response.error)
    return res
      .status(400)
      .send({ message: response.error.message, messageDetail: response.error.messageDetail });

  res.set("Content-Type", "text/xml");
  res.set("Content-Disposition", "attachment; filename=export.xml");
  return res.send(response);
});

module.exports = router;
