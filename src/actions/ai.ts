"use server"

import { prisma } from "@/lib/prisma"
import { gerarResumo as gerarResumoAi, gerarSumario as gerarSumarioAi, gerarConteudoTema as gerarConteudoTemaAi, perguntar as perguntarAi } from "@/lib/ai"
import { revalidatePath } from "next/cache"

export async function salvarConfigAi(formData: FormData) {
  const provider = formData.get("provider") as string
  const apiKey = formData.get("apiKey") as string
  const model = formData.get("model") as string

  const upsert = async (chave: string, valor: string) => {
    await prisma.configuracao.upsert({
      where: { chave },
      update: { valor },
      create: { chave, valor },
    })
  }

  await upsert("ai_provider", provider)
  await upsert("ai_api_key", apiKey)
  await upsert("ai_model", model)

  revalidatePath("/configuracoes")
}

export async function getConfigAi() {
  const getVal = async (chave: string) =>
    (await prisma.configuracao.findUnique({ where: { chave } }))?.valor ?? ""

  return {
    provider: (await getVal("ai_provider")) || "groq",
    apiKey: await getVal("ai_api_key"),
    model: (await getVal("ai_model")) || "llama-3.3-70b-versatile",
  }
}

export async function gerarResumo(encontroId: string, texto: string) {
  try {
    const resumo = await gerarResumoAi(texto)
    await prisma.encontro.update({
      where: { id: encontroId },
      data: { resumo },
    })
    revalidatePath("/encontros")
    return { success: "Resumo gerado com sucesso!", resumo }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao gerar resumo." }
  }
}

export async function getEncontroSumario(encontroId: string) {
  const encontro = await prisma.encontro.findUnique({
    where: { id: encontroId },
    include: {
      presencas: {
        include: { catequista: { select: { nome: true } } },
      },
      turma: { select: { nome: true } },
    },
  })

  if (!encontro) return null

  const totalCatequistas = await prisma.catequista.count({
    where: { status: "ATIVO", turmas: { some: { turmaId: encontro.turmaId } } },
  })

  const presentes = encontro.presencas.filter((p) => p.presente)
  const ausentes = encontro.presencas.filter((p) => !p.presente)

  const justificativas = ausentes.reduce(
    (acc, p) => {
      const motivo = p.justificativa || "Sem justificativa"
      const existing = acc.find((j) => j.motivo === motivo)
      if (existing) existing.count++
      else acc.push({ motivo, count: 1 })
      return acc
    },
    [] as { motivo: string; count: number }[]
  )

  return {
    tema: encontro.tema,
    data: encontro.data.toLocaleDateString("pt-BR"),
    local: encontro.local,
    totalPresencas: encontro.presencas.length,
    totalCatequistas,
    presentesCount: presentes.length,
    ausentesCount: ausentes.length,
    justificativas,
    resumo: encontro.resumo,
  }
}

export async function gerarSumario(encontroId: string) {
  try {
    const dados = await getEncontroSumario(encontroId)
    if (!dados) return { error: "Encontro não encontrado." }
    const sumario = await gerarSumarioAi(dados)
    return { success: sumario }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao gerar sumário." }
  }
}

export async function gerarConteudoTema(encontroId: string, tema: string) {
  try {
    const conteudo = await gerarConteudoTemaAi(tema)
    await prisma.encontro.update({
      where: { id: encontroId },
      data: { resumo: conteudo },
    })
    revalidatePath("/encontros")
    return { success: "Conteúdo gerado com sucesso!", conteudo }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao gerar conteúdo." }
  }
}

export async function perguntarAoAssistente(pergunta: string) {
  try {
    const encontros = await prisma.encontro.findMany({
      orderBy: { data: "desc" },
      take: 50,
      include: { _count: { select: { presencas: true } } },
    })

    const catequistas = await prisma.catequista.findMany({
      where: { status: "ATIVO" },
      include: {
        _count: { select: { presencas: true } },
        turmas: { include: { turma: { select: { nome: true } } } },
      },
    })

    const turmas = await prisma.turma.findMany({
      include: { _count: { select: { catequistas: true, encontros: true } } },
    })

    const contexto = `
CATEQUISTAS (${catequistas.length} ativos):
${catequistas.slice(0, 20).map((c) => `  ${c.nome} - presenças: ${c._count.presencas} - turmas: ${c.turmas.map((t) => t.turma.nome).join(", ")}`).join("\n")}

ENCONTROS (${encontros.length} últimos):
${encontros.slice(0, 20).map((e) => `  ${e.data.toISOString().split("T")[0]} - ${e.tema} - presenças: ${e._count.presencas}`).join("\n")}

TURMAS:
${turmas.map((t) => `  ${t.nome} - ${t._count.catequistas} catequistas, ${t._count.encontros} encontros`).join("\n")}
`

    const resposta = await perguntarAi(pergunta, contexto)
    return { success: resposta }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao processar pergunta." }
  }
}
