"use server"

import { prisma } from "@/lib/prisma"
import { gerarResumo as gerarResumoAi, gerarSumario as gerarSumarioAi, gerarConteudoTema as gerarConteudoTemaAi, perguntar as perguntarAi, gerarQuiz as gerarQuizAi, gerarMensagemPersonalizada as gerarMensagemPersonalizadaAi, gerarRelatorioMensal as gerarRelatorioMensalAi, analisarFaltas as analisarFaltasAi, analisarTemas as analisarTemasAi, gerarMensagemGrupo as gerarMensagemGrupoAi } from "@/lib/ai"
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

// ─── Quiz Automático ──────────────────────────────────────────────────────────
export async function gerarQuizEncontro(encontroId: string) {
  try {
    const encontro = await prisma.encontro.findUnique({
      where: { id: encontroId },
      select: { tema: true, resumo: true },
    })
    if (!encontro) return { error: "Encontro não encontrado." }
    const json = await gerarQuizAi(encontro.tema, encontro.resumo ?? undefined)
    return { success: true, quiz: json }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao gerar quiz." }
  }
}

// ─── Mensagem Personalizada WhatsApp ─────────────────────────────────────────
export async function gerarMensagemCatequista(catequistaId: string, encontroId: string) {
  try {
    const [catequista, encontro] = await Promise.all([
      prisma.catequista.findUnique({
        where: { id: catequistaId },
        select: { nome: true },
      }),
      prisma.encontro.findUnique({
        where: { id: encontroId },
        select: { tema: true, data: true },
      }),
    ])
    if (!catequista || !encontro) return { error: "Dados não encontrados." }

    const totalEncontros = await prisma.encontro.count()
    const totalFaltas = await prisma.registroPresenca.count({
      where: { catequistaId, presente: false },
    })

    const mensagem = await gerarMensagemPersonalizadaAi({
      nome: catequista.nome,
      tema: encontro.tema,
      dataEncontro: encontro.data.toLocaleDateString("pt-BR"),
      totalFaltas,
      totalEncontros,
    })
    return { success: true, mensagem }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao gerar mensagem." }
  }
}

// ─── Relatório Narrativo Mensal ───────────────────────────────────────────────
export async function gerarRelatorioNarrativo(mes: number, ano: number) {
  try {
    const inicio = new Date(ano, mes - 1, 1)
    const fim = new Date(ano, mes, 0, 23, 59, 59)

    const encontros = await prisma.encontro.findMany({
      where: { data: { gte: inicio, lte: fim } },
      include: { presencas: true },
      orderBy: { data: "asc" },
    })

    const totalCatequistas = await prisma.catequista.count({ where: { status: "ATIVO" } })

    const encontrosData = encontros.map((e) => ({
      tema: e.tema,
      data: e.data.toLocaleDateString("pt-BR"),
      presentes: e.presencas.filter((p) => p.presente).length,
      ausentes: e.presencas.filter((p) => !p.presente).length,
      total: totalCatequistas,
    }))

    const totalPresencas = encontrosData.reduce((s, e) => s + e.presentes, 0)
    const possivel = encontrosData.length * totalCatequistas
    const mediaFrequencia = possivel > 0 ? Math.round((totalPresencas / possivel) * 100) : 0

    // Calcula frequência individual no mês
    const catequistas = await prisma.catequista.findMany({
      where: { status: "ATIVO" },
      select: { nome: true, id: true },
    })
    const baixaFreq: { nome: string; percentual: number }[] = []
    for (const c of catequistas) {
      const presentes = await prisma.registroPresenca.count({
        where: { catequistaId: c.id, presente: true, encontro: { data: { gte: inicio, lte: fim } } },
      })
      const perc = encontros.length > 0 ? Math.round((presentes / encontros.length) * 100) : 100
      if (perc < 70) baixaFreq.push({ nome: c.nome, percentual: perc })
    }

    const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
    const relatorio = await gerarRelatorioMensalAi({
      mes: meses[mes - 1],
      ano: String(ano),
      encontros: encontrosData,
      totalCatequistas,
      mediaFrequencia,
      catequistasBaixaFreq: baixaFreq,
    })
    return { success: true, relatorio }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao gerar relatório." }
  }
}

// ─── Análise de Faltas Recorrentes ───────────────────────────────────────────
export async function analisarFaltasRecorrentes() {
  try {
    const tresMesesAtras = new Date()
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3)

    const catequistas = await prisma.catequista.findMany({
      where: { status: "ATIVO" },
      select: {
        id: true,
        nome: true,
        presencas: {
          where: { encontro: { data: { gte: tresMesesAtras } } },
          include: { encontro: { select: { data: true, tema: true } } },
          orderBy: { encontro: { data: "desc" } },
        },
      },
    })

    const totalEncontros = await prisma.encontro.count({
      where: { data: { gte: tresMesesAtras } },
    })

    const dados = catequistas
      .map((c) => {
        const faltas = c.presencas.filter((p) => !p.presente)
        const percentualFalta = totalEncontros > 0 ? Math.round((faltas.length / totalEncontros) * 100) : 0
        return {
          nome: c.nome,
          faltas: faltas.length,
          total: totalEncontros,
          percentualFalta,
          ultimasFaltas: faltas.slice(0, 3).map((p) => p.encontro.data.toLocaleDateString("pt-BR")),
        }
      })
      .filter((c) => c.faltas > 0)

    const now = new Date()
    const periodo = `${tresMesesAtras.toLocaleDateString("pt-BR")} a ${now.toLocaleDateString("pt-BR")}`
    const analise = await analisarFaltasAi({ catequistas: dados, periodo })
    return { success: true, analise }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao analisar faltas." }
  }
}

// ─── Análise de Temas Recorrentes ────────────────────────────────────────────
export async function analisarTemasRecorrentes() {
  try {
    const encontros = await prisma.encontro.findMany({
      where: { resumo: { not: "" } },
      orderBy: { data: "desc" },
      take: 60,
      select: { id: true, tema: true, data: true, numeroEncontro: true, resumo: true },
    })

    // Filtra resumos vazios/só-espaços e coloca em ordem cronológica
    const comResumo = encontros.reverse().filter((e) => e.resumo?.trim())

    if (comResumo.length === 0) {
      return { error: "Nenhum resumo de encontro disponível ainda. Gere um resumo ou conteúdo nos encontros antes de analisar os temas recorrentes." }
    }

    const analise = await analisarTemasAi({
      encontros: comResumo.map((e) => ({
        numeroEncontro: e.numeroEncontro,
        data: e.data.toLocaleDateString("pt-BR"),
        tema: e.tema,
        resumo: e.resumo ?? "",
      })),
    })
    return { success: true, analise }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao analisar temas." }
  }
}

// ─── Mensagem para Grupo WhatsApp ───────────────────────────────────────────
export async function gerarMensagemGrupo(params: {
  tipo: "lembrete" | "agradecimento" | "convocacao" | "livre"
  encontroId?: string
  instrucao?: string
  mensagemUsuario?: string
}) {
  try {
    const baseUrl = "https://catequistas.housecloud.tec.br"

    // Para lembrete, busca o próximo encontro automaticamente
    if (params.tipo === "lembrete") {
      const agora = new Date()
      const encontro = await prisma.encontro.findFirst({
        where: { data: { gte: agora } },
        orderBy: { data: "asc" },
        include: { turma: { select: { nome: true } } },
      })
      if (!encontro) return { error: "Nenhum encontro futuro agendado." }

      const mensagem = await gerarMensagemGrupoAi({
        tipo: "lembrete",
        tema: encontro.tema,
        data: encontro.data.toLocaleDateString("pt-BR"),
        local: encontro.local || encontro.turma.nome,
        turma: encontro.turma.nome,
        linkPresenca: `${baseUrl}/presenca/confirmar?encontro=${encontro.id}`,
      })
      return { success: true, mensagem, encontro: encontro.tema }
    }

    // Para agradecimento, busca o encontro selecionado
    if (params.tipo === "agradecimento" && params.encontroId) {
      const encontro = await prisma.encontro.findUnique({
        where: { id: params.encontroId },
        include: {
          turma: { select: { nome: true } },
          presencas: { select: { presente: true } },
        },
      })
      if (!encontro) return { error: "Encontro não encontrado." }

      const totalCatequistas = await prisma.catequista.count({
        where: { status: "ATIVO" },
      })
      const presentes = encontro.presencas.filter((p) => p.presente).length
      const ausentes = encontro.presencas.length - presentes

      const mensagem = await gerarMensagemGrupoAi({
        tipo: "agradecimento",
        tema: encontro.tema,
        data: encontro.data.toLocaleDateString("pt-BR"),
        local: encontro.local || encontro.turma?.nome || "Não informado",
        resumo: encontro.resumo || undefined,
        totalCatequistas,
        presentes,
        ausentes,
        linkPresenca: `${baseUrl}/presenca/confirmar?encontro=${encontro.id}`,
      })
      return { success: true, mensagem, encontro: encontro.tema }
    }

    // Para convocação
    if (params.tipo === "convocacao") {
      if (!params.instrucao?.trim()) return { error: "Digite o comunicado." }
      const mensagem = await gerarMensagemGrupoAi({
        tipo: "convocacao",
        instrucao: params.instrucao,
        linkPresenca: `${baseUrl}/presenca/confirmar`,
      })
      return { success: true, mensagem }
    }

    // Para mensagem livre
    if (params.tipo === "livre") {
      if (!params.mensagemUsuario?.trim()) return { error: "Digite a mensagem." }
      const mensagem = await gerarMensagemGrupoAi({
        tipo: "livre",
        mensagemUsuario: params.mensagemUsuario,
        linkPresenca: `${baseUrl}/presenca/confirmar`,
      })
      return { success: true, mensagem }
    }

    return { error: "Tipo de mensagem inválido." }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao gerar mensagem." }
  }
}

export async function listarEncontrosPassados() {
  try {
    const agora = new Date()
    const encontros = await prisma.encontro.findMany({
      where: { data: { lt: agora } },
      orderBy: { data: "desc" },
      take: 20,
      select: { id: true, tema: true, data: true },
    })
    return encontros.map((e) => ({
      id: e.id,
      label: `${e.data.toLocaleDateString("pt-BR")} — ${e.tema}`,
    }))
  } catch {
    return []
  }
}
