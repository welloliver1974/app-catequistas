import { prisma } from "@/lib/prisma"
import { PresencaPublicaClient } from "./client"
import { inicioDoDiaBrasilia } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function PresencaConfirmarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const catequistas = await prisma.catequista.findMany({
    where: { status: "ATIVO" },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  })

  // Se o link trouxer ?encontro=<id> (QR/WhatsApp do painel admin), mostra
  // exatamente esse encontro — inclusive passados, para confirmação retroativa.
  const { encontro: encontroParam } = await searchParams
  const encontroParamStr = typeof encontroParam === "string" ? encontroParam : ""

  let encontro = encontroParamStr
    ? await prisma.encontro.findUnique({
        where: { id: encontroParamStr },
        include: { turma: { select: { nome: true } } },
      })
    : null

  const viaParametro = encontro !== null

  // Fallback: sem parâmetro (ou id inválido/removido) → próximo encontro a
  // partir da meia-noite de hoje no horário de Brasília; se não houver, o
  // mais recente.
  if (!encontro) {
    encontro = await prisma.encontro.findFirst({
      where: { data: { gte: inicioDoDiaBrasilia() } },
      orderBy: { data: "asc" },
      include: { turma: { select: { nome: true } } },
    })
    if (!encontro) {
      encontro = await prisma.encontro.findFirst({
        orderBy: { data: "desc" },
        include: { turma: { select: { nome: true } } },
      })
    }
  }

  return <PresencaPublicaClient catequistas={catequistas} encontro={encontro} viaParametro={viaParametro} />
}
