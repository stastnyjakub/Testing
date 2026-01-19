ALTER TABLE
    IF EXISTS public.invoice
ADD
    COLUMN "paymentConfirmationDate" bigint;

ALTER TABLE
    IF EXISTS public.invoice
ADD
    COLUMN "paidStateChangedBy_id" integer;

ALTER TABLE
    IF EXISTS public.invoice
ADD
    COLUMN "paidAmount" numeric;

ALTER TABLE
    IF EXISTS public.invoice
ADD
    CONSTRAINT "invoice_paidStateChangedBy_id_fkey" FOREIGN KEY ("paidStateChangedBy_id") REFERENCES public.users (user_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

SELECT
    invoice.invoice_id,
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
    count(complete_commission.commission_id) :: integer AS "totalCommissions",
    sum(complete_commission."priceCustomerOriginal") :: integer AS "totalPrice",
    CASE
        WHEN count(complete_commission.commission_id) > 0 THEN json_agg(
            json_build_object(
                'commission_id',
                complete_commission.commission_id,
                'commissionNumber',
                complete_commission.number,
                'currencyCustomer',
                complete_commission.currency,
                'customer_company',
                customer.company,
                'discharge_date',
                complete_commission.discharge_date,
                'discharge_city_string',
                complete_commission.discharge_city_string,
                'discharge_city',
                complete_commission.discharge_city,
                'exchangeRateCarrier',
                complete_commission."exchangeRateCarrier",
                'exchangeRateCustomer',
                complete_commission."exchangeRateCustomer",
                'loading_date',
                complete_commission.loading_date,
                'loading_city_string',
                complete_commission.loading_city_string,
                'loading_city',
                complete_commission.loading_city,
                'orderDate',
                complete_commission."orderDate" :: text,
                'orderSource',
                complete_commission."orderNumber",
                'priceCustomer',
                complete_commission."priceCustomerOriginal",
                'place',
                customer.place,
                'qid',
                complete_commission.qid,
                'relation',
                complete_commission.relation,
                'vat',
                complete_commission.vat
            )
        )
        ELSE '[]' :: json
    END AS commission,
    (
        SELECT
            json_agg(
                json_build_object('email', customercontact.email)
            ) AS json_agg
        FROM
            customercontact
        WHERE
            customercontact.customer_id = customer.customer_id
    ) AS customercontact,
    invoice."orderDate",
    "Attachment".attachment_id AS "invoiceAttachmentId",
    invoice."paymentConfirmationDate",
    invoice."paidAmount",
    CASE
        WHEN "paidStateChangedByUser".* IS NULL THEN NULL :: jsonb
        ELSE jsonb_build_object(
            'user_id',
            "paidStateChangedByUser".user_id,
            'number',
            "paidStateChangedByUser".number,
            'email',
            "paidStateChangedByUser".email,
            'name',
            "paidStateChangedByUser".name,
            'surname',
            "paidStateChangedByUser".surname
        )
    END AS "paidStateChangedBy"
FROM
    invoice
    LEFT JOIN users "paidStateChangedByUser" ON "paidStateChangedByUser".user_id = invoice."paidStateChangedBy_id"
    LEFT JOIN complete_commission ON invoice.invoice_id = complete_commission.invoice_id
    LEFT JOIN customer ON complete_commission.customer_id = customer.customer_id
    LEFT JOIN (
        SELECT
            "Attachment_1".attachment_id,
            "Attachment_1".name,
            "Attachment_1"."fileName",
            "Attachment_1".type,
            "Attachment_1".sent,
            "Attachment_1"."tsAdded",
            "Attachment_1".deleted,
            "Attachment_1".user_id,
            "Attachment_1".commission_id,
            "Attachment_1".invoice_id
        FROM
            "Attachment" "Attachment_1"
        WHERE
            "Attachment_1".deleted = false
            AND "Attachment_1".type = 'INVOICE' :: "AttachmentType"
    ) "Attachment" ON "Attachment".invoice_id = invoice.invoice_id
GROUP BY
    invoice.invoice_id,
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
    customer.company,
    customer."companyRegistrationNumber",
    complete_commission.currency,
    "Attachment".attachment_id,
    "paidStateChangedByUser".user_id;