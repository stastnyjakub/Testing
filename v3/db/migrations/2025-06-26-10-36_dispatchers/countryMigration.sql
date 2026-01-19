CREATE SEQUENCE IF NOT EXISTS public."Country_country_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE IF NOT EXISTS public."Country"
(
    country_id integer NOT NULL DEFAULT nextval('"Country_country_id_seq"'::regclass),
    "countryCode" text COLLATE pg_catalog."default" NOT NULL,
    "name" text COLLATE pg_catalog."default" NOT NULL,
    "continent" text COLLATE pg_catalog."default" NOT NULL,
    "inEU" boolean not null,

    CONSTRAINT "Country_pkey" PRIMARY KEY (country_id)
);

ALTER TABLE IF EXISTS public."Country"
    OWNER to postgres;

INSERT INTO public."Country" ("countryCode", "name", "continent", "inEU") VALUES 
('AL', 'Albánie', 'Europe', false),
('AD', 'Andorra', 'Europe', false),
('AM', 'Arménie', 'Europe', false),
('AT', 'Rakousko', 'Europe', true),
('BY', 'Bělorusko', 'Europe', false),
('BE', 'Belgie', 'Europe', true),
('BA', 'Bosna a Hercegovina', 'Europe', false),
('BG', 'Bulharsko', 'Europe', true),
('CH', 'Švýcarsko', 'Europe', false),
('CY', 'Kypr', 'Europe', true),
('CZ', 'Česká republika', 'Europe', true),
('DE', 'Německo', 'Europe', true),
('DK', 'Dánsko', 'Europe', true),
('EE', 'Estonsko', 'Europe', true),
('ES', 'Španělsko', 'Europe', true),
('FO', 'Faerské ostrovy', 'Europe', false),
('FI', 'Finsko', 'Europe', true),
('FR', 'Francie', 'Europe', true),
('GB', 'Spojené království', 'Europe', false),
('GE', 'Gruzie', 'Europe', false),
('GI', 'Gibraltar', 'Europe', false),
('GR', 'Řecko', 'Europe', true),
('HU', 'Maďarsko', 'Europe', true),
('HR', 'Chorvatsko', 'Europe', true),
('IE', 'Irsko', 'Europe', true),
('IS', 'Island', 'Europe', false),
('IT', 'Itálie', 'Europe', true),
('LI', 'Lichtenštejnsko', 'Europe', false),
('LT', 'Litva', 'Europe', true),
('CN', 'Čína', 'Asia', false),
('LU', 'Lucembursko', 'Europe', true),
('LV', 'Lotyšsko', 'Europe', true),
('MC', 'Monaco', 'Europe', false),
('MK', 'Makedonie', 'Europe', false),
('MT', 'Malta', 'Europe', true),
('NO', 'Norsko', 'Europe', false),
('NL', 'Nizozemsko', 'Europe', true),
('PL', 'Polsko', 'Europe', true),
('PT', 'Portugalsko', 'Europe', true),
('RO', 'Rumunsko', 'Europe', true),
('RS', 'Srbsko', 'Europe', false),
('SE', 'Švédsko', 'Europe', true),
('SI', 'Slovinsko', 'Europe', true),
('SK', 'Slovensko', 'Europe', true),
('SM', 'San Marino', 'Europe', false),
('TR', 'Turecko', 'Europe', false),
('UA', 'Ukrajina', 'Europe', false),
('VA', 'Vatikán', 'Europe', false);