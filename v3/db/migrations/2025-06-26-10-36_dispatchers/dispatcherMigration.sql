CREATE SEQUENCE IF NOT EXISTS public."Dispatcher_dispatcher_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE IF NOT EXISTS public."Dispatcher" (
    dispatcher_id integer NOT NULL DEFAULT nextval('"Dispatcher_dispatcher_id_seq"'::regclass),
    "notificationEmail" boolean NOT NULL DEFAULT false,
    "notificationWhatsapp" boolean NOT NULL DEFAULT false,
    deleted boolean NOT NULL DEFAULT false,
    token uuid DEFAULT uuid_generate_v4(),
    carrier_id integer NOT NULL,
    user_id integer NOT NULL,
    CONSTRAINT "Dispatcher_pkey" PRIMARY KEY (dispatcher_id),
    CONSTRAINT "Dispatcher_carrier_id_fkey" FOREIGN KEY (carrier_id) REFERENCES public."Carrier" (carrier_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE,
    CONSTRAINT "User_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User" (user_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
);

ALTER TABLE
    IF EXISTS public."Dispatcher" OWNER to postgres;


ALTER SEQUENCE public."Dispatcher_dispatcher_id_seq" OWNED BY public."Dispatcher".dispatcher_id;
ALTER SEQUENCE public."Dispatcher_dispatcher_id_seq" OWNER TO postgres;

WITH deduplicated_dispatchers AS (
    SELECT DISTINCT ON (d.email)
        d.*
    FROM public.dispatcher d
    LEFT JOIN public."User" u ON u.email = d.email
    WHERE u.email IS NULL and d.email is not null and d.carrier_id is not null
    ORDER BY d.email, d.deleted -- false (0) comes before true (1)
)

INSERT INTO public."User" (
    "number",
    name,
    surname,
    email,
    "passwordHash",
    "tsAdded",
    deleted
)
SELECT
    1 AS "number",
    COALESCE(dd."firstName", 'Unknown') AS name,
    COALESCE(dd."lastName", 'Unknown') AS surname,
    dd.email,
    COALESCE(dd.password, '') AS "passwordHash",
    extract(epoch from now())::bigint AS "tsAdded",
    dd.deleted
FROM deduplicated_dispatchers dd;

INSERT INTO public."Dispatcher" (
    dispatcher_id,
    "notificationEmail",
    "notificationWhatsapp",
    deleted,
    token,
    carrier_id,
    user_id
)
SELECT
    d.dispatcher_id,
    d."notificationEmail",
    d."notificationWhatsapp",
    d.deleted,
    d.token,
    d.carrier_id,
    u.user_id
FROM public.dispatcher d
JOIN public."User" u ON u.email = d.email
where d.carrier_id is not null;