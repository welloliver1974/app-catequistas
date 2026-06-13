import { prisma } from "@/lib/prisma"
import { TelefonesClient } from "./client"

export const dynamic = "force-dynamic"

export default async function TelefonesPage() {
  const semTelefone = await prisma.catequista.findMany({
    where: { telefone: null },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  })

  const comTelefone = await prisma.catequista.findMany({
    where: { telefone: { not: null } },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, telefone: true },
  })

  return <TelefonesClient semTelefone={semTelefone} comTelefone={comTelefone as { id: string; nome: string; telefone: string }[]} />
}
