module.exports = `CREATE TABLE IF NOT EXISTS rate (
        "rate_id" SERIAL PRIMARY KEY,
        "date" timestamp,
        "rates" jsonb, 
        "base" text,
        "success" boolean,
        "timestamp" bigint
    );

CREATE TABLE IF NOT EXISTS country (
        "country_id" SERIAL PRIMARY KEY,
        "countries" jsonb
    );

INSERT INTO country ("countries") values ('{}') RETURNING country_id;


CREATE TABLE IF NOT EXISTS users (
        "user_id" SERIAL PRIMARY KEY,
        "number" smallint,
        "email" text NOT NULL,
        "emailPassword" text,
        "password" text,
        "jobTitle" text NOT NULL,
        "mobilePhone" text NOT NULL,
        "name" text NOT NULL,
        "surname" text NOT NULL,
        "username" text NOT NULL,
        "deleted" boolean DEFAULT false NOT NULL,
        "role" smallint DEFAULT 0
    );

CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE TABLE IF NOT EXISTS carrier (
        "carrier_id" SERIAL PRIMARY KEY,
        "addedBy" text,
        "city" text, 
        "company" text NOT NULL,
        "companyRegistrationNumber" bigint,
        "country" text,
        "countryCode" text,
        "editedBy" text,
        "note" text,
        "email" text,
        "firstName" text,
        "lastName" text,
        "phone" text,
        "place" jsonb,
        "postalCode" text,
        "qid" smallint,
        "number" smallint,
        "street" text,
        "taxId" text,
        "ts_edited" bigint,
        "ts_added" bigint,
        "deleted" boolean default false NOT NULL
    );
    CREATE INDEX ca_addedby_idx ON carrier USING GIN("addedBy" gin_trgm_ops);
    CREATE INDEX ca_company_idx ON carrier USING GIN(company gin_trgm_ops);
    CREATE INDEX ca_country_idx ON carrier USING GIN(country gin_trgm_ops);
    CREATE INDEX ca_zip_idx ON carrier USING GIN("postalCode" gin_trgm_ops);
    CREATE INDEX ca_street_idx ON carrier USING GIN("street" gin_trgm_ops);
    CREATE INDEX ca_taxid_idx ON carrier USING GIN("taxId" gin_trgm_ops);

    CREATE TABLE IF NOT EXISTS customer (
        "customer_id" SERIAL PRIMARY KEY,
        "addedBy" text,
        "city" text, 
        "company" text NOT NULL,
        "companyRegistrationNumber" bigint,
        "country" text,
        "countryCode" text,
        "editedBy" text,
        "note" text,
        "email" text,
        "firstName" text,
        "lastName" text,
        "phone" text,
        "place" jsonb,
        "postalCode" text,
        "qid" smallint,
        "number" smallint,
        "street" text,
        "taxId" text,
        "ts_edited" bigint,
        "ts_added" bigint,
        "deleted" boolean default false NOT NULL
    );
    CREATE INDEX cu_addedby_idx ON customer USING GIN("addedBy" gin_trgm_ops);
    CREATE INDEX cu_company_idx ON customer USING GIN(company gin_trgm_ops);
    CREATE INDEX cu_country_idx ON customer USING GIN(country gin_trgm_ops);
    CREATE INDEX cu_zip_idx ON customer USING GIN("postalCode" gin_trgm_ops);
    CREATE INDEX cu_street_idx ON customer USING GIN("street" gin_trgm_ops);
    CREATE INDEX cu_taxid_idx ON customer USING GIN("taxId" gin_trgm_ops);

CREATE TABLE IF NOT EXISTS customerContact (
        "customerContact_id" SERIAL PRIMARY KEY,
        "customer_id" integer REFERENCES customer (customer_id) ON DELETE CASCADE,
        "email" text,
        "firstName" text,
        "lastName" text,
        "phone" text,
        "deleted" boolean default false NOT NULL
    );

CREATE TABLE IF NOT EXISTS loading (
        "loading_id" SERIAL PRIMARY KEY,
        "city" text, 
        "company" text,
        "country" text,
        "countryCode" text,
        "customer_id" integer REFERENCES customer (customer_id) ON DELETE CASCADE,
        "email" text,
        "firstName" text,
        "lastName" text,
        "gps" text,
        "latitude" DECIMAL(10, 8),
        "longitude" DECIMAL(11, 8),
        "note" text,
        "phone" text,
        "postalCode" text,
        "street" text,
        "scrollTo" boolean,
        "deleted" boolean DEFAULT false NOT NULL
    );

CREATE TABLE IF NOT EXISTS discharge (
        "discharge_id" SERIAL PRIMARY KEY,
        "city" text, 
        "company" text,
        "country" text,
        "countryCode" text,
        "customer_id" integer REFERENCES customer (customer_id) ON DELETE CASCADE,
        "email" text,
        "firstName" text,
        "lastName" text,
        "gps" text,
        "latitude" DECIMAL(10, 8),
        "longitude" DECIMAL(11, 8),
        "note" text,
        "phone" text,
        "postalCode" text,
        "street" text,
        "scrollTo" boolean,
        "deleted" boolean DEFAULT false NOT NULL
    );

CREATE TABLE IF NOT EXISTS location (
        "location_id" SERIAL PRIMARY KEY,
        "city" text, 
        "company" text,
        "country" text,
        "countryCode" text,
        "customer_id" integer REFERENCES customer (customer_id) ON DELETE CASCADE,
        "email" text,
        "firstName" text,
        "lastName" text,
        "gps" text,
        "latitude" DECIMAL(10, 8),
        "longitude" DECIMAL(11, 8),
        "note" text,
        "phone" text,
        "postalCode" text,
        "street" text,
        "scrollTo" boolean,
        "discharge" boolean DEFAULT false NOT NULL,
        "loading" boolean DEFAULT false NOT NULL,
        "deleted" boolean DEFAULT false NOT NULL
    );

CREATE TABLE IF NOT EXISTS language (
          "language_id" SERIAL PRIMARY KEY,          
          "languageCode" text
      );

CREATE TABLE IF NOT EXISTS onboardingtoken
(
    onboardingtoken_id SERIAL PRIMARY KEY,
    token text COLLATE pg_catalog."default",
    carrier_id integer NOT NULL,
    solved boolean DEFAULT false,
    dispatcher_id integer,
    CONSTRAINT onboardingtoken_carrier_id_fkey FOREIGN KEY (carrier_id)
        REFERENCES public.carrier (carrier_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

INSERT INTO language ("languageCode") values ('ab');
INSERT INTO language ("languageCode") values ('aa');
INSERT INTO language ("languageCode") values ('af');
INSERT INTO language ("languageCode") values ('ak');
INSERT INTO language ("languageCode") values ('sq');
INSERT INTO language ("languageCode") values ('am');
INSERT INTO language ("languageCode") values ('ar');
INSERT INTO language ("languageCode") values ('an');
INSERT INTO language ("languageCode") values ('hy');
INSERT INTO language ("languageCode") values ('as');
INSERT INTO language ("languageCode") values ('av');
INSERT INTO language ("languageCode") values ('ae');
INSERT INTO language ("languageCode") values ('ay');
INSERT INTO language ("languageCode") values ('az');
INSERT INTO language ("languageCode") values ('bm');
INSERT INTO language ("languageCode") values ('ba');
INSERT INTO language ("languageCode") values ('eu');
INSERT INTO language ("languageCode") values ('be');
INSERT INTO language ("languageCode") values ('bn');
INSERT INTO language ("languageCode") values ('bh');
INSERT INTO language ("languageCode") values ('bi');
INSERT INTO language ("languageCode") values ('bs');
INSERT INTO language ("languageCode") values ('br');
INSERT INTO language ("languageCode") values ('bg');
INSERT INTO language ("languageCode") values ('my');
INSERT INTO language ("languageCode") values ('ca');
INSERT INTO language ("languageCode") values ('ch');
INSERT INTO language ("languageCode") values ('ce');
INSERT INTO language ("languageCode") values ('ny');
INSERT INTO language ("languageCode") values ('zh');
INSERT INTO language ("languageCode") values ('cv');
INSERT INTO language ("languageCode") values ('kw');
INSERT INTO language ("languageCode") values ('co');
INSERT INTO language ("languageCode") values ('cr');
INSERT INTO language ("languageCode") values ('hr');
INSERT INTO language ("languageCode") values ('cs');
INSERT INTO language ("languageCode") values ('da');
INSERT INTO language ("languageCode") values ('dv');
INSERT INTO language ("languageCode") values ('nl');
INSERT INTO language ("languageCode") values ('dz');
INSERT INTO language ("languageCode") values ('en');
INSERT INTO language ("languageCode") values ('eo');
INSERT INTO language ("languageCode") values ('et');
INSERT INTO language ("languageCode") values ('ee');
INSERT INTO language ("languageCode") values ('fo');
INSERT INTO language ("languageCode") values ('fj');
INSERT INTO language ("languageCode") values ('fi');
INSERT INTO language ("languageCode") values ('fr');
INSERT INTO language ("languageCode") values ('ff');
INSERT INTO language ("languageCode") values ('gl');
INSERT INTO language ("languageCode") values ('ka');
INSERT INTO language ("languageCode") values ('de');
INSERT INTO language ("languageCode") values ('el');
INSERT INTO language ("languageCode") values ('gn');
INSERT INTO language ("languageCode") values ('gu');
INSERT INTO language ("languageCode") values ('ht');
INSERT INTO language ("languageCode") values ('ha');
INSERT INTO language ("languageCode") values ('he');
INSERT INTO language ("languageCode") values ('hz');
INSERT INTO language ("languageCode") values ('hi');
INSERT INTO language ("languageCode") values ('ho');
INSERT INTO language ("languageCode") values ('hu');
INSERT INTO language ("languageCode") values ('ia');
INSERT INTO language ("languageCode") values ('id');
INSERT INTO language ("languageCode") values ('ie');
INSERT INTO language ("languageCode") values ('ga');
INSERT INTO language ("languageCode") values ('ig');
INSERT INTO language ("languageCode") values ('ik');
INSERT INTO language ("languageCode") values ('io');
INSERT INTO language ("languageCode") values ('is');
INSERT INTO language ("languageCode") values ('it');
INSERT INTO language ("languageCode") values ('iu');
INSERT INTO language ("languageCode") values ('ja');
INSERT INTO language ("languageCode") values ('jv');
INSERT INTO language ("languageCode") values ('kl');
INSERT INTO language ("languageCode") values ('kn');
INSERT INTO language ("languageCode") values ('kr');
INSERT INTO language ("languageCode") values ('ks');
INSERT INTO language ("languageCode") values ('kk');
INSERT INTO language ("languageCode") values ('km');
INSERT INTO language ("languageCode") values ('ki');
INSERT INTO language ("languageCode") values ('rw');
INSERT INTO language ("languageCode") values ('ky');
INSERT INTO language ("languageCode") values ('kv');
INSERT INTO language ("languageCode") values ('kg');
INSERT INTO language ("languageCode") values ('ko');
INSERT INTO language ("languageCode") values ('ku');
INSERT INTO language ("languageCode") values ('kj');
INSERT INTO language ("languageCode") values ('la');
INSERT INTO language ("languageCode") values ('lb');
INSERT INTO language ("languageCode") values ('lg');
INSERT INTO language ("languageCode") values ('li');
INSERT INTO language ("languageCode") values ('ln');
INSERT INTO language ("languageCode") values ('lo');
INSERT INTO language ("languageCode") values ('lt');
INSERT INTO language ("languageCode") values ('lu');
INSERT INTO language ("languageCode") values ('lv');
INSERT INTO language ("languageCode") values ('gv');
INSERT INTO language ("languageCode") values ('mk');
INSERT INTO language ("languageCode") values ('mg');
INSERT INTO language ("languageCode") values ('ms');
INSERT INTO language ("languageCode") values ('ml');
INSERT INTO language ("languageCode") values ('mt');
INSERT INTO language ("languageCode") values ('mi');
INSERT INTO language ("languageCode") values ('mr');
INSERT INTO language ("languageCode") values ('mh');
INSERT INTO language ("languageCode") values ('mn');
INSERT INTO language ("languageCode") values ('na');
INSERT INTO language ("languageCode") values ('nv');
INSERT INTO language ("languageCode") values ('nd');
INSERT INTO language ("languageCode") values ('ne');
INSERT INTO language ("languageCode") values ('ng');
INSERT INTO language ("languageCode") values ('nb');
INSERT INTO language ("languageCode") values ('nn');
INSERT INTO language ("languageCode") values ('no');
INSERT INTO language ("languageCode") values ('ii');
INSERT INTO language ("languageCode") values ('nr');
INSERT INTO language ("languageCode") values ('oc');
INSERT INTO language ("languageCode") values ('oj');
INSERT INTO language ("languageCode") values ('cu');
INSERT INTO language ("languageCode") values ('om');
INSERT INTO language ("languageCode") values ('or');
INSERT INTO language ("languageCode") values ('os');
INSERT INTO language ("languageCode") values ('pa');
INSERT INTO language ("languageCode") values ('pi');
INSERT INTO language ("languageCode") values ('fa');
INSERT INTO language ("languageCode") values ('pl');
INSERT INTO language ("languageCode") values ('ps');
INSERT INTO language ("languageCode") values ('pt');
INSERT INTO language ("languageCode") values ('qu');
INSERT INTO language ("languageCode") values ('rm');
INSERT INTO language ("languageCode") values ('rn');
INSERT INTO language ("languageCode") values ('ro');
INSERT INTO language ("languageCode") values ('ru');
INSERT INTO language ("languageCode") values ('sa');
INSERT INTO language ("languageCode") values ('sc');
INSERT INTO language ("languageCode") values ('sd');
INSERT INTO language ("languageCode") values ('se');
INSERT INTO language ("languageCode") values ('sm');
INSERT INTO language ("languageCode") values ('sg');
INSERT INTO language ("languageCode") values ('sr');
INSERT INTO language ("languageCode") values ('gd');
INSERT INTO language ("languageCode") values ('sn');
INSERT INTO language ("languageCode") values ('si');
INSERT INTO language ("languageCode") values ('sk');
INSERT INTO language ("languageCode") values ('sl');
INSERT INTO language ("languageCode") values ('so');
INSERT INTO language ("languageCode") values ('st');
INSERT INTO language ("languageCode") values ('es');
INSERT INTO language ("languageCode") values ('su');
INSERT INTO language ("languageCode") values ('sw');
INSERT INTO language ("languageCode") values ('ss');
INSERT INTO language ("languageCode") values ('sv');
INSERT INTO language ("languageCode") values ('ta');
INSERT INTO language ("languageCode") values ('te');
INSERT INTO language ("languageCode") values ('tg');
INSERT INTO language ("languageCode") values ('th');
INSERT INTO language ("languageCode") values ('ti');
INSERT INTO language ("languageCode") values ('bo');
INSERT INTO language ("languageCode") values ('tk');
INSERT INTO language ("languageCode") values ('tl');
INSERT INTO language ("languageCode") values ('tn');
INSERT INTO language ("languageCode") values ('to');
INSERT INTO language ("languageCode") values ('tr');
INSERT INTO language ("languageCode") values ('ts');
INSERT INTO language ("languageCode") values ('tt');
INSERT INTO language ("languageCode") values ('tw');
INSERT INTO language ("languageCode") values ('ty');
INSERT INTO language ("languageCode") values ('ug');
INSERT INTO language ("languageCode") values ('uk');
INSERT INTO language ("languageCode") values ('ur');
INSERT INTO language ("languageCode") values ('uz');
INSERT INTO language ("languageCode") values ('ve');
INSERT INTO language ("languageCode") values ('vi');
INSERT INTO language ("languageCode") values ('vo');
INSERT INTO language ("languageCode") values ('wa');
INSERT INTO language ("languageCode") values ('cy');
INSERT INTO language ("languageCode") values ('wo');
INSERT INTO language ("languageCode") values ('fy');
INSERT INTO language ("languageCode") values ('xh');
INSERT INTO language ("languageCode") values ('yi');
INSERT INTO language ("languageCode") values ('yo');
INSERT INTO language ("languageCode") values ('za');
INSERT INTO language ("languageCode") values ('zu');

CREATE TABLE IF NOT EXISTS state (
          "state_id" SERIAL PRIMARY KEY,          
          "countryCode" text,
          "name" text
      );

INSERT INTO state ("name","countryCode") values ('Albánie','AL');
INSERT INTO state ("name","countryCode") values ('Alžírsko','DZ');
INSERT INTO state ("name","countryCode") values ('Americká Samoa','AS');
INSERT INTO state ("name","countryCode") values ('Andorra','AD');
INSERT INTO state ("name","countryCode") values ('Angola','AO');
INSERT INTO state ("name","countryCode") values ('Anguilla','AI');
INSERT INTO state ("name","countryCode") values ('Antarktida','AQ');
INSERT INTO state ("name","countryCode") values ('Antigua a Barbuda','AG');
INSERT INTO state ("name","countryCode") values ('Argentina','AR');
INSERT INTO state ("name","countryCode") values ('Arménie','AM');
INSERT INTO state ("name","countryCode") values ('Aruba','AW');
INSERT INTO state ("name","countryCode") values ('Austrálie','AU');
INSERT INTO state ("name","countryCode") values ('Ázerbajdžán','AZ');
INSERT INTO state ("name","countryCode") values ('Bahamy','BS');
INSERT INTO state ("name","countryCode") values ('Bahrajn','BH');
INSERT INTO state ("name","countryCode") values ('Bailiwick Jersey','JE');
INSERT INTO state ("name","countryCode") values ('Bangladéš','BD');
INSERT INTO state ("name","countryCode") values ('Barbados','BB');
INSERT INTO state ("name","countryCode") values ('Barma','MM');
INSERT INTO state ("name","countryCode") values ('Belgie','BE');
INSERT INTO state ("name","countryCode") values ('Belize','BZ');
INSERT INTO state ("name","countryCode") values ('Bělorusko','BY');
INSERT INTO state ("name","countryCode") values ('Benin','BJ');
INSERT INTO state ("name","countryCode") values ('Bermudy','BM');
INSERT INTO state ("name","countryCode") values ('Bhútánské království','BT');
INSERT INTO state ("name","countryCode") values ('Bolívie','BO');
INSERT INTO state ("name","countryCode") values ('Bosna-Hercegovina','BA');
INSERT INTO state ("name","countryCode") values ('Botswana','BW');
INSERT INTO state ("name","countryCode") values ('Bouvetův ostrov','BV');
INSERT INTO state ("name","countryCode") values ('Brazílie','BR');
INSERT INTO state ("name","countryCode") values ('Britské indickooceánské terit.','IO');
INSERT INTO state ("name","countryCode") values ('Britské Panenské ostrovy','VG');
INSERT INTO state ("name","countryCode") values ('Brunej Darussalam','BN');
INSERT INTO state ("name","countryCode") values ('Bulharsko','BG');
INSERT INTO state ("name","countryCode") values ('Burkina Faso','BF');
INSERT INTO state ("name","countryCode") values ('Burundi','BI');
INSERT INTO state ("name","countryCode") values ('Svatý Bartoloměj','BL');
INSERT INTO state ("name","countryCode") values ('Bonaire, Svatý Eustach a Saba','BQ');
INSERT INTO state ("name","countryCode") values ('Canton a Enderbury','CT');
INSERT INTO state ("name","countryCode") values ('Cookovy ostrovy','CK');
INSERT INTO state ("name","countryCode") values ('Curaçao','CW');
INSERT INTO state ("name","countryCode") values ('Čad','TD');
INSERT INTO state ("name","countryCode") values ('Černá Hora','ME');
INSERT INTO state ("name","countryCode") values ('Česká republika','CZ');
INSERT INTO state ("name","countryCode") values ('Československo','CS1');
INSERT INTO state ("name","countryCode") values ('ČLR','CN');
INSERT INTO state ("name","countryCode") values ('Dánsko','DK');
INSERT INTO state ("name","countryCode") values ('Dominika','DM');
INSERT INTO state ("name","countryCode") values ('Dominikánská republika','DO');
INSERT INTO state ("name","countryCode") values ('Džibutsko','DJ');
INSERT INTO state ("name","countryCode") values ('Egypt','EG');
INSERT INTO state ("name","countryCode") values ('Ekvádor','EC');
INSERT INTO state ("name","countryCode") values ('Eritrea','ER');
INSERT INTO state ("name","countryCode") values ('Estonsko','EE');
INSERT INTO state ("name","countryCode") values ('Etiopie','ET');
INSERT INTO state ("name","countryCode") values ('Faerské ostrovy','FO');
INSERT INTO state ("name","countryCode") values ('Falklandy','FK');
INSERT INTO state ("name","countryCode") values ('Federativní státy a Mikronésie','FM');
INSERT INTO state ("name","countryCode") values ('Fidži','FJ');
INSERT INTO state ("name","countryCode") values ('Filipíny','PH');
INSERT INTO state ("name","countryCode") values ('Finsko','FI');
INSERT INTO state ("name","countryCode") values ('Francie','FR');
INSERT INTO state ("name","countryCode") values ('Francouzská Guayana','GF');
INSERT INTO state ("name","countryCode") values ('Francouzská jižní území','TF');
INSERT INTO state ("name","countryCode") values ('Francouzská Polynésie','PF');
INSERT INTO state ("name","countryCode") values ('Gabon','GA');
INSERT INTO state ("name","countryCode") values ('Gambie','GM');
INSERT INTO state ("name","countryCode") values ('Ghana','GH');
INSERT INTO state ("name","countryCode") values ('Gibraltar','GI');
INSERT INTO state ("name","countryCode") values ('Grenada','GD');
INSERT INTO state ("name","countryCode") values ('Grónsko','GL');
INSERT INTO state ("name","countryCode") values ('Gruzie','GE');
INSERT INTO state ("name","countryCode") values ('Guadeloupe','GP');
INSERT INTO state ("name","countryCode") values ('Guam','GU');
INSERT INTO state ("name","countryCode") values ('Guatemala','GT');
INSERT INTO state ("name","countryCode") values ('Guernsey','GG');
INSERT INTO state ("name","countryCode") values ('Guinea','GN');
INSERT INTO state ("name","countryCode") values ('Guinea-Bissau','GW');
INSERT INTO state ("name","countryCode") values ('Guyana','GY');
INSERT INTO state ("name","countryCode") values ('Haiti','HT');
INSERT INTO state ("name","countryCode") values ('Heardův a MacDonaldův o.','HM');
INSERT INTO state ("name","countryCode") values ('Honduras','HN');
INSERT INTO state ("name","countryCode") values ('Hongkong','HK');
INSERT INTO state ("name","countryCode") values ('Chile','CL');
INSERT INTO state ("name","countryCode") values ('Chorvatsko','HR');
INSERT INTO state ("name","countryCode") values ('Indie','IN');
INSERT INTO state ("name","countryCode") values ('Indonésie','ID');
INSERT INTO state ("name","countryCode") values ('Irák','IQ');
INSERT INTO state ("name","countryCode") values ('Irán','IR');
INSERT INTO state ("name","countryCode") values ('Irsko','IE');
INSERT INTO state ("name","countryCode") values ('Island','IS');
INSERT INTO state ("name","countryCode") values ('Itálie','IT');
INSERT INTO state ("name","countryCode") values ('Izrael','IL');
INSERT INTO state ("name","countryCode") values ('Jamajka','JM');
INSERT INTO state ("name","countryCode") values ('Japonsko','JP');
INSERT INTO state ("name","countryCode") values ('Jemen','YE');
INSERT INTO state ("name","countryCode") values ('Jihoafrická republika','ZA');
INSERT INTO state ("name","countryCode") values ('Jihosúdánská republika','SS');
INSERT INTO state ("name","countryCode") values ('Jižní Georgie a Jižní Sanwich. o.','GS');
INSERT INTO state ("name","countryCode") values ('Jižní Jemen','YD');
INSERT INTO state ("name","countryCode") values ('Jižní Korea','KR');
INSERT INTO state ("name","countryCode") values ('Johnston I.','JT');
INSERT INTO state ("name","countryCode") values ('Jordánsko','JO');
INSERT INTO state ("name","countryCode") values ('Kajmanské ostrovy','KY');
INSERT INTO state ("name","countryCode") values ('Kambodža','KH');
INSERT INTO state ("name","countryCode") values ('Kamerun','CM');
INSERT INTO state ("name","countryCode") values ('Kanada','CA');
INSERT INTO state ("name","countryCode") values ('Kapverdy','CV');
INSERT INTO state ("name","countryCode") values ('Katar','QA');
INSERT INTO state ("name","countryCode") values ('Kazachstán','KZ');
INSERT INTO state ("name","countryCode") values ('Keňa','KE');
INSERT INTO state ("name","countryCode") values ('Kiribati','KI');
INSERT INTO state ("name","countryCode") values ('KLDR','KP');
INSERT INTO state ("name","countryCode") values ('Kokosové ostrovy','CC');
INSERT INTO state ("name","countryCode") values ('Kolumbie','CO');
INSERT INTO state ("name","countryCode") values ('Komory','KM');
INSERT INTO state ("name","countryCode") values ('Konžská republika','CG');
INSERT INTO state ("name","countryCode") values ('Kongo, demokratická republika','CD');
INSERT INTO state ("name","countryCode") values ('Kostarika','CR');
INSERT INTO state ("name","countryCode") values ('Kuba','CU');
INSERT INTO state ("name","countryCode") values ('Kuvajt','KW');
INSERT INTO state ("name","countryCode") values ('Kypr','CY');
INSERT INTO state ("name","countryCode") values ('Kyrgyzstán','KG');
INSERT INTO state ("name","countryCode") values ('Laos','LA');
INSERT INTO state ("name","countryCode") values ('Lesotho','LS');
INSERT INTO state ("name","countryCode") values ('Libanon','LB');
INSERT INTO state ("name","countryCode") values ('Libérie','LR');
INSERT INTO state ("name","countryCode") values ('Libye','LY');
INSERT INTO state ("name","countryCode") values ('Lichtenštejnsko','LI');
INSERT INTO state ("name","countryCode") values ('Litva','LT');
INSERT INTO state ("name","countryCode") values ('Lotyšsko','LV');
INSERT INTO state ("name","countryCode") values ('Lucembursko','LU');
INSERT INTO state ("name","countryCode") values ('Macao','MO');
INSERT INTO state ("name","countryCode") values ('Madagaskar','MG');
INSERT INTO state ("name","countryCode") values ('Maďarsko','HU');
INSERT INTO state ("name","countryCode") values ('Makedonie','MK');
INSERT INTO state ("name","countryCode") values ('Malajsie','MY');
INSERT INTO state ("name","countryCode") values ('Malawi','MW');
INSERT INTO state ("name","countryCode") values ('Maledivy','MV');
INSERT INTO state ("name","countryCode") values ('Mali','ML');
INSERT INTO state ("name","countryCode") values ('Malta','MT');
INSERT INTO state ("name","countryCode") values ('Maroko','MA');
INSERT INTO state ("name","countryCode") values ('Marshallovy ostrovy','MH');
INSERT INTO state ("name","countryCode") values ('Martinik','MQ');
INSERT INTO state ("name","countryCode") values ('Mauricius','MU');
INSERT INTO state ("name","countryCode") values ('Mauritánie','MR');
INSERT INTO state ("name","countryCode") values ('Mayotte','YT');
INSERT INTO state ("name","countryCode") values ('Mexiko','MX');
INSERT INTO state ("name","countryCode") values ('Midwayské ostrovy','MI');
INSERT INTO state ("name","countryCode") values ('Mikronésie','PC');
INSERT INTO state ("name","countryCode") values ('Moldavsko','MD');
INSERT INTO state ("name","countryCode") values ('Monako','MC');
INSERT INTO state ("name","countryCode") values ('Mongolsko','MN');
INSERT INTO state ("name","countryCode") values ('Montserrat','MS');
INSERT INTO state ("name","countryCode") values ('Mosambik','MZ');
INSERT INTO state ("name","countryCode") values ('Myanmarský svaz','MM');
INSERT INTO state ("name","countryCode") values ('Namíbie','NA');
INSERT INTO state ("name","countryCode") values ('Nauru','NR');
INSERT INTO state ("name","countryCode") values ('NDR (do r. 1990)','DD');
INSERT INTO state ("name","countryCode") values ('Německo (od r. 1991)','DE');
INSERT INTO state ("name","countryCode") values ('Nepál','NP');
INSERT INTO state ("name","countryCode") values ('Neutrální území','NT');
INSERT INTO state ("name","countryCode") values ('Niger','NE');
INSERT INTO state ("name","countryCode") values ('Nigérie','NG');
INSERT INTO state ("name","countryCode") values ('Nikaragua','NI');
INSERT INTO state ("name","countryCode") values ('Niue','NU');
INSERT INTO state ("name","countryCode") values ('Nizozemí','NL');
INSERT INTO state ("name","countryCode") values ('Nizozemské Antily','AN');
INSERT INTO state ("name","countryCode") values ('Norfolk','NF');
INSERT INTO state ("name","countryCode") values ('Norsko','NO');
INSERT INTO state ("name","countryCode") values ('Nová Kaledonie','NC');
INSERT INTO state ("name","countryCode") values ('Nový Zéland','NZ');
INSERT INTO state ("name","countryCode") values ('Omán','OM');
INSERT INTO state ("name","countryCode") values ('Ostrov Man','IM');
INSERT INTO state ("name","countryCode") values ('Ostrovy USA v Tichém o.','UM');
INSERT INTO state ("name","countryCode") values ('Pákistán','PK');
INSERT INTO state ("name","countryCode") values ('Palau','PW');
INSERT INTO state ("name","countryCode") values ('Palestina','PS');
INSERT INTO state ("name","countryCode") values ('Panama','PA');
INSERT INTO state ("name","countryCode") values ('Panamské průplav. pásmo','PZ');
INSERT INTO state ("name","countryCode") values ('Panenské ostrovy (USA)','VI');
INSERT INTO state ("name","countryCode") values ('Papua-Nová Guinea','PG');
INSERT INTO state ("name","countryCode") values ('Paraguay','PY');
INSERT INTO state ("name","countryCode") values ('Peru','PE');
INSERT INTO state ("name","countryCode") values ('Pitcairnovy ostrovy','PN');
INSERT INTO state ("name","countryCode") values ('Pobřeží slonoviny','CI');
INSERT INTO state ("name","countryCode") values ('Polsko','PL');
INSERT INTO state ("name","countryCode") values ('Portoriko','PR');
INSERT INTO state ("name","countryCode") values ('Portugalsko','PT');
INSERT INTO state ("name","countryCode") values ('Rakousko','AT');
INSERT INTO state ("name","countryCode") values ('Réunion','RE');
INSERT INTO state ("name","countryCode") values ('Rovníková Guinea','GQ');
INSERT INTO state ("name","countryCode") values ('Rumunsko','RO');
INSERT INTO state ("name","countryCode") values ('Rusko','RU');
INSERT INTO state ("name","countryCode") values ('Rwanda','RW');
INSERT INTO state ("name","countryCode") values ('Řecko','GR');
INSERT INTO state ("name","countryCode") values ('Saint Pierre a Miquelon','PM');
INSERT INTO state ("name","countryCode") values ('Salvador','SV');
INSERT INTO state ("name","countryCode") values ('Samoa','WS');
INSERT INTO state ("name","countryCode") values ('San Marino','SM');
INSERT INTO state ("name","countryCode") values ('Saúdská Arábie','SA');
INSERT INTO state ("name","countryCode") values ('Senegal','SN');
INSERT INTO state ("name","countryCode") values ('Severní Marianny','MP');
INSERT INTO state ("name","countryCode") values ('Seychelly','SC');
INSERT INTO state ("name","countryCode") values ('Sierra Leone','SL');
INSERT INTO state ("name","countryCode") values ('Singapur','SG');
INSERT INTO state ("name","countryCode") values ('Slovensko','SK');
INSERT INTO state ("name","countryCode") values ('Slovinsko','SI');
INSERT INTO state ("name","countryCode") values ('Somalsko','SO');
INSERT INTO state ("name","countryCode") values ('Spojené arabské emiráty','AE');
INSERT INTO state ("name","countryCode") values ('Srbsko','RS');
INSERT INTO state ("name","countryCode") values ('Srbsko a Černá Hora (do r. 2006)','CS');
INSERT INTO state ("name","countryCode") values ('Srí Lanka','LK');
INSERT INTO state ("name","countryCode") values ('SRN (do r. 1990)','DB');
INSERT INTO state ("name","countryCode") values ('SSSR','SU');
INSERT INTO state ("name","countryCode") values ('Středoafrická republika','CF');
INSERT INTO state ("name","countryCode") values ('Súdán','SD');
INSERT INTO state ("name","countryCode") values ('Surinam','SR');
INSERT INTO state ("name","countryCode") values ('Sv. Helena','SH');
INSERT INTO state ("name","countryCode") values ('Sv. Kryštof','KN');
INSERT INTO state ("name","countryCode") values ('Sv. Lucie','LC');
INSERT INTO state ("name","countryCode") values ('Sv. Martin (FR)','MF');
INSERT INTO state ("name","countryCode") values ('Sv. Martin (NL)','SX');
INSERT INTO state ("name","countryCode") values ('Sv. Tomáš','ST');
INSERT INTO state ("name","countryCode") values ('Sv. Vincenc a Grenadiny','VC');
INSERT INTO state ("name","countryCode") values ('Svazijsko','SZ');
INSERT INTO state ("name","countryCode") values ('Sýrie','SY');
INSERT INTO state ("name","countryCode") values ('Šalomounovy ostrovy','SB');
INSERT INTO state ("name","countryCode") values ('Španělsko','ES');
INSERT INTO state ("name","countryCode") values ('Špicberky','SJ');
INSERT INTO state ("name","countryCode") values ('Švédsko','SE');
INSERT INTO state ("name","countryCode") values ('Švýcarsko','CH');
INSERT INTO state ("name","countryCode") values ('Tádžikistán','TJ');
INSERT INTO state ("name","countryCode") values ('Demokratická republika Východní Timor','TL');
INSERT INTO state ("name","countryCode") values ('Tanzánie','TZ');
INSERT INTO state ("name","countryCode") values ('Thajsko','TH');
INSERT INTO state ("name","countryCode") values ('Tchaj-wan','TW');
INSERT INTO state ("name","countryCode") values ('Togo','TG');
INSERT INTO state ("name","countryCode") values ('Tokelau','TK');
INSERT INTO state ("name","countryCode") values ('Tonga','TO');
INSERT INTO state ("name","countryCode") values ('Trinidad a Tobago','TT');
INSERT INTO state ("name","countryCode") values ('Tunisko','TN');
INSERT INTO state ("name","countryCode") values ('Turecko','TR');
INSERT INTO state ("name","countryCode") values ('Turkmenistán','TU');
INSERT INTO state ("name","countryCode") values ('Turks a Caicos','TC');
INSERT INTO state ("name","countryCode") values ('Tuvalu','TV');
INSERT INTO state ("name","countryCode") values ('Uganda','UG');
INSERT INTO state ("name","countryCode") values ('Ukrajina','UA');
INSERT INTO state ("name","countryCode") values ('Uruguay','UY');
INSERT INTO state ("name","countryCode") values ('USA','US');
INSERT INTO state ("name","countryCode") values ('Uzbekistán','UZ');
INSERT INTO state ("name","countryCode") values ('Vánoční ostrovy','CX');
INSERT INTO state ("name","countryCode") values ('Vanuatu','VU');
INSERT INTO state ("name","countryCode") values ('Vatikán','VA');
INSERT INTO state ("name","countryCode") values ('Velká Británie','GB');
INSERT INTO state ("name","countryCode") values ('Venezuela','VE');
INSERT INTO state ("name","countryCode") values ('Vietnam','VN');
INSERT INTO state ("name","countryCode") values ('Východní Timor','TP');
INSERT INTO state ("name","countryCode") values ('Wake I.','WK');
INSERT INTO state ("name","countryCode") values ('Wallisovy ostrovy','WF');
INSERT INTO state ("name","countryCode") values ('Zair','ZR');
INSERT INTO state ("name","countryCode") values ('Zambie','ZM');
INSERT INTO state ("name","countryCode") values ('Západní Berlín (do 1991)','WB');
INSERT INTO state ("name","countryCode") values ('Západní Sahara','EH');
INSERT INTO state ("name","countryCode") values ('Země královny Maud','NQ');
INSERT INTO state ("name","countryCode") values ('Zimbabwe','ZW');
INSERT INTO state ("name","countryCode") values ('Kosovská republika','XK');

CREATE TABLE IF NOT EXISTS languagestate (
          "languageState_id" SERIAL PRIMARY KEY,
          "language_id" int REFERENCES language ("language_id") ON DELETE CASCADE,
          "state_id" int REFERENCES state ("state_id") ON DELETE CASCADE      
      );

INSERT INTO languagestate ("language_id","state_id") values ('7','116');
INSERT INTO languagestate ("language_id","state_id") values ('48','116');
INSERT INTO languagestate ("language_id","state_id") values ('151','116');
INSERT INTO languagestate ("language_id","state_id") values ('86','113');
INSERT INTO languagestate ("language_id","state_id") values ('86','101');
INSERT INTO languagestate ("language_id","state_id") values ('41','101');
INSERT INTO languagestate ("language_id","state_id") values ('41','83');
INSERT INTO languagestate ("language_id","state_id") values ('129','133');
INSERT INTO languagestate ("language_id","state_id") values ('73','95');
INSERT INTO languagestate ("language_id","state_id") values ('80','105');
INSERT INTO languagestate ("language_id","state_id") values ('158','53');
INSERT INTO languagestate ("language_id","state_id") values ('7','53');
INSERT INTO languagestate ("language_id","state_id") values ('41','53');
INSERT INTO languagestate ("language_id","state_id") values ('6','55');
INSERT INTO languagestate ("language_id","state_id") values ('121','55');
INSERT INTO languagestate ("language_id","state_id") values ('51','72');
INSERT INTO languagestate ("language_id","state_id") values ('25','156');
INSERT INTO languagestate ("language_id","state_id") values ('40','25');
INSERT INTO languagestate ("language_id","state_id") values ('94','124');
INSERT INTO languagestate ("language_id","state_id") values ('157','236');
INSERT INTO languagestate ("language_id","state_id") values ('144','213');
INSERT INTO languagestate ("language_id","state_id") values ('154','213');
INSERT INTO languagestate ("language_id","state_id") values ('19','17');
INSERT INTO languagestate ("language_id","state_id") values ('60','86');
INSERT INTO languagestate ("language_id","state_id") values ('41','86');
INSERT INTO languagestate ("language_id","state_id") values ('41','176');
INSERT INTO languagestate ("language_id","state_id") values ('171','176');
INSERT INTO languagestate ("language_id","state_id") values ('7','146');
INSERT INTO languagestate ("language_id","state_id") values ('48','146');
INSERT INTO languagestate ("language_id","state_id") values ('7','51');
INSERT INTO languagestate ("language_id","state_id") values ('7','128');
INSERT INTO languagestate ("language_id","state_id") values ('7','126');
INSERT INTO languagestate ("language_id","state_id") values ('48','126');
INSERT INTO languagestate ("language_id","state_id") values ('7','109');
INSERT INTO languagestate ("language_id","state_id") values ('7','227');
INSERT INTO languagestate ("language_id","state_id") values ('7','173');
INSERT INTO languagestate ("language_id","state_id") values ('7','210');
INSERT INTO languagestate ("language_id","state_id") values ('7','242');
INSERT INTO languagestate ("language_id","state_id") values ('48','242');
INSERT INTO languagestate ("language_id","state_id") values ('126','89');
INSERT INTO languagestate ("language_id","state_id") values ('7','96');
INSERT INTO languagestate ("language_id","state_id") values ('7','121');
INSERT INTO languagestate ("language_id","state_id") values ('7','88');
INSERT INTO languagestate ("language_id","state_id") values ('87','88');
INSERT INTO languagestate ("language_id","state_id") values ('7','217');
INSERT INTO languagestate ("language_id","state_id") values ('41','217');
INSERT INTO languagestate ("language_id","state_id") values ('7','201');
INSERT INTO languagestate ("language_id","state_id") values ('7','2');
INSERT INTO languagestate ("language_id","state_id") values ('7','15');
INSERT INTO languagestate ("language_id","state_id") values ('7','103');
INSERT INTO languagestate ("language_id","state_id") values ('58','93');
INSERT INTO languagestate ("language_id","state_id") values ('9','10');
INSERT INTO languagestate ("language_id","state_id") values ('79','110');
INSERT INTO languagestate ("language_id","state_id") values ('134','110');
INSERT INTO languagestate ("language_id","state_id") values ('170','248');
INSERT INTO languagestate ("language_id","state_id") values ('141','211');
INSERT INTO languagestate ("language_id","state_id") values ('99','136');
INSERT INTO languagestate ("language_id","state_id") values ('134','194');
INSERT INTO languagestate ("language_id","state_id") values ('107','153');
INSERT INTO languagestate ("language_id","state_id") values ('83','123');
INSERT INTO languagestate ("language_id","state_id") values ('134','123');
INSERT INTO languagestate ("language_id","state_id") values ('24','34');
INSERT INTO languagestate ("language_id","state_id") values ('18','22');
INSERT INTO languagestate ("language_id","state_id") values ('134','22');
INSERT INTO languagestate ("language_id","state_id") values ('53','122');
INSERT INTO languagestate ("language_id","state_id") values ('164','122');
INSERT INTO languagestate ("language_id","state_id") values ('53','196');
INSERT INTO languagestate ("language_id","state_id") values ('36','44');
INSERT INTO languagestate ("language_id","state_id") values ('52','190');
INSERT INTO languagestate ("language_id","state_id") values ('70','91');
INSERT INTO languagestate ("language_id","state_id") values ('41','266');
INSERT INTO languagestate ("language_id","state_id") values ('143','266');
INSERT INTO languagestate ("language_id","state_id") values ('110','266');
INSERT INTO languagestate ("language_id","state_id") values ('41','262');
INSERT INTO languagestate ("language_id","state_id") values ('48','260');
INSERT INTO languagestate ("language_id","state_id") values ('174','257');
INSERT INTO languagestate ("language_id","state_id") values ('149','256');
INSERT INTO languagestate ("language_id","state_id") values ('21','253');
INSERT INTO languagestate ("language_id","state_id") values ('41','253');
INSERT INTO languagestate ("language_id","state_id") values ('48','253');
INSERT INTO languagestate ("language_id","state_id") values ('149','249');
INSERT INTO languagestate ("language_id","state_id") values ('41','181');
INSERT INTO languagestate ("language_id","state_id") values ('41','250');
INSERT INTO languagestate ("language_id","state_id") values ('41','175');
INSERT INTO languagestate ("language_id","state_id") values ('41','255');
INSERT INTO languagestate ("language_id","state_id") values ('66','255');
INSERT INTO languagestate ("language_id","state_id") values ('177','255');
INSERT INTO languagestate ("language_id","state_id") values ('142','255');
INSERT INTO languagestate ("language_id","state_id") values ('32','255');
INSERT INTO languagestate ("language_id","state_id") values ('41','247');
INSERT INTO languagestate ("language_id","state_id") values ('151','247');
INSERT INTO languagestate ("language_id","state_id") values ('164','243');
INSERT INTO languagestate ("language_id","state_id") values ('41','246');
INSERT INTO languagestate ("language_id","state_id") values ('41','245');
INSERT INTO languagestate ("language_id","state_id") values ('41','241');
INSERT INTO languagestate ("language_id","state_id") values ('41','240');
INSERT INTO languagestate ("language_id","state_id") values ('41','239');
INSERT INTO languagestate ("language_id","state_id") values ('139','239');
INSERT INTO languagestate ("language_id","state_id") values ('48','238');
INSERT INTO languagestate ("language_id","state_id") values ('129','234');
INSERT INTO languagestate ("language_id","state_id") values ('41','67');
INSERT INTO languagestate ("language_id","state_id") values ('48','64');
INSERT INTO languagestate ("language_id","state_id") values ('48','42');
INSERT INTO languagestate ("language_id","state_id") values ('7','42');
INSERT INTO languagestate ("language_id","state_id") values ('151','235');
INSERT INTO languagestate ("language_id","state_id") values ('41','235');
INSERT INTO languagestate ("language_id","state_id") values ('48','202');
INSERT INTO languagestate ("language_id","state_id") values ('129','224');
INSERT INTO languagestate ("language_id","state_id") values ('153','231');
INSERT INTO languagestate ("language_id","state_id") values ('115','230');
INSERT INTO languagestate ("language_id","state_id") values ('39','218');
INSERT INTO languagestate ("language_id","state_id") values ('47','61');
INSERT INTO languagestate ("language_id","state_id") values ('153','61');
INSERT INTO languagestate ("language_id","state_id") values ('138','61');
INSERT INTO languagestate ("language_id","state_id") values ('41','98');
INSERT INTO languagestate ("language_id","state_id") values ('41','99');
INSERT INTO languagestate ("language_id","state_id") values ('41','97');
INSERT INTO languagestate ("language_id","state_id") values ('3','97');
INSERT INTO languagestate ("language_id","state_id") values ('148','97');
INSERT INTO languagestate ("language_id","state_id") values ('162','97');
INSERT INTO languagestate ("language_id","state_id") values ('180','97');
INSERT INTO languagestate ("language_id","state_id") values ('184','97');
INSERT INTO languagestate ("language_id","state_id") values ('147','209');
INSERT INTO languagestate ("language_id","state_id") values ('7','209');
INSERT INTO languagestate ("language_id","state_id") values ('41','228');
INSERT INTO languagestate ("language_id","state_id") values ('145','207');
INSERT INTO languagestate ("language_id","state_id") values ('146','208');
INSERT INTO languagestate ("language_id","state_id") values ('39','223');
INSERT INTO languagestate ("language_id","state_id") values ('41','223');
INSERT INTO languagestate ("language_id","state_id") values ('41','206');
INSERT INTO languagestate ("language_id","state_id") values ('101','206');
INSERT INTO languagestate ("language_id","state_id") values ('154','206');
INSERT INTO languagestate ("language_id","state_id") values ('41','205');
INSERT INTO languagestate ("language_id","state_id") values ('5','1');
INSERT INTO languagestate ("language_id","state_id") values ('48','204');
INSERT INTO languagestate ("language_id","state_id") values ('41','204');
INSERT INTO languagestate ("language_id","state_id") values ('52','232');
INSERT INTO languagestate ("language_id","state_id") values ('48','232');
INSERT INTO languagestate ("language_id","state_id") values ('71','232');
INSERT INTO languagestate ("language_id","state_id") values ('131','232');
INSERT INTO languagestate ("language_id","state_id") values ('71','200');
INSERT INTO languagestate ("language_id","state_id") values ('139','199');
INSERT INTO languagestate ("language_id","state_id") values ('41','199');
INSERT INTO languagestate ("language_id","state_id") values ('48','197');
INSERT INTO languagestate ("language_id","state_id") values ('48','222');
INSERT INTO languagestate ("language_id","state_id") values ('48','37');
INSERT INTO languagestate ("language_id","state_id") values ('41','225');
INSERT INTO languagestate ("language_id","state_id") values ('41','221');
INSERT INTO languagestate ("language_id","state_id") values ('41','220');
INSERT INTO languagestate ("language_id","state_id") values ('41','219');
INSERT INTO languagestate ("language_id","state_id") values ('7','264');
INSERT INTO languagestate ("language_id","state_id") values ('149','264');
INSERT INTO languagestate ("language_id","state_id") values ('48','264');
INSERT INTO languagestate ("language_id","state_id") values ('48','118');
INSERT INTO languagestate ("language_id","state_id") values ('48','117');
INSERT INTO languagestate ("language_id","state_id") values ('48','216');
INSERT INTO languagestate ("language_id","state_id") values ('140','216');
INSERT INTO languagestate ("language_id","state_id") values ('82','195');
INSERT INTO languagestate ("language_id","state_id") values ('48','195');
INSERT INTO languagestate ("language_id","state_id") values ('41','195');
INSERT INTO languagestate ("language_id","state_id") values ('133','193');
INSERT INTO languagestate ("language_id","state_id") values ('149','49');
INSERT INTO languagestate ("language_id","state_id") values ('149','188');
INSERT INTO languagestate ("language_id","state_id") values ('41','188');
INSERT INTO languagestate ("language_id","state_id") values ('129','189');
INSERT INTO languagestate ("language_id","state_id") values ('48','65');
INSERT INTO languagestate ("language_id","state_id") values ('127','187');
INSERT INTO languagestate ("language_id","state_id") values ('41','185');
INSERT INTO languagestate ("language_id","state_id") values ('41','60');
INSERT INTO languagestate ("language_id","state_id") values ('161','60');
INSERT INTO languagestate ("language_id","state_id") values ('149','184');
INSERT INTO languagestate ("language_id","state_id") values ('149','183');
INSERT INTO languagestate ("language_id","state_id") values ('54','183');
INSERT INTO languagestate ("language_id","state_id") values ('41','182');
INSERT INTO languagestate ("language_id","state_id") values ('61','182');
INSERT INTO languagestate ("language_id","state_id") values ('149','179');
INSERT INTO languagestate ("language_id","state_id") values ('7','178');
INSERT INTO languagestate ("language_id","state_id") values ('58','178');
INSERT INTO languagestate ("language_id","state_id") values ('41','177');
INSERT INTO languagestate ("language_id","state_id") values ('73','177');
INSERT INTO languagestate ("language_id","state_id") values ('48','171');
INSERT INTO languagestate ("language_id","state_id") values ('41','203');
INSERT INTO languagestate ("language_id","state_id") values ('27','203');
INSERT INTO languagestate ("language_id","state_id") values ('113','170');
INSERT INTO languagestate ("language_id","state_id") values ('114','170');
INSERT INTO languagestate ("language_id","state_id") values ('115','170');
INSERT INTO languagestate ("language_id","state_id") values ('138','170');
INSERT INTO languagestate ("language_id","state_id") values ('41','169');
INSERT INTO languagestate ("language_id","state_id") values ('41','166');
INSERT INTO languagestate ("language_id","state_id") values ('41','164');
INSERT INTO languagestate ("language_id","state_id") values ('48','163');
INSERT INTO languagestate ("language_id","state_id") values ('149','165');
INSERT INTO languagestate ("language_id","state_id") values ('104','172');
INSERT INTO languagestate ("language_id","state_id") values ('41','172');
INSERT INTO languagestate ("language_id","state_id") values ('39','167');
INSERT INTO languagestate ("language_id","state_id") values ('108','158');
INSERT INTO languagestate ("language_id","state_id") values ('41','158');
INSERT INTO languagestate ("language_id","state_id") values ('41','157');
INSERT INTO languagestate ("language_id","state_id") values ('52','157');
INSERT INTO languagestate ("language_id","state_id") values ('149','148');
INSERT INTO languagestate ("language_id","state_id") values ('129','155');
INSERT INTO languagestate ("language_id","state_id") values ('41','154');
INSERT INTO languagestate ("language_id","state_id") values ('48','152');
INSERT INTO languagestate ("language_id","state_id") values ('133','151');
INSERT INTO languagestate ("language_id","state_id") values ('134','151');
INSERT INTO languagestate ("language_id","state_id") values ('170','151');
INSERT INTO languagestate ("language_id","state_id") values ('41','58');
INSERT INTO languagestate ("language_id","state_id") values ('48','147');
INSERT INTO languagestate ("language_id","state_id") values ('48','145');
INSERT INTO languagestate ("language_id","state_id") values ('41','145');
INSERT INTO languagestate ("language_id","state_id") values ('48','144');
INSERT INTO languagestate ("language_id","state_id") values ('41','143');
INSERT INTO languagestate ("language_id","state_id") values ('106','143');
INSERT INTO languagestate ("language_id","state_id") values ('48','142');
INSERT INTO languagestate ("language_id","state_id") values ('7','142');
INSERT INTO languagestate ("language_id","state_id") values ('103','141');
INSERT INTO languagestate ("language_id","state_id") values ('41','141');
INSERT INTO languagestate ("language_id","state_id") values ('48','140');
INSERT INTO languagestate ("language_id","state_id") values ('41','138');
INSERT INTO languagestate ("language_id","state_id") values ('29','138');
INSERT INTO languagestate ("language_id","state_id") values ('62','135');
INSERT INTO languagestate ("language_id","state_id") values ('100','134');
INSERT INTO languagestate ("language_id","state_id") values ('48','134');
INSERT INTO languagestate ("language_id","state_id") values ('90','132');
INSERT INTO languagestate ("language_id","state_id") values ('48','132');
INSERT INTO languagestate ("language_id","state_id") values ('52','132');
INSERT INTO languagestate ("language_id","state_id") values ('95','130');
INSERT INTO languagestate ("language_id","state_id") values ('52','129');
INSERT INTO languagestate ("language_id","state_id") values ('41','127');
INSERT INTO languagestate ("language_id","state_id") values ('41','125');
INSERT INTO languagestate ("language_id","state_id") values ('148','125');
INSERT INTO languagestate ("language_id","state_id") values ('97','131');
INSERT INTO languagestate ("language_id","state_id") values ('48','191');
INSERT INTO languagestate ("language_id","state_id") values ('41','112');
INSERT INTO languagestate ("language_id","state_id") values ('151','111');
INSERT INTO languagestate ("language_id","state_id") values ('41','111');
INSERT INTO languagestate ("language_id","state_id") values ('75','71');
INSERT INTO languagestate ("language_id","state_id") values ('37','71');
INSERT INTO languagestate ("language_id","state_id") values ('41','16');
INSERT INTO languagestate ("language_id","state_id") values ('41','94');
INSERT INTO languagestate ("language_id","state_id") values ('71','92');
INSERT INTO languagestate ("language_id","state_id") values ('52','92');
INSERT INTO languagestate ("language_id","state_id") values ('48','92');
INSERT INTO languagestate ("language_id","state_id") values ('41','174');
INSERT INTO languagestate ("language_id","state_id") values ('41','90');
INSERT INTO languagestate ("language_id","state_id") values ('66','90');
INSERT INTO languagestate ("language_id","state_id") values ('64','87');
INSERT INTO languagestate ("language_id","state_id") values ('35','85');
INSERT INTO languagestate ("language_id","state_id") values ('149','82');
INSERT INTO languagestate ("language_id","state_id") values ('41','81');
INSERT INTO languagestate ("language_id","state_id") values ('48','80');
INSERT INTO languagestate ("language_id","state_id") values ('56','80');
INSERT INTO languagestate ("language_id","state_id") values ('48','63');
INSERT INTO languagestate ("language_id","state_id") values ('41','79');
INSERT INTO languagestate ("language_id","state_id") values ('48','77');
INSERT INTO languagestate ("language_id","state_id") values ('129','78');
INSERT INTO languagestate ("language_id","state_id") values ('149','192');
INSERT INTO languagestate ("language_id","state_id") values ('48','192');
INSERT INTO languagestate ("language_id","state_id") values ('129','192');
INSERT INTO languagestate ("language_id","state_id") values ('41','76');
INSERT INTO languagestate ("language_id","state_id") values ('149','75');
INSERT INTO languagestate ("language_id","state_id") values ('41','74');
INSERT INTO languagestate ("language_id","state_id") values ('27','74');
INSERT INTO languagestate ("language_id","state_id") values ('48','73');
INSERT INTO languagestate ("language_id","state_id") values ('41','70');
INSERT INTO languagestate ("language_id","state_id") values ('41','69');
INSERT INTO languagestate ("language_id","state_id") values ('41','68');
INSERT INTO languagestate ("language_id","state_id") values ('48','66');
INSERT INTO languagestate ("language_id","state_id") values ('45','56');
INSERT INTO languagestate ("language_id","state_id") values ('37','56');
INSERT INTO languagestate ("language_id","state_id") values ('48','62');
INSERT INTO languagestate ("language_id","state_id") values ('41','59');
INSERT INTO languagestate ("language_id","state_id") values ('41','57');
INSERT INTO languagestate ("language_id","state_id") values ('41','226');
INSERT INTO languagestate ("language_id","state_id") values ('152','226');
INSERT INTO languagestate ("language_id","state_id") values ('26','229');
INSERT INTO languagestate ("language_id","state_id") values ('149','229');
INSERT INTO languagestate ("language_id","state_id") values ('17','229');
INSERT INTO languagestate ("language_id","state_id") values ('50','229');
INSERT INTO languagestate ("language_id","state_id") values ('149','198');
INSERT INTO languagestate ("language_id","state_id") values ('43','54');
INSERT INTO languagestate ("language_id","state_id") values ('149','52');
INSERT INTO languagestate ("language_id","state_id") values ('41','48');
INSERT INTO languagestate ("language_id","state_id") values ('48','50');
INSERT INTO languagestate ("language_id","state_id") values ('7','50');
INSERT INTO languagestate ("language_id","state_id") values ('147','50');
INSERT INTO languagestate ("language_id","state_id") values ('2','50');
INSERT INTO languagestate ("language_id","state_id") values ('52','160');
INSERT INTO languagestate ("language_id","state_id") values ('37','47');
INSERT INTO languagestate ("language_id","state_id") values ('48','186');
INSERT INTO languagestate ("language_id","state_id") values ('39','41');
INSERT INTO languagestate ("language_id","state_id") values ('41','41');
INSERT INTO languagestate ("language_id","state_id") values ('149','120');
INSERT INTO languagestate ("language_id","state_id") values ('141','43');
INSERT INTO languagestate ("language_id","state_id") values ('35','43');
INSERT INTO languagestate ("language_id","state_id") values ('22','43');
INSERT INTO languagestate ("language_id","state_id") values ('5','43');
INSERT INTO languagestate ("language_id","state_id") values ('149','119');
INSERT INTO languagestate ("language_id","state_id") values ('41','40');
INSERT INTO languagestate ("language_id","state_id") values ('149','115');
INSERT INTO languagestate ("language_id","state_id") values ('41','114');
INSERT INTO languagestate ("language_id","state_id") values ('71','254');
INSERT INTO languagestate ("language_id","state_id") values ('41','252');
INSERT INTO languagestate ("language_id","state_id") values ('149','84');
INSERT INTO languagestate ("language_id","state_id") values ('41','104');
INSERT INTO languagestate ("language_id","state_id") values ('39','38');
INSERT INTO languagestate ("language_id","state_id") values ('41','107');
INSERT INTO languagestate ("language_id","state_id") values ('48','107');
INSERT INTO languagestate ("language_id","state_id") values ('48','106');
INSERT INTO languagestate ("language_id","state_id") values ('41','106');
INSERT INTO languagestate ("language_id","state_id") values ('129','108');
INSERT INTO languagestate ("language_id","state_id") values ('48','23');
INSERT INTO languagestate ("language_id","state_id") values ('48','36');
INSERT INTO languagestate ("language_id","state_id") values ('48','35');
INSERT INTO languagestate ("language_id","state_id") values ('101','33');
INSERT INTO languagestate ("language_id","state_id") values ('41','32');
INSERT INTO languagestate ("language_id","state_id") values ('41','31');
INSERT INTO languagestate ("language_id","state_id") values ('129','30');
INSERT INTO languagestate ("language_id","state_id") values ('115','29');
INSERT INTO languagestate ("language_id","state_id") values ('41','28');
INSERT INTO languagestate ("language_id","state_id") values ('162','28');
INSERT INTO languagestate ("language_id","state_id") values ('22','27');
INSERT INTO languagestate ("language_id","state_id") values ('35','27');
INSERT INTO languagestate ("language_id","state_id") values ('141','27');
INSERT INTO languagestate ("language_id","state_id") values ('149','26');
INSERT INTO languagestate ("language_id","state_id") values ('130','26');
INSERT INTO languagestate ("language_id","state_id") values ('54','26');
INSERT INTO languagestate ("language_id","state_id") values ('13','26');
INSERT INTO languagestate ("language_id","state_id") values ('41','24');
INSERT INTO languagestate ("language_id","state_id") values ('41','21');
INSERT INTO languagestate ("language_id","state_id") values ('39','20');
INSERT INTO languagestate ("language_id","state_id") values ('48','20');
INSERT INTO languagestate ("language_id","state_id") values ('52','20');
INSERT INTO languagestate ("language_id","state_id") values ('41','18');
INSERT INTO languagestate ("language_id","state_id") values ('41','14');
INSERT INTO languagestate ("language_id","state_id") values ('14','13');
INSERT INTO languagestate ("language_id","state_id") values ('41','12');
INSERT INTO languagestate ("language_id","state_id") values ('39','11');
INSERT INTO languagestate ("language_id","state_id") values ('149','9');
INSERT INTO languagestate ("language_id","state_id") values ('41','8');
INSERT INTO languagestate ("language_id","state_id") values ('41','7');
INSERT INTO languagestate ("language_id","state_id") values ('149','7');
INSERT INTO languagestate ("language_id","state_id") values ('48','7');
INSERT INTO languagestate ("language_id","state_id") values ('134','7');
INSERT INTO languagestate ("language_id","state_id") values ('41','6');
INSERT INTO languagestate ("language_id","state_id") values ('129','5');
INSERT INTO languagestate ("language_id","state_id") values ('26','4');
INSERT INTO languagestate ("language_id","state_id") values ('41','3');
INSERT INTO languagestate ("language_id","state_id") values ('139','3');
INSERT INTO languagestate ("language_id","state_id") values ('156','233');
INSERT INTO languagestate ("language_id","state_id") values ('134','233');
INSERT INTO languagestate ("language_id","state_id") values ('38','139');
INSERT INTO languagestate ("language_id","state_id") values ('101','137');
INSERT INTO languagestate ("language_id","state_id") values ('111','161');
INSERT INTO languagestate ("language_id","state_id") values ('172','251');

CREATE TABLE IF NOT EXISTS request (
        "request_id" SERIAL PRIMARY KEY,
        "addedBy" text,
		    "editedBy" text,
		    "emailSent" bigint,
        "customer_id" integer REFERENCES customer (customer_id) ON DELETE CASCADE,
        "carriers" text[],
        "carTypes" integer[],
        "discharge" jsonb,
        "discharge_id" integer REFERENCES discharge (discharge_id) ON DELETE CASCADE,
        "dischargeDateFrom" bigint,
        "dischargeRadius"  smallint,
        "dispatchers" text[],
        "editeBy" text,
		    "loading" jsonb,
	    	"loading_id" integer REFERENCES loading (loading_id) ON DELETE CASCADE,
        "loadingDateFrom" bigint,
        "loadingDateTo" bigint,
        "loadingRadius" smallint,
        "loadingTypes" integer[],
        "number" smallint,
        "qid" varchar (100),
        "relation" varchar (100),
        "tsAdded" bigint,
        "tsEdited" bigint,
        "week"  smallint,
        "year" smallint,
        "deleted" boolean DEFAULT false NOT NULL
    );

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE TABLE IF NOT EXISTS dispatcher (
        "dispatcher_id" SERIAL PRIMARY KEY,
        "carType" text[],
        "carTypes" integer[],
        "carrier_id" integer REFERENCES carrier (carrier_id) ON DELETE CASCADE,
        "email" text,
        "emailSent" bigint,
        "firstName" text,
        "lastName" text,
        "phone" text,
        "password" text,
        "notificationEmail" boolean NOT NULL DEFAULT false,
        "notificationWhatsapp" boolean NOT NULL DEFAULT false,
        "lastRequest_id" integer REFERENCES request (request_id) ON DELETE CASCADE,
        "lastRequestTimeSent" bigint,
		    "loadingTypes" integer[],
		    "selected" boolean DEFAULT false NOT NULL,
        "deleted" boolean DEFAULT false NOT NULL,
        "language_id" integer REFERENCES language (language_id) ON DELETE CASCADE,
        "token" uuid default uuid_generate_v4()
    );

CREATE TABLE IF NOT EXISTS place (
        "place_id" SERIAL PRIMARY KEY,
        "carrier_id" integer REFERENCES carrier (carrier_id) ON DELETE CASCADE,
        "city" text,
        "country" text,
        "countryCode" text,
        "directionLoading" boolean DEFAULT false,
        "directionDischarge" boolean DEFAULT false,
        "dispatcher_id" integer REFERENCES dispatcher (dispatcher_id) ON DELETE CASCADE,
        "latitude" DECIMAL(10, 8),
        "longitude" DECIMAL(11, 8),
        "note" text,
        "postalCode" text,
        "deleted" boolean DEFAULT false NOT NULL
    );

CREATE TABLE IF NOT EXISTS vehicletype (
          "vehicleType_id" SERIAL PRIMARY KEY,          
          "type" text,
          "heightMin" DECIMAL,
          "heightMax" DECIMAL,
          "heightStep" DECIMAL,
          "lengthMin" DECIMAL,
          "lengthMax" DECIMAL,
          "lengthStep" DECIMAL,
          "capacityMin" DECIMAL,
          "capacityMax" DECIMAL,
          "capacityStep" DECIMAL
      );


INSERT INTO vehicletype ("type") values ('Dodávka');
INSERT INTO vehicletype ("type") values ('Sólo');
INSERT INTO vehicletype ("type") values ('Návěs');
INSERT INTO vehicletype ("type") values ('Souprava');

CREATE TABLE IF NOT EXISTS vehiclefeature (
          "vehicleFeature_id" SERIAL PRIMARY KEY,          
          "feature" text
      );

INSERT INTO vehiclefeature ("feature") values ('Autotransportér');
INSERT INTO vehiclefeature ("feature") values ('Plachta');
INSERT INTO vehiclefeature ("feature") values ('Skříň');
INSERT INTO vehiclefeature ("feature") values ('Chladírenská skříň');
INSERT INTO vehiclefeature ("feature") values ('Plato');
INSERT INTO vehiclefeature ("feature") values ('Mulda');
INSERT INTO vehiclefeature ("feature") values ('Sklápěč');
INSERT INTO vehiclefeature ("feature") values ('Klanice');
INSERT INTO vehiclefeature ("feature") values ('Cisterna');
INSERT INTO vehiclefeature ("feature") values ('Dvoupodplažní');
INSERT INTO vehiclefeature ("feature") values ('Čelo');
INSERT INTO vehiclefeature ("feature") values ('Ruka');
INSERT INTO vehiclefeature ("feature") values ('Posuvná podlaha');
INSERT INTO vehiclefeature ("feature") values ('ADR');
INSERT INTO vehiclefeature ("feature") values ('Vysokozdvižný vozík');
INSERT INTO vehiclefeature ("feature") values ('Průjezdná');

CREATE TABLE IF NOT EXISTS vehicletypefeature (
          "vehicleTypeFeature_id" SERIAL PRIMARY KEY,
          "vehicleFeature_id" int REFERENCES vehiclefeature ("vehicleFeature_id") ON DELETE CASCADE,
          "vehicleType_id" int REFERENCES vehicletype ("vehicleType_id") ON DELETE CASCADE      
      );

INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('1','2');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('1','3');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('1','4');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('1','11');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('1','14');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','1');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','2');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','3');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','4');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','5');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','6');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','7');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','8');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','9');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','10');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','11');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','12');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','13');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','14');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('2','15');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','1');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','2');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','3');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','4');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','5');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','6');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','7');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','8');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','9');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','10');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','11');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','12');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','13');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','14');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('3','15');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','1');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','2');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','3');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','4');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','5');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','6');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','7');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','8');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','9');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','10');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','11');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','12');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','13');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','14');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','15');
INSERT INTO vehicletypefeature ("vehicleType_id","vehicleFeature_id") values ('4','16');

CREATE TABLE IF NOT EXISTS dispatchervehicle(
          "dispatcherVehicle_id" SERIAL PRIMARY KEY,          
          "dispatcher_id" int REFERENCES dispatcher ("dispatcher_id") ON DELETE CASCADE,
          "vehicleType_id" int REFERENCES vehicleType ("vehicleType_id") ON DELETE CASCADE,
          "maxHeight" numeric,
          "maxLength" numeric,
          "maxWeight" numeric,
          "maxWidth" numeric,
          "deleted" boolean DEFAULT false NOT NULL,
          "carrier_id" int REFERENCES carrier ("carrier_id") ON DELETE CASCADE
      );

CREATE TABLE IF NOT EXISTS dispatchervehiclefeature(
          "dispatcherVehicleFeature_id" SERIAL PRIMARY KEY,          
          "dispatcherVehicle_id" int REFERENCES dispatchervehicle ("dispatcherVehicle_id") ON DELETE CASCADE,
          "vehicleFeature_id" int REFERENCES vehiclefeature ("vehicleFeature_id") ON DELETE CASCADE,
          "deleted" boolean DEFAULT false NOT NULL
      );

CREATE TABLE IF NOT EXISTS commission (
        "addedBy" text,
        "carType" smallint,
        "carTypes" int[],
        "commission_id" SERIAL PRIMARY KEY,
        "carrier_id" integer REFERENCES carrier (carrier_id),
        "carrierDriver" text,
        "carrierGsm" text,
        "carrierOrderCreatedBy" text,
        "carrierOrderSent" boolean DEFAULT false NOT NULL,
        "currencyCarrier" text,
        "currencyCustomer" text,
        "carrierNote" text,
        "carrierRegistrationPlate" text,
        "carrierVat" text,
        "carrierInvoiceNumber" text,
        "carriersTable" text[],
        "customer_id" integer REFERENCES customer (customer_id) ON DELETE SET NULL,
        "customerContact_id" integer REFERENCES customerContact ("customerContact_id"),
        "dischargeConfirmationSent" boolean DEFAULT false NOT NULL,
        "dischargeRadius" int,
        "dispatcher_id" integer REFERENCES dispatcher (dispatcher_id),
        "dispatchersTable" text[],
        "disposition" text,
        "editedBy" text,
        "enteredCarrierBy" text,
        "enteredCarrierByNumber" integer,
        "exchangeRateCarrier" DECIMAL,
        "exchangeRateCustomer" DECIMAL, 
        "loadingConfirmationSent" boolean DEFAULT false NOT NULL,
        "loadingRadius" int,
		    "loadingType" int,
		    "loadingTypes" int[],
        "note" text,
        "number" int,
        "orderConfirmationSent" boolean DEFAULT false NOT NULL,
        "oldid" text,
        "phoneNumberCarrierOrderCreatedBy" text,
        "priceCarrier" DECIMAL,
        "priceCustomer" DECIMAL,
        "qid" text,
        "relation" text,
        "state" int,
        "tsAdded" bigint,
        "tsCarrierOrderCreatedBy" bigint,
        "tsEdited" bigint,
        "tsEnteredCarrier" bigint,
        "vat" text,
        "week"  smallint,
        "year" smallint,
        "deleted" boolean DEFAULT false NOT NULL,
        "notification" boolean DEFAULT false NOT NULL
    );

CREATE TABLE IF NOT EXISTS commissionLoading (
        "commissionLoading_id" SERIAL PRIMARY KEY,
        "commission_id" int REFERENCES commission (commission_id) ON DELETE CASCADE,
        "date" bigint,
        "dateTo" bigint,
        "deleted" boolean default false NOT NULL,
        "note" text,
        "number" int,
        "loading_id" int REFERENCES loading (loading_id) ON DELETE CASCADE,
        "location_id" int REFERENCES location (location_id) ON DELETE CASCADE,
        "refNumber" text,
        "time" text,
        "year" smallint
    );

CREATE TABLE IF NOT EXISTS commissiondischarge (
        "commissionDischarge_id" SERIAL PRIMARY KEY,
		"commission_id" int REFERENCES commission (commission_id) ON DELETE CASCADE,
		"customer_id" int REFERENCES customer (customer_id) ON DELETE CASCADE,
        "city" text,
		"company" text,
		"country" text,
		"countryCode" text,
        "date" bigint,
        "dateTo" bigint,
		"deleted" boolean default false NOT NULL,
		"email" text,
		"firstName" text,
		"lastName" text,
		"phone" text,
		"note" text,
        "neutralization" boolean default false NOT NULL,
		"number" int,
		"postalCode" text,
		"street" text,
		"scrollTo" boolean default false NOT NULL,
        "discharge_id" int REFERENCES discharge (discharge_id) ON DELETE CASCADE,
        "location_id" int REFERENCES location (location_id) ON DELETE CASCADE,
        "refNumber" text,
        "time" text,
        "year" smallint
    );

CREATE TABLE IF NOT EXISTS commissionItem (
        "commissionItem_id" SERIAL PRIMARY KEY,
        "commission_id" int REFERENCES commission (commission_id) ON DELETE CASCADE,
        "commissionDischarge_id" int REFERENCES commissionDischarge ("commissionDischarge_id") ON DELETE CASCADE,
        "commissionLoading_id" int REFERENCES commissionloading ("commissionLoading_id") ON DELETE CASCADE,
        "deleted" boolean default false NOT NULL,
        "loadingMeters" decimal,
        "name" text,
        "price" decimal,
        "package" text,
        "packaging" text,
        "quantity" decimal,
        "size" text,
        "weight" decimal,
        "weightBrutto" bigint,
        "year" smallint,    
        "width" decimal,    
        "length" decimal,    
        "height" decimal    
    );

CREATE TABLE IF NOT EXISTS requestdischarge (
    "requestDischarge_id" SERIAL PRIMARY KEY,
    "city" text,
    "country" text,
    "countryCode" text,
    "latitude" DECIMAL(10, 8),
    "longitude" DECIMAL(11, 8),
    "postalCode" text,
    "request_id" integer REFERENCES request (request_id) ON DELETE CASCADE,
    "deleted" boolean DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS requestloading (
    "requestLoading_id" SERIAL PRIMARY KEY,
    "city" text,
    "country" text,
    "countryCode" text,
    "latitude" DECIMAL(10, 8),
    "longitude" DECIMAL(11, 8),
    "postalCode" text,
    "request_id" integer REFERENCES request (request_id) ON DELETE CASCADE,
    "deleted" boolean DEFAULT false NOT NULL
);

ALTER TABLE "dispatcher"
    DROP "carType",
    DROP "carTypes",
    DROP "loadingTypes";
    COMMENT ON TABLE "dispatcher" IS '';
    
ALTER TABLE "commission"
    DROP "carType",
    DROP "carTypes",
    DROP "loadingTypes", 
    DROP "loadingType";

CREATE OR REPLACE FUNCTION count_provison( rate_carrier DECIMAL, price_carrier DECIMAL, rate_customer DECIMAL, price_customer DECIMAL) 
  RETURNS DECIMAL AS $$
  DECLARE
  result DECIMAL;   
  rate_carrier DECIMAL = rate_carrier;
  rate_customer DECIMAL = rate_customer;
  BEGIN
  IF rate_carrier ISNULL THEN rate_carrier = 1; ELSE rate_carrier = rate_carrier; END IF;
  IF rate_customer ISNULL THEN rate_customer = 1; ELSE rate_customer = rate_customer; END IF;
  IF price_customer ISNULL THEN price_customer = 0; ELSE price_customer = price_customer; END IF;
  IF price_carrier ISNULL THEN price_carrier = 0; ELSE price_carrier = price_carrier; END IF;
  result = rate_customer * price_customer - rate_carrier * price_carrier;       
  RETURN result;                               
  END   
  $$ LANGUAGE plpgsql;

  CREATE OR REPLACE FUNCTION distance(lat1 FLOAT, lon1 FLOAT, lat2 FLOAT, lon2 FLOAT) RETURNS FLOAT AS $$
  DECLARE                                                   
      x float = 69.1 * (lat2 - lat1);                           
      y float = 69.1 * (lon2 - lon1) * cos(lat1 / 57.3);        
  BEGIN                                                     
      RETURN sqrt(x * x + y * y);                               
  END  
  $$ LANGUAGE plpgsql;

    
    CREATE TABLE "invoice" (
        "invoice_id" serial PRIMARY KEY,
        "commission_id" int REFERENCES commission ("commission_id") ON DELETE CASCADE,
        "user_id" int REFERENCES users ("user_id"),
        "constantSymbol" text,
        "orderNumber" text,
        "orderDate" bigint,
        "issueDate" bigint,
        "dueDate" bigint,
        "pointDate" bigint,
        "paymentMethod" text,
        "text" text,
        "language" text
        );

    ALTER TABLE "invoice"
    ADD "invoiceSent" boolean NOT NULL DEFAULT false;
    COMMENT ON TABLE "invoice" IS '';
        
    ALTER TABLE "invoice"
    ADD "paid" boolean NOT NULL DEFAULT false;
    COMMENT ON TABLE "invoice" IS '';
        
    ALTER TABLE "invoice"
    ADD "invoiceNumber" integer NULL;
    COMMENT ON TABLE "invoice" IS '';
        
    ALTER TABLE "invoice"
    ADD "valueAddedTax" integer NULL;
    COMMENT ON TABLE "invoice" IS '';

    ALTER TABLE "invoice"
    ADD "exported" BOOLEAN NOT NULL DEFAULT FALSE;

    ALTER TABLE "customer"
    ADD "defaultDueDate" integer NULL;
    COMMENT ON TABLE "customer" IS '';

    ALTER TABLE "commission"
    ADD "orderDate" bigint NULL,
    ADD "orderNumber" text NULL;
    COMMENT ON TABLE "commission" IS '';

    ALTER TABLE "invoice"
    ADD "canceled" boolean NOT NULL DEFAULT false;
    COMMENT ON TABLE "invoice" IS '';
            
    ALTER TABLE "invoice"
    DROP "orderNumber",
    DROP "orderDate";
    COMMENT ON TABLE "invoice" IS '';
           
    ALTER TABLE "invoice"
    ADD "reverseCharge" boolean NOT NULL DEFAULT false;
    COMMENT ON TABLE "invoice" IS '';

    ALTER TABLE "state"
    ADD "inEU" boolean NULL;
    COMMENT ON TABLE "state" IS '';

    UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Belgie%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Bul%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Dán%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Esto%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Fin%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Fran%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Chorv%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Irsk%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Itál%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Kyp%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Lit%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Lot%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Lucem%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Maďarsko%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Malta%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Něme%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Nizo%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Pol%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Portu%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Rakou%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Rumun%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Řeck%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Sloven%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Slovin%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Španěl%';
UPDATE "state" SET "inEU" = '1' WHERE "name" LIKE '%Švédsk%';


ALTER TABLE "invoice"
ALTER "invoiceNumber" TYPE bigint,
ALTER "invoiceNumber"
DROP DEFAULT,
ALTER "invoiceNumber"
DROP NOT NULL;
COMMENT ON COLUMN "invoice"."invoiceNumber" IS '';
COMMENT ON TABLE "invoice" IS '';
ALTER TABLE "invoice" ADD "deleted" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "commission"
    ADD "invoice_id" integer NULL;
    COMMENT ON TABLE "commission" IS '';
    ALTER TABLE "commission"
    ADD FOREIGN KEY ("invoice_id") REFERENCES "invoice" ("invoice_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    ALTER TABLE "invoice"
    DROP CONSTRAINT "invoice_commission_id_fkey";
    ALTER TABLE "invoice"
    DROP "commission_id"; 
    
    CREATE OR REPLACE VIEW "carrier_onboarding"
    AS
    SELECT carrier.carrier_id,
       carrier."addedBy",
       carrier.city,
       carrier.company,
       carrier."companyRegistrationNumber",
       carrier.country,
       carrier."countryCode",
       carrier."editedBy",
       carrier.note,
       carrier.email,
       carrier."firstName",
       carrier."lastName",
       carrier.phone,
       carrier.place,
       carrier."postalCode",
       carrier.qid,
       carrier.number,
       carrier.street,
       carrier."taxId",
       carrier.ts_edited,
       carrier.ts_added,
       carrier.deleted,
       dispatcher.dispatcher_id,
       dispatcher.email AS "dispatcherEmail",
       dispatcher."firstName" AS "dispatcherFirstName",
       dispatcher."lastName" AS "dispatcherLastName",
       dispatcher.phone AS "dispatcherPhone",
       ( SELECT count(fo.dispatcher_id)::integer AS count
              FROM dispatcher fo
                LEFT JOIN onboardingtoken o ON o.dispatcher_id = fo.dispatcher_id
             WHERE fo.carrier_id = carrier.carrier_id AND fo.deleted = false AND fo.password IS NULL AND o.onboardingtoken_id IS NULL) AS dispatchersunregistered,
       ( SELECT count(fo.dispatcher_id)::integer AS count
              FROM dispatcher fo
             WHERE fo.carrier_id = carrier.carrier_id AND fo.deleted = false AND fo.password IS NOT NULL) AS dispatchersregistered,
       ( SELECT count(o.dispatcher_id)::integer AS count
              FROM ( SELECT DISTINCT ON (fo.dispatcher_id) fo.dispatcher_id
                      FROM dispatcher fo
                        JOIN onboardingtoken o_1 ON o_1.dispatcher_id = fo.dispatcher_id
                     WHERE fo.carrier_id = carrier.carrier_id AND fo.password IS NULL AND fo.deleted = false) o) AS dispatcherspending
      FROM carrier
        LEFT JOIN dispatcher dispatcher ON carrier.carrier_id = dispatcher.carrier_id;

CREATE OR REPLACE VIEW "complete_commission" AS
SELECT co.commission_id,
    co.relation,
    co.invoice_id,
    co."currencyCustomer" AS currency,
    co.week,
    co.number,
    co.year,
    co.oldid,
    co.carrier_id,
    co.note,
    co."addedBy",
    co.state,
    co.deleted,
    co."enteredCarrierBy",
    co.vat,
    co.qid,
    co."carrierVat",
    co."carrierInvoiceNumber",
    co."carrierOrderSent",
    co."loadingConfirmationSent",
    co."dischargeConfirmationSent",
    co."orderConfirmationSent",
    cu.company AS customer_company,
    cu.customer_id,
    ca.company AS carrier_company,
    co."exchangeRateCarrier",
    co."priceCarrier" AS "priceCarrierOriginal",
    co."priceCustomer" AS "priceCustomerOriginal",
        CASE
            WHEN co."exchangeRateCarrier" IS NULL THEN co."priceCarrier"
            ELSE co."exchangeRateCarrier" * co."priceCarrier"
        END AS "priceCarrier",
    co."exchangeRateCustomer",
        CASE
            WHEN co."exchangeRateCustomer" IS NULL THEN co."priceCustomer"
            ELSE co."exchangeRateCustomer" * co."priceCustomer"
        END AS "priceCustomer",
        CASE
            WHEN co."priceCarrier" IS NULL AND co."priceCustomer" IS NULL THEN NULL::numeric
            ELSE count_provison(co."exchangeRateCarrier", co."priceCarrier", co."exchangeRateCustomer", co."priceCustomer")
        END AS provision,
    ci.total_weight,
    ci.total_loading_meters,
    cl.loading_date,
    ( SELECT array_agg(location.city) AS array_agg
           FROM location
          WHERE location.location_id = ANY (cl.loading_ids)) AS loading_city,
    ( SELECT array_agg(location."postalCode") AS array_agg
           FROM location
          WHERE location.location_id = ANY (cl.loading_ids)) AS loading_zip,
    ( SELECT string_agg(location.city, '; '::text) AS string_agg
           FROM location
          WHERE location.location_id = ANY (cl.loading_ids)) AS loading_city_string,
    ( SELECT string_agg(location."postalCode", '; '::text) AS string_agg
           FROM location
          WHERE location.location_id = ANY (cl.loading_ids)) AS loading_zip_string,
    cd.discharge_date,
    ( SELECT array_agg(location.city) AS array_agg
           FROM location
          WHERE location.location_id = ANY (cd.discharge_ids)) AS discharge_city,
    ( SELECT array_agg(location."postalCode") AS array_agg
           FROM location
          WHERE location.location_id = ANY (cd.discharge_ids)) AS discharge_zip,
    ( SELECT string_agg(location.city, '; '::text) AS string_agg
           FROM location
          WHERE location.location_id = ANY (cd.discharge_ids)) AS discharge_city_string,
    ( SELECT string_agg(location."postalCode", '; '::text) AS string_agg
           FROM location
          WHERE location.location_id = ANY (cd.discharge_ids)) AS discharge_zip_string,
    ( SELECT invoice."invoiceNumber"
           FROM invoice
          WHERE invoice.invoice_id = co.invoice_id) AS "invNumber",
    co.notification,
    co."orderDate",
    co."orderNumber",
    co."currencyCarrier"
   FROM commission co
     LEFT JOIN carrier ca ON co.carrier_id = ca.carrier_id
     LEFT JOIN customer cu ON co.customer_id = cu.customer_id
     LEFT JOIN ( SELECT commissionloading.commission_id,
            array_agg(commissionloading.date) AS loading_date,
            array_agg(commissionloading.location_id) AS loading_ids
           FROM commissionloading
           WHERE commissionloading.deleted = false
          GROUP BY commissionloading.commission_id) cl ON co.commission_id = cl.commission_id
     LEFT JOIN ( SELECT commissiondischarge.commission_id,
            array_agg(commissiondischarge.date) AS discharge_date,
            array_agg(commissiondischarge.location_id) AS discharge_ids
           FROM commissiondischarge
           WHERE commissiondischarge.deleted = false
          GROUP BY commissiondischarge.commission_id) cd ON co.commission_id = cd.commission_id
     LEFT JOIN ( SELECT commissionitem.commission_id,
            sum(commissionitem.weight) AS total_weight,
            sum(commissionitem."loadingMeters") AS total_loading_meters
           FROM commissionitem
          WHERE commissionitem.deleted = false
          GROUP BY commissionitem.commission_id) ci ON co.commission_id = ci.commission_id;

CREATE OR REPLACE VIEW "complete_invoice" AS
SELECT invoice.invoice_id,
    invoice."issueDate",
    invoice."dueDate",
    invoice."invoiceSent",
    invoice.exported,
    invoice.canceled,
    invoice."constantSymbol",
    invoice.deleted,
    invoice."invoiceNumber",
    invoice.language,
    invoice.paid,
    invoice."paymentMethod",
    invoice."pointDate",
    invoice."reverseCharge",
    invoice.text,
    invoice."valueAddedTax",
    customer.customer_id,
    customer.company AS customer_company,
    customer."companyRegistrationNumber",
    complete_commission.currency,
    count(complete_commission.commission_id)::integer AS "totalCommissions",
    sum(complete_commission."priceCustomerOriginal")::integer AS "totalPrice",
        CASE
            WHEN count(complete_commission.commission_id) > 0 THEN json_agg(json_build_object('commission_id', complete_commission.commission_id, 'commissionNumber', complete_commission.number, 'currencyCustomer', complete_commission.currency, 'customer_company', customer.company, 'discharge_date', complete_commission.discharge_date, 'discharge_city_string', complete_commission.discharge_city_string, 'discharge_city', complete_commission.discharge_city, 'exchangeRateCarrier', complete_commission."exchangeRateCarrier", 'exchangeRateCustomer', complete_commission."exchangeRateCustomer", 'loading_date', complete_commission.loading_date, 'loading_city_string', complete_commission.loading_city_string, 'loading_city', complete_commission.loading_city, 'orderDate', complete_commission."orderDate"::text, 'orderSource', complete_commission."orderNumber", 'priceCustomer', complete_commission."priceCustomerOriginal", 'place', customer.place, 'qid', complete_commission.qid, 'relation', complete_commission.relation, 'vat', complete_commission.vat))
            ELSE '[]'::json
        END AS commission,
    ( SELECT json_agg(json_build_object('email', customercontact.email)) AS json_agg
           FROM customercontact
          WHERE customercontact.customer_id = customer.customer_id) AS customercontact
   FROM invoice
     LEFT JOIN complete_commission ON invoice.invoice_id = complete_commission.invoice_id
     LEFT JOIN customer ON complete_commission.customer_id = customer.customer_id
  GROUP BY invoice.invoice_id, invoice."issueDate", invoice."dueDate", invoice."invoiceSent", invoice.exported, invoice.canceled, invoice."constantSymbol", invoice.deleted, invoice."invoiceNumber", invoice.language, invoice.paid, invoice."paymentMethod", invoice."pointDate", invoice."reverseCharge", invoice.text, invoice."valueAddedTax", customer.customer_id, customer.company, customer."companyRegistrationNumber", complete_commission.currency;`;
