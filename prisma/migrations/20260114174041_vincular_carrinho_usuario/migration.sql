/*
  Warnings:

  - You are about to drop the column `clienteId` on the `Carrinho` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[usuarioId]` on the table `Carrinho` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usuarioId` to the `Carrinho` table without a default value. This is not possible if the table is not empty.

*/

-- Primeiro, deletar carrinhos órfãos (sem usuário associado)
DELETE FROM "Carrinho" WHERE "clienteId" NOT IN (SELECT "email" FROM "Usuario");

-- Adicionar coluna temporária
ALTER TABLE "Carrinho" ADD COLUMN "usuarioId" INTEGER;

-- Vincular carrinhos existentes aos usuários pelo email
UPDATE "Carrinho" 
SET "usuarioId" = "Usuario"."id" 
FROM "Usuario" 
WHERE "Carrinho"."clienteId" = "Usuario"."email";

-- Deletar carrinhos que não puderam ser vinculados
DELETE FROM "Carrinho" WHERE "usuarioId" IS NULL;

-- Tornar a coluna obrigatória
ALTER TABLE "Carrinho" ALTER COLUMN "usuarioId" SET NOT NULL;

-- DropIndex
DROP INDEX "Carrinho_clienteId_key";

-- Remover coluna antiga
ALTER TABLE "Carrinho" DROP COLUMN "clienteId";

-- CreateIndex
CREATE UNIQUE INDEX "Carrinho_usuarioId_key" ON "Carrinho"("usuarioId");

-- AddForeignKey
ALTER TABLE "Carrinho" ADD CONSTRAINT "Carrinho_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
