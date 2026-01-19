BEGIN;

COPY public.users (user_id, number, email, "emailPassword", password, "jobTitle", "mobilePhone", name, surname, username, deleted, role) FROM stdin;
1000	42	system@qapline.com	-	-	systém	-	Systém	Systém	system	f	0
\.

DROP VIEW public.complete_invoice;
DROP VIEW public.complete_commission;
-- Step 1: Add a temporary column to store the email addresses
ALTER TABLE commission ADD COLUMN "addedByTemp" TEXT;

-- Step 2: Copy values from 'addedBy' to 'addedByTemp'
UPDATE commission
SET "addedByTemp" = "addedBy";

-- Step 3: Drop the old 'addedBy' column
ALTER TABLE commission DROP COLUMN "addedBy";

-- Step 4: Add a new 'addedBy_id' column with INT datatype
ALTER TABLE commission ADD COLUMN "addedBy_id" INT;

-- Step 5: Update 'addedBy_id' with user_id by matching email in 'addedByTemp'
UPDATE commission c
SET "addedBy_id" = u.user_id
FROM "users" u
WHERE c."addedByTemp" = u.email;

-- Step 6: (Optional) Verify that the data migration is successful
SELECT * FROM commission WHERE "addedBy_id" IS NULL;

-- Step 7: Drop the temporary column 'addedByTemp'
ALTER TABLE commission DROP COLUMN "addedByTemp";

-- View: public.complete_commission

-- DROP VIEW public.complete_commission;

CREATE OR REPLACE VIEW public.complete_commission
 AS
 SELECT co.commission_id,
    co.relation,
    co.invoice_id,
    co."currencyCustomer" AS currency,
    co.week,
    co.number,
    co.year,
    co.oldid,
    co.carrier_id,
    co.note,
    co.state,
    co.deleted,
    co."enteredCarrierBy",
    co.vat,
    co.qid,
    co."carrierVat",
    co."carrierOrderSent",
    co."loadingConfirmationSent",
    co."dischargeConfirmationSent",
    co."orderConfirmationSent",
    cu.company AS customer_company,
    cu.customer_id,
    ca.company AS carrier_company,
    co."exchangeRateCarrier",
    co."priceCarrier" AS "priceCarrierOriginal",
    co."priceCustomer" AS "priceCustomerOriginal",
        CASE
            WHEN co."exchangeRateCarrier" IS NULL THEN co."priceCarrier"
            WHEN co."exchangeRateCarrier" IS NOT NULL AND co."currencyCarrier" = 'CZK'::text THEN co."priceCarrier"
            ELSE co."exchangeRateCarrier" * co."priceCarrier"
        END AS "priceCarrier",
    co."exchangeRateCustomer",
        CASE
            WHEN co."exchangeRateCustomer" IS NULL THEN co."priceCustomer"
            WHEN co."exchangeRateCustomer" IS NOT NULL AND co."currencyCustomer" = 'CZK'::text THEN co."priceCustomer"
            ELSE co."exchangeRateCustomer" * co."priceCustomer"
        END AS "priceCustomer",
        CASE
            WHEN co."priceCarrier" IS NULL AND co."priceCustomer" IS NULL THEN NULL::numeric
            ELSE count_provison(co."exchangeRateCarrier", co."priceCarrier", co."currencyCarrier", co."exchangeRateCustomer", co."priceCustomer", co."currencyCustomer")
        END AS provision,
    ci.total_weight,
    ci.total_loading_meters,
    cl.loading_date,
    ( SELECT array_agg(location.city) AS array_agg
           FROM location
          WHERE location.location_id = ANY (cl.loading_ids)) AS loading_city,
    ( SELECT array_agg(location."postalCode") AS array_agg
           FROM location
          WHERE location.location_id = ANY (cl.loading_ids)) AS loading_zip,
    ( SELECT string_agg(location.city, '; '::text) AS string_agg
           FROM location
          WHERE location.location_id = ANY (cl.loading_ids)) AS loading_city_string,
    ( SELECT string_agg(location."postalCode", '; '::text) AS string_agg
           FROM location
          WHERE location.location_id = ANY (cl.loading_ids)) AS loading_zip_string,
    cd.discharge_date,
    ( SELECT array_agg(location.city) AS array_agg
           FROM location
          WHERE location.location_id = ANY (cd.discharge_ids)) AS discharge_city,
    ( SELECT array_agg(location."postalCode") AS array_agg
           FROM location
          WHERE location.location_id = ANY (cd.discharge_ids)) AS discharge_zip,
    ( SELECT string_agg(location.city, '; '::text) AS string_agg
           FROM location
          WHERE location.location_id = ANY (cd.discharge_ids)) AS discharge_city_string,
    ( SELECT string_agg(location."postalCode", '; '::text) AS string_agg
           FROM location
          WHERE location.location_id = ANY (cd.discharge_ids)) AS discharge_zip_string,
    ( SELECT invoice."invoiceNumber"
           FROM invoice
          WHERE invoice.invoice_id = co.invoice_id) AS "invNumber",
    co.notification,
    co."orderDate",
    co."orderNumber",
    co."currencyCarrier",
    en.enquiry_id,
    en.state AS "enquiryState",
    at."carrierInvoiceName",
    at.attachment_id,
    cu.type AS "customerType",
    ( SELECT jsonb_build_object('minPrice', cpe."minPrice", 'maxPrice', cpe."maxPrice") AS "priceEstimation"
           FROM "CommissionPriceEstimation" cpe
          WHERE cpe.commission_id = co.commission_id) AS "priceEstimation",
    jsonb_build_object('user_id', usr.user_id, 'number', usr.number, 'email', usr.email, 'name', usr.name, 'surname', usr.surname) AS "addedBy"
   FROM commission co
     LEFT JOIN users usr ON usr.user_id = co."addedBy_id"
     LEFT JOIN enquiry en ON en.commission_id = co.commission_id
     LEFT JOIN carrier ca ON co.carrier_id = ca.carrier_id
     LEFT JOIN customer cu ON co.customer_id = cu.customer_id
     LEFT JOIN ( SELECT "Attachment".commission_id,
            "Attachment".attachment_id,
            "Attachment".name AS "carrierInvoiceName"
           FROM "Attachment"
          WHERE "Attachment".type = 'INVOICE'::"AttachmentType" AND "Attachment".deleted = false) at ON at.commission_id = co.commission_id
     LEFT JOIN ( SELECT commissionloading.commission_id,
            array_agg(commissionloading.date) AS loading_date,
            array_agg(commissionloading.location_id) AS loading_ids
           FROM commissionloading
          WHERE commissionloading.deleted = false
          GROUP BY commissionloading.commission_id) cl ON co.commission_id = cl.commission_id
     LEFT JOIN ( SELECT commissiondischarge.commission_id,
            array_agg(commissiondischarge.date) AS discharge_date,
            array_agg(commissiondischarge.location_id) AS discharge_ids
           FROM commissiondischarge
          WHERE commissiondischarge.deleted = false
          GROUP BY commissiondischarge.commission_id) cd ON co.commission_id = cd.commission_id
     LEFT JOIN ( SELECT commissionitem.commission_id,
            sum(commissionitem.weight) AS total_weight,
            sum(commissionitem."loadingMeters") AS total_loading_meters
           FROM commissionitem
          WHERE commissionitem.deleted = false
          GROUP BY commissionitem.commission_id) ci ON co.commission_id = ci.commission_id;

ALTER TABLE public.complete_commission
    OWNER TO postgres;



-- View: public.complete_invoice

-- DROP VIEW public.complete_invoice;

CREATE OR REPLACE VIEW public.complete_invoice
 AS
 SELECT invoice.invoice_id,
    invoice."issueDate",
    invoice."dueDate",
    invoice."invoiceSent",
    invoice.exported,
    invoice.canceled,
    invoice."constantSymbol",
    invoice.deleted,
    invoice."invoiceNumber",
    invoice.language,
    invoice.paid,
    invoice."paymentMethod",
    invoice."pointDate",
    invoice."reverseCharge",
    invoice.text,
    invoice."valueAddedTax",
    customer.customer_id,
    customer.company AS customer_company,
    customer."companyRegistrationNumber",
    complete_commission.currency,
    count(complete_commission.commission_id)::integer AS "totalCommissions",
    sum(complete_commission."priceCustomerOriginal")::integer AS "totalPrice",
        CASE
            WHEN count(complete_commission.commission_id) > 0 THEN json_agg(json_build_object('commission_id', complete_commission.commission_id, 'commissionNumber', complete_commission.number, 'currencyCustomer', complete_commission.currency, 'customer_company', customer.company, 'discharge_date', complete_commission.discharge_date, 'discharge_city_string', complete_commission.discharge_city_string, 'discharge_city', complete_commission.discharge_city, 'exchangeRateCarrier', complete_commission."exchangeRateCarrier", 'exchangeRateCustomer', complete_commission."exchangeRateCustomer", 'loading_date', complete_commission.loading_date, 'loading_city_string', complete_commission.loading_city_string, 'loading_city', complete_commission.loading_city, 'orderDate', complete_commission."orderDate"::text, 'orderSource', complete_commission."orderNumber", 'priceCustomer', complete_commission."priceCustomerOriginal", 'place', customer.place, 'qid', complete_commission.qid, 'relation', complete_commission.relation, 'vat', complete_commission.vat))
            ELSE '[]'::json
        END AS commission,
    ( SELECT json_agg(json_build_object('email', customercontact.email)) AS json_agg
           FROM customercontact
          WHERE customercontact.customer_id = customer.customer_id) AS customercontact,
    invoice."orderDate",
    "Attachment".attachment_id AS "invoiceAttachmentId"
   FROM invoice
     LEFT JOIN complete_commission ON invoice.invoice_id = complete_commission.invoice_id
     LEFT JOIN customer ON complete_commission.customer_id = customer.customer_id
     LEFT JOIN ( SELECT "Attachment_1".attachment_id,
            "Attachment_1".name,
            "Attachment_1"."fileName",
            "Attachment_1".type,
            "Attachment_1".sent,
            "Attachment_1"."tsAdded",
            "Attachment_1".deleted,
            "Attachment_1".user_id,
            "Attachment_1".commission_id,
            "Attachment_1".invoice_id
           FROM "Attachment" "Attachment_1"
          WHERE "Attachment_1".deleted = false AND "Attachment_1".type = 'INVOICE'::"AttachmentType") "Attachment" ON "Attachment".invoice_id = invoice.invoice_id
  GROUP BY invoice.invoice_id, invoice."issueDate", invoice."dueDate", invoice."invoiceSent", invoice.exported, invoice.canceled, invoice."constantSymbol", invoice.deleted, invoice."invoiceNumber", invoice.language, invoice.paid, invoice."paymentMethod", invoice."pointDate", invoice."reverseCharge", invoice.text, invoice."valueAddedTax", customer.customer_id, customer.company, customer."companyRegistrationNumber", complete_commission.currency, "Attachment".attachment_id;

ALTER TABLE public.complete_invoice
    OWNER TO postgres;



COMMIT;