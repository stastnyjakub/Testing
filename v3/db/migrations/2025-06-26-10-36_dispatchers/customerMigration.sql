-- 2. Create sequence for customer_id
CREATE SEQUENCE IF NOT EXISTS public."Customer_customer_id_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- 3. Create Customer table
CREATE TABLE IF NOT EXISTS public."Customer"
(
    customer_id               integer   NOT NULL DEFAULT nextval('"Customer_customer_id_seq"'::regclass),
    type                      public."CustomerType" NOT NULL DEFAULT 'ACTIVE'::public."CustomerType",
    number                    smallint,
    "defaultDueDate"            integer,
    city                      text COLLATE pg_catalog."default",
    country                   text  COLLATE pg_catalog."default",
    "countryCode"             text  COLLATE pg_catalog."default",
    "profilePicture"          text  COLLATE pg_catalog."default",
    "postalCode"              text  COLLATE pg_catalog."default",
    street                    text  COLLATE pg_catalog."default",
    name                      text  COLLATE pg_catalog."default"      NOT NULL,
    "companyRegistrationNumber" text  COLLATE pg_catalog."default",
    "taxId"                   text  COLLATE pg_catalog."default",
    "sameBillingAddress"      boolean   NOT NULL DEFAULT false,
    "cityBilling"               text  COLLATE pg_catalog."default",
    "countryCodeBilling"      text  COLLATE pg_catalog."default",
    "postalCodeBilling"       text  COLLATE pg_catalog."default",
    "streetBilling"           text  COLLATE pg_catalog."default",
    note                      text  COLLATE pg_catalog."default",
    "billingEmail"            text  COLLATE pg_catalog."default",
    "tsAdded"                 bigint,
    "tsEdited"                bigint,
    deleted                   boolean   NOT NULL DEFAULT false,
    "addedBy_id"              integer,
    "editedBy_id"             integer,

    CONSTRAINT "Customer_pkey" PRIMARY KEY (customer_id),

    CONSTRAINT "Customer_addedBy_id_fkey"
        FOREIGN KEY ("addedBy_id")
        REFERENCES public."User" (user_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,

    CONSTRAINT "Customer_editedBy_id_fkey"
        FOREIGN KEY ("editedBy_id")
        REFERENCES public."User" (user_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

-- 4. Set table owner
ALTER TABLE IF EXISTS public."Customer"
    OWNER TO postgres;


INSERT INTO public."Customer" (
    customer_id,
    type,
    number,
    "defaultDueDate",
    city,
    country,
    "countryCode",
    "postalCode",
    street,
    name,
    "companyRegistrationNumber",
    "taxId",
    note,
    "billingEmail",
    "tsAdded",
    "tsEdited",
    deleted,
    "addedBy_id",
    "editedBy_id"
)
SELECT
    c.customer_id,
    c.type,
    c.number,
    c."defaultDueDate",
    c.place->>'city' AS city,
    c.place->>'country' AS country,
    c.place->>'countryCode' AS "countryCode",
    c.place->>'postalCode' AS "postalCode",
    c.place->>'street' AS street,
    c.company,
    c."companyRegistrationNumber",
    c."taxId",
    c.note,
    c.email AS "billingEmail",
    c."ts_added",
    c.ts_edited AS "tsEdited",
    c.deleted,
    u_add.user_id AS "addedBy_id",
    u_edit.user_id AS "editedBy_id"
FROM public."customer" as c
LEFT JOIN public."User" u_add ON u_add.email = c."addedBy"
LEFT JOIN public."User" u_edit ON u_edit.email = c."editedBy";


-- 1. Create sequence for CustomerContact.customerContact_id
CREATE SEQUENCE IF NOT EXISTS public."CustomerContact_customerContact_id_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- 2. Create CustomerContact table
CREATE TABLE IF NOT EXISTS public."CustomerContact"
(
    "customerContact_id" integer NOT NULL DEFAULT nextval('"CustomerContact_customerContact_id_seq"'::regclass),
    email              text COLLATE pg_catalog."default",
    name        text COLLATE pg_catalog."default",
    surname         text COLLATE pg_catalog."default",
    phone              text COLLATE pg_catalog."default",
    deleted            boolean NOT NULL DEFAULT false,
    customer_id        integer NOT NULL,

    CONSTRAINT "CustomerContact_pkey" PRIMARY KEY ("customerContact_id"),

    CONSTRAINT "CustomerContact_customer_id_fkey"
        FOREIGN KEY (customer_id)
        REFERENCES public."Customer" (customer_id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- 3. Set table owner
INSERT INTO public."CustomerContact" (
    "customerContact_id",
    email,
    name,
    surname,
    phone,
    deleted,
    customer_id
)
SELECT
    cc."customerContact_id",
    cc.email,
    cc."firstName" AS name,
    cc."lastName" AS surname,
    cc.phone,
    cc.deleted,
    cc.customer_id
FROM public."customercontact" AS cc
where cc.customer_id IS NOT NULL;

-- 1. Create sequence for CustomerUser.customerUser_id
CREATE SEQUENCE IF NOT EXISTS public."CustomerUser_customerUser_id_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- 2. Create CustomerUser table with all columns quoted
CREATE TABLE IF NOT EXISTS public."CustomerUser"
(
    "customerUser_id" integer NOT NULL DEFAULT nextval('"CustomerUser_customerUser_id_seq"'::regclass),
    "customer_id"     integer NOT NULL,
    "user_id"         integer NOT NULL,
    "deleted"         boolean NOT NULL DEFAULT false,

    CONSTRAINT "CustomerUser_pkey" PRIMARY KEY ("customerUser_id"),

    CONSTRAINT "CustomerUser_customer_id_fkey"
        FOREIGN KEY ("customer_id")
        REFERENCES public."Customer" ("customer_id")
        ON UPDATE NO ACTION
        ON DELETE CASCADE,

    CONSTRAINT "CustomerUser_user_id_fkey"
        FOREIGN KEY ("user_id")
        REFERENCES public."User" ("user_id")
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- 3. Set table owner
ALTER TABLE IF EXISTS public."CustomerUser"
    OWNER TO postgres;