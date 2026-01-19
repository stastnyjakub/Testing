CREATE SEQUENCE IF NOT EXISTS public."VehicleType_vehicleType_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
CREATE TABLE IF NOT EXISTS public."VehicleType" (
    "vehicleType_id" integer NOT NULL DEFAULT nextval('"VehicleType_vehicleType_id_seq"'::regclass),
    "name" text NOT NULL,
    CONSTRAINT "VehicleType_pkey" PRIMARY KEY ("vehicleType_id")
);
ALTER TABLE public."VehicleType" OWNER TO postgres;
ALTER SEQUENCE public."VehicleType_vehicleType_id_seq" OWNED BY public."VehicleType"."vehicleType_id";
ALTER SEQUENCE public."VehicleType_vehicleType_id_seq" OWNER TO postgres;

CREATE SEQUENCE IF NOT EXISTS public."Vehicle_vehicle_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
CREATE TABLE IF NOT EXISTS public."Vehicle" (
    "vehicle_id" integer NOT NULL DEFAULT nextval('"Vehicle_vehicle_id_seq"'::regclass),
    "dispatcher_id" integer NOT NULL,
    "vehicleType_id" integer NOT NULL,
    "maxHeight" numeric,
    "maxLength" numeric,
    "maxWeight" numeric,
    "maxWidth" numeric,
    "deleted" boolean NOT NULL DEFAULT false,
    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("vehicle_id"),
    CONSTRAINT "Vehicle_dispatcher_id_fkey" FOREIGN KEY ("dispatcher_id") REFERENCES public."Dispatcher" ("dispatcher_id") ON UPDATE NO ACTION ON DELETE CASCADE,
    CONSTRAINT "Vehicle_vehicleType_id_fkey" FOREIGN KEY ("vehicleType_id") REFERENCES public."VehicleType" ("vehicleType_id") ON UPDATE NO ACTION ON DELETE CASCADE
);
ALTER TABLE public."Vehicle" OWNER TO postgres;
ALTER SEQUENCE public."Vehicle_vehicle_id_seq" OWNED BY public."Vehicle"."vehicle_id";
ALTER SEQUENCE public."Vehicle_vehicle_id_seq" OWNER TO postgres;

CREATE SEQUENCE IF NOT EXISTS public."VehicleFeature_vehicleFeature_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
CREATE TABLE IF NOT EXISTS public."VehicleFeature" (
    "vehicleFeature_id" integer NOT NULL DEFAULT nextval('"VehicleFeature_vehicleFeature_id_seq"'::regclass),
    "name" text NOT NULL,
    CONSTRAINT "VehicleFeature_pkey" PRIMARY KEY ("vehicleFeature_id")
);
ALTER TABLE public."VehicleFeature" OWNER TO postgres;
ALTER SEQUENCE public."VehicleFeature_vehicleFeature_id_seq" OWNED BY public."VehicleFeature"."vehicleFeature_id";
ALTER SEQUENCE public."VehicleFeature_vehicleFeature_id_seq" OWNER TO postgres;

CREATE SEQUENCE IF NOT EXISTS public."VehicleVehicleFeature_vehicleVehicleFeature_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
CREATE TABLE IF NOT EXISTS public."VehicleVehicleFeature" (
    "vehicleVehicleFeature_id" integer NOT NULL DEFAULT nextval('"VehicleVehicleFeature_vehicleVehicleFeature_id_seq"'::regclass),
    "dispatcherVehicle_id" integer NOT NULL,
    "vehicleFeature_id" integer NOT NULL,
    CONSTRAINT "VehicleVehicleFeature_pkey" PRIMARY KEY ("vehicleVehicleFeature_id"),
    CONSTRAINT "VehicleVehicleFeature_vehicle_fkey" FOREIGN KEY ("dispatcherVehicle_id") REFERENCES public."Vehicle" ("vehicle_id") ON UPDATE NO ACTION ON DELETE CASCADE,
    CONSTRAINT "VehicleVehicleFeature_feature_fkey" FOREIGN KEY ("vehicleFeature_id") REFERENCES public."VehicleFeature" ("vehicleFeature_id") ON UPDATE NO ACTION ON DELETE CASCADE
);
ALTER TABLE public."VehicleVehicleFeature" OWNER TO postgres;
ALTER SEQUENCE public."VehicleVehicleFeature_vehicleVehicleFeature_id_seq" OWNED BY public."VehicleVehicleFeature"."vehicleVehicleFeature_id";
ALTER SEQUENCE public."VehicleVehicleFeature_vehicleVehicleFeature_id_seq" OWNER TO postgres;


CREATE SEQUENCE IF NOT EXISTS public."VehicleTypeVehicleFeature_vehicleTypeVehicleFeature_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
CREATE TABLE IF NOT EXISTS public."VehicleTypeVehicleFeature" (
    "vehicleTypeVehicleFeature_id" integer NOT NULL DEFAULT nextval('"VehicleTypeVehicleFeature_vehicleTypeVehicleFeature_id_seq"'::regclass),
    "vehicleFeature_id" integer NOT NULL,
    "vehicleType_id" integer NOT NULL,
    CONSTRAINT "VehicleTypeVehicleFeature_pkey" PRIMARY KEY ("vehicleTypeVehicleFeature_id"),
    CONSTRAINT "VehicleTypeVehicleFeature_feature_fkey" FOREIGN KEY ("vehicleFeature_id") REFERENCES public."VehicleFeature" ("vehicleFeature_id") ON UPDATE NO ACTION ON DELETE CASCADE,
    CONSTRAINT "VehicleTypeVehicleFeature_type_fkey" FOREIGN KEY ("vehicleType_id") REFERENCES public."VehicleType" ("vehicleType_id") ON UPDATE NO ACTION ON DELETE CASCADE
);
ALTER TABLE public."VehicleTypeVehicleFeature" OWNER TO postgres;
ALTER SEQUENCE public."VehicleTypeVehicleFeature_vehicleTypeVehicleFeature_id_seq" OWNED BY public."VehicleTypeVehicleFeature"."vehicleTypeVehicleFeature_id";
ALTER SEQUENCE public."VehicleTypeVehicleFeature_vehicleTypeVehicleFeature_id_seq" OWNER TO postgres;


-- Vehicle Type
INSERT INTO public."VehicleType" ("vehicleType_id", name)
SELECT
    vt."vehicleType_id",
    vt.type as name
FROM
    public."vehicletype" vt;

-- Vehicle Features
INSERT INTO public."VehicleFeature" ("vehicleFeature_id", "name")
SELECT
    vf."vehicleFeature_id",
    vf.feature as "name"
FROM
    public."vehiclefeature" vf;

-- Vehicle Type Features
INSERT INTO public."VehicleTypeVehicleFeature" ("vehicleFeature_id", "vehicleType_id")
SELECT
    vt."vehicleFeature_id",
    vt."vehicleType_id"
FROM
    public."vehicletypefeature" vt;

-- Vehicles
INSERT INTO public."Vehicle" (
    "dispatcher_id",
    "vehicleType_id",
    "maxHeight",
    "maxLength",
    "maxWeight",
    "maxWidth",
    "deleted"
)
SELECT
    v."dispatcher_id",
    v."vehicleType_id",
    v."maxHeight",
    v."maxLength",
    v."maxWeight",
    v."maxWidth",
    v.deleted
FROM
    public."dispatchervehicle" v
where v.dispatcher_id in (
    SELECT
        d."dispatcher_id"
    FROM
        public."Dispatcher" d
    WHERE
        d.deleted = false
);

-- Vehicle Features for Vehicles
INSERT INTO public."VehicleVehicleFeature" (
    "dispatcherVehicle_id",
    "vehicleFeature_id"
)
SELECT
    vvf."dispatcherVehicle_id",
    vvf."vehicleFeature_id"
FROM
    public."dispatchervehiclefeature" vvf
where vvf."dispatcherVehicle_id" in (
    SELECT
        v."vehicle_id"
    FROM
        public."Vehicle" v
);