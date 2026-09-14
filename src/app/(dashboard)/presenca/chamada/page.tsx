import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { ChamadaOfflineClient } from "./client"
import { redirect } from "next/navigation"
import { inicioDoDiaBrasilia } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function ChamadaOfflinePage({
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

  const encontros = await prisma.encontro.findMany({
    orderBy: [{ numeroEncontro: { sort: "asc", nulls: "last" } }, { data: "asc" }],
    select: { id: true, tema: true, data: true, numeroEncontro: true },
  })

  const { encontro: encontroParam } = await searchParams
  const encontroParamStr = typeof encontroParam === "string" ? encontroParam : ""

  let encontro = encontroParamStr
    ? await prisma.encontro.findUnique({
        where: { id: encontroParamStr },
        include: { turma: { select: { nome: true } } },
      })
    : null

  if (encontroParamStr && !encontro) redirect("/presenca/chamada")

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

  let catequistasComPresenca: {
    id: string
    nome: string
    telefone: string | null
    estado: "presente" | "ausente" | "pendente"
  }[] = []

  if (encontro) {
    const [registros, todosCatequistas] = await Promise.all([
      prisma.registroPresenca.findMany({
        where: { encontroId: encontro.id },
        select: { catequistaId: true, presente: true },
      }),
      prisma.catequista.findMany({
        where: { status: "ATIVO" },
        select: { id: true, nome: true, telefone: true },
        orderBy: { nome: "asc" },
      }),
    ])

    const registroMap = new Map(registros.map((r) => [r.catequistaId, r.presente ? "presente" : "ausente"]))

    catequistasComPresenca = todosCatequistas.map((c) => ({
      id: c.id,
      nome: c.nome,
      telefone: c.telefone,
      estado: (registroMap.get(c.id) as "presente" | "ausente") || "pendente",
    }))
  }

  return (
    <ChamadaOfflineClient
      encontro={
        encontro
          ? {
              id: encontro.id,
              tema: encontro.tema,
              data: encontro.data.toISOString(),
              local: encontro.local ?? "",
              turma: encontro.turma?.nome ?? "",
              numeroEncontro: encontro.numeroEncontro,
            }
          : null
      }
      encontros={encontros.map((e) => ({
        id: e.id,
        tema: e.tema,
        data: e.data.toISOString(),
        numeroEncontro: e.numeroEncontro,
      }))}
      catequistasIniciais={catequistasComPresenca}
    />
  )
}
