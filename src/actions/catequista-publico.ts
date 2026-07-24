"use server"

import { prisma } from "@/lib/prisma"

export async function listarCatequistasAtivos() {
  return prisma.catequista.findMany({
    where: { status: "ATIVO" },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  })
}

export async function verificarTelefone(catequistaId: string, telefone: string) {
  const catequista = await prisma.catequista.findUnique({
    where: { id: catequistaId },
    select: { telefone: true, nome: true },
  })

  if (!catequista) return { valido: false, error: "Catequista não encontrado." }

  // Remove tudo que não é número pra comparar
  const telDigitado = telefone.replace(/\D/g, "")
  const telCadastrado = (catequista.telefone || "").replace(/\D/g, "")

  if (!telCadastrado) {
    return { valido: false, error: `${catequista.nome} não possui telefone cadastrado. Solicite ao administrador.` }
  }

  if (telDigitado !== telCadastrado) {
    return { valido: false, error: "Telefone incorreto. Tente novamente." }
  }

  return { valido: true, nome: catequista.nome }
}

export async function getHistoricoCatequista(catequistaId: string, telefone: string) {
  // Verifica telefone novamente (segurança)
  const verificado = await verificarTelefone(catequistaId, telefone)
  if (!verificado.valido) return { error: "Acesso negado." }

  const presencas = await prisma.registroPresenca.findMany({
    where: { catequistaId },
    include: {
      encontro: {
        select: { id: true, tema: true, data: true, resumo: true },
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
    resumo: p.encontro.resumo,
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
