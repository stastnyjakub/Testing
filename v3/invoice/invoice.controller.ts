import { NextFunction, Request, Response } from 'express';

import { Entity, HttpException, NotFoundException } from '@/errors';
import * as fileService from '@/file/file.service';
import { t } from '@/middleware/i18n';
import { downloadCsv, validateEntityId, validateId } from '@/utils';
import { assertAuthenticatedUser } from '@/utils/validation/assertAuthenticated';
import { invalidateTag } from '@/websockets';

import { getSubstitutions } from './utils/pdfHelpers';
import { AllInvoicesResponse, Invoice, InvoiceError, InvoiceWithAttachments } from './invoice.interface';
import {
  validateExportBody,
  validateGetCommissionsForInvoicingRequestQuery,
  validateGetInvoicingStatusesRequestQuery,
  validateListInvoiceNumbersRequestQuery,
  validateMailInvoiceRequestBody,
  validateParameters,
  validatePdfPreviewBody,
  validateRequestBody,
} from './invoice.model';
import * as invoiceService from './invoice.service';

export const listInvoiceNumbers = async (req: Request, res: Response, next: NextFunction) => {
  /*
        #swagger.tags = ['Invoices']
        #swagger.description = 'List invoice numbers'
        #swagger.operationId = 'listInvoiceNumbers'
        #swagger.parameters['x-auth-token'] = {
          in: 'header',
          description: 'JWT token
        }
        #swagger.parameters['search'] = {
          in: 'query',
          description: 'Search by invoice number',
          type: 'string',
        }
        #swagger.responses[200] = {
          schema: { $ref: '#/definitions/ListInvoiceNumbersResponseBody' }
        }
  */
  try {
    const { search } = validateListInvoiceNumbersRequestQuery(req.query);
    const results = await invoiceService.listInvoiceNumbers(search);

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

export const invoicesGet = async (
  req: Request,
  res: Response<AllInvoicesResponse | InvoiceError>,
  next: NextFunction,
) => {
  /*
    #swagger.tags = ['Invoices']
    #swagger.description = 'Get invoices'
    #swagger.operationId = 'getInvoices'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.parameters['sort'] = {
      in: 'query',
      description: 'Sort by',
      type: 'string',
      enum: ['dueDate:ASC', 'exported:ASC','invoiceSent:ASC','invoice_id:ASC','issueDate:ASC','customer_company:ASC','totalCommissions:ASC','currency:ASC','totalPrice:ASC',
      'dueDate:DESC', 'exported:DESC','invoiceSent:DESC','invoice_id:DESC','issueDate:DESC','customer_company:DESC','totalCommissions:DESC','currency:DESC','totalPrice:DESC',
      'pointDate:ASC','pointDate:DESC','invoiceNumber:ASC','invoiceNumber:DESC'],
    }
    
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of invoices per page',
      type: 'number',
      default: 40
    }
    #swagger.parameters['offset'] = {
      in: 'query',
      description: 'How many invoices to skip',
      type: 'number',
      default: 0
    }
    #swagger.parameters['search'] = {
      in: 'query',
      description: 'Full text search',
      type: 'string',
    }
    #swagger.parameters['omit'] = {
      in: 'query',
      description: 'Omit fields (comma separated)',
      type: 'string',
    }
    #swagger.parameters['selected'] = {
      in: 'query',
      description: 'Select fields (comma separated)',
      type: 'string',
    }
    #swagger.parameters['invoice_id'] = {
      in: 'query',
      description: 'Search by invoice_id',
      type: 'number',
    }
    #swagger.parameters['customer_company'] = {
      in: 'query',
      description: 'Search by customer_company',
      type: 'string',
    }
    #swagger.parameters['issueDate_gt'] = {
      in: 'query',
      description: 'Search by issueDate greater than',
      type: 'number',
    }
    #swagger.parameters['issueDate_lt'] = {
      query: 'query',
      description: 'Search by issueDate less than',
      type: 'number',
    }#swagger.parameters['issueDate_gte'] = {
      in: 'query',
      description: 'Search by issueDate greater than or equals',
      type: 'number',
    }
    #swagger.parameters['issueDate_lte'] = {
      query: 'query',
      description: 'Search by issueDate less than or equals',
      type: 'number',
    }
    #swagger.parameters['dueDate_gt'] = {
      in: 'query',
      description: 'Search by dueDate greater than',
      type: 'number',
    }
    #swagger.parameters['dueDate_lt'] = {
      in: 'query',
      description: 'Search by dueDate less than',
      type: 'number',
    }
    #swagger.parameters['dueDate_gte'] = {
      in: 'query',
      description: 'Search by dueDate greater than or equals',
      type: 'number',
    }
    #swagger.parameters['dueDate_lte'] = {
      in: 'query',
      description: 'Search by dueDate less than or equals',
      type: 'number',
    }
    #swagger.parameters['pointDate_gt'] = {
      in: 'query',
      description: 'Search by pointDate greater than',
      type: 'number',
    }
    #swagger.parameters['pointDate_lt'] = {
      in: 'query',
      description: 'Search by pointDate less than',
      type: 'number',
    }
    #swagger.parameters['pointDate_gte'] = {
      in: 'query',
      description: 'Search by pointDate greater than or equals',
      type: 'number',
    }
    #swagger.parameters['pointDate_lte'] = {
      in: 'query',
      description: 'Search by pointDate less than or equals',
      type: 'number',
    }
    #swagger.parameters['totalPrice_gt'] = {
      in: 'query',
      description: 'Search by totalPrice greater than',
      type: 'number',
    }
    #swagger.parameters['totalPrice_lt'] = {
      in: 'query',
      description: 'Search by totalPrice less than',
      type: 'number',
    }
    #swagger.parameters['totalPrice_gte'] = {
      in: 'query',
      description: 'Search by totalPrice greater than or equals',
      type: 'number',
    }
    #swagger.parameters['totalPrice_lte'] = {
      in: 'query',
      description: 'Search by totalPrice less than or equals',
      type: 'number',
    }
    #swagger.parameters['totalCommissions_gt'] = {
      in: 'query',
      description: 'Search by totalCommissions greater than',
      type: 'number',
    }
    #swagger.parameters['totalCommissions_lt'] = {
      in: 'query',
      description: 'Search by totalCommissions less than',
      type: 'number',
    }
    #swagger.parameters['totalCommissions_gte'] = {
      in: 'query',
      description: 'Search by totalCommissions greater than or equals',
      type: 'number',
    }
    #swagger.parameters['totalCommissions_lte'] = {
      in: 'query',
      description: 'Search by totalCommissions less than or equals',
      type: 'number',
    }
    #swagger.parameters['invoiceSent'] = {
      in: 'query',
      description: 'Search by invoiceSent',
      type: 'boolean',
    }
    #swagger.parameters['exported'] = {
      in: 'query',
      description: 'Search by exported',
      type: 'boolean',
    }
    #swagger.parameters['currency'] = {
      in: 'query',
      description: 'Search by currency',
      type: 'string',
      enum: ['CZK', 'EUR', 'USD'],
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/InvoicesGet'},
    }
  */
  const { error } = validateParameters(req.query);
  if (error) return res.status(400).send({ message: error.details[0].message });
  try {
    const invoices = await invoiceService.findInvoices(req.query);
    if (invoices.data == null || invoices.data.length === 0) {
      return res.status(404).send({ message: 'Faktury se nepodařilo načíst' });
    }
    return res.json(invoices);
  } catch (e: any) {
    next(e);
  }
};

export const invoiceGet = async (
  req: Request,
  res: Response<InvoiceWithAttachments | InvoiceError>,
  next: NextFunction,
) => {
  /*
    #swagger.tags = ['Invoices']
    #swagger.description = 'Get invoice by id'
    #swagger.operationId = 'getInvoice'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Invoice ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/InvoiceGet'},
}
   */
  // validate ID
  const validatedInvoiceId = validateId(req.params.id);
  if (typeof validatedInvoiceId == 'string') {
    return res.status(400).send({ message: 'Neplatné id' });
  }
  try {
    // find
    const invoice = await invoiceService.findOneInvoice(validatedInvoiceId);
    if (invoice == null) {
      return res.status(404).send({
        message: `Faktura s id: ${validatedInvoiceId} nebyla nalezena`,
      });
    }

    const attachments = await fileService.listFiles(`invoices/${invoice.invoice_id}/`);
    return res.json({ ...invoice, attachments });
  } catch (e: any) {
    next(e);
  }
};

export const invoicePost = async (req: Request, res: Response<Invoice | InvoiceError>, next: NextFunction) => {
  /*
    #swagger.tags = ['Invoices']
    #swagger.description = 'Creates invoice'
    #swagger.operationId = 'createInvoice'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }

    #swagger.requestBody = {
      required: true,
      schema: { $ref: '#/definitions/InvoiceCreateBody' },
    }

    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/InvoiceCreate'}
    }
  */

  //validate
  const { error } = validateRequestBody(req.body);
  if (error) {
    return res.status(400).send({
      message: error.details[0].message,
    });
  }
  const { commission, ...invoiceData } = req.body;
  try {
    //create
    const invoice = await invoiceService.createInvoice(invoiceData, commission);

    if (invoice == null) {
      return res.status(500).send({ message: 'Fakturu se nepodařilo vytvořit' });
    }
    if (invoice.user_id === null) throw new HttpException(500, 'Invoice creator is not set');

    const inv = await invoiceService.findOneInvoice(invoice.invoice_id);
    if (inv === null) throw new NotFoundException(Entity.INVOICE);
    const saved = await invoiceService.savePdfAttachment(inv, invoice.user_id, req.body.language);

    if (!saved) return res.status(500).send({ message: 'Pdf faktury se nepodařilo vytvořit' });
    invalidateTag('Invoices');
    res.json(invoice);
  } catch (e: any) {
    next(e);
  }
};

export const invoicePut = async (req: Request, res: Response<Invoice | InvoiceError>, next: NextFunction) => {
  /*
    #swagger.tags = ['Invoices']
    #swagger.description = 'Updates invoice'
    #swagger.operationId = 'updateInvoice'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.requestBody = {
      required: true,
      schema: { $ref: '#/definitions/InvoiceUpdateBody' },
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Invoice ID',
      type: 'number',
    }
    #swagger.responses[200] = {
      schema: {$ref: "#/definitions/InvoiceUpdate"}
    }
  */
  const validatedInvoiceId = validateId(req.params.id);
  if (typeof validatedInvoiceId == 'string') {
    return res.status(400).send({ message: 'Neplatné id' });
  }
  const { error } = validateRequestBody(req.body);
  if (error) {
    return res.status(400).send({
      message: error.details[0].message,
    });
  }

  try {
    const { commission, ...invoiceData } = req.body;
    const updatedInvoice = await invoiceService.updateInvoice({
      invoiceId: validatedInvoiceId,
      invoice: invoiceData,
      commission,
    });
    if (updatedInvoice == null) {
      return res.status(404).send({
        message: `Faktura s id: ${validatedInvoiceId} nebyla nalezena`,
      });
    }
    if (updatedInvoice.user_id === null) throw new HttpException(500, 'Invoice creator is not set');

    const inv = await invoiceService.findOneInvoice(updatedInvoice.invoice_id);
    if (inv === null) throw new NotFoundException(Entity.INVOICE);
    const saved = await invoiceService.savePdfAttachment(inv, updatedInvoice.user_id, req.body.language);

    if (!saved) return res.status(500).send({ message: 'Pdf faktury se nepodařilo vytvořit' });

    invalidateTag('Invoices');
    return res.json(updatedInvoice);
  } catch (e: any) {
    next(e);
  }
};

export const invoiceDelete = async (req: Request, res: Response<Invoice | InvoiceError>, next: NextFunction) => {
  /*
  #swagger.tags = ['Invoices']
  #swagger.description = 'Deletes invoice'
  #swagger.operationId = 'deleteInvoice'
  #swagger.parameters['x-auth-token'] = {
    in: 'header',
    description: 'JWT token',
  }
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'Invoice ID',
    type: 'number',
  }
  #swagger.responses[200] = {
    schema: {$ref: '#/definitions/InvoiceDelete'}
  }
*/
  const validatedInvoiceId = validateId(req.params.id);
  if (typeof validatedInvoiceId == 'string') {
    return res.status(400).send({ message: 'Neplatné id' });
  }
  try {
    //delete invoice
    const invoice = await invoiceService.removeInvoice(validatedInvoiceId);
    if (invoice == null) {
      return res.status(404).send({
        message: `Faktura s id: ${validatedInvoiceId} nebyla nalezena`,
      });
    }

    invalidateTag('Invoices');
    return res.json(invoice);
  } catch (e: any) {
    next(e);
  }
};

export const invoicesExportToCsv = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Invoices']
    #swagger.description = 'Get invoices and export to csv'
    #swagger.operationId = 'getInvoicesCsv'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.parameters['sort'] = {
      in: 'query',
      description: 'Sort by',
      type: 'string',
      enum: ['dueDate:ASC', 'exported:ASC','invoiceSent:ASC','invoice_id:ASC','issueDate:ASC','customer_company:ASC','totalCommissions:ASC','currency:ASC','totalPrice:ASC',
      'dueDate:DESC', 'exported:DESC','invoiceSent:DESC','invoice_id:DESC','issueDate:DESC','customer_company:DESC','totalCommissions:DESC','currency:DESC','totalPrice:DESC',
      'pointDate:ASC','pointDate:DESC','invoiceNumber:ASC','invoiceNumber:DESC'],
    }
    
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of invoices per page',
      type: 'number',
      default: 40
    }
    #swagger.parameters['offset'] = {
      in: 'query',
      description: 'How many invoices to skip',
      type: 'number',
      default: 0
    }
    #swagger.parameters['search'] = {
      in: 'query',
      description: 'Full text search',
      type: 'string',
    }
    #swagger.parameters['omit'] = {
      in: 'query',
      description: 'Omit fields (comma separated)',
      type: 'string',
    }
    #swagger.parameters['selected'] = {
      in: 'query',
      description: 'Select fields (comma separated)',
      type: 'string',
    }
    #swagger.parameters['invoice_id'] = {
      in: 'query',
      description: 'Search by invoice_id',
      type: 'number',
    }
    #swagger.parameters['customer_company'] = {
      in: 'query',
      description: 'Search by customer_company',
      type: 'string',
    }
    #swagger.parameters['issueDate_gt'] = {
      in: 'query',
      description: 'Search by issueDate greater than',
      type: 'number',
    }
    #swagger.parameters['issueDate_lt'] = {
      query: 'query',
      description: 'Search by issueDate less than',
      type: 'number',
    }#swagger.parameters['issueDate_gte'] = {
      in: 'query',
      description: 'Search by issueDate greater than or equals',
      type: 'number',
    }
    #swagger.parameters['issueDate_lte'] = {
      query: 'query',
      description: 'Search by issueDate less than or equals',
      type: 'number',
    }
    #swagger.parameters['dueDate_gt'] = {
      in: 'query',
      description: 'Search by dueDate greater than',
      type: 'number',
    }
    #swagger.parameters['dueDate_lt'] = {
      in: 'query',
      description: 'Search by dueDate less than',
      type: 'number',
    }
    #swagger.parameters['dueDate_gte'] = {
      in: 'query',
      description: 'Search by dueDate greater than or equals',
      type: 'number',
    }
    #swagger.parameters['dueDate_lte'] = {
      in: 'query',
      description: 'Search by dueDate less than or equals',
      type: 'number',
    }
    #swagger.parameters['pointDate_gt'] = {
      in: 'query',
      description: 'Search by pointDate greater than',
      type: 'number',
    }
    #swagger.parameters['pointDate_lt'] = {
      in: 'query',
      description: 'Search by pointDate less than',
      type: 'number',
    }
    #swagger.parameters['pointDate_gte'] = {
      in: 'query',
      description: 'Search by pointDate greater than or equals',
      type: 'number',
    }
    #swagger.parameters['pointDate_lte'] = {
      in: 'query',
      description: 'Search by pointDate less than or equals',
      type: 'number',
    }
    #swagger.parameters['totalPrice_gt'] = {
      in: 'query',
      description: 'Search by totalPrice greater than',
      type: 'number',
    }
    #swagger.parameters['totalPrice_lt'] = {
      in: 'query',
      description: 'Search by totalPrice less than',
      type: 'number',
    }
    #swagger.parameters['totalPrice_gte'] = {
      in: 'query',
      description: 'Search by totalPrice greater than or equals',
      type: 'number',
    }
    #swagger.parameters['totalPrice_lte'] = {
      in: 'query',
      description: 'Search by totalPrice less than or equals',
      type: 'number',
    }
    #swagger.parameters['totalCommissions_gt'] = {
      in: 'query',
      description: 'Search by totalCommissions greater than',
      type: 'number',
    }
    #swagger.parameters['totalCommissions_lt'] = {
      in: 'query',
      description: 'Search by totalCommissions less than',
      type: 'number',
    }
    #swagger.parameters['totalCommissions_gte'] = {
      in: 'query',
      description: 'Search by totalCommissions greater than or equals',
      type: 'number',
    }
    #swagger.parameters['totalCommissions_lte'] = {
      in: 'query',
      description: 'Search by totalCommissions less than or equals',
      type: 'number',
    }
    #swagger.parameters['invoiceSent'] = {
      in: 'query',
      description: 'Search by invoiceSent',
      type: 'boolean',
    }
    #swagger.parameters['exported'] = {
      in: 'query',
      description: 'Search by exported',
      type: 'boolean',
    }
    #swagger.parameters['currency'] = {
      in: 'query',
      description: 'Search by currency',
      type: 'string',
      enum: ['CZK', 'EUR', 'USD'],
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/InvoicesGet'},
    }
  */
  const { error } = validateParameters(req.query);
  if (error) return res.status(400).send({ message: error.details[0].message });
  try {
    req.query.limit = `${Number.MAX_SAFE_INTEGER}`;
    req.query.offset = '0';
    const invoices = await invoiceService.findInvoices(req.query, true);
    if (invoices.data == null || invoices.data.length === 0) {
      return res.status(404).send({ message: 'Faktury se nepodařilo načíst' });
    }
    const fields = [
      { label: 'Číslo faktury', value: 'invoiceNumber' },
      { label: 'Zákazník', value: 'customer_company' },
      { label: 'Vystavení', value: 'issueDate' },
      { label: 'Plnění', value: 'pointDate' },
      { label: 'Splatnost', value: 'dueDate' },
      { label: 'Cena', value: 'totalPrice' },
      { label: 'Měna', value: 'currency' },
      { label: 'Počet zakázek', value: 'totalCommissions' },
    ];
    return downloadCsv(res, 'invoices', fields, invoices.data);
  } catch (e: any) {
    next(e);
  }
};

export const invoicesExportToXml = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Invoices']
    #swagger.description = 'Export invoices to xml'
    #swagger.operationId = 'exportXMLInvoice'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.requestBody = {
      schema: { $ref: '#/definitions/InvoiceXmlBody' },
    }
    #swagger.responses[200]
  */
  const { error } = validateExportBody(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });
  try {
    const xml = await invoiceService.createXml(req.body);

    res.header('Content-Type', 'text/xml');
    res.header('Content-Disposition', 'attachment; filename="export.xml"');
    return res.send(xml);
  } catch (e: any) {
    next(e);
  }
};

export const getCommissionsForInvoicing = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Invoices']
    #swagger.description = 'Get commissions for invoicing'
    #swagger.operationId = 'getCommissionsForInvoicing'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.parameters['currency'] = {
      in: 'query',
      description: 'Currency',
      type: 'string',
      enum: ['CZK', 'EUR'],
    }
    #swagger.parameters['customerId'] = {
      in: 'query',
      description: 'Customer ID',
      type: 'number',
    }
    #swagger.parameters['includeAllCommissions'] = {
      in: 'query',
      description: 'Include all commissions',
      type: 'boolean',
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/GetCommissionsForInvoicingResponseBody' }
    }
  */
  try {
    const { currency, customerId, includeAllCommissions } = validateGetCommissionsForInvoicingRequestQuery(req.query);

    const unInvoicedCommissions = await (async () => {
      if (includeAllCommissions) {
        return await invoiceService.getAllUnInvoicedCommissions({ currency, customerId });
      }
      return await invoiceService.getCommissionsForInvoicing({ currency, customerId });
    })();

    res.status(200).send(unInvoicedCommissions);
  } catch (e) {
    next(e);
  }
};

export const getInvoicingStatusCounts = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Invoices']
    #swagger.description = 'Get invoicing status counts'
    #swagger.operationId = 'getInvoicingStatusCounts'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/GetInvoicingStatusCountsResponseBody' }
    }
  */
  try {
    const counts = await invoiceService.getCommissionsInvoicingCounts();
    res.status(200).send(counts);
  } catch (error) {
    next(error);
  }
};

export const getInvoicingStatuses = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Invoices']
    #swagger.description = 'Get invoicing statuses'
    #swagger.operationId = 'getInvoicingStatuses'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.parameters['includeAllCommissions'] = {
      in: 'query',
      description: 'Include all commissions',
      type: 'boolean',
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/GetInvoicingStatusesResponseBody' }
    }
  */
  try {
    const { includeAllCommissions } = validateGetInvoicingStatusesRequestQuery(req.query);

    const statuses = await invoiceService.getInvoicingStatuses({
      includeAllUnInvoicedCommissions: includeAllCommissions,
    });
    res.status(200).send(statuses);
  } catch (error) {
    next(error);
  }
};

export const previewPdf = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Invoices']
    #swagger.description = 'Get pdf preview'
    #swagger.operationId = 'getPreviewPdf'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.requestBody = {
      schema: { $ref: '#/definitions/V3InvoicePdfBody' },
    }
    #swagger.responses[200] = {
      content: {'application/pdf': {}}
    }
  */
  const { error } = validatePdfPreviewBody(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });
  try {
    const substitutions = await getSubstitutions(req.body);

    const { body, footer } = await invoiceService.invoiceTemplate(substitutions, req.body.language);
    const pdf = await invoiceService.getPdf(body, footer, undefined, { marginBottom: '50px' });
    res.contentType('application/pdf');
    return res.send(pdf);
  } catch (e: any) {
    console.log(e);
    next(e);
  }
};

export const mailInvoice = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Invoices']
    #swagger.description = 'Mail invoice'
    #swagger.operationId = 'mailInvoice'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Invoice ID',
      type: 'number',
    }
    #swagger.requestBody = {
      schema: { $ref: '#/definitions/MailInvoiceRequest' },
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/MailInvoiceSuccessfulResponse' },
    }
    #swagger.responses[207] = {
      schema: { $ref: '#/definitions/MailInvoiceMixedResponse' },
    }
  */
  try {
    assertAuthenticatedUser(req.auth);

    const { emails, lang, message } = validateMailInvoiceRequestBody(req.body);
    const invoiceId = validateEntityId(req.params.id);

    const { rejectedEmails, successfulEmails } = await invoiceService.mailInvoice({
      emails,
      lang,
      message,
      invoiceId,
      senderId: req.auth.payload.userId,
      withDeliveryNotes: true,
    });

    const isAllRejected = successfulEmails.length === 0;
    const isSomeRejected = rejectedEmails.length > 0 && rejectedEmails.length < emails.length;

    if (isAllRejected) throw new HttpException(500, 'invoice.mailSendingFailed');
    const responseStatusCode = isSomeRejected ? 207 : 200;

    res.status(responseStatusCode).json({
      message: isSomeRejected
        ? t('invoiceEmail.mailSendingPartiallyFailed', lang, { emails: rejectedEmails.join(', ') })
        : t('invoiceEmail.mailSendingSucceeded', lang),
      successfulEmails,
      rejectedEmails: isSomeRejected ? rejectedEmails : undefined,
    });
  } catch (error) {
    next(error);
  }
};

export const invoicePaymentsJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await invoiceService.checkIncomeTransactionsAndUpdatePaidInvoices();
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
