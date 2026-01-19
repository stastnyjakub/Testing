CREATE SEQUENCE IF NOT EXISTS public."Carrier_carrier_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE IF NOT EXISTS public."Carrier"
(
    carrier_id integer NOT NULL DEFAULT nextval('"Carrier_carrier_id_seq"'::regclass),
    company text COLLATE pg_catalog."default" NOT NULL,
    "companyRegistrationNumber" text COLLATE pg_catalog."default",
    "profilePicture" text COLLATE pg_catalog."default",
    "taxId" text COLLATE pg_catalog."default",
    street text COLLATE pg_catalog."default",
    city text COLLATE pg_catalog."default",
    country text COLLATE pg_catalog."default",
    "countryCode" text COLLATE pg_catalog."default",
    "postalCode" text COLLATE pg_catalog."default",
    note text COLLATE pg_catalog."default",
    "number" smallint,
    "tsEdited" bigint,
    "tsAdded" bigint,
    deleted boolean NOT NULL DEFAULT false,
    "editedBy_id" integer,
    "addedBy_id" integer,

    CONSTRAINT "Carrier_pkey" PRIMARY KEY (carrier_id),
    CONSTRAINT "Carrier_editedBy_id_fkey" FOREIGN KEY ("editedBy_id")
        REFERENCES public."User" (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "Carrier_addedBy_id_fkey" FOREIGN KEY ("addedBy_id")
        REFERENCES public."User" (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

ALTER TABLE IF EXISTS public."Carrier"
    OWNER to postgres;

INSERT INTO public."Carrier" (
    carrier_id,
    company,
    "companyRegistrationNumber",
    "taxId",
    street,
    city,
    country,
    "countryCode",
    "postalCode",
    note,
    "number",
    "tsEdited",
    "tsAdded",
    deleted,
    "addedBy_id",
    "editedBy_id"
)
SELECT
    c.carrier_id,
    c.company,
    c."companyRegistrationNumber",
    c."taxId",
    c.street,
    c.city,
    c.country,
    c."countryCode",
    c."postalCode",
    c.note,
    c."number",
    c.ts_edited,
    c.ts_added,
    c.deleted,
    u_add.user_id AS addedBy_id,
    u_edit.user_id AS editedBy_id
FROM public.carrier c
LEFT JOIN public."User" u_add ON u_add.email = c."addedBy"
LEFT JOIN public."User" u_edit ON u_edit.email = c."editedBy";



ALTER SEQUENCE public."Carrier_carrier_id_seq" OWNED BY public."Carrier".carrier_id;
ALTER SEQUENCE public."Carrier_carrier_id_seq" OWNER TO postgres;