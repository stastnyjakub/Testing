ALTER TABLE IF EXISTS public."CustomerRegistration"
    ADD COLUMN customer_id integer;
ALTER TABLE IF EXISTS public."CustomerRegistration"
    ADD CONSTRAINT "CustomerRegistration_customer_id_fkey" FOREIGN KEY (customer_id)
    REFERENCES public."Customer" (customer_id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;