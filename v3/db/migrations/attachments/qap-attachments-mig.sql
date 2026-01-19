CREATE TYPE public."AttachmentType" AS ENUM ('INVOICE', 'DELIVERY_NOTE');

ALTER TYPE public."AttachmentType" OWNER TO postgres;

CREATE SEQUENCE IF NOT EXISTS public.attachment_attachment_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

CREATE TABLE IF NOT EXISTS public."Attachment" (
    attachment_id integer NOT NULL DEFAULT nextval('attachment_attachment_id_seq' :: regclass),
    name text COLLATE pg_catalog."default" NOT NULL,
    "fileName" text COLLATE pg_catalog."default" NOT NULL,
    type "AttachmentType" NOT NULL,
    sent boolean DEFAULT false,
    "tsAdded" bigint NOT NULL,
    deleted boolean NOT NULL DEFAULT false,
    user_id integer,
    commission_id integer,
    invoice_id integer,
    CONSTRAINT attachment_pkey PRIMARY KEY (attachment_id),
    CONSTRAINT fk_commission FOREIGN KEY (commission_id) REFERENCES public.commission (commission_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users (user_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE,
    CONSTRAINT fk_invoice FOREIGN KEY (invoice_id) REFERENCES public.invoice (invoice_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
);

ALTER TABLE
    IF EXISTS public."Attachment" OWNER to postgres;

ALTER TABLE
    IF EXISTS public.commission
ADD
    COLUMN "attachmentUploadLink" text;

ALTER TABLE
    IF EXISTS public.invoice
ADD
    COLUMN sent boolean DEFAULT false;