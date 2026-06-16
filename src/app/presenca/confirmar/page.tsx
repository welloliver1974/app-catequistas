import { prisma } from "@/lib/prisma"
import { PresencaPublicaClient } from "./client"
import { inicioDoDiaBrasilia } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function PresencaConfirmarPage() {
  const catequistas = await prisma.catequista.findMany({
    where: { status: "ATIVO" },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  })

  // Busca encontro a partir da meia-noite de hoje no horário de Brasília.
  // Isso garante que o encontro do dia fique visível mesmo às 22h/23h,
  // quando catequistas registram presença após o encontro terminar.
  let encontro = await prisma.encontro.findFirst({
    where: { data: { gte: inicioDoDiaBrasilia() } },
    orderBy: { data: "asc" },
    include: { turma: { select: { nome: true } } },
  })

  // Fallback: se não há encontro hoje nem futuro, mostra o mais recente
  if (!encontro) {
    encontro = await prisma.encontro.findFirst({
      orderBy: { data: "desc" },
      include: { turma: { select: { nome: true } } },
    })
  }

  return <PresencaPublicaClient catequistas={catequistas} encontro={encontro} />
}
