BEGIN;

ALTER TABLE
    customer
ADD
    COLUMN "tsAdded" BIGINT;

UPDATE
    customer
SET
    "tsAdded" = ts_added;

ALTER TABLE
    customer DROP COLUMN ts_added;

UPDATE
    customer
SET
    "tsAdded" = "tsAdded" / 1000;

COMMIT;