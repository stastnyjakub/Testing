CREATE TYPE public."CronState" AS ENUM ('NEW', 'DONE', 'ERROR');

ALTER TYPE public."CronState" OWNER TO postgres;

ALTER TABLE
    IF EXISTS public."CommissionPriceEstimation"
ADD
    COLUMN "cronState" "CronState" NOT NULL DEFAULT 'NEW';