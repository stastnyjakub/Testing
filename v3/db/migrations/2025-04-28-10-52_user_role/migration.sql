CREATE SEQUENCE IF NOT EXISTS public."User_user_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

ALTER SEQUENCE public."User_user_id_seq" OWNER TO postgres;

-- CreateTable
CREATE TABLE "User" (
    "user_id" integer NOT NULL DEFAULT nextval('"User_user_id_seq"' :: regclass),
    "number" SMALLINT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "profilePicture" TEXT,
    "tsAdded" BIGINT NOT NULL,
    "tsLastLogin" BIGINT,
    "tsDeleted" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

CREATE SEQUENCE IF NOT EXISTS public."UserRole_userRole_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

ALTER SEQUENCE public."UserRole_userRole_id_seq" OWNER TO postgres;

-- CreateTable
CREATE TABLE "UserRole" (
    "userRole_id" integer NOT NULL DEFAULT nextval('"UserRole_userRole_id_seq"' :: regclass),
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userRole_id")
);

CREATE SEQUENCE IF NOT EXISTS public."Role_role_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

ALTER SEQUENCE public."Role_role_id_seq" OWNER TO postgres;

-- CreateTable
CREATE TABLE "Role" (
    "role_id" integer NOT NULL DEFAULT nextval('"Role_role_id_seq"' :: regclass),
    "name" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

CREATE SEQUENCE IF NOT EXISTS public."ContactInfo_contactInfo_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

ALTER SEQUENCE public."ContactInfo_contactInfo_id_seq" OWNER TO postgres;

-- CreateTable
CREATE TABLE "ContactInfo" (
    "contactInfo_id" integer NOT NULL DEFAULT nextval('"ContactInfo_contactInfo_id_seq"' :: regclass),
    "email" TEXT,
    "phone" TEXT,
    "note" TEXT,
    "tsAdded" BIGINT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("contactInfo_id")
    CONSTRAINT "Carrier_language_id_fkey" FOREIGN KEY ("language_id")
        REFERENCES public."language" (language_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ContactInfo_user_id_key" ON "ContactInfo"("user_id");

-- AddForeignKey
ALTER TABLE
    "UserRole"
ADD
    CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "ContactInfo"
ADD
    CONSTRAINT "ContactInfo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "UserRole"
ADD
    CONSTRAINT "UserRole_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Copy data from old users table to new User table
INSERT INTO
    public."User" (
        user_id,
        number,
        name,
        surname,
        email,
        "passwordHash",
        deleted,
        "tsAdded"
    )
SELECT
    user_id,
    "number",
    name,
    surname,
    email,
    password,
    -- assuming old password field already stores the hashed password
    deleted,
    floor(
        extract(
            epoch
            from
                now()
        )
    )
FROM
    public."users";

INSERT INTO
    public."ContactInfo" (
        phone,
        "tsAdded",
        user_id,
        language_id
    )
SELECT
    "mobilePhone",
    floor(
        extract(
            epoch
            from
                now()
        )
    ),
    user_id,
    36
FROM
    public."users";

INSERT INTO
    public."Role" (
        name
    )
VALUES
    ('system'),
    ('admin'),
    ('qaplineEmployee'),
    ('dispatcherOwner'),
    ('dispatcher'),
    ('attachmentsUploader'),
    ('onboardingUser'),
    ('apiKeyEnquiryForm'),
    ('apiKeyAdmin'),
    ('apiKeyJobCaller'),
    ('customer'),
    ('customerOwner');

INSERT INTO
    public."UserRole" (
        user_id,
        role_id
    )
SELECT
    user_id,
    3
FROM 
    public."User"
WHERE user_id < 1000;