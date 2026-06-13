import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { PresencaAdminClient } from "./client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function PresencaPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("session")?.value
  if (!userId) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, role: true },
  })
  if (!user) redirect("/login")

  const proximoEncontro = await prisma.encontro.findFirst({
    where: { data: { gte: new Date() } },
    orderBy: { data: "asc" },
    include: { turma: { select: { nome: true } } },
  })

  let presencas: { catequistaId: string; presente: boolean; justificativa: string | null }[] = []
  let catequistas: { id: string; nome: string; telefone: string | null }[] = []

  if (proximoEncontro) {
    presencas = await prisma.registroPresenca.findMany({
      where: { encontroId: proximoEncontro.id },
      select: { catequistaId: true, presente: true, justificativa: true },
    })

    catequistas = await prisma.catequista.findMany({
      where: { status: "ATIVO" },
      select: { id: true, nome: true, telefone: true },
      orderBy: { nome: "asc" },
    })
  }

  const presencaMap = new Map(presencas.map((p) => [p.catequistaId, p]))
  const total = catequistas.length
  let confirmados = 0
  let ausentes = 0

  for (const p of presencas) {
    if (p.presente) confirmados++
    else ausentes++
  }

  const pendentes = total - confirmados - ausentes

  return (
    <PresencaAdminClient
      user={{ name: user.name ?? "Admin" }}
      proximoEncontro={proximoEncontro ? {
        id: proximoEncontro.id,
        tema: proximoEncontro.tema,
        data: proximoEncontro.data.toISOString(),
        local: proximoEncontro.local ?? "",
        linkPdf: proximoEncontro.linkPdf ?? "",
        turma: proximoEncontro.turma.nome,
      } : null}
      catequistas={catequistas.map((c) => ({
        id: c.id,
        nome: c.nome,
        telefone: c.telefone ?? "",
        presente: presencaMap.get(c.id)?.presente ?? null,
        justificativa: presencaMap.get(c.id)?.justificativa ?? null,
      }))}
      stats={{ total, confirmados, ausentes, pendentes }}
    />
  )
}
