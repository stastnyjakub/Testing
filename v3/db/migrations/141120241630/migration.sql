-- View: public.complete_invoice
-- DROP VIEW public.complete_invoice;
CREATE
OR REPLACE VIEW PUBLIC.COMPLETE_INVOICE AS
SELECT
    INVOICE.INVOICE_ID,
    INVOICE."issueDate",
    INVOICE."dueDate",
    INVOICE."invoiceSent",
    INVOICE.EXPORTED,
    INVOICE.CANCELED,
    INVOICE."constantSymbol",
    INVOICE.DELETED,
    INVOICE."invoiceNumber",
    INVOICE.LANGUAGE,
    INVOICE.PAID,
    INVOICE."paymentMethod",
    INVOICE."pointDate",
    INVOICE."reverseCharge",
    INVOICE.TEXT,
    INVOICE."valueAddedTax",
    CUSTOMER.CUSTOMER_ID,
    CUSTOMER.COMPANY AS CUSTOMER_COMPANY,
    CUSTOMER."companyRegistrationNumber",
    COMPLETE_COMMISSION.CURRENCY,
    COUNT(COMPLETE_COMMISSION.COMMISSION_ID) :: INTEGER AS "totalCommissions",
    SUM(COMPLETE_COMMISSION."priceCustomerOriginal") :: INTEGER AS "totalPrice",
    CASE
        WHEN COUNT(COMPLETE_COMMISSION.COMMISSION_ID) > 0 THEN JSON_AGG(
            JSON_BUILD_OBJECT(
                'commission_id',
                COMPLETE_COMMISSION.COMMISSION_ID,
                'commissionNumber',
                COMPLETE_COMMISSION.NUMBER,
                'currencyCustomer',
                COMPLETE_COMMISSION.CURRENCY,
                'customer_company',
                CUSTOMER.COMPANY,
                'discharge_date',
                COMPLETE_COMMISSION.DISCHARGE_DATE,
                'discharge_city_string',
                COMPLETE_COMMISSION.DISCHARGE_CITY_STRING,
                'discharge_city',
                COMPLETE_COMMISSION.DISCHARGE_CITY,
                'exchangeRateCarrier',
                COMPLETE_COMMISSION."exchangeRateCarrier",
                'exchangeRateCustomer',
                COMPLETE_COMMISSION."exchangeRateCustomer",
                'loading_date',
                COMPLETE_COMMISSION.LOADING_DATE,
                'loading_city_string',
                COMPLETE_COMMISSION.LOADING_CITY_STRING,
                'loading_city',
                COMPLETE_COMMISSION.LOADING_CITY,
                'orderDate',
                COMPLETE_COMMISSION."orderDate" :: TEXT,
                'orderSource',
                COMPLETE_COMMISSION."orderNumber",
                'priceCustomer',
                COMPLETE_COMMISSION."priceCustomerOriginal",
                'place',
                CUSTOMER.PLACE,
                'qid',
                COMPLETE_COMMISSION.QID,
                'relation',
                COMPLETE_COMMISSION.RELATION,
                'vat',
                COMPLETE_COMMISSION.VAT
            )
        )
        ELSE '[]' :: JSON
    END AS COMMISSION,
    (
        SELECT
            JSON_AGG(
                JSON_BUILD_OBJECT('email', CUSTOMERCONTACT.EMAIL)
            ) AS JSON_AGG
        FROM
            CUSTOMERCONTACT
        WHERE
            CUSTOMERCONTACT.CUSTOMER_ID = CUSTOMER.CUSTOMER_ID
    ) AS CUSTOMERCONTACT,
    INVOICE."orderDate",
    "Attachment".ATTACHMENT_ID AS "invoiceAttachmentId"
FROM
    INVOICE
    LEFT JOIN COMPLETE_COMMISSION ON INVOICE.INVOICE_ID = COMPLETE_COMMISSION.INVOICE_ID
    LEFT JOIN CUSTOMER ON COMPLETE_COMMISSION.CUSTOMER_ID = CUSTOMER.CUSTOMER_ID
    LEFT JOIN (
        SELECT
            *
        FROM
            "Attachment"
        WHERE
            "Attachment".DELETED = FALSE
            AND "Attachment".TYPE = 'INVOICE'
    ) AS "Attachment" ON "Attachment".INVOICE_ID = INVOICE.INVOICE_ID
GROUP BY
    INVOICE.INVOICE_ID,
    INVOICE."issueDate",
    INVOICE."dueDate",
    INVOICE."invoiceSent",
    INVOICE.EXPORTED,
    INVOICE.CANCELED,
    INVOICE."constantSymbol",
    INVOICE.DELETED,
    INVOICE."invoiceNumber",
    INVOICE.LANGUAGE,
    INVOICE.PAID,
    INVOICE."paymentMethod",
    INVOICE."pointDate",
    INVOICE."reverseCharge",
    INVOICE.TEXT,
    INVOICE."valueAddedTax",
    CUSTOMER.CUSTOMER_ID,
    CUSTOMER.COMPANY,
    CUSTOMER."companyRegistrationNumber",
    COMPLETE_COMMISSION.CURRENCY,
    "Attachment".ATTACHMENT_ID;

ALTER TABLE
    PUBLIC.COMPLETE_INVOICE OWNER TO POSTGRES;