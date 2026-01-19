DELETE FROM public.location
	WHERE customer_id is null;

ALTER TABLE IF EXISTS public.location
    ALTER COLUMN customer_id SET NOT NULL;

-- 1. Create sequence for Ramp.ramp_id
CREATE SEQUENCE IF NOT EXISTS public."Ramp_ramp_id_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- 2. Create Ramp table
CREATE TABLE IF NOT EXISTS public."Ramp"
(
    ramp_id        integer NOT NULL DEFAULT nextval('"Ramp_ramp_id_seq"'::regclass),
    number         integer NOT NULL,
    "gatehousePhone" text,
    location_id    integer NOT NULL,
    deleted        boolean NOT NULL DEFAULT false,

    CONSTRAINT "Ramp_pkey" PRIMARY KEY (ramp_id),

    CONSTRAINT "Ramp_location_id_fkey"
        FOREIGN KEY (location_id)
        REFERENCES public."location" (location_id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- 3. Set table owner
ALTER TABLE IF EXISTS public."Ramp"
    OWNER TO postgres;

ALTER TABLE IF EXISTS public."location"
    ADD COLUMN name text;

UPDATE public."location"
    SET name = company
    WHERE company IS NOT NULL;

ALTER TABLE IF EXISTS public."location"
    DROP COLUMN IF EXISTS company;

ALTER TABLE IF EXISTS public."location"
    ADD COLUMN IF NOT EXISTS "areaMap" text;