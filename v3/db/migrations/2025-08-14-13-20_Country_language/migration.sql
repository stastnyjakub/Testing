ALTER TABLE IF EXISTS public."Country"
    ADD COLUMN language_id integer NOT NULL DEFAULT 36;
ALTER TABLE IF EXISTS public."Country"
    ADD CONSTRAINT "Country_language_id_fkey" FOREIGN KEY (language_id)
    REFERENCES public.language (language_id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE
    NOT VALID;

-- Update language_id for every country in the Country table.
-- Languages used: cs=36, en=41, de=52
UPDATE "Country" AS c
SET "language_id" = CASE
    WHEN c."countryCode" IN ('AT', 'DE') THEN 52  -- de
    WHEN c."countryCode" IN ('CZ', 'SK') THEN 36  -- cs
    ELSE 41  -- en
END;