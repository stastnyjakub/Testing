CREATE SEQUENCE IF NOT EXISTS public."ApiKey_apikey_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

ALTER SEQUENCE public."ApiKey_apikey_id_seq" OWNER TO postgres;

CREATE TABLE IF NOT EXISTS public."ApiKey" (
    apikey_id integer NOT NULL DEFAULT nextval('"ApiKey_apikey_id_seq"' :: regclass),
    "key" text COLLATE pg_catalog."default" NOT NULL,
    "secretHash" text COLLATE pg_catalog."default" NOT NULL,
    privileges jsonb NOT NULL,
    active boolean NOT NULL DEFAULT true,
    "tsAdded" bigint NOT NULL,
    "tsUsed" bigint,
    CONSTRAINT "ApiKey_pkey" PRIMARY KEY (apikey_id)
) TABLESPACE pg_default;

ALTER TABLE
    IF EXISTS public."ApiKey" OWNER to postgres;

CREATE UNIQUE INDEX IF NOT EXISTS "ApiKey_key_key" ON public."ApiKey" USING btree (
    "key" COLLATE pg_catalog."default" ASC NULLS LAST
) TABLESPACE pg_default;

ALTER SEQUENCE public."ApiKey_apikey_id_seq" OWNED BY public."ApiKey".apikey_id;