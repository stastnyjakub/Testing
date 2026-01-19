/* Database changes */

CREATE TABLE "invoice" (
  "invoice_id" serial PRIMARY KEY,
  "commission_id" int REFERENCES commission ("commission_id") ON DELETE CASCADE,
  "user_id" int REFERENCES users ("user_id"),
  "constantSymbol" text,
  "orderNumber" text,
  "orderDate" bigint,
  "issueDate" bigint,
  "dueDate" bigint,
  "pointDate" bigint,
  "paymentMethod" text,
  "text" text,
  "language" text
);

ALTER TABLE "invoice"
ADD "invoiceSent" boolean NOT NULL DEFAULT false;
COMMENT ON TABLE "invoice" IS '';

ALTER TABLE "invoice"
ADD "paid" boolean NOT NULL DEFAULT false;
COMMENT ON TABLE "invoice" IS '';

ALTER TABLE "invoice"
ADD "invoiceNumber" integer NULL;
COMMENT ON TABLE "invoice" IS '';

ALTER TABLE "invoice"
ADD "valueAddedTax" integer NULL;
COMMENT ON TABLE "invoice" IS '';