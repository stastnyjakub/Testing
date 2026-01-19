ALTER TABLE
    IF EXISTS public.invoice
ADD
    COLUMN "paymentReminderCount" integer DEFAULT 0;