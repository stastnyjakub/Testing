ALTER TABLE public."Ramp"
ALTER COLUMN "number"
TYPE text
USING "number"::text;
