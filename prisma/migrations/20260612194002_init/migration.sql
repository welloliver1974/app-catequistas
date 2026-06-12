-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CATEQUISTA',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Catequista" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "dataEntrada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataSaida" DATETIME,
    "observacoes" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Catequista_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Turma" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TurmaCatequista" (
    "catequistaId" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,

    PRIMARY KEY ("catequistaId", "turmaId"),
    CONSTRAINT "TurmaCatequista_catequistaId_fkey" FOREIGN KEY ("catequistaId") REFERENCES "Catequista" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TurmaCatequista_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Encontro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "turmaId" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "tema" TEXT NOT NULL,
    "local" TEXT,
    "linkPdf" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Encontro_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegistroPresenca" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "encontroId" TEXT NOT NULL,
    "catequistaId" TEXT NOT NULL,
    "presente" BOOLEAN NOT NULL DEFAULT true,
    "justificativa" TEXT,
    "confirmadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegistroPresenca_encontroId_fkey" FOREIGN KEY ("encontroId") REFERENCES "Encontro" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RegistroPresenca_catequistaId_fkey" FOREIGN KEY ("catequistaId") REFERENCES "Catequista" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Catequista_email_key" ON "Catequista"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Catequista_userId_key" ON "Catequista"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroPresenca_encontroId_catequistaId_key" ON "RegistroPresenca"("encontroId", "catequistaId");
