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
    const dataFilter: Record<string, unknown> = {}
    if (dataInicio) dataFilter.gte = new Date(dataInicio)
    if (dataFim) dataFilter.lte = new Date(dataFim)
    where.encontro = { data: dataFilter }
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

  const totalEncontros = encontros.length
  const totalCatequistas = catequistas.length
  let totalPresencas = 0
  let somaPercentuais = 0

  const catequistasData: CatequistaFreq[] = catequistas.map((c) => {
    const presencasCount = c.presencas.filter((p) => p.presente).length
    const percentual = totalEncontros > 0 ? Math.round((presencasCount / totalEncontros) * 100) : 0
    totalPresencas += presencasCount
    somaPercentuais += percentual
    return {
      id: c.id,
      nome: c.nome,
      turmas: c.turmas.map((t) => t.turma.nome).join(", "),
      totalEncontros,
      presencas: presencasCount,
      percentual,
    }
  })

  const mediaFrequencia = totalCatequistas > 0 ? Math.round(somaPercentuais / totalCatequistas) : 0

  return {
    encontros: encontros.map((e) => ({
      id: e.id,
      data: e.data.toISOString(),
      tema: e.tema,
    })),
    catequistas: catequistasData,
    stats: { totalCatequistas, totalEncontros, totalPresencas, mediaFrequencia },
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

export interface PresencaEncontroRow {
  catequistaId: string
  nome: string
  turmas: string
  presente: boolean | null
  justificativa: string | null
}

export async function getEncontrosDisponiveis() {
  const encontros = await prisma.encontro.findMany({
    orderBy: { data: "desc" },
    select: {
      id: true,
      tema: true,
      data: true,
      turma: { select: { nome: true } },
    },
  })

  return encontros.map((e) => ({
    id: e.id,
    label: `${new Date(e.data).toLocaleDateString("pt-BR")} — ${e.tema} (${e.turma.nome})`,
    data: e.data.toISOString(),
    tema: e.tema,
    turma: e.turma.nome,
  }))
}

export async function getRelatorioEncontro(encontroId: string) {
  const encontro = await prisma.encontro.findUnique({
    where: { id: encontroId },
    include: {
      turma: { select: { nome: true, catequistas: { include: { catequista: { select: { id: true, nome: true, status: true, turmas: { include: { turma: { select: { nome: true } } } } } } } } } },
      presencas: {
        include: { catequista: { select: { id: true, nome: true } } },
      },
    },
  })

  if (!encontro) return null

  // Todos catequistas ativos da turma
  const catequistasDaTurma = encontro.turma.catequistas
    .map((tc) => tc.catequista)
    .filter((c) => c.status === "ATIVO")

  const presencaMap = new Map(
    encontro.presencas.map((p) => [p.catequistaId, p])
  )

  const lista: PresencaEncontroRow[] = catequistasDaTurma.map((c) => {
    const reg = presencaMap.get(c.id)
    return {
      catequistaId: c.id,
      nome: c.nome,
      turmas: c.turmas.map((t) => t.turma.nome).join(", "),
      presente: reg ? reg.presente : null,
      justificativa: reg?.justificativa ?? null,
    }
  })

  // Ordenar: presentes, pendentes, ausentes
  lista.sort((a, b) => {
    const order = (v: boolean | null) => (v === true ? 0 : v === null ? 1 : 2)
    return order(a.presente) - order(b.presente) || a.nome.localeCompare(b.nome)
  })

  const presentes = lista.filter((c) => c.presente === true).length
  const ausentes = lista.filter((c) => c.presente === false).length
  const pendentes = lista.filter((c) => c.presente === null).length
  const percentual = lista.length > 0 ? Math.round((presentes / lista.length) * 100) : 0

  return {
    encontro: {
      id: encontro.id,
      tema: encontro.tema,
      data: encontro.data.toISOString(),
      turma: encontro.turma.nome,
    },
    lista,
    stats: { presentes, ausentes, pendentes, percentual, total: lista.length },
  }
}
