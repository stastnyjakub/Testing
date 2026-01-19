import moment from 'moment';

// We only want to check invoices that are older than this date
// Older invoices are not relevant for us
export const MIN_UNPAID_INVOICE_DUE_DATE = moment.tz('2025-05-15', 'Europe/Prague').unix() * 1000; // Convert to milliseconds
