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
  commission."currencyCustomer" AS currency,
  (count(commission.commission_id)) :: integer AS "totalCommissions",
  (sum(commission."priceCustomer")) :: integer AS "totalPrice",
  CASE
    WHEN (count(commission.commission_id) > 0) THEN json_agg(
      json_build_object(
        'commission_id',
        commission.commission_id,
        'commissionNumber',
        commission.number,
        'currencyCustomer',
        commission."currencyCustomer",
        'customer_company',
        customer.company,
        'dischargeDate',
        (commissiondischarge.date) :: text,
        'dischargeCity',
        discharge.city,
        'dischargeCountry',
        discharge.country,
        'exchangeRateCarrier',
        commission."exchangeRateCarrier",
        'exchangeRateCustomer',
        commission."exchangeRateCustomer",
        'loadingDate',
        (commissionloading.date) :: text,
        'loadingCity',
        loading.city,
        'loadingCountry',
        loading.country,
        'orderDate',
        (commission."orderDate") :: text,
        'orderSource',
        commission."orderNumber",
        'priceCustomer',
        commission."priceCustomer",
        'place',
        customer.place,
        'qid',
        commission.qid,
        'relation',
        commission.relation,
        'vat',
        commission.vat
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
      (
        customercontact.customer_id = customer.customer_id
      )
  ) AS customercontact
FROM
  (
    (
      (
        (
          (
            (
              invoice
              LEFT JOIN commission ON ((invoice.invoice_id = commission.invoice_id))
            )
            LEFT JOIN customer ON ((commission.customer_id = customer.customer_id))
          )
          LEFT JOIN commissiondischarge ON (
            (
              commissiondischarge.commission_id = commission.commission_id
            )
          )
        )
        LEFT JOIN discharge ON (
          (
            discharge.discharge_id = commissiondischarge.discharge_id
          )
        )
      )
      LEFT JOIN commissionloading ON (
        (
          commissionloading.commission_id = commission.commission_id
        )
      )
    )
    LEFT JOIN loading ON (
      (
        loading.loading_id = commissionloading.loading_id
      )
    )
  )
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
  commission."currencyCustomer";