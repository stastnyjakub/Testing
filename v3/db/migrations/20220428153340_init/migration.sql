-- CreateTable
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE TABLE "carrier" (
    "carrier_id" SERIAL NOT NULL,
    "addedBy" TEXT,
    "city" TEXT,
    "company" TEXT NOT NULL,
    "companyRegistrationNumber" BIGINT,
    "country" TEXT,
    "countryCode" TEXT,
    "editedBy" TEXT,
    "note" TEXT,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "place" JSONB,
    "postalCode" TEXT,
    "qid" SMALLINT,
    "number" SMALLINT,
    "street" TEXT,
    "taxId" TEXT,
    "ts_edited" BIGINT,
    "ts_added" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "carrier_pkey" PRIMARY KEY ("carrier_id")
);

-- CreateTable
CREATE TABLE "commission" (
    "addedBy" TEXT,
    "commission_id" SERIAL NOT NULL,
    "carrier_id" INTEGER,
    "carrierDriver" TEXT,
    "carrierGsm" TEXT,
    "carrierOrderCreatedBy" TEXT,
    "carrierOrderSent" BOOLEAN NOT NULL DEFAULT false,
    "currencyCarrier" TEXT,
    "currencyCustomer" TEXT,
    "carrierNote" TEXT,
    "carrierRegistrationPlate" TEXT,
    "carrierVat" TEXT,
    "carriersTable" TEXT[],
    "customer_id" INTEGER,
    "customerContact_id" INTEGER,
    "dischargeConfirmationSent" BOOLEAN NOT NULL DEFAULT false,
    "dischargeRadius" INTEGER,
    "dispatcher_id" INTEGER,
    "dispatchersTable" TEXT[],
    "disposition" TEXT,
    "editedBy" TEXT,
    "enteredCarrierBy" TEXT,
    "enteredCarrierByNumber" INTEGER,
    "exchangeRateCarrier" DECIMAL,
    "exchangeRateCustomer" DECIMAL,
    "loadingConfirmationSent" BOOLEAN NOT NULL DEFAULT false,
    "loadingRadius" INTEGER,
    "note" TEXT,
    "number" INTEGER,
    "orderConfirmationSent" BOOLEAN NOT NULL DEFAULT false,
    "oldid" TEXT,
    "phoneNumberCarrierOrderCreatedBy" TEXT,
    "priceCarrier" DECIMAL,
    "priceCustomer" DECIMAL,
    "qid" TEXT,
    "relation" TEXT,
    "state" INTEGER,
    "tsAdded" BIGINT,
    "tsCarrierOrderCreatedBy" BIGINT,
    "tsEdited" BIGINT,
    "tsEnteredCarrier" BIGINT,
    "vat" TEXT,
    "week" SMALLINT,
    "year" SMALLINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "notification" BOOLEAN NOT NULL DEFAULT false,
    "orderDate" BIGINT,
    "orderNumber" TEXT,

    CONSTRAINT "commission_pkey" PRIMARY KEY ("commission_id")
);

-- CreateTable
CREATE TABLE "commissiondischarge" (
    "commissionDischarge_id" SERIAL NOT NULL,
    "commission_id" INTEGER,
    "customer_id" INTEGER,
    "city" TEXT,
    "company" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "date" BIGINT,
    "dateTo" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "note" TEXT,
    "neutralization" BOOLEAN NOT NULL DEFAULT false,
    "number" INTEGER,
    "postalCode" TEXT,
    "street" TEXT,
    "scrollTo" BOOLEAN NOT NULL DEFAULT false,
    "discharge_id" INTEGER,
    "refNumber" TEXT,
    "time" TEXT,
    "year" SMALLINT,

    CONSTRAINT "commissiondischarge_pkey" PRIMARY KEY ("commissionDischarge_id")
);

-- CreateTable
CREATE TABLE "commissionitem" (
    "commissionItem_id" SERIAL NOT NULL,
    "commission_id" INTEGER,
    "commissionDischarge_id" INTEGER,
    "commissionLoading_id" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "loadingMeters" DECIMAL,
    "name" TEXT,
    "price" DECIMAL,
    "package" TEXT,
    "packaging" TEXT,
    "quantity" DECIMAL,
    "size" TEXT,
    "weight" DECIMAL,
    "weightBrutto" BIGINT,
    "year" SMALLINT,

    CONSTRAINT "commissionitem_pkey" PRIMARY KEY ("commissionItem_id")
);

-- CreateTable
CREATE TABLE "commissionloading" (
    "commissionLoading_id" SERIAL NOT NULL,
    "commission_id" INTEGER,
    "date" BIGINT,
    "dateTo" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "number" INTEGER,
    "loading_id" INTEGER,
    "refNumber" TEXT,
    "time" TEXT,
    "year" SMALLINT,

    CONSTRAINT "commissionloading_pkey" PRIMARY KEY ("commissionLoading_id")
);

-- CreateTable
CREATE TABLE "country" (
    "country_id" SERIAL NOT NULL,
    "countries" JSONB,

    CONSTRAINT "country_pkey" PRIMARY KEY ("country_id")
);

-- CreateTable
CREATE TABLE "customer" (
    "customer_id" SERIAL NOT NULL,
    "addedBy" TEXT,
    "city" TEXT,
    "company" TEXT NOT NULL,
    "companyRegistrationNumber" BIGINT,
    "country" TEXT,
    "countryCode" TEXT,
    "editedBy" TEXT,
    "note" TEXT,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "place" JSONB,
    "postalCode" TEXT,
    "qid" SMALLINT,
    "number" SMALLINT,
    "street" TEXT,
    "taxId" TEXT,
    "ts_edited" BIGINT,
    "ts_added" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "defaultDueDate" INTEGER,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "customercontact" (
    "customerContact_id" SERIAL NOT NULL,
    "customer_id" INTEGER,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "customercontact_pkey" PRIMARY KEY ("customerContact_id")
);

-- CreateTable
CREATE TABLE "discharge" (
    "discharge_id" SERIAL NOT NULL,
    "city" TEXT,
    "company" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "customer_id" INTEGER,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "gps" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "note" TEXT,
    "phone" TEXT,
    "postalCode" TEXT,
    "street" TEXT,
    "scrollTo" BOOLEAN,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "discharge_pkey" PRIMARY KEY ("discharge_id")
);

-- CreateTable
CREATE TABLE "dispatcher" (
    "dispatcher_id" SERIAL NOT NULL,
    "carrier_id" INTEGER,
    "email" TEXT,
    "emailSent" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "lastRequest_id" INTEGER,
    "lastRequestTimeSent" BIGINT,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "language_id" INTEGER,
    "token" UUID DEFAULT uuid_generate_v4(),

    CONSTRAINT "dispatcher_pkey" PRIMARY KEY ("dispatcher_id")
);

-- CreateTable
CREATE TABLE "dispatchervehicle" (
    "dispatcherVehicle_id" SERIAL NOT NULL,
    "dispatcher_id" INTEGER,
    "vehicleType_id" INTEGER,
    "maxHeight" DECIMAL,
    "maxLength" DECIMAL,
    "maxWeight" DECIMAL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "carrier_id" INTEGER,

    CONSTRAINT "dispatchervehicle_pkey" PRIMARY KEY ("dispatcherVehicle_id")
);

-- CreateTable
CREATE TABLE "dispatchervehiclefeature" (
    "dispatcherVehicleFeature_id" SERIAL NOT NULL,
    "dispatcherVehicle_id" INTEGER,
    "vehicleFeature_id" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "dispatchervehiclefeature_pkey" PRIMARY KEY ("dispatcherVehicleFeature_id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "invoice_id" SERIAL NOT NULL,
    "commission_id" INTEGER,
    "user_id" INTEGER,
    "constantSymbol" TEXT,
    "issueDate" BIGINT,
    "dueDate" BIGINT,
    "pointDate" BIGINT,
    "paymentMethod" TEXT,
    "text" TEXT,
    "language" TEXT,
    "invoiceSent" BOOLEAN NOT NULL DEFAULT false,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "invoiceNumber" INTEGER,
    "valueAddedTax" INTEGER,
    "exported" BOOLEAN NOT NULL DEFAULT false,
    "canceled" BOOLEAN NOT NULL DEFAULT false,
    "reverseCharge" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("invoice_id")
);

-- CreateTable
CREATE TABLE "language" (
    "language_id" SERIAL NOT NULL,
    "languageCode" TEXT,

    CONSTRAINT "language_pkey" PRIMARY KEY ("language_id")
);

-- CreateTable
CREATE TABLE "languagestate" (
    "languageState_id" SERIAL NOT NULL,
    "language_id" INTEGER,
    "state_id" INTEGER,

    CONSTRAINT "languagestate_pkey" PRIMARY KEY ("languageState_id")
);

-- CreateTable
CREATE TABLE "loading" (
    "loading_id" SERIAL NOT NULL,
    "city" TEXT,
    "company" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "customer_id" INTEGER,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "gps" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "note" TEXT,
    "phone" TEXT,
    "postalCode" TEXT,
    "street" TEXT,
    "scrollTo" BOOLEAN,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "loading_pkey" PRIMARY KEY ("loading_id")
);

-- CreateTable
CREATE TABLE "place" (
    "place_id" SERIAL NOT NULL,
    "carrier_id" INTEGER,
    "city" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "directions" INTEGER[],
    "dispatcher_id" INTEGER,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "note" TEXT,
    "postalCode" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "place_pkey" PRIMARY KEY ("place_id")
);

-- CreateTable
CREATE TABLE "rate" (
    "rate_id" SERIAL NOT NULL,
    "date" TIMESTAMP(6),
    "rates" JSONB,
    "base" TEXT,
    "success" BOOLEAN,
    "timestamp" BIGINT,

    CONSTRAINT "rate_pkey" PRIMARY KEY ("rate_id")
);

-- CreateTable
CREATE TABLE "request" (
    "request_id" SERIAL NOT NULL,
    "addedBy" TEXT,
    "editedBy" TEXT,
    "emailSent" BIGINT,
    "customer_id" INTEGER,
    "carriers" TEXT[],
    "carTypes" INTEGER[],
    "discharge" JSONB,
    "discharge_id" INTEGER,
    "dischargeDateFrom" BIGINT,
    "dischargeRadius" SMALLINT,
    "dispatchers" TEXT[],
    "editeBy" TEXT,
    "loading" JSONB,
    "loading_id" INTEGER,
    "loadingDateFrom" BIGINT,
    "loadingDateTo" BIGINT,
    "loadingRadius" SMALLINT,
    "loadingTypes" INTEGER[],
    "number" SMALLINT,
    "qid" VARCHAR(100),
    "relation" VARCHAR(100),
    "tsAdded" BIGINT,
    "tsEdited" BIGINT,
    "week" SMALLINT,
    "year" SMALLINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "request_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "requestdischarge" (
    "requestDischarge_id" SERIAL NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "postalCode" TEXT,
    "request_id" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "requestdischarge_pkey" PRIMARY KEY ("requestDischarge_id")
);

-- CreateTable
CREATE TABLE "requestloading" (
    "requestLoading_id" SERIAL NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "postalCode" TEXT,
    "request_id" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "requestloading_pkey" PRIMARY KEY ("requestLoading_id")
);

-- CreateTable
CREATE TABLE "state" (
    "state_id" SERIAL NOT NULL,
    "countryCode" TEXT,
    "name" TEXT,
    "inEU" BOOLEAN,

    CONSTRAINT "state_pkey" PRIMARY KEY ("state_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "number" SMALLINT,
    "email" TEXT NOT NULL,
    "emailPassword" TEXT,
    "password" TEXT,
    "jobTitle" TEXT NOT NULL,
    "mobilePhone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "role" SMALLINT DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "vehiclefeature" (
    "vehicleFeature_id" SERIAL NOT NULL,
    "feature" TEXT,

    CONSTRAINT "vehiclefeature_pkey" PRIMARY KEY ("vehicleFeature_id")
);

-- CreateTable
CREATE TABLE "vehicletype" (
    "vehicleType_id" SERIAL NOT NULL,
    "type" TEXT,
    "heightMin" DECIMAL,
    "heightMax" DECIMAL,
    "heightStep" DECIMAL,
    "lengthMin" DECIMAL,
    "lengthMax" DECIMAL,
    "lengthStep" DECIMAL,
    "capacityMin" DECIMAL,
    "capacityMax" DECIMAL,
    "capacityStep" DECIMAL,

    CONSTRAINT "vehicletype_pkey" PRIMARY KEY ("vehicleType_id")
);

-- CreateTable
CREATE TABLE "vehicletypefeature" (
    "vehicleTypeFeature_id" SERIAL NOT NULL,
    "vehicleFeature_id" INTEGER,
    "vehicleType_id" INTEGER,

    CONSTRAINT "vehicletypefeature_pkey" PRIMARY KEY ("vehicleTypeFeature_id")
);

-- CreateIndex
CREATE INDEX "ca_addedby_idx" ON "carrier"("addedBy");

-- CreateIndex
CREATE INDEX "ca_company_idx" ON "carrier"("company");

-- CreateIndex
CREATE INDEX "ca_country_idx" ON "carrier"("country");

-- CreateIndex
CREATE INDEX "ca_street_idx" ON "carrier"("street");

-- CreateIndex
CREATE INDEX "ca_taxid_idx" ON "carrier"("taxId");

-- CreateIndex
CREATE INDEX "ca_zip_idx" ON "carrier"("postalCode");

-- CreateIndex
CREATE INDEX "cu_addedby_idx" ON "customer"("addedBy");

-- CreateIndex
CREATE INDEX "cu_company_idx" ON "customer"("company");

-- CreateIndex
CREATE INDEX "cu_country_idx" ON "customer"("country");

-- CreateIndex
CREATE INDEX "cu_street_idx" ON "customer"("street");

-- CreateIndex
CREATE INDEX "cu_taxid_idx" ON "customer"("taxId");

-- CreateIndex
CREATE INDEX "cu_zip_idx" ON "customer"("postalCode");

-- AddForeignKey
ALTER TABLE "commission" ADD CONSTRAINT "commission_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carrier"("carrier_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commission" ADD CONSTRAINT "commission_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commission" ADD CONSTRAINT "commission_customerContact_id_fkey" FOREIGN KEY ("customerContact_id") REFERENCES "customercontact"("customerContact_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commission" ADD CONSTRAINT "commission_dispatcher_id_fkey" FOREIGN KEY ("dispatcher_id") REFERENCES "dispatcher"("dispatcher_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commissiondischarge" ADD CONSTRAINT "commissiondischarge_commission_id_fkey" FOREIGN KEY ("commission_id") REFERENCES "commission"("commission_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commissiondischarge" ADD CONSTRAINT "commissiondischarge_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commissiondischarge" ADD CONSTRAINT "commissiondischarge_discharge_id_fkey" FOREIGN KEY ("discharge_id") REFERENCES "discharge"("discharge_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commissionitem" ADD CONSTRAINT "commissionitem_commission_id_fkey" FOREIGN KEY ("commission_id") REFERENCES "commission"("commission_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commissionitem" ADD CONSTRAINT "commissionitem_commissionDischarge_id_fkey" FOREIGN KEY ("commissionDischarge_id") REFERENCES "commissiondischarge"("commissionDischarge_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commissionitem" ADD CONSTRAINT "commissionitem_commissionLoading_id_fkey" FOREIGN KEY ("commissionLoading_id") REFERENCES "commissionloading"("commissionLoading_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commissionloading" ADD CONSTRAINT "commissionloading_commission_id_fkey" FOREIGN KEY ("commission_id") REFERENCES "commission"("commission_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commissionloading" ADD CONSTRAINT "commissionloading_loading_id_fkey" FOREIGN KEY ("loading_id") REFERENCES "loading"("loading_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customercontact" ADD CONSTRAINT "customercontact_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "discharge" ADD CONSTRAINT "discharge_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dispatcher" ADD CONSTRAINT "dispatcher_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carrier"("carrier_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dispatcher" ADD CONSTRAINT "dispatcher_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "language"("language_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dispatcher" ADD CONSTRAINT "dispatcher_lastRequest_id_fkey" FOREIGN KEY ("lastRequest_id") REFERENCES "request"("request_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dispatchervehicle" ADD CONSTRAINT "dispatchervehicle_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carrier"("carrier_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dispatchervehicle" ADD CONSTRAINT "dispatchervehicle_dispatcher_id_fkey" FOREIGN KEY ("dispatcher_id") REFERENCES "dispatcher"("dispatcher_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dispatchervehicle" ADD CONSTRAINT "dispatchervehicle_vehicleType_id_fkey" FOREIGN KEY ("vehicleType_id") REFERENCES "vehicletype"("vehicleType_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dispatchervehiclefeature" ADD CONSTRAINT "dispatchervehiclefeature_dispatcherVehicle_id_fkey" FOREIGN KEY ("dispatcherVehicle_id") REFERENCES "dispatchervehicle"("dispatcherVehicle_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dispatchervehiclefeature" ADD CONSTRAINT "dispatchervehiclefeature_vehicleFeature_id_fkey" FOREIGN KEY ("vehicleFeature_id") REFERENCES "vehiclefeature"("vehicleFeature_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_commission_id_fkey" FOREIGN KEY ("commission_id") REFERENCES "commission"("commission_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "languagestate" ADD CONSTRAINT "languagestate_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "language"("language_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "languagestate" ADD CONSTRAINT "languagestate_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "state"("state_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "loading" ADD CONSTRAINT "loading_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "place" ADD CONSTRAINT "place_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carrier"("carrier_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "place" ADD CONSTRAINT "place_dispatcher_id_fkey" FOREIGN KEY ("dispatcher_id") REFERENCES "dispatcher"("dispatcher_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_discharge_id_fkey" FOREIGN KEY ("discharge_id") REFERENCES "discharge"("discharge_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_loading_id_fkey" FOREIGN KEY ("loading_id") REFERENCES "loading"("loading_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "requestdischarge" ADD CONSTRAINT "requestdischarge_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request"("request_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "requestloading" ADD CONSTRAINT "requestloading_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request"("request_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vehicletypefeature" ADD CONSTRAINT "vehicletypefeature_vehicleFeature_id_fkey" FOREIGN KEY ("vehicleFeature_id") REFERENCES "vehiclefeature"("vehicleFeature_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vehicletypefeature" ADD CONSTRAINT "vehicletypefeature_vehicleType_id_fkey" FOREIGN KEY ("vehicleType_id") REFERENCES "vehicletype"("vehicleType_id") ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE OR REPLACE FUNCTION count_provison( rate_carrier DECIMAL, price_carrier DECIMAL, rate_customer DECIMAL, price_customer DECIMAL) 
  RETURNS DECIMAL AS $$
  DECLARE
  result DECIMAL;   
  rate_carrier DECIMAL = rate_carrier;
  rate_customer DECIMAL = rate_customer;
  BEGIN
  IF rate_carrier ISNULL THEN rate_carrier = 1; ELSE rate_carrier = rate_carrier; END IF;
  IF rate_customer ISNULL THEN rate_customer = 1; ELSE rate_customer = rate_customer; END IF;
  IF price_customer ISNULL THEN price_customer = 0; ELSE price_customer = price_customer; END IF;
  IF price_carrier ISNULL THEN price_carrier = 0; ELSE price_carrier = price_carrier; END IF;
  result = rate_customer * price_customer - rate_carrier * price_carrier;       
  RETURN result;                               
  END   
  $$ LANGUAGE plpgsql;

  CREATE OR REPLACE FUNCTION distance(lat1 FLOAT, lon1 FLOAT, lat2 FLOAT, lon2 FLOAT) RETURNS FLOAT AS $$
  DECLARE                                                   
      x float = 69.1 * (lat2 - lat1);                           
      y float = 69.1 * (lon2 - lon1) * cos(lat1 / 57.3);        
  BEGIN                                                     
      RETURN sqrt(x * x + y * y);                               
  END  
  $$ LANGUAGE plpgsql;

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
      (SELECT array_agg(loading.city) AS array_agg
             FROM loading
            WHERE (loading.loading_id = ANY (cl.loading_ids))) AS loading_city,
      (SELECT array_agg(loading."postalCode") AS array_agg
             FROM loading
            WHERE (loading.loading_id = ANY (cl.loading_ids))) AS loading_zip,
      (SELECT string_agg(loading.city, '; '::text) AS string_agg
             FROM loading
            WHERE (loading.loading_id = ANY (cl.loading_ids))) AS loading_city_string,
      (SELECT string_agg(loading."postalCode", '; '::text) AS string_agg
             FROM loading
            WHERE (loading.loading_id = ANY (cl.loading_ids))) AS loading_zip_string,
      cd.discharge_date,
      (SELECT array_agg(discharge.city) AS array_agg
             FROM discharge
            WHERE (discharge.discharge_id = ANY (cd.discharge_ids))) AS discharge_city,
      (SELECT array_agg(discharge."postalCode") AS array_agg
             FROM discharge
            WHERE (discharge.discharge_id = ANY (cd.discharge_ids))) AS discharge_zip,
      (SELECT string_agg(discharge.city, '; '::text) AS string_agg
             FROM discharge
            WHERE (discharge.discharge_id = ANY (cd.discharge_ids))) AS discharge_city_string,
      (SELECT string_agg(discharge."postalCode", '; '::text) AS string_agg
             FROM discharge
            WHERE (discharge.discharge_id = ANY (cd.discharge_ids))) AS discharge_zip_string,
      co.notification,
      co."orderDate",
      co."orderNumber",
      co."currencyCarrier"
      FROM (((((commission co
       LEFT JOIN carrier ca ON ((co.carrier_id = ca.carrier_id)))
       LEFT JOIN customer cu ON ((co.customer_id = cu.customer_id)))
       LEFT JOIN ( SELECT commissionloading.commission_id,
              array_agg(commissionloading.date) AS loading_date,
              array_agg(commissionloading.loading_id) AS loading_ids
             FROM commissionloading
              WHERE (commissionloading.deleted = false)
            GROUP BY commissionloading.commission_id) cl ON ((co.commission_id = cl.commission_id)))
       LEFT JOIN ( SELECT commissiondischarge.commission_id,
              array_agg(commissiondischarge.date) AS discharge_date,
              array_agg(commissiondischarge.discharge_id) AS discharge_ids
             FROM commissiondischarge
              WHERE (commissiondischarge.deleted = false)
            GROUP BY commissiondischarge.commission_id) cd ON ((co.commission_id = cd.commission_id)))
       LEFT JOIN ( SELECT commissionitem.commission_id,
              sum(commissionitem.weight) AS total_weight,
              sum(commissionitem."loadingMeters") AS total_loading_meters
             FROM commissionitem
            WHERE (commissionitem.deleted = false)
            GROUP BY commissionitem.commission_id) ci ON ((co.commission_id = ci.commission_id)));

INSERT INTO country ("countries") values ('{}') RETURNING country_id;


INSERT INTO language ("languageCode") values ('ab');
INSERT INTO language ("languageCode") values ('aa');
INSERT INTO language ("languageCode") values ('af');
INSERT INTO language ("languageCode") values ('ak');
INSERT INTO language ("languageCode") values ('sq');
INSERT INTO language ("languageCode") values ('am');
INSERT INTO language ("languageCode") values ('ar');
INSERT INTO language ("languageCode") values ('an');
INSERT INTO language ("languageCode") values ('hy');
INSERT INTO language ("languageCode") values ('as');
INSERT INTO language ("languageCode") values ('av');
INSERT INTO language ("languageCode") values ('ae');
INSERT INTO language ("languageCode") values ('ay');
INSERT INTO language ("languageCode") values ('az');
INSERT INTO language ("languageCode") values ('bm');
INSERT INTO language ("languageCode") values ('ba');
INSERT INTO language ("languageCode") values ('eu');
INSERT INTO language ("languageCode") values ('be');
INSERT INTO language ("languageCode") values ('bn');
INSERT INTO language ("languageCode") values ('bh');
INSERT INTO language ("languageCode") values ('bi');
INSERT INTO language ("languageCode") values ('bs');
INSERT INTO language ("languageCode") values ('br');
INSERT INTO language ("languageCode") values ('bg');
INSERT INTO language ("languageCode") values ('my');
INSERT INTO language ("languageCode") values ('ca');
INSERT INTO language ("languageCode") values ('ch');
INSERT INTO language ("languageCode") values ('ce');
INSERT INTO language ("languageCode") values ('ny');
INSERT INTO language ("languageCode") values ('zh');
INSERT INTO language ("languageCode") values ('cv');
INSERT INTO language ("languageCode") values ('kw');
INSERT INTO language ("languageCode") values ('co');
INSERT INTO language ("languageCode") values ('cr');
INSERT INTO language ("languageCode") values ('hr');
INSERT INTO language ("languageCode") values ('cs');
INSERT INTO language ("languageCode") values ('da');
INSERT INTO language ("languageCode") values ('dv');
INSERT INTO language ("languageCode") values ('nl');
INSERT INTO language ("languageCode") values ('dz');
INSERT INTO language ("languageCode") values ('en');
INSERT INTO language ("languageCode") values ('eo');
INSERT INTO language ("languageCode") values ('et');
INSERT INTO language ("languageCode") values ('ee');
INSERT INTO language ("languageCode") values ('fo');
INSERT INTO language ("languageCode") values ('fj');
INSERT INTO language ("languageCode") values ('fi');
INSERT INTO language ("languageCode") values ('fr');
INSERT INTO language ("languageCode") values ('ff');
INSERT INTO language ("languageCode") values ('gl');
INSERT INTO language ("languageCode") values ('ka');
INSERT INTO language ("languageCode") values ('de');
INSERT INTO language ("languageCode") values ('el');
INSERT INTO language ("languageCode") values ('gn');
INSERT INTO language ("languageCode") values ('gu');
INSERT INTO language ("languageCode") values ('ht');
INSERT INTO language ("languageCode") values ('ha');
INSERT INTO language ("languageCode") values ('he');
INSERT INTO language ("languageCode") values ('hz');
INSERT INTO language ("languageCode") values ('hi');
INSERT INTO language ("languageCode") values ('ho');
INSERT INTO language ("languageCode") values ('hu');
INSERT INTO language ("languageCode") values ('ia');
INSERT INTO language ("languageCode") values ('id');
INSERT INTO language ("languageCode") values ('ie');
INSERT INTO language ("languageCode") values ('ga');
INSERT INTO language ("languageCode") values ('ig');
INSERT INTO language ("languageCode") values ('ik');
INSERT INTO language ("languageCode") values ('io');
INSERT INTO language ("languageCode") values ('is');
INSERT INTO language ("languageCode") values ('it');
INSERT INTO language ("languageCode") values ('iu');
INSERT INTO language ("languageCode") values ('ja');
INSERT INTO language ("languageCode") values ('jv');
INSERT INTO language ("languageCode") values ('kl');
INSERT INTO language ("languageCode") values ('kn');
INSERT INTO language ("languageCode") values ('kr');
INSERT INTO language ("languageCode") values ('ks');
INSERT INTO language ("languageCode") values ('kk');
INSERT INTO language ("languageCode") values ('km');
INSERT INTO language ("languageCode") values ('ki');
INSERT INTO language ("languageCode") values ('rw');
INSERT INTO language ("languageCode") values ('ky');
INSERT INTO language ("languageCode") values ('kv');
INSERT INTO language ("languageCode") values ('kg');
INSERT INTO language ("languageCode") values ('ko');
INSERT INTO language ("languageCode") values ('ku');
INSERT INTO language ("languageCode") values ('kj');
INSERT INTO language ("languageCode") values ('la');
INSERT INTO language ("languageCode") values ('lb');
INSERT INTO language ("languageCode") values ('lg');
INSERT INTO language ("languageCode") values ('li');
INSERT INTO language ("languageCode") values ('ln');
INSERT INTO language ("languageCode") values ('lo');
INSERT INTO language ("languageCode") values ('lt');
INSERT INTO language ("languageCode") values ('lu');
INSERT INTO language ("languageCode") values ('lv');
INSERT INTO language ("languageCode") values ('gv');
INSERT INTO language ("languageCode") values ('mk');
INSERT INTO language ("languageCode") values ('mg');
INSERT INTO language ("languageCode") values ('ms');
INSERT INTO language ("languageCode") values ('ml');
INSERT INTO language ("languageCode") values ('mt');
INSERT INTO language ("languageCode") values ('mi');
INSERT INTO language ("languageCode") values ('mr');
INSERT INTO language ("languageCode") values ('mh');
INSERT INTO language ("languageCode") values ('mn');
INSERT INTO language ("languageCode") values ('na');
INSERT INTO language ("languageCode") values ('nv');
INSERT INTO language ("languageCode") values ('nd');
INSERT INTO language ("languageCode") values ('ne');
INSERT INTO language ("languageCode") values ('ng');
INSERT INTO language ("languageCode") values ('nb');
INSERT INTO language ("languageCode") values ('nn');
INSERT INTO language ("languageCode") values ('no');
INSERT INTO language ("languageCode") values ('ii');
INSERT INTO language ("languageCode") values ('nr');
INSERT INTO language ("languageCode") values ('oc');
INSERT INTO language ("languageCode") values ('oj');
INSERT INTO language ("languageCode") values ('cu');
INSERT INTO language ("languageCode") values ('om');
INSERT INTO language ("languageCode") values ('or');
INSERT INTO language ("languageCode") values ('os');
INSERT INTO language ("languageCode") values ('pa');
INSERT INTO language ("languageCode") values ('pi');
INSERT INTO language ("languageCode") values ('fa');
INSERT INTO language ("languageCode") values ('pl');
INSERT INTO language ("languageCode") values ('ps');
INSERT INTO language ("languageCode") values ('pt');
INSERT INTO language ("languageCode") values ('qu');
INSERT INTO language ("languageCode") values ('rm');
INSERT INTO language ("languageCode") values ('rn');
INSERT INTO language ("languageCode") values ('ro');
INSERT INTO language ("languageCode") values ('ru');
INSERT INTO language ("languageCode") values ('sa');
INSERT INTO language ("languageCode") values ('sc');
INSERT INTO language ("languageCode") values ('sd');
INSERT INTO language ("languageCode") values ('se');
INSERT INTO language ("languageCode") values ('sm');
INSERT INTO language ("languageCode") values ('sg');
INSERT INTO language ("languageCode") values ('sr');
INSERT INTO language ("languageCode") values ('gd');
INSERT INTO language ("languageCode") values ('sn');
INSERT INTO language ("languageCode") values ('si');
INSERT INTO language ("languageCode") values ('sk');
INSERT INTO language ("languageCode") values ('sl');
INSERT INTO language ("languageCode") values ('so');
INSERT INTO language ("languageCode") values ('st');
INSERT INTO language ("languageCode") values ('es');
INSERT INTO language ("languageCode") values ('su');
INSERT INTO language ("languageCode") values ('sw');
INSERT INTO language ("languageCode") values ('ss');
INSERT INTO language ("languageCode") values ('sv');
INSERT INTO language ("languageCode") values ('ta');
INSERT INTO language ("languageCode") values ('te');
INSERT INTO language ("languageCode") values ('tg');
INSERT INTO language ("languageCode") values ('th');
INSERT INTO language ("languageCode") values ('ti');
INSERT INTO language ("languageCode") values ('bo');
INSERT INTO language ("languageCode") values ('tk');
INSERT INTO language ("languageCode") values ('tl');
INSERT INTO language ("languageCode") values ('tn');
INSERT INTO language ("languageCode") values ('to');
INSERT INTO language ("languageCode") values ('tr');
INSERT INTO language ("languageCode") values ('ts');
INSERT INTO language ("languageCode") values ('tt');
INSERT INTO language ("languageCode") values ('tw');
INSERT INTO language ("languageCode") values ('ty');
INSERT INTO language ("languageCode") values ('ug');
INSERT INTO language ("languageCode") values ('uk');
INSERT INTO language ("languageCode") values ('ur');
INSERT INTO language ("languageCode") values ('uz');
INSERT INTO language ("languageCode") values ('ve');
INSERT INTO language ("languageCode") values ('vi');
INSERT INTO language ("languageCode") values ('vo');
INSERT INTO language ("languageCode") values ('wa');
INSERT INTO language ("languageCode") values ('cy');
INSERT INTO language ("languageCode") values ('wo');
INSERT INTO language ("languageCode") values ('fy');
INSERT INTO language ("languageCode") values ('xh');
INSERT INTO language ("languageCode") values ('yi');
INSERT INTO language ("languageCode") values ('yo');
INSERT INTO language ("languageCode") values ('za');
INSERT INTO language ("languageCode") values ('zu');


INSERT INTO state ("name","countryCode") values ('Albánie','AL');
INSERT INTO state ("name","countryCode") values ('Alžírsko','DZ');
INSERT INTO state ("name","countryCode") values ('Americká Samoa','AS');
INSERT INTO state ("name","countryCode") values ('Andorra','AD');
INSERT INTO state ("name","countryCode") values ('Angola','AO');
INSERT INTO state ("name","countryCode") values ('Anguilla','AI');
INSERT INTO state ("name","countryCode") values ('Antarktida','AQ');
INSERT INTO state ("name","countryCode") values ('Antigua a Barbuda','AG');
INSERT INTO state ("name","countryCode") values ('Argentina','AR');
INSERT INTO state ("name","countryCode") values ('Arménie','AM');
INSERT INTO state ("name","countryCode") values ('Aruba','AW');
INSERT INTO state ("name","countryCode") values ('Austrálie','AU');
INSERT INTO state ("name","countryCode") values ('Ázerbajdžán','AZ');
INSERT INTO state ("name","countryCode") values ('Bahamy','BS');
INSERT INTO state ("name","countryCode") values ('Bahrajn','BH');
INSERT INTO state ("name","countryCode") values ('Bailiwick Jersey','JE');
INSERT INTO state ("name","countryCode") values ('Bangladéš','BD');
INSERT INTO state ("name","countryCode") values ('Barbados','BB');
INSERT INTO state ("name","countryCode") values ('Barma','MM');
INSERT INTO state ("name","countryCode") values ('Belgie','BE');
INSERT INTO state ("name","countryCode") values ('Belize','BZ');
INSERT INTO state ("name","countryCode") values ('Bělorusko','BY');
INSERT INTO state ("name","countryCode") values ('Benin','BJ');
INSERT INTO state ("name","countryCode") values ('Bermudy','BM');
INSERT INTO state ("name","countryCode") values ('Bhútánské království','BT');
INSERT INTO state ("name","countryCode") values ('Bolívie','BO');
INSERT INTO state ("name","countryCode") values ('Bosna-Hercegovina','BA');
INSERT INTO state ("name","countryCode") values ('Botswana','BW');
INSERT INTO state ("name","countryCode") values ('Bouvetův ostrov','BV');
INSERT INTO state ("name","countryCode") values ('Brazílie','BR');
INSERT INTO state ("name","countryCode") values ('Britské indickooceánské terit.','IO');
INSERT INTO state ("name","countryCode") values ('Britské Panenské ostrovy','VG');
INSERT INTO state ("name","countryCode") values ('Brunej Darussalam','BN');
INSERT INTO state ("name","countryCode") values ('Bulharsko','BG');
INSERT INTO state ("name","countryCode") values ('Burkina Faso','BF');
INSERT INTO state ("name","countryCode") values ('Burundi','BI');
INSERT INTO state ("name","countryCode") values ('Svatý Bartoloměj','BL');
INSERT INTO state ("name","countryCode") values ('Bonaire, Svatý Eustach a Saba','BQ');
INSERT INTO state ("name","countryCode") values ('Canton a Enderbury','CT');
INSERT INTO state ("name","countryCode") values ('Cookovy ostrovy','CK');
INSERT INTO state ("name","countryCode") values ('Curaçao','CW');
INSERT INTO state ("name","countryCode") values ('Čad','TD');
INSERT INTO state ("name","countryCode") values ('Černá Hora','ME');
INSERT INTO state ("name","countryCode") values ('Česká republika','CZ');
INSERT INTO state ("name","countryCode") values ('Československo','CS1');
INSERT INTO state ("name","countryCode") values ('ČLR','CN');
INSERT INTO state ("name","countryCode") values ('Dánsko','DK');
INSERT INTO state ("name","countryCode") values ('Dominika','DM');
INSERT INTO state ("name","countryCode") values ('Dominikánská republika','DO');
INSERT INTO state ("name","countryCode") values ('Džibutsko','DJ');
INSERT INTO state ("name","countryCode") values ('Egypt','EG');
INSERT INTO state ("name","countryCode") values ('Ekvádor','EC');
INSERT INTO state ("name","countryCode") values ('Eritrea','ER');
INSERT INTO state ("name","countryCode") values ('Estonsko','EE');
INSERT INTO state ("name","countryCode") values ('Etiopie','ET');
INSERT INTO state ("name","countryCode") values ('Faerské ostrovy','FO');
INSERT INTO state ("name","countryCode") values ('Falklandy','FK');
INSERT INTO state ("name","countryCode") values ('Federativní státy a Mikronésie','FM');
INSERT INTO state ("name","countryCode") values ('Fidži','FJ');
INSERT INTO state ("name","countryCode") values ('Filipíny','PH');
INSERT INTO state ("name","countryCode") values ('Finsko','FI');
INSERT INTO state ("name","countryCode") values ('Francie','FR');
INSERT INTO state ("name","countryCode") values ('Francouzská Guayana','GF');
INSERT INTO state ("name","countryCode") values ('Francouzská jižní území','TF');
INSERT INTO state ("name","countryCode") values ('Francouzská Polynésie','PF');
INSERT INTO state ("name","countryCode") values ('Gabon','GA');
INSERT INTO state ("name","countryCode") values ('Gambie','GM');
INSERT INTO state ("name","countryCode") values ('Ghana','GH');
INSERT INTO state ("name","countryCode") values ('Gibraltar','GI');
INSERT INTO state ("name","countryCode") values ('Grenada','GD');
INSERT INTO state ("name","countryCode") values ('Grónsko','GL');
INSERT INTO state ("name","countryCode") values ('Gruzie','GE');
INSERT INTO state ("name","countryCode") values ('Guadeloupe','GP');
INSERT INTO state ("name","countryCode") values ('Guam','GU');
INSERT INTO state ("name","countryCode") values ('Guatemala','GT');
INSERT INTO state ("name","countryCode") values ('Guernsey','GG');
INSERT INTO state ("name","countryCode") values ('Guinea','GN');
INSERT INTO state ("name","countryCode") values ('Guinea-Bissau','GW');
INSERT INTO state ("name","countryCode") values ('Guyana','GY');
INSERT INTO state ("name","countryCode") values ('Haiti','HT');
INSERT INTO state ("name","countryCode") values ('Heardův a MacDonaldův o.','HM');
INSERT INTO state ("name","countryCode") values ('Honduras','HN');
INSERT INTO state ("name","countryCode") values ('Hongkong','HK');
INSERT INTO state ("name","countryCode") values ('Chile','CL');
INSERT INTO state ("name","countryCode") values ('Chorvatsko','HR');
INSERT INTO state ("name","countryCode") values ('Indie','IN');
INSERT INTO state ("name","countryCode") values ('Indonésie','ID');
INSERT INTO state ("name","countryCode") values ('Irák','IQ');
INSERT INTO state ("name","countryCode") values ('Irán','IR');
INSERT INTO state ("name","countryCode") values ('Irsko','IE');
INSERT INTO state ("name","countryCode") values ('Island','IS');
INSERT INTO state ("name","countryCode") values ('Itálie','IT');
INSERT INTO state ("name","countryCode") values ('Izrael','IL');
INSERT INTO state ("name","countryCode") values ('Jamajka','JM');
INSERT INTO state ("name","countryCode") values ('Japonsko','JP');
INSERT INTO state ("name","countryCode") values ('Jemen','YE');
INSERT INTO state ("name","countryCode") values ('Jihoafrická republika','ZA');
INSERT INTO state ("name","countryCode") values ('Jihosúdánská republika','SS');
INSERT INTO state ("name","countryCode") values ('Jižní Georgie a Jižní Sanwich. o.','GS');
INSERT INTO state ("name","countryCode") values ('Jižní Jemen','YD');
INSERT INTO state ("name","countryCode") values ('Jižní Korea','KR');
INSERT INTO state ("name","countryCode") values ('Johnston I.','JT');
INSERT INTO state ("name","countryCode") values ('Jordánsko','JO');
INSERT INTO state ("name","countryCode") values ('Kajmanské ostrovy','KY');
INSERT INTO state ("name","countryCode") values ('Kambodža','KH');
INSERT INTO state ("name","countryCode") values ('Kamerun','CM');
INSERT INTO state ("name","countryCode") values ('Kanada','CA');
INSERT INTO state ("name","countryCode") values ('Kapverdy','CV');
INSERT INTO state ("name","countryCode") values ('Katar','QA');
INSERT INTO state ("name","countryCode") values ('Kazachstán','KZ');
INSERT INTO state ("name","countryCode") values ('Keňa','KE');
INSERT INTO state ("name","countryCode") values ('Kiribati','KI');
INSERT INTO state ("name","countryCode") values ('KLDR','KP');
INSERT INTO state ("name","countryCode") values ('Kokosové ostrovy','CC');
INSERT INTO state ("name","countryCode") values ('Kolumbie','CO');
INSERT INTO state ("name","countryCode") values ('Komory','KM');
INSERT INTO state ("name","countryCode") values ('Konžská republika','CG');
INSERT INTO state ("name","countryCode") values ('Kongo, demokratická republika','CD');
INSERT INTO state ("name","countryCode") values ('Kostarika','CR');
INSERT INTO state ("name","countryCode") values ('Kuba','CU');
INSERT INTO state ("name","countryCode") values ('Kuvajt','KW');
INSERT INTO state ("name","countryCode") values ('Kypr','CY');
INSERT INTO state ("name","countryCode") values ('Kyrgyzstán','KG');
INSERT INTO state ("name","countryCode") values ('Laos','LA');
INSERT INTO state ("name","countryCode") values ('Lesotho','LS');
INSERT INTO state ("name","countryCode") values ('Libanon','LB');
INSERT INTO state ("name","countryCode") values ('Libérie','LR');
INSERT INTO state ("name","countryCode") values ('Libye','LY');
INSERT INTO state ("name","countryCode") values ('Lichtenštejnsko','LI');
INSERT INTO state ("name","countryCode") values ('Litva','LT');
INSERT INTO state ("name","countryCode") values ('Lotyšsko','LV');
INSERT INTO state ("name","countryCode") values ('Lucembursko','LU');
INSERT INTO state ("name","countryCode") values ('Macao','MO');
INSERT INTO state ("name","countryCode") values ('Madagaskar','MG');
INSERT INTO state ("name","countryCode") values ('Maďarsko','HU');
INSERT INTO state ("name","countryCode") values ('Makedonie','MK');
INSERT INTO state ("name","countryCode") values ('Malajsie','MY');
INSERT INTO state ("name","countryCode") values ('Malawi','MW');
INSERT INTO state ("name","countryCode") values ('Maledivy','MV');
INSERT INTO state ("name","countryCode") values ('Mali','ML');
INSERT INTO state ("name","countryCode") values ('Malta','MT');
INSERT INTO state ("name","countryCode") values ('Maroko','MA');
INSERT INTO state ("name","countryCode") values ('Marshallovy ostrovy','MH');
INSERT INTO state ("name","countryCode") values ('Martinik','MQ');
INSERT INTO state ("name","countryCode") values ('Mauricius','MU');
INSERT INTO state ("name","countryCode") values ('Mauritánie','MR');
INSERT INTO state ("name","countryCode") values ('Mayotte','YT');
INSERT INTO state ("name","countryCode") values ('Mexiko','MX');
INSERT INTO state ("name","countryCode") values ('Midwayské ostrovy','MI');
INSERT INTO state ("name","countryCode") values ('Mikronésie','PC');
INSERT INTO state ("name","countryCode") values ('Moldavsko','MD');
INSERT INTO state ("name","countryCode") values ('Monako','MC');
INSERT INTO state ("name","countryCode") values ('Mongolsko','MN');
INSERT INTO state ("name","countryCode") values ('Montserrat','MS');
INSERT INTO state ("name","countryCode") values ('Mosambik','MZ');
INSERT INTO state ("name","countryCode") values ('Myanmarský svaz','MM');
INSERT INTO state ("name","countryCode") values ('Namíbie','NA');
INSERT INTO state ("name","countryCode") values ('Nauru','NR');
INSERT INTO state ("name","countryCode") values ('NDR (do r. 1990)','DD');
INSERT INTO state ("name","countryCode") values ('Německo (od r. 1991)','DE');
INSERT INTO state ("name","countryCode") values ('Nepál','NP');
INSERT INTO state ("name","countryCode") values ('Neutrální území','NT');
INSERT INTO state ("name","countryCode") values ('Niger','NE');
INSERT INTO state ("name","countryCode") values ('Nigérie','NG');
INSERT INTO state ("name","countryCode") values ('Nikaragua','NI');
INSERT INTO state ("name","countryCode") values ('Niue','NU');
INSERT INTO state ("name","countryCode") values ('Nizozemí','NL');
INSERT INTO state ("name","countryCode") values ('Nizozemské Antily','AN');
INSERT INTO state ("name","countryCode") values ('Norfolk','NF');
INSERT INTO state ("name","countryCode") values ('Norsko','NO');
INSERT INTO state ("name","countryCode") values ('Nová Kaledonie','NC');
INSERT INTO state ("name","countryCode") values ('Nový Zéland','NZ');
INSERT INTO state ("name","countryCode") values ('Omán','OM');
INSERT INTO state ("name","countryCode") values ('Ostrov Man','IM');
INSERT INTO state ("name","countryCode") values ('Ostrovy USA v Tichém o.','UM');
INSERT INTO state ("name","countryCode") values ('Pákistán','PK');
INSERT INTO state ("name","countryCode") values ('Palau','PW');
INSERT INTO state ("name","countryCode") values ('Palestina','PS');
INSERT INTO state ("name","countryCode") values ('Panama','PA');
INSERT INTO state ("name","countryCode") values ('Panamské průplav. pásmo','PZ');
INSERT INTO state ("name","countryCode") values ('Panenské ostrovy (USA)','VI');
INSERT INTO state ("name","countryCode") values ('Papua-Nová Guinea','PG');
INSERT INTO state ("name","countryCode") values ('Paraguay','PY');
INSERT INTO state ("name","countryCode") values ('Peru','PE');
INSERT INTO state ("name","countryCode") values ('Pitcairnovy ostrovy','PN');
INSERT INTO state ("name","countryCode") values ('Pobřeží slonoviny','CI');
INSERT INTO state ("name","countryCode") values ('Polsko','PL');
INSERT INTO state ("name","countryCode") values ('Portoriko','PR');
INSERT INTO state ("name","countryCode") values ('Portugalsko','PT');
INSERT INTO state ("name","countryCode") values ('Rakousko','AT');
INSERT INTO state ("name","countryCode") values ('Réunion','RE');
INSERT INTO state ("name","countryCode") values ('Rovníková Guinea','GQ');
INSERT INTO state ("name","countryCode") values ('Rumunsko','RO');
INSERT INTO state ("name","countryCode") values ('Rusko','RU');
INSERT INTO state ("name","countryCode") values ('Rwanda','RW');
INSERT INTO state ("name","countryCode") values ('Řecko','GR');
INSERT INTO state ("name","countryCode") values ('Saint Pierre a Miquelon','PM');
INSERT INTO state ("name","countryCode") values ('Salvador','SV');
INSERT INTO state ("name","countryCode") values ('Samoa','WS');
INSERT INTO state ("name","countryCode") values ('San Marino','SM');
INSERT INTO state ("name","countryCode") values ('Saúdská Arábie','SA');
INSERT INTO state ("name","countryCode") values ('Senegal','SN');
INSERT INTO state ("name","countryCode") values ('Severní Marianny','MP');
INSERT INTO state ("name","countryCode") values ('Seychelly','SC');
INSERT INTO state ("name","countryCode") values ('Sierra Leone','SL');
INSERT INTO state ("name","countryCode") values ('Singapur','SG');
INSERT INTO state ("name","countryCode") values ('Slovensko','SK');
INSERT INTO state ("name","countryCode") values ('Slovinsko','SI');
INSERT INTO state ("name","countryCode") values ('Somalsko','SO');
INSERT INTO state ("name","countryCode") values ('Spojené arabské emiráty','AE');
INSERT INTO state ("name","countryCode") values ('Srbsko','RS');
INSERT INTO state ("name","countryCode") values ('Srbsko a Černá Hora (do r. 2006)','CS');
INSERT INTO state ("name","countryCode") values ('Srí Lanka','LK');
INSERT INTO state ("name","countryCode") values ('SRN (do r. 1990)','DB');
INSERT INTO state ("name","countryCode") values ('SSSR','SU');
INSERT INTO state ("name","countryCode") values ('Středoafrická republika','CF');
INSERT INTO state ("name","countryCode") values ('Súdán','SD');
INSERT INTO state ("name","countryCode") values ('Surinam','SR');
INSERT INTO state ("name","countryCode") values ('Sv. Helena','SH');
INSERT INTO state ("name","countryCode") values ('Sv. Kryštof','KN');
INSERT INTO state ("name","countryCode") values ('Sv. Lucie','LC');
INSERT INTO state ("name","countryCode") values ('Sv. Martin (FR)','MF');
INSERT INTO state ("name","countryCode") values ('Sv. Martin (NL)','SX');
INSERT INTO state ("name","countryCode") values ('Sv. Tomáš','ST');
INSERT INTO state ("name","countryCode") values ('Sv. Vincenc a Grenadiny','VC');
INSERT INTO state ("name","countryCode") values ('Svazijsko','SZ');
INSERT INTO state ("name","countryCode") values ('Sýrie','SY');
INSERT INTO state ("name","countryCode") values ('Šalomounovy ostrovy','SB');
INSERT INTO state ("name","countryCode") values ('Španělsko','ES');
INSERT INTO state ("name","countryCode") values ('Špicberky','SJ');
INSERT INTO state ("name","countryCode") values ('Švédsko','SE');
INSERT INTO state ("name","countryCode") values ('Švýcarsko','CH');
INSERT INTO state ("name","countryCode") values ('Tádžikistán','TJ');
INSERT INTO state ("name","countryCode") values ('Demokratická republika Východní Timor','TL');
INSERT INTO state ("name","countryCode") values ('Tanzánie','TZ');
INSERT INTO state ("name","countryCode") values ('Thajsko','TH');
INSERT INTO state ("name","countryCode") values ('Tchaj-wan','TW');
INSERT INTO state ("name","countryCode") values ('Togo','TG');
INSERT INTO state ("name","countryCode") values ('Tokelau','TK');
INSERT INTO state ("name","countryCode") values ('Tonga','TO');
INSERT INTO state ("name","countryCode") values ('Trinidad a Tobago','TT');
INSERT INTO state ("name","countryCode") values ('Tunisko','TN');
INSERT INTO state ("name","countryCode") values ('Turecko','TR');
INSERT INTO state ("name","countryCode") values ('Turkmenistán','TU');
INSERT INTO state ("name","countryCode") values ('Turks a Caicos','TC');
INSERT INTO state ("name","countryCode") values ('Tuvalu','TV');
INSERT INTO state ("name","countryCode") values ('Uganda','UG');
INSERT INTO state ("name","countryCode") values ('Ukrajina','UA');
INSERT INTO state ("name","countryCode") values ('Uruguay','UY');
INSERT INTO state ("name","countryCode") values ('USA','US');
INSERT INTO state ("name","countryCode") values ('Uzbekistán','UZ');
INSERT INTO state ("name","countryCode") values ('Vánoční ostrovy','CX');
INSERT INTO state ("name","countryCode") values ('Vanuatu','VU');
INSERT INTO state ("name","countryCode") values ('Vatikán','VA');
INSERT INTO state ("name","countryCode") values ('Velká Británie','GB');
INSERT INTO state ("name","countryCode") values ('Venezuela','VE');
INSERT INTO state ("name","countryCode") values ('Vietnam','VN');
INSERT INTO state ("name","countryCode") values ('Východní Timor','TP');
INSERT INTO state ("name","countryCode") values ('Wake I.','WK');
INSERT INTO state ("name","countryCode") values ('Wallisovy ostrovy','WF');
INSERT INTO state ("name","countryCode") values ('Zair','ZR');
INSERT INTO state ("name","countryCode") values ('Zambie','ZM');
INSERT INTO state ("name","countryCode") values ('Západní Berlín (do 1991)','WB');
INSERT INTO state ("name","countryCode") values ('Západní Sahara','EH');
INSERT INTO state ("name","countryCode") values ('Země královny Maud','NQ');
INSERT INTO state ("name","countryCode") values ('Zimbabwe','ZW');
INSERT INTO state ("name","countryCode") values ('Kosovská republika','XK');


INSERT INTO languagestate ("language_id","state_id") values ('7','116');
INSERT INTO languagestate ("language_id","state_id") values ('48','116');
INSERT INTO languagestate ("language_id","state_id") values ('151','116');
INSERT INTO languagestate ("language_id","state_id") values ('86','113');
INSERT INTO languagestate ("language_id","state_id") values ('86','101');
INSERT INTO languagestate ("language_id","state_id") values ('41','101');
INSERT INTO languagestate ("language_id","state_id") values ('41','83');
INSERT INTO languagestate ("language_id","state_id") values ('129','133');
INSERT INTO languagestate ("language_id","state_id") values ('73','95');
INSERT INTO languagestate ("language_id","state_id") values ('80','105');
INSERT INTO languagestate ("language_id","state_id") values ('158','53');
INSERT INTO languagestate ("language_id","state_id") values ('7','53');
INSERT INTO languagestate ("language_id","state_id") values ('41','53');
INSERT INTO languagestate ("language_id","state_id") values ('6','55');
INSERT INTO languagestate ("language_id","state_id") values ('121','55');
INSERT INTO languagestate ("language_id","state_id") values ('51','72');
INSERT INTO languagestate ("language_id","state_id") values ('25','156');
INSERT INTO languagestate ("language_id","state_id") values ('40','25');
INSERT INTO languagestate ("language_id","state_id") values ('94','124');
INSERT INTO languagestate ("language_id","state_id") values ('157','236');
INSERT INTO languagestate ("language_id","state_id") values ('144','213');
INSERT INTO languagestate ("language_id","state_id") values ('154','213');
INSERT INTO languagestate ("language_id","state_id") values ('19','17');
INSERT INTO languagestate ("language_id","state_id") values ('60','86');
INSERT INTO languagestate ("language_id","state_id") values ('41','86');
INSERT INTO languagestate ("language_id","state_id") values ('41','176');
INSERT INTO languagestate ("language_id","state_id") values ('171','176');
INSERT INTO languagestate ("language_id","state_id") values ('7','146');
INSERT INTO languagestate ("language_id","state_id") values ('48','146');
INSERT INTO languagestate ("language_id","state_id") values ('7','51');
INSERT INTO languagestate ("language_id","state_id") values ('7','128');
INSERT INTO languagestate ("language_id","state_id") values ('7','126');
INSERT INTO languagestate ("language_id","state_id") values ('48','126');
INSERT INTO languagestate ("language_id","state_id") values ('7','109');
INSERT INTO languagestate ("language_id","state_id") values ('7','227');
INSERT INTO languagestate ("language_id","state_id") values ('7','173');
INSERT INTO languagestate ("language_id","state_id") values ('7','210');
INSERT INTO languagestate ("language_id","state_id") values ('7','242');
INSERT INTO languagestate ("language_id","state_id") values ('48','242');
INSERT INTO languagestate ("language_id","state_id") values ('126','89');
INSERT INTO languagestate ("language_id","state_id") values ('7','96');
INSERT INTO languagestate ("language_id","state_id") values ('7','121');
INSERT INTO languagestate ("language_id","state_id") values ('7','88');
INSERT INTO languagestate ("language_id","state_id") values ('87','88');
INSERT INTO languagestate ("language_id","state_id") values ('7','217');
INSERT INTO languagestate ("language_id","state_id") values ('41','217');
INSERT INTO languagestate ("language_id","state_id") values ('7','201');
INSERT INTO languagestate ("language_id","state_id") values ('7','2');
INSERT INTO languagestate ("language_id","state_id") values ('7','15');
INSERT INTO languagestate ("language_id","state_id") values ('7','103');
INSERT INTO languagestate ("language_id","state_id") values ('58','93');
INSERT INTO languagestate ("language_id","state_id") values ('9','10');
INSERT INTO languagestate ("language_id","state_id") values ('79','110');
INSERT INTO languagestate ("language_id","state_id") values ('134','110');
INSERT INTO languagestate ("language_id","state_id") values ('170','248');
INSERT INTO languagestate ("language_id","state_id") values ('141','211');
INSERT INTO languagestate ("language_id","state_id") values ('99','136');
INSERT INTO languagestate ("language_id","state_id") values ('134','194');
INSERT INTO languagestate ("language_id","state_id") values ('107','153');
INSERT INTO languagestate ("language_id","state_id") values ('83','123');
INSERT INTO languagestate ("language_id","state_id") values ('134','123');
INSERT INTO languagestate ("language_id","state_id") values ('24','34');
INSERT INTO languagestate ("language_id","state_id") values ('18','22');
INSERT INTO languagestate ("language_id","state_id") values ('134','22');
INSERT INTO languagestate ("language_id","state_id") values ('53','122');
INSERT INTO languagestate ("language_id","state_id") values ('164','122');
INSERT INTO languagestate ("language_id","state_id") values ('53','196');
INSERT INTO languagestate ("language_id","state_id") values ('36','44');
INSERT INTO languagestate ("language_id","state_id") values ('52','190');
INSERT INTO languagestate ("language_id","state_id") values ('70','91');
INSERT INTO languagestate ("language_id","state_id") values ('41','266');
INSERT INTO languagestate ("language_id","state_id") values ('143','266');
INSERT INTO languagestate ("language_id","state_id") values ('110','266');
INSERT INTO languagestate ("language_id","state_id") values ('41','262');
INSERT INTO languagestate ("language_id","state_id") values ('48','260');
INSERT INTO languagestate ("language_id","state_id") values ('174','257');
INSERT INTO languagestate ("language_id","state_id") values ('149','256');
INSERT INTO languagestate ("language_id","state_id") values ('21','253');
INSERT INTO languagestate ("language_id","state_id") values ('41','253');
INSERT INTO languagestate ("language_id","state_id") values ('48','253');
INSERT INTO languagestate ("language_id","state_id") values ('149','249');
INSERT INTO languagestate ("language_id","state_id") values ('41','181');
INSERT INTO languagestate ("language_id","state_id") values ('41','250');
INSERT INTO languagestate ("language_id","state_id") values ('41','175');
INSERT INTO languagestate ("language_id","state_id") values ('41','255');
INSERT INTO languagestate ("language_id","state_id") values ('66','255');
INSERT INTO languagestate ("language_id","state_id") values ('177','255');
INSERT INTO languagestate ("language_id","state_id") values ('142','255');
INSERT INTO languagestate ("language_id","state_id") values ('32','255');
INSERT INTO languagestate ("language_id","state_id") values ('41','247');
INSERT INTO languagestate ("language_id","state_id") values ('151','247');
INSERT INTO languagestate ("language_id","state_id") values ('164','243');
INSERT INTO languagestate ("language_id","state_id") values ('41','246');
INSERT INTO languagestate ("language_id","state_id") values ('41','245');
INSERT INTO languagestate ("language_id","state_id") values ('41','241');
INSERT INTO languagestate ("language_id","state_id") values ('41','240');
INSERT INTO languagestate ("language_id","state_id") values ('41','239');
INSERT INTO languagestate ("language_id","state_id") values ('139','239');
INSERT INTO languagestate ("language_id","state_id") values ('48','238');
INSERT INTO languagestate ("language_id","state_id") values ('129','234');
INSERT INTO languagestate ("language_id","state_id") values ('41','67');
INSERT INTO languagestate ("language_id","state_id") values ('48','64');
INSERT INTO languagestate ("language_id","state_id") values ('48','42');
INSERT INTO languagestate ("language_id","state_id") values ('7','42');
INSERT INTO languagestate ("language_id","state_id") values ('151','235');
INSERT INTO languagestate ("language_id","state_id") values ('41','235');
INSERT INTO languagestate ("language_id","state_id") values ('48','202');
INSERT INTO languagestate ("language_id","state_id") values ('129','224');
INSERT INTO languagestate ("language_id","state_id") values ('153','231');
INSERT INTO languagestate ("language_id","state_id") values ('115','230');
INSERT INTO languagestate ("language_id","state_id") values ('39','218');
INSERT INTO languagestate ("language_id","state_id") values ('47','61');
INSERT INTO languagestate ("language_id","state_id") values ('153','61');
INSERT INTO languagestate ("language_id","state_id") values ('138','61');
INSERT INTO languagestate ("language_id","state_id") values ('41','98');
INSERT INTO languagestate ("language_id","state_id") values ('41','99');
INSERT INTO languagestate ("language_id","state_id") values ('41','97');
INSERT INTO languagestate ("language_id","state_id") values ('3','97');
INSERT INTO languagestate ("language_id","state_id") values ('148','97');
INSERT INTO languagestate ("language_id","state_id") values ('162','97');
INSERT INTO languagestate ("language_id","state_id") values ('180','97');
INSERT INTO languagestate ("language_id","state_id") values ('184','97');
INSERT INTO languagestate ("language_id","state_id") values ('147','209');
INSERT INTO languagestate ("language_id","state_id") values ('7','209');
INSERT INTO languagestate ("language_id","state_id") values ('41','228');
INSERT INTO languagestate ("language_id","state_id") values ('145','207');
INSERT INTO languagestate ("language_id","state_id") values ('146','208');
INSERT INTO languagestate ("language_id","state_id") values ('39','223');
INSERT INTO languagestate ("language_id","state_id") values ('41','223');
INSERT INTO languagestate ("language_id","state_id") values ('41','206');
INSERT INTO languagestate ("language_id","state_id") values ('101','206');
INSERT INTO languagestate ("language_id","state_id") values ('154','206');
INSERT INTO languagestate ("language_id","state_id") values ('41','205');
INSERT INTO languagestate ("language_id","state_id") values ('5','1');
INSERT INTO languagestate ("language_id","state_id") values ('48','204');
INSERT INTO languagestate ("language_id","state_id") values ('41','204');
INSERT INTO languagestate ("language_id","state_id") values ('52','232');
INSERT INTO languagestate ("language_id","state_id") values ('48','232');
INSERT INTO languagestate ("language_id","state_id") values ('71','232');
INSERT INTO languagestate ("language_id","state_id") values ('131','232');
INSERT INTO languagestate ("language_id","state_id") values ('71','200');
INSERT INTO languagestate ("language_id","state_id") values ('139','199');
INSERT INTO languagestate ("language_id","state_id") values ('41','199');
INSERT INTO languagestate ("language_id","state_id") values ('48','197');
INSERT INTO languagestate ("language_id","state_id") values ('48','222');
INSERT INTO languagestate ("language_id","state_id") values ('48','37');
INSERT INTO languagestate ("language_id","state_id") values ('41','225');
INSERT INTO languagestate ("language_id","state_id") values ('41','221');
INSERT INTO languagestate ("language_id","state_id") values ('41','220');
INSERT INTO languagestate ("language_id","state_id") values ('41','219');
INSERT INTO languagestate ("language_id","state_id") values ('7','264');
INSERT INTO languagestate ("language_id","state_id") values ('149','264');
INSERT INTO languagestate ("language_id","state_id") values ('48','264');
INSERT INTO languagestate ("language_id","state_id") values ('48','118');
INSERT INTO languagestate ("language_id","state_id") values ('48','117');
INSERT INTO languagestate ("language_id","state_id") values ('48','216');
INSERT INTO languagestate ("language_id","state_id") values ('140','216');
INSERT INTO languagestate ("language_id","state_id") values ('82','195');
INSERT INTO languagestate ("language_id","state_id") values ('48','195');
INSERT INTO languagestate ("language_id","state_id") values ('41','195');
INSERT INTO languagestate ("language_id","state_id") values ('133','193');
INSERT INTO languagestate ("language_id","state_id") values ('149','49');
INSERT INTO languagestate ("language_id","state_id") values ('149','188');
INSERT INTO languagestate ("language_id","state_id") values ('41','188');
INSERT INTO languagestate ("language_id","state_id") values ('129','189');
INSERT INTO languagestate ("language_id","state_id") values ('48','65');
INSERT INTO languagestate ("language_id","state_id") values ('127','187');
INSERT INTO languagestate ("language_id","state_id") values ('41','185');
INSERT INTO languagestate ("language_id","state_id") values ('41','60');
INSERT INTO languagestate ("language_id","state_id") values ('161','60');
INSERT INTO languagestate ("language_id","state_id") values ('149','184');
INSERT INTO languagestate ("language_id","state_id") values ('149','183');
INSERT INTO languagestate ("language_id","state_id") values ('54','183');
INSERT INTO languagestate ("language_id","state_id") values ('41','182');
INSERT INTO languagestate ("language_id","state_id") values ('61','182');
INSERT INTO languagestate ("language_id","state_id") values ('149','179');
INSERT INTO languagestate ("language_id","state_id") values ('7','178');
INSERT INTO languagestate ("language_id","state_id") values ('58','178');
INSERT INTO languagestate ("language_id","state_id") values ('41','177');
INSERT INTO languagestate ("language_id","state_id") values ('73','177');
INSERT INTO languagestate ("language_id","state_id") values ('48','171');
INSERT INTO languagestate ("language_id","state_id") values ('41','203');
INSERT INTO languagestate ("language_id","state_id") values ('27','203');
INSERT INTO languagestate ("language_id","state_id") values ('113','170');
INSERT INTO languagestate ("language_id","state_id") values ('114','170');
INSERT INTO languagestate ("language_id","state_id") values ('115','170');
INSERT INTO languagestate ("language_id","state_id") values ('138','170');
INSERT INTO languagestate ("language_id","state_id") values ('41','169');
INSERT INTO languagestate ("language_id","state_id") values ('41','166');
INSERT INTO languagestate ("language_id","state_id") values ('41','164');
INSERT INTO languagestate ("language_id","state_id") values ('48','163');
INSERT INTO languagestate ("language_id","state_id") values ('149','165');
INSERT INTO languagestate ("language_id","state_id") values ('104','172');
INSERT INTO languagestate ("language_id","state_id") values ('41','172');
INSERT INTO languagestate ("language_id","state_id") values ('39','167');
INSERT INTO languagestate ("language_id","state_id") values ('108','158');
INSERT INTO languagestate ("language_id","state_id") values ('41','158');
INSERT INTO languagestate ("language_id","state_id") values ('41','157');
INSERT INTO languagestate ("language_id","state_id") values ('52','157');
INSERT INTO languagestate ("language_id","state_id") values ('149','148');
INSERT INTO languagestate ("language_id","state_id") values ('129','155');
INSERT INTO languagestate ("language_id","state_id") values ('41','154');
INSERT INTO languagestate ("language_id","state_id") values ('48','152');
INSERT INTO languagestate ("language_id","state_id") values ('133','151');
INSERT INTO languagestate ("language_id","state_id") values ('134','151');
INSERT INTO languagestate ("language_id","state_id") values ('170','151');
INSERT INTO languagestate ("language_id","state_id") values ('41','58');
INSERT INTO languagestate ("language_id","state_id") values ('48','147');
INSERT INTO languagestate ("language_id","state_id") values ('48','145');
INSERT INTO languagestate ("language_id","state_id") values ('41','145');
INSERT INTO languagestate ("language_id","state_id") values ('48','144');
INSERT INTO languagestate ("language_id","state_id") values ('41','143');
INSERT INTO languagestate ("language_id","state_id") values ('106','143');
INSERT INTO languagestate ("language_id","state_id") values ('48','142');
INSERT INTO languagestate ("language_id","state_id") values ('7','142');
INSERT INTO languagestate ("language_id","state_id") values ('103','141');
INSERT INTO languagestate ("language_id","state_id") values ('41','141');
INSERT INTO languagestate ("language_id","state_id") values ('48','140');
INSERT INTO languagestate ("language_id","state_id") values ('41','138');
INSERT INTO languagestate ("language_id","state_id") values ('29','138');
INSERT INTO languagestate ("language_id","state_id") values ('62','135');
INSERT INTO languagestate ("language_id","state_id") values ('100','134');
INSERT INTO languagestate ("language_id","state_id") values ('48','134');
INSERT INTO languagestate ("language_id","state_id") values ('90','132');
INSERT INTO languagestate ("language_id","state_id") values ('48','132');
INSERT INTO languagestate ("language_id","state_id") values ('52','132');
INSERT INTO languagestate ("language_id","state_id") values ('95','130');
INSERT INTO languagestate ("language_id","state_id") values ('52','129');
INSERT INTO languagestate ("language_id","state_id") values ('41','127');
INSERT INTO languagestate ("language_id","state_id") values ('41','125');
INSERT INTO languagestate ("language_id","state_id") values ('148','125');
INSERT INTO languagestate ("language_id","state_id") values ('97','131');
INSERT INTO languagestate ("language_id","state_id") values ('48','191');
INSERT INTO languagestate ("language_id","state_id") values ('41','112');
INSERT INTO languagestate ("language_id","state_id") values ('151','111');
INSERT INTO languagestate ("language_id","state_id") values ('41','111');
INSERT INTO languagestate ("language_id","state_id") values ('75','71');
INSERT INTO languagestate ("language_id","state_id") values ('37','71');
INSERT INTO languagestate ("language_id","state_id") values ('41','16');
INSERT INTO languagestate ("language_id","state_id") values ('41','94');
INSERT INTO languagestate ("language_id","state_id") values ('71','92');
INSERT INTO languagestate ("language_id","state_id") values ('52','92');
INSERT INTO languagestate ("language_id","state_id") values ('48','92');
INSERT INTO languagestate ("language_id","state_id") values ('41','174');
INSERT INTO languagestate ("language_id","state_id") values ('41','90');
INSERT INTO languagestate ("language_id","state_id") values ('66','90');
INSERT INTO languagestate ("language_id","state_id") values ('64','87');
INSERT INTO languagestate ("language_id","state_id") values ('35','85');
INSERT INTO languagestate ("language_id","state_id") values ('149','82');
INSERT INTO languagestate ("language_id","state_id") values ('41','81');
INSERT INTO languagestate ("language_id","state_id") values ('48','80');
INSERT INTO languagestate ("language_id","state_id") values ('56','80');
INSERT INTO languagestate ("language_id","state_id") values ('48','63');
INSERT INTO languagestate ("language_id","state_id") values ('41','79');
INSERT INTO languagestate ("language_id","state_id") values ('48','77');
INSERT INTO languagestate ("language_id","state_id") values ('129','78');
INSERT INTO languagestate ("language_id","state_id") values ('149','192');
INSERT INTO languagestate ("language_id","state_id") values ('48','192');
INSERT INTO languagestate ("language_id","state_id") values ('129','192');
INSERT INTO languagestate ("language_id","state_id") values ('41','76');
INSERT INTO languagestate ("language_id","state_id") values ('149','75');
INSERT INTO languagestate ("language_id","state_id") values ('41','74');
INSERT INTO languagestate ("language_id","state_id") values ('27','74');
INSERT INTO languagestate ("language_id","state_id") values ('48','73');
INSERT INTO languagestate ("language_id","state_id") values ('41','70');
INSERT INTO languagestate ("language_id","state_id") values ('41','69');
INSERT INTO languagestate ("language_id","state_id") values ('41','68');
INSERT INTO languagestate ("language_id","state_id") values ('48','66');
INSERT INTO languagestate ("language_id","state_id") values ('45','56');
INSERT INTO languagestate ("language_id","state_id") values ('37','56');
INSERT INTO languagestate ("language_id","state_id") values ('48','62');
INSERT INTO languagestate ("language_id","state_id") values ('41','59');
INSERT INTO languagestate ("language_id","state_id") values ('41','57');
INSERT INTO languagestate ("language_id","state_id") values ('41','226');
INSERT INTO languagestate ("language_id","state_id") values ('152','226');
INSERT INTO languagestate ("language_id","state_id") values ('26','229');
INSERT INTO languagestate ("language_id","state_id") values ('149','229');
INSERT INTO languagestate ("language_id","state_id") values ('17','229');
INSERT INTO languagestate ("language_id","state_id") values ('50','229');
INSERT INTO languagestate ("language_id","state_id") values ('149','198');
INSERT INTO languagestate ("language_id","state_id") values ('43','54');
INSERT INTO languagestate ("language_id","state_id") values ('149','52');
INSERT INTO languagestate ("language_id","state_id") values ('41','48');
INSERT INTO languagestate ("language_id","state_id") values ('48','50');
INSERT INTO languagestate ("language_id","state_id") values ('7','50');
INSERT INTO languagestate ("language_id","state_id") values ('147','50');
INSERT INTO languagestate ("language_id","state_id") values ('2','50');
INSERT INTO languagestate ("language_id","state_id") values ('52','160');
INSERT INTO languagestate ("language_id","state_id") values ('37','47');
INSERT INTO languagestate ("language_id","state_id") values ('48','186');
INSERT INTO languagestate ("language_id","state_id") values ('39','41');
INSERT INTO languagestate ("language_id","state_id") values ('41','41');
INSERT INTO languagestate ("language_id","state_id") values ('149','120');
INSERT INTO languagestate ("language_id","state_id") values ('141','43');
INSERT INTO languagestate ("language_id","state_id") values ('35','43');
INSERT INTO languagestate ("language_id","state_id") values ('22','43');
INSERT INTO languagestate ("language_id","state_id") values ('5','43');
INSERT INTO languagestate ("language_id","state_id") values ('149','119');
INSERT INTO languagestate ("language_id","state_id") values ('41','40');
INSERT INTO languagestate ("language_id","state_id") values ('149','115');
INSERT INTO languagestate ("language_id","state_id") values ('41','114');
INSERT INTO languagestate ("language_id","state_id") values ('71','254');
INSERT INTO languagestate ("language_id","state_id") values ('41','252');
INSERT INTO languagestate ("language_id","state_id") values ('149','84');
INSERT INTO languagestate ("language_id","state_id") values ('41','104');
INSERT INTO languagestate ("language_id","state_id") values ('39','38');
INSERT INTO languagestate ("language_id","state_id") values ('41','107');
INSERT INTO languagestate ("language_id","state_id") values ('48','107');
INSERT INTO languagestate ("language_id","state_id") values ('48','106');
INSERT INTO languagestate ("language_id","state_id") values ('41','106');
INSERT INTO languagestate ("language_id","state_id") values ('129','108');
INSERT INTO languagestate ("language_id","state_id") values ('48','23');
INSERT INTO languagestate ("language_id","state_id") values ('48','36');
INSERT INTO languagestate ("language_id","state_id") values ('48','35');
INSERT INTO languagestate ("language_id","state_id") values ('101','33');
INSERT INTO languagestate ("language_id","state_id") values ('41','32');
INSERT INTO languagestate ("language_id","state_id") values ('41','31');
INSERT INTO languagestate ("language_id","state_id") values ('129','30');
INSERT INTO languagestate ("language_id","state_id") values ('115','29');
INSERT INTO languagestate ("language_id","state_id") values ('41','28');
INSERT INTO languagestate ("language_id","state_id") values ('162','28');
INSERT INTO languagestate ("language_id","state_id") values ('22','27');
INSERT INTO languagestate ("language_id","state_id") values ('35','27');
INSERT INTO languagestate ("language_id","state_id") values ('141','27');
INSERT INTO languagestate ("language_id","state_id") values ('149','26');
INSERT INTO languagestate ("language_id","state_id") values ('130','26');
INSERT INTO languagestate ("language_id","state_id") values ('54','26');
INSERT INTO languagestate ("language_id","state_id") values ('13','26');
INSERT INTO languagestate ("language_id","state_id") values ('41','24');
INSERT INTO languagestate ("language_id","state_id") values ('41','21');
INSERT INTO languagestate ("language_id","state_id") values ('39','20');
INSERT INTO languagestate ("language_id","state_id") values ('48','20');
INSERT INTO languagestate ("language_id","state_id") values ('52','20');
INSERT INTO languagestate ("language_id","state_id") values ('41','18');
INSERT INTO languagestate ("language_id","state_id") values ('41','14');
INSERT INTO languagestate ("language_id","state_id") values ('14','13');
INSERT INTO languagestate ("language_id","state_id") values ('41','12');
INSERT INTO languagestate ("language_id","state_id") values ('39','11');
INSERT INTO languagestate ("language_id","state_id") values ('149','9');
INSERT INTO languagestate ("language_id","state_id") values ('41','8');
INSERT INTO languagestate ("language_id","state_id") values ('41','7');
INSERT INTO languagestate ("language_id","state_id") values ('149','7');
INSERT INTO languagestate ("language_id","state_id") values ('48','7');
INSERT INTO languagestate ("language_id","state_id") values ('134','7');
INSERT INTO languagestate ("language_id","state_id") values ('41','6');
INSERT INTO languagestate ("language_id","state_id") values ('129','5');
INSERT INTO languagestate ("language_id","state_id") values ('26','4');
INSERT INTO languagestate ("language_id","state_id") values ('41','3');
INSERT INTO languagestate ("language_id","state_id") values ('139','3');
INSERT INTO languagestate ("language_id","state_id") values ('156','233');
INSERT INTO languagestate ("language_id","state_id") values ('134','233');
INSERT INTO languagestate ("language_id","state_id") values ('38','139');
INSERT INTO languagestate ("language_id","state_id") values ('101','137');
INSERT INTO languagestate ("language_id","state_id") values ('111','161');
INSERT INTO languagestate ("language_id","state_id") values ('172','251');

INSERT INTO vehicletype ("type") values ('Dodávka');
INSERT INTO vehicletype ("type") values ('Sólo');
INSERT INTO vehicletype ("type") values ('Návěs');
INSERT INTO vehicletype ("type") values ('Souprava');



INSERT INTO vehiclefeature ("feature") values ('Autotransportér');
INSERT INTO vehiclefeature ("feature") values ('Plachta');
INSERT INTO vehiclefeature ("feature") values ('Skříň');
INSERT INTO vehiclefeature ("feature") values ('Chladírenská skříň');
INSERT INTO vehiclefeature ("feature") values ('Plato');
INSERT INTO vehiclefeature ("feature") values ('Mulda');
INSERT INTO vehiclefeature ("feature") values ('Sklápěč');
INSERT INTO vehiclefeature ("feature") values ('Klanice');
INSERT INTO vehiclefeature ("feature") values ('Cisterna');
INSERT INTO vehiclefeature ("feature") values ('Dvoupodplažní');
INSERT INTO vehiclefeature ("feature") values ('Čelo');
INSERT INTO vehiclefeature ("feature") values ('Ruka');
INSERT INTO vehiclefeature ("feature") values ('Posuvná podlaha');
INSERT INTO vehiclefeature ("feature") values ('ADR');
INSERT INTO vehiclefeature ("feature") values ('Vysokozdvižný vozík');
INSERT INTO vehiclefeature ("feature") values ('Průjezdná');


INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('1','2');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('1','3');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('1','4');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('1','11');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('1','14');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','1');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','2');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','3');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','4');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','5');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','6');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','7');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','8');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','9');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','10');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','11');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','12');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','13');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','14');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','15');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','1');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','2');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','3');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','4');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','5');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','6');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','7');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','8');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','9');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','10');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','11');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','12');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','13');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','14');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','15');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','1');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','2');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','3');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','4');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','5');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','6');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','7');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','8');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','9');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','10');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','11');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','12');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','13');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','14');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','15');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','16');


UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Belgie%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Bul%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Dán%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Esto%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Fin%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Fran%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Chorv%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Irsk%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Itál%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Kyp%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Lit%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Lot%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Lucem%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Maďarsko%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Malta%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Něme%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Nizo%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Pol%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Portu%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Rakou%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Rumun%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Řeck%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Sloven%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Slovin%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Španěl%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Švédsk%';
