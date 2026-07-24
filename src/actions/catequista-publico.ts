"use server"

import { prisma } from "@/lib/prisma"

export async function listarCatequistasAtivos() {
  return prisma.catequista.findMany({
    where: { status: "ATIVO" },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  })
}

export async function getHistoricoCatequista(catequistaId: string) {
  const presencas = await prisma.registroPresenca.findMany({
    where: { catequistaId },
    include: {
      encontro: {
        select: { id: true, tema: true, data: true },
      },
    },
    orderBy: { encontro: { data: "desc" } },
  })

  const totalEncontros = await prisma.encontro.count()

  const stats = {
    total: presencas.length,
    presentes: presencas.filter((p) => p.presente).length,
    ausentes: presencas.filter((p) => !p.presente).length,
    totalEncontros,
    frequencia: totalEncontros > 0
      ? Math.round((presencas.filter((p) => p.presente).length / Math.max(presencas.length, 1)) * 100)
      : 0,
  }

  const historico = presencas.map((p) => ({
    tema: p.encontro.tema,
    data: p.encontro.data.toLocaleDateString("pt-BR"),
    presente: p.presente,
    justificativa: p.justificativa,
  }))

  return { stats, historico }
}

export async function lerMuralPublico() {
  try {
    const config = await prisma.configuracao.findUnique({
      where: { chave: "mural_texto" },
    })
    return config?.valor || ""
  } catch {
    return ""
  }
}
