ALTER TABLE
    IF EXISTS public."Attachment"
ADD
    COLUMN "mimeType" text NOT NULL DEFAULT 'application/pdf';