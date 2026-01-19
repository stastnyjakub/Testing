CREATE SEQUENCE IF NOT EXISTS public.uploadtoken_uploadtoken_id_seq INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE IF NOT EXISTS public."UploadToken" (
    uploadtoken_id integer NOT NULL DEFAULT nextval('uploadtoken_uploadtoken_id_seq' :: regclass),
    commission_id integer NOT NULL,
    token text COLLATE pg_catalog."default" NOT NULL,
    active boolean NOT NULL DEFAULT true,
    "tsAdded" bigint NOT NULL,
);

ALTER TABLE
    IF EXISTS public."UploadToken" OWNER to postgres;

CREATE UNIQUE INDEX "UploadToken_token_key" ON "UploadToken"("token");

CREATE INDEX "UploadToken_token_idx" ON "UploadToken" USING HASH ("token");