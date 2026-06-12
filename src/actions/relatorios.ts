"use server"

import { prisma } from "@/lib/prisma"

export interface PresencaRow {
  encontroId: string
  encontroData: string
  encontroTema: string
  presente: boolean
  justificativa: string | null
}

export interface CatequistaFreq {
  id: string
  nome: string
  turmas: string
  totalEncontros: number
  presencas: number
  percentual: number
}

export async function getRelatorioIndividual(
  catequistaId: string,
  dataInicio?: string,
  dataFim?: string
) {
  const where: Record<string, unknown> = { catequistaId }
  if (dataInicio || dataFim) {
    where.encontro = {} as Record<string, unknown>
    if (dataInicio) (where.encontro as Record<string, unknown>).gte = new Date(dataInicio)
    if (dataFim) (where.encontro as Record<string, unknown>).lte = new Date(dataFim)
  }

  const presencas = await prisma.registroPresenca.findMany({
    where,
    include: {
      encontro: { select: { data: true, tema: true } },
    },
    orderBy: { encontro: { data: "desc" } },
  })

  const catequista = await prisma.catequista.findUnique({
    where: { id: catequistaId },
    select: { nome: true, turmas: { include: { turma: { select: { nome: true } } } } },
  })

  const total = presencas.length
  const presentes = presencas.filter((p) => p.presente).length

  return {
    nome: catequista?.nome ?? "",
    turmas: catequista?.turmas.map((t) => t.turma.nome).join(", ") ?? "",
    total,
    presentes,
    percentual: total > 0 ? Math.round((presentes / total) * 100) : 0,
    presencas: presencas.map((p) => ({
      encontroId: p.encontroId,
      encontroData: p.encontro.data.toISOString(),
      encontroTema: p.encontro.tema,
      presente: p.presente,
      justificativa: p.justificativa,
    })),
  }
}

export async function getRelatorioPorTurma(
  turmaId?: string,
  dataInicio?: string,
  dataFim?: string
) {
  const encontroWhere: Record<string, unknown> = {}
  if (turmaId) encontroWhere.turmaId = turmaId
  if (dataInicio || dataFim) {
    encontroWhere.data = {} as Record<string, unknown>
    if (dataInicio) (encontroWhere.data as Record<string, unknown>).gte = new Date(dataInicio)
    if (dataFim) (encontroWhere.data as Record<string, unknown>).lte = new Date(dataFim)
  }

  const catequistas = await prisma.catequista.findMany({
    where: {
      status: "ATIVO",
      ...(turmaId ? { turmas: { some: { turmaId } } } : {}),
    },
    include: {
      turmas: { include: { turma: { select: { nome: true } } } },
      presencas: {
        where: { encontro: encontroWhere },
        include: { encontro: { select: { id: true, tema: true, data: true } } },
      },
    },
    orderBy: { nome: "asc" },
  })

  const encontros = await prisma.encontro.findMany({
    where: encontroWhere,
    orderBy: { data: "desc" },
  })

  const catequistasData: CatequistaFreq[] = catequistas.map((c) => {
    const total = encontros.length
    const presencas = c.presencas.filter((p) => p.presente).length
    return {
      id: c.id,
      nome: c.nome,
      turmas: c.turmas.map((t) => t.turma.nome).join(", "),
      totalEncontros: total,
      presencas,
      percentual: total > 0 ? Math.round((presencas / total) * 100) : 0,
    }
  })

  return {
    encontros: encontros.map((e) => ({
      id: e.id,
      data: e.data.toISOString(),
      tema: e.tema,
    })),
    catequistas: catequistasData,
  }
}

export async function getRelatorioBaixaFrequencia(
  limitePercentual: number = 75,
  dataInicio?: string,
  dataFim?: string
) {
  const encontroWhere: Record<string, unknown> = {}
  if (dataInicio || dataFim) {
    encontroWhere.data = {} as Record<string, unknown>
    if (dataInicio) (encontroWhere.data as Record<string, unknown>).gte = new Date(dataInicio)
    if (dataFim) (encontroWhere.data as Record<string, unknown>).lte = new Date(dataFim)
  }

  const encontros = await prisma.encontro.count({ where: encontroWhere })
  if (encontros === 0) return { catequistas: [] }

  const catequistas = await prisma.catequista.findMany({
    where: { status: "ATIVO" },
    include: {
      turmas: { include: { turma: { select: { nome: true } } } },
      presencas: {
        where: {
          presente: true,
          encontro: encontroWhere,
        },
      },
    },
    orderBy: { nome: "asc" },
  })

  const catequistasData: CatequistaFreq[] = catequistas
    .map((c) => {
      const presencas = c.presencas.length
      const percentual = Math.round((presencas / encontros) * 100)
      return {
        id: c.id,
        nome: c.nome,
        turmas: c.turmas.map((t) => t.turma.nome).join(", "),
        totalEncontros: encontros,
        presencas,
        percentual,
      }
    })
    .filter((c) => c.percentual < limitePercentual)

  return { catequistas: catequistasData }
}
