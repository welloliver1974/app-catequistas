"use server"

import { prisma } from "@/lib/prisma"

function toCSV(rows: string[][], headers: string[]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  return [headers.join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n")
}

export async function exportarCatequistasCSV() {
  const catequistas = await prisma.catequista.findMany({
    orderBy: { nome: "asc" },
    include: {
      turmas: { include: { turma: { select: { nome: true } } } },
      _count: { select: { presencas: true } },
    },
  })

  const headers = ["Nome", "Email", "Telefone", "Status", "Data Entrada", "Turmas", "Total Presenças"]
  const rows = catequistas.map((c) => [
    c.nome,
    c.email,
    c.telefone ?? "",
    c.status === "ATIVO" ? "Ativo" : "Inativo",
    c.dataEntrada.toLocaleDateString("pt-BR"),
    c.turmas.map((t) => t.turma.nome).join("; "),
    String(c._count.presencas),
  ])

  return {
    filename: "catequistas.csv",
    content: toCSV(rows, headers),
  }
}

export async function exportarEncontrosCSV() {
  const encontros = await prisma.encontro.findMany({
    orderBy: { data: "desc" },
    include: {
      turma: { select: { nome: true } },
      _count: { select: { presencas: true } },
    },
  })

  const headers = ["Data", "Tema", "Local", "Link PDF", "Turma", "Total Presenças"]
  const rows = encontros.map((e) => [
    e.data.toLocaleDateString("pt-BR"),
    e.tema,
    e.local ?? "",
    e.linkPdf ?? "",
    e.turma.nome,
    String(e._count.presencas),
  ])

  return {
    filename: "encontros.csv",
    content: toCSV(rows, headers),
  }
}

export async function exportarPresencasCSV() {
  const registros = await prisma.registroPresenca.findMany({
    orderBy: { confirmadoEm: "desc" },
    include: {
      encontro: { select: { data: true, tema: true } },
      catequista: { select: { nome: true, email: true } },
    },
  })

  const headers = ["Data do Encontro", "Tema", "Catequista", "Email", "Presente", "Justificativa", "Confirmado Em"]
  const rows = registros.map((r) => [
    r.encontro.data.toLocaleDateString("pt-BR"),
    r.encontro.tema,
    r.catequista.nome,
    r.catequista.email,
    r.presente ? "Sim" : "Não",
    r.justificativa ?? "",
    r.confirmadoEm.toLocaleString("pt-BR"),
  ])

  return {
    filename: "presencas.csv",
    content: toCSV(rows, headers),
  }
}

export async function exportarFrequenciaCSV(turmaId?: string) {
  const encontroWhere = turmaId ? { turmaId } : {}

  const encontros = await prisma.encontro.findMany({
    where: encontroWhere,
    orderBy: { data: "desc" },
  })

  const catequistas = await prisma.catequista.findMany({
    where: {
      status: "ATIVO",
      ...(turmaId ? { turmas: { some: { turmaId } } } : {}),
    },
    include: {
      presencas: {
        where: { encontro: encontroWhere },
        include: { encontro: { select: { id: true } } },
      },
    },
    orderBy: { nome: "asc" },
  })

  const headers = ["Catequista", ...encontros.map((e) => e.tema), "Presenças", "Total", "%"]
  const rows = catequistas.map((c) => {
    const presencas = encontros.map((e) => {
      const r = c.presencas.find((p) => p.encontroId === e.id)
      return r?.presente ? "Sim" : "Não"
    })
    const totalPresentes = c.presencas.filter((p) => p.presente).length
    const pct = encontros.length > 0 ? Math.round((totalPresentes / encontros.length) * 100) + "%" : "0%"
    return [c.nome, ...presencas, String(totalPresentes), String(encontros.length), pct]
  })

  return {
    filename: "frequencia.csv",
    content: toCSV(rows, headers),
  }
}
