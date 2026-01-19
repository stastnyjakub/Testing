-- Create sequence for KbCallbackResponse table
CREATE SEQUENCE IF NOT EXISTS public."KbCallbackResponse_kbCallbackResponse_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

-- Set sequence ownership to user
ALTER SEQUENCE public."KbCallbackResponse_kbCallbackResponse_id_seq" OWNER TO postgres;

-- Create table KbCallbackResponse
CREATE TABLE IF NOT EXISTS public."KbCallbackResponse" (
    "kbCallbackResponse_id" integer NOT NULL DEFAULT nextval(
        '"KbCallbackResponse_kbCallbackResponse_id_seq"' :: regclass
    ),
    "response" jsonb NOT NULL,
    "tsAdded" bigint NOT NULL,
    CONSTRAINT "KbCallbackResponse_pkey" PRIMARY KEY ("kbCallbackResponse_id")
);
-- Set table ownership
ALTER TABLE
    IF EXISTS public."KbCallbackResponse" OWNER to postgres;

-- Set sequence ownership to table
ALTER SEQUENCE public."KbCallbackResponse_kbCallbackResponse_id_seq" OWNED BY public."KbCallbackResponse"."kbCallbackResponse_id";

CREATE SEQUENCE IF NOT EXISTS public."KbRefreshToken_kbRefreshToken_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
ALTER SEQUENCE public."KbRefreshToken_kbRefreshToken_id_seq" OWNER TO postgres;
CREATE TABLE IF NOT EXISTS public."KbRefreshToken" (
    "kbRefreshToken_id" integer NOT NULL DEFAULT nextval(
        '"KbRefreshToken_kbRefreshToken_id_seq"' :: regclass
    ),
    "tokenCipher" text NOT NULL,
    "tsAdded" bigint NOT NULL,
    CONSTRAINT "KbRefreshToken_pkey" PRIMARY KEY ("kbRefreshToken_id")
);
ALTER TABLE IF EXISTS public."KbRefreshToken" OWNER to postgres;
ALTER SEQUENCE public."KbRefreshToken_kbRefreshToken_id_seq" OWNED BY public."KbRefreshToken"."kbRefreshToken_id";
