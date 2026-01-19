export type PdfPrintSettings = {
  /**
   * Define whether to print the entire content in one single page.
   * @default false
   */
  singlePage?: boolean;

  /**
   * Specify paper width using units like 72pt, 96px, 1in, 25.4mm, 2.54cm, or 6pc. Default unit is inches if unspecified.
   * @default 8.5
   */
  paperWidth?: string | number;

  /**
   * Specify paper height using units like 72pt, 96px, 1in, 25.4mm, 2.54cm, or 6pc. Default unit is inches if unspecified.
   * @default 11
   */
  paperHeight?: string | number;

  /**
   * Specify top margin width using units like 72pt, 96px, 1in, 25.4mm, 2.54cm, or 6pc. Default unit is inches if unspecified.
   * @default 0.39
   */
  marginTop?: string | number;

  /**
   * Specify bottom margin using units like 72pt, 96px, 1in, 25.4mm, 2.54cm, or 6pc. Default unit is inches if unspecified.
   * @default 0.39
   */
  marginBottom?: string | number;

  /**
   * Specify left margin using units like 72pt, 96px, 1in, 25.4mm, 2.54cm, or 6pc. Default unit is inches if unspecified.
   * @default 0.39
   */
  marginLeft?: string | number;

  /**
   * Specify right margin using units like 72pt, 96px, 1in, 25.4mm, or 6pc. Default unit is inches if unspecified.
   * @default 0.39
   */
  marginRight?: string | number;

  /**
   * Define whether to prefer page size as defined by CSS.
   * @default false
   */
  preferCssPageSize?: boolean;

  /**
   * Print the background graphics.
   * @default false
   */
  printBackground?: boolean;

  /**
   * Hide the default white background and allow generating PDFs with transparency.
   * @default false
   */
  omitBackground?: boolean;

  /**
   * Set the paper orientation to landscape.
   * @default false
   */
  landscape?: boolean;

  /**
   * The scale of the page rendering.
   * @default 1.0
   */
  scale?: number;

  /**
   * Page ranges to print, e.g., '1-5, 8, 11-13' - empty means all pages.
   * @default "All pages"
   */
  nativePageRanges?: string;
};

export enum EPaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  OVERPAID = 'OVERPAID',
  UNDERPAID = 'UNDERPAID',
}

export * from './arguments';
export * from './request';
