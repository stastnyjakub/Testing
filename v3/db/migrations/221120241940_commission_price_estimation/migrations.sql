CREATE SEQUENCE IF NOT EXISTS public."CommissionPriceEstimation_commissionPriceEstimation_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

ALTER SEQUENCE public."CommissionPriceEstimation_commissionPriceEstimation_id_seq" OWNER TO postgres;

CREATE TABLE IF NOT EXISTS public."CommissionPriceEstimation" (
    "commissionPriceEstimation_id" integer NOT NULL DEFAULT nextval(
        '"CommissionPriceEstimation_commissionPriceEstimation_id_seq"' :: regclass
    ),
    "code" text COLLATE pg_catalog."default" NOT NULL,
    "commission_id" integer,
    "customer_id" integer,
    "email" text COLLATE pg_catalog."default",
    "minPrice" double precision,
    "maxPrice" double precision,
    "parameters" jsonb NOT NULL,
    "ipAddress" text COLLATE pg_catalog."default" NOT NULL,
    "tsAdded" bigint NOT NULL,
    CONSTRAINT "CommissionPriceEstimation_pkey" PRIMARY KEY ("commissionPriceEstimation_id"),
    CONSTRAINT "CommissionPriceEstimation_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customer (customer_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT "CommissionPriceEstimation_commission_id_fkey" FOREIGN KEY (commission_id) REFERENCES public.commission (commission_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
) TABLESPACE pg_default;

ALTER TABLE
    IF EXISTS public."CommissionPriceEstimation" OWNER to postgres;

ALTER SEQUENCE public."CommissionPriceEstimation_commissionPriceEstimation_id_seq" OWNED BY public."CommissionPriceEstimation"."commissionPriceEstimation_id";

CREATE UNIQUE INDEX IF NOT EXISTS "cpe_code_idx" ON public."CommissionPriceEstimation" USING btree (
    "code" COLLATE pg_catalog."default" ASC NULLS LAST
) TABLESPACE pg_default;