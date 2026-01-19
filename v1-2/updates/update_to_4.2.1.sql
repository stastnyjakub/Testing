ALTER TABLE "invoice"
ALTER "invoiceNumber" TYPE bigint,
ALTER "invoiceNumber"
DROP DEFAULT,
ALTER "invoiceNumber"
DROP NOT NULL;
COMMENT ON COLUMN "invoice"."invoiceNumber" IS '';
COMMENT ON TABLE "invoice" IS '';

DROP VIEW  "complete_commission";

CREATE OR REPLACE VIEW "complete_commission" AS
SELECT co.commission_id,
    co.relation,
    co.week,
    co.number,
    co.year,
    co.oldid,
    co.carrier_id,
    co.note,
    co."addedBy",
    co.state,
    co.deleted,
    co."enteredCarrierBy",
    co.vat,
    co."carrierVat",
    co."carrierOrderSent",
    co."loadingConfirmationSent",
    co."dischargeConfirmationSent",
    co."orderConfirmationSent",
    cu.company AS customer_company,
    cu.customer_id,
    ca.company AS carrier_company,
    co."exchangeRateCarrier",
    CASE
              WHEN (co."exchangeRateCarrier" IS NULL) THEN co."priceCarrier"
              ELSE (co."exchangeRateCarrier" * co."priceCarrier")
          END AS "priceCarrier",
    co."exchangeRateCustomer",
    CASE
              WHEN (co."exchangeRateCustomer" IS NULL) THEN co."priceCustomer"
              ELSE (co."exchangeRateCustomer" * co."priceCustomer")
          END AS "priceCustomer",
    CASE
              WHEN ((co."priceCarrier" IS NULL) AND (co."priceCustomer" IS NULL)) THEN NULL::numeric
              ELSE count_provison(co."exchangeRateCarrier", co."priceCarrier", co."exchangeRateCustomer", co."priceCustomer")
          END AS provision,
    ci.total_weight,
    ci.total_loading_meters,
    cl.loading_date,
    ( SELECT array_agg(loading.city) AS array_agg
    FROM loading
    WHERE (loading.loading_id = ANY (cl
.loading_ids))) AS loading_city,
( SELECT array_agg(loading."postalCode") AS array_agg
FROM loading
WHERE (loading.loading_id = ANY (cl.loading_ids))
) AS loading_zip,
( SELECT string_agg(loading.city, '; '
::text) AS string_agg
             FROM loading
            WHERE
(loading.loading_id = ANY
(cl.loading_ids))) AS loading_city_string,
( SELECT string_agg(loading."postalCode", '; '
::text) AS string_agg
             FROM loading
            WHERE
(loading.loading_id = ANY
(cl.loading_ids))) AS loading_zip_string,
      cd.discharge_date,
( SELECT array_agg(discharge.city) AS array_agg
FROM discharge
WHERE (discharge.discharge_id = ANY (cd.discharge_ids))
) AS discharge_city,
( SELECT array_agg(discharge."postalCode") AS array_agg
FROM discharge
WHERE (discharge.discharge_id = ANY (cd.discharge_ids))
) AS discharge_zip,
( SELECT string_agg(discharge.city, '; '
::text) AS string_agg
             FROM discharge
            WHERE
(discharge.discharge_id = ANY
(cd.discharge_ids))) AS discharge_city_string,
( SELECT string_agg(discharge."postalCode", '; '
::text) AS string_agg
             FROM discharge
            WHERE
(discharge.discharge_id = ANY
(cd.discharge_ids))) AS discharge_zip_string,
(SELECT "invoiceNumber"
FROM invoice
WHERE invoice.commission_id = co.commission_id)
AS "invNumber",
     co.notification,
     co."orderDate",
     co."orderNumber"
     FROM
(((((commission co
       LEFT JOIN carrier ca ON
((co.carrier_id = ca.carrier_id)))
       LEFT JOIN customer cu ON
((co.customer_id = cu.customer_id)))
       LEFT JOIN
( SELECT commissionloading.commission_id,
    array_agg(commissionloading.date) AS loading_date,
    array_agg(commissionloading.loading_id) AS loading_ids
FROM commissionloading
GROUP BY commissionloading.commission_id)
cl ON
((co.commission_id = cl.commission_id)))
       LEFT JOIN
( SELECT commissiondischarge.commission_id,
    array_agg(commissiondischarge.date) AS discharge_date,
    array_agg(commissiondischarge.discharge_id) AS discharge_ids
FROM commissiondischarge
GROUP BY commissiondischarge.commission_id)
cd ON
((co.commission_id = cd.commission_id)))
       LEFT JOIN
( SELECT commissionitem.commission_id,
    sum(commissionitem.weight) AS total_weight,
    sum(commissionitem."loadingMeters") AS total_loading_meters
FROM commissionitem
WHERE (commissionitem.deleted = false)
GROUP BY commissionitem.commission_id)
ci ON
((co.commission_id = ci.commission_id)));