import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { PresencaAdminClient } from "./client"
import { redirect } from "next/navigation"
import { inicioDoDiaBrasilia } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function PresencaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const cookieStore = await cookies()
  const userId = cookieStore.get("session")?.value
  if (!userId) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, role: true },
  })
  if (!user) redirect("/login")

  // Todos os encontros em ordem cronológica para o admin escolher qualquer
  // encontro (inclusive passados) e lançar a frequência retroativamente.
  const encontros = await prisma.encontro.findMany({
    // Mesma ordenação da lista de encontros: pelo Nº, sem número vai pro fim.
    orderBy: [{ numeroEncontro: { sort: "asc", nulls: "last" } }, { data: "asc" }],
    select: { id: true, tema: true, data: true, numeroEncontro: true },
  })

  // Resolve o encontro exibido: ?encontro=<id> específico (vindo do seletor),
  // ou o automático (próximo futuro; se não houver, o mais recente).
  const { encontro: encontroParam } = await searchParams
  const encontroParamStr = typeof encontroParam === "string" ? encontroParam : ""

  let encontro = encontroParamStr
    ? await prisma.encontro.findUnique({
        where: { id: encontroParamStr },
        include: { turma: { select: { nome: true } } },
      })
    : null

  const selecionado = encontro !== null
  // Id inválido/removido: normaliza a URL para que UI e URL nunca divirjam.
  if (encontroParamStr && !encontro) redirect("/presenca")

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

  const dataPassada = !!encontro && encontro.data.getTime() < inicioDoDiaBrasilia().getTime()

  let presencas: { catequistaId: string; presente: boolean; justificativa: string | null }[] = []
  let catequistas: { id: string; nome: string; telefone: string | null }[] = []

  if (encontro) {
    presencas = await prisma.registroPresenca.findMany({
      where: { encontroId: encontro.id },
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
      encontro={encontro ? {
        id: encontro.id,
        tema: encontro.tema,
        data: encontro.data.toISOString(),
        local: encontro.local ?? "",
        linkPdf: encontro.linkPdf ?? "",
        turma: encontro.turma.nome,
        numeroEncontro: encontro.numeroEncontro,
        selecionado,
        dataPassada,
      } : null}
      encontroSelecionadoId={selecionado && encontro ? encontro.id : "auto"}
      encontros={encontros.map((e) => ({
        id: e.id,
        data: e.data.toISOString(),
        tema: e.tema,
        numeroEncontro: e.numeroEncontro,
      }))}
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
