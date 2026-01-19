CREATE SEQUENCE IF NOT EXISTS public."CustomerUserInvitation_customerUserInvitation_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE IF NOT EXISTS public."CustomerUserInvitation" (
    "customerUserInvitation_id" integer NOT NULL DEFAULT nextval(
        '"CustomerUserInvitation_customerUserInvitation_id_seq"' :: regclass
    ),
    "sentAt" bigint,
    "sent" boolean,
    "used" boolean NOT NULL DEFAULT false,
    "sender_id" integer NOT NULL,
    "customerUser_id" integer NOT NULL,
    "language_id" integer NOT NULL,
    CONSTRAINT "CustomerUserInvitation_pkey" PRIMARY KEY ("customerUserInvitation_id"),
    CONSTRAINT "CustomerUserInvitation_sender_id_fkey"
        FOREIGN KEY ("sender_id")
        REFERENCES public."User" (user_id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT "CustomerUserInvitation_customerUser_id_fkey"
        FOREIGN KEY ("customerUser_id")
        REFERENCES public."CustomerUser" ("customerUser_id")
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT "CustomerUserInvitation_language_id_fkey"
        FOREIGN KEY ("language_id")
        REFERENCES public."language" (language_id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

ALTER TABLE
    IF EXISTS public."CustomerUserInvitation" OWNER TO postgres;

ALTER TABLE IF EXISTS public."ApiKey"
    RENAME "apikey_id" TO "apiKey_id";