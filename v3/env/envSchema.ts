import z from 'zod';

import { booleanFromString } from './validationTypes';

export const envFromSecretManagerSchema = z.object({
  SERVER_URL: z.string(),
  JOB_API_KEY: z.string(),
  QL_JWT_PRIVATE_KEY: z.string(),
  QL_JWT_REFRESH_KEY: z.string(),
  SENDGRID_API_KEY: z.string(),
  DATA_FIXER_API_KEY: z.string(),
  MAPBOX_TOKEN: z.string(),
  SENTRY_AUTH_TOKEN: z.string(),
  SENTRY_ENABLED: booleanFromString(),
  DEBUG: booleanFromString(),
  CO_URL: z.string(),
  CUSTOMER_ZONE_URL: z.string(),
  NEW_ENQUIRY_CONTACT_EMAIL: z.string(),
  WEB_FLOW_URL: z.string(),
  PDF_PROCESSOR_URL: z.string(),
  SYSTEM_NOTIFICATIONS_USER_IDS: z.string().default('42'),
  CRON_CHECK_INVOICE_PAYMENTS_ENABLED: booleanFromString('false'),
  CRON_NOTIFY_UNCONVERTED_CUSTOMERS_ENABLED: booleanFromString('false'),
  CRON_CHECK_UNPAID_INVOICES_ENABLED: booleanFromString('false'),
  FIO_BANK_API_KEY: z.string(),
  KB_BANK_REFRESH_TOKEN_SECRET: z.string(),
  KB_BANK_ACCOUNT_ID: z.string(),
  KB_BANK_ADAA_API_KEY: z.string(),
  KB_BANK_OAUTH2_API_KEY: z.string(),
  KB_BANK_CLIENT_ID: z.string(),
  KB_BANK_CLIENT_SECRET: z.string(),
  KB_BANK_REFRESH_TOKEN_API_URL: z.string(),
  KB_BANK_ADAA_ACCOUNTS_API_URL: z.string(),
  KB_BANK_ADAA_ACCOUNT_TRANSACTIONS_API_URL: z.string(),
});
export const envFromProcessSchema = z.object({
  ENVIRONMENT: z.enum(['dev', 'prod', 'mono']).default('dev'),
  GCLOUD_PROJECT_ID: z.string().default('qapline'),
});
export const envSchema = envFromSecretManagerSchema.merge(envFromProcessSchema);

export type TEnv = z.infer<typeof envSchema>;
