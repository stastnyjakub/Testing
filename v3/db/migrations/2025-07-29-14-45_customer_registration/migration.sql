CREATE SEQUENCE IF NOT EXISTS public."CustomerRegistration_customerRegistration_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE IF NOT EXISTS public."CustomerRegistration" (
    "customerRegistration_id" integer NOT NULL DEFAULT nextval(
        '"CustomerRegistration_customerRegistration_id_seq"' :: regclass
    ),
    "companyIdentification" text COLLATE pg_catalog."default" NOT NULL,
    "email" text COLLATE pg_catalog."default" NOT NULL,
    "passwordHash" text COLLATE pg_catalog."default" NOT NULL,
    "tsAdded" bigint NOT NULL,
    CONSTRAINT "CustomerRegistration_pkey" PRIMARY KEY ("customerRegistration_id")
);

ALTER TABLE
    IF EXISTS public."CustomerRegistration" OWNER TO postgres;

INSERT INTO
    public."Role" ("name", "description")
VALUES
    (
        'customerRegistration',
        null
    ),
    (
        'customerUserRegistration',
        null
    );
