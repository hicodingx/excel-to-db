-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "matricule" TEXT,
    "nom" TEXT,
    "prenom" TEXT,
    "date_de_naissance" TEXT,
    "status" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
