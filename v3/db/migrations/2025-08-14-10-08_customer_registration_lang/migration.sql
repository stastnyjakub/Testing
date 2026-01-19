ALTER TABLE IF EXISTS public."CustomerRegistration"
    ADD COLUMN language_id integer NOT NULL DEFAULT 36;
ALTER TABLE IF EXISTS public."CustomerRegistration"
    ADD CONSTRAINT "CustomerRegistration_language_id_fkey" FOREIGN KEY (language_id)
    REFERENCES public.language (language_id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE
    NOT VALID;