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
ADD "exported" BOOLEAN NOT NULL DEFAULT FALSE;
