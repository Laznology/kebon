-- CreateTable
CREATE TABLE "public"."AppSettings" (
    "id" SERIAL NOT NULL,
    "allowRegister" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);
