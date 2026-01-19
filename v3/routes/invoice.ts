import { Router } from 'express';

import { auth } from '@/auth/auth.middleware';

import * as invoiceController from '../invoice/invoice.controller';
const router = Router();

router.get('/', auth(), invoiceController.invoicesGet);
router.get('/commissions-for-invoicing', auth(), invoiceController.getCommissionsForInvoicing);
router.get('/invoicing-statuses', auth(), invoiceController.getInvoicingStatuses);
router.get('/invoicing-status-counts', auth(), invoiceController.getInvoicingStatusCounts);
router.get('/csv', auth(), invoiceController.invoicesExportToCsv);
router.get('/numbers', auth(), invoiceController.listInvoiceNumbers);
router.get('/:id', auth(), invoiceController.invoiceGet);
router.post('/', auth(), invoiceController.invoicePost);
router.put('/:id', auth(), invoiceController.invoicePut);
router.delete('/:id', auth(), invoiceController.invoiceDelete);
router.post('/xml', auth(), invoiceController.invoicesExportToXml);
router.post('/pdf', auth(), invoiceController.previewPdf);
router.post('/mail/:id', auth(), invoiceController.mailInvoice);

export default router;
