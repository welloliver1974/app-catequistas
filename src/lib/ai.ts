import { AiProvider, PROVIDERS_INFO, MODELOS_SUGERIDOS } from "./modelos-ai"

export interface AiConfig {
  provider: AiProvider
  apiKey: string
  model: string
  customBaseUrl?: string
}

export async function getAiConfig(): Promise<AiConfig> {
  const { prisma } = await import("@/lib/prisma")
  const getVal = async (chave: string) =>
    (await prisma.configuracao.findUnique({ where: { chave } }))?.valor ?? ""

  const provider = ((await getVal("ai_provider")) || "groq") as AiProvider

  // Busca chave específica do provedor salvo no banco ou fallback em variáveis de ambiente / chave legada
  let apiKey = await getVal(`ai_key_${provider}`)
  if (!apiKey) {
    if (provider === "groq") {
      apiKey = process.env.GROQ_API_KEY || ""
    } else if (provider === "nvidia") {
      apiKey = process.env.NVIDIA_API_KEY || ""
    } else if (provider === "openrouter") {
      apiKey = process.env.OPENROUTER_API_KEY || ""
    } else if (provider === "custom") {
      apiKey = process.env.CUSTOM_AI_API_KEY || ""
    }
  }
  if (!apiKey) {
    apiKey = await getVal("ai_api_key")
  }

  const model =
    (await getVal("ai_model")) ||
    (provider === "nvidia" ? "meta/llama-3.3-70b-instruct" : "llama-3.3-70b-versatile")
  const customBaseUrl =
    (await getVal("ai_custom_base_url")) || process.env.CUSTOM_AI_BASE_URL || PROVIDERS_INFO.custom.baseUrl

  return { provider, apiKey, model, customBaseUrl }
}

export async function gerarResumo(texto: string): Promise<string> {
  const config = await getAiConfig()
  if (!config.apiKey) throw new Error("Configure a chave da API de IA nas Configurações.")

  const prompt = `Você é um assistente de catequese. Estruture o resumo do encontro abaixo em 4 tópicos:

1. **Assunto Principal** (1 frase)
2. **Pontos Abordados** (3-5 bullets)
3. **Reflexão** (2-3 frases)
4. **Avisos** (se houver)

Texto do coordenador:
"""
${texto}
"""

Responda APENAS com o resumo estruturado em markdown.`

  return await sendToAi(prompt, config)
}

export async function gerarConteudoTema(tema: string): Promise<string> {
  const config = await getAiConfig()
  if (!config.apiKey) throw new Error("Configure a chave da API de IA nas Configurações.")

  const prompt = `Você é um catequista experiente. Gere um roteiro de estudo completo para o encontro de catequese com o tema "${tema}".

Estruture em markdown com os seguintes tópicos:

1. **Explicação do Tema** (2-3 parágrafos simples e diretos)
2. **Passagens Bíblicas** (2-3 citações com referência)
3. **Pontos para Reflexão** (3-5 bullets)
4. **Perguntas para o Encontro** (3-4 perguntas para debate em grupo)

Use linguagem acessível para catequistas. Responda APENAS com o conteúdo gerado.`

  return await sendToAi(prompt, config, 0.8)
}

export async function gerarSumario(encontro: {
  tema: string
  data: string
  local: string | null
  totalPresencas: number
  totalCatequistas: number
  presentesCount: number
  ausentesCount: number
  justificativas: { motivo: string; count: number }[]
  resumo: string | null
}): Promise<string> {
  const config = await getAiConfig()
  if (!config.apiKey) throw new Error("Configure a chave da API de IA nas Configurações.")

  const justificativasStr = encontro.justificativas
    .map((j) => `  - ${j.motivo}: ${j.count}`)
    .join("\n")

  const prompt = `Gere um sumário executivo do encontro de catequese abaixo:

**Encontro:** ${encontro.tema}
**Data:** ${encontro.data}
**Local:** ${encontro.local || "Não informado"}
**Presença:** ${encontro.presentesCount} presentes de ${encontro.totalCatequistas} catequistas
**Ausências:** ${encontro.ausentesCount}
${encontro.justificativas.length > 0 ? `**Justificativas:**\n${justificativasStr}` : "**Justificativas:** Nenhuma"}
${encontro.resumo ? `**Resumo do tema:**\n${encontro.resumo}` : ""}

Gere um parágrafo curto (3-5 frases) resumindo o encontro, destacando a participação e qualquer padrão relevante.`

  return await sendToAi(prompt, config)
}

export async function perguntar(pergunta: string, contexto: string): Promise<string> {
  const config = await getAiConfig()
  if (!config.apiKey) throw new Error("Configure a chave da API de IA nas Configurações.")

  const prompt = `Você é um assistente de coordenação de catequese. Responda à pergunta do coordenador com base nos dados abaixo.

Contexto do sistema:
"""
${contexto}
"""

Pergunta: ${pergunta}

Responda de forma direta e objetiva, baseando-se APENAS nos dados fornecidos. Se não souber, diga que não encontrou dados suficientes.`

  return await sendToAi(prompt, config, 0.3)
}


export async function gerarQuiz(tema: string, resumo?: string): Promise<string> {
  const config = await getAiConfig()
  if (!config.apiKey) throw new Error("Configure a chave da API de IA nas Configurações.")

  const conteudo = resumo ? `Tema: "${tema}"\nResumo do encontro:\n${resumo}` : `Tema: "${tema}"`

  const prompt = `Você é um catequista especialista. Crie um quiz com 5 perguntas de múltipla escolha sobre o encontro de catequese abaixo.

${conteudo}

Retorne APENAS um JSON válido com esta estrutura exata (sem markdown, sem texto fora do JSON):
[
  {
    "pergunta": "texto da pergunta",
    "opcoes": ["A) opção 1", "B) opção 2", "C) opção 3", "D) opção 4"],
    "correta": 0
  }
]

"correta" é o índice (0-3) da opção correta. Use linguagem simples e pastoral.`

  const raw = await sendToAi(prompt, config, 0.5)
  // Extrai JSON mesmo se vier com markdown
  const match = raw.match(/\[[\s\S]*\]/)
  if (!match) throw new Error("IA não retornou um quiz válido.")
  return match[0]
}

export async function gerarMensagemPersonalizada(dados: {
  nome: string
  tema: string
  dataEncontro: string
  totalFaltas: number
  totalEncontros: number
}): Promise<string> {
  const config = await getAiConfig()
  if (!config.apiKey) throw new Error("Configure a chave da API de IA nas Configurações.")

  const prompt = `Você é um coordenador de catequese acolhedor e pastoral. Escreva uma mensagem de WhatsApp personalizada e acolhedora para ${dados.nome}, que não pôde estar presente no encontro de catequese.

Dados:
- Nome: ${dados.nome}
- Tema do encontro: "${dados.tema}"
- Data: ${dados.dataEncontro}
- Total de faltas nos últimos encontros: ${dados.totalFaltas} de ${dados.totalEncontros}

A mensagem deve:
1. Ser calorosa e acolhedora (não cobrativa)
2. Mencionar o tema do encontro e incentivar a buscar o conteúdo
3. Se tiver muitas faltas (mais de 3), adicionar um convite especial para conversar
4. Ter no máximo 5 linhas
5. Terminar com uma saudação cristã

Responda APENAS com o texto da mensagem, sem aspas externas.`

  return await sendToAi(prompt, config, 0.8)
}

export async function gerarRelatorioMensal(dados: {
  mes: string
  ano: string
  encontros: { tema: string; data: string; presentes: number; ausentes: number; total: number }[]
  totalCatequistas: number
  mediaFrequencia: number
  catequistasBaixaFreq: { nome: string; percentual: number }[]
}): Promise<string> {
  const config = await getAiConfig()
  if (!config.apiKey) throw new Error("Configure a chave da API de IA nas Configurações.")

  const encontrosStr = dados.encontros
    .map((e) => `  - ${e.data}: "${e.tema}" — ${e.presentes} presentes de ${e.total} (${Math.round((e.presentes / Math.max(e.total, 1)) * 100)}%)`)
    .join("\n")

  const baixaFreqStr = dados.catequistasBaixaFreq.length > 0
    ? dados.catequistasBaixaFreq.map((c) => `  - ${c.nome} (${c.percentual}%)`).join("\n")
    : "  Nenhum catequista com baixa frequência."

  const prompt = `Você é um secretário pastoral. Redija um relatório narrativo formal do mês de ${dados.mes}/${dados.ano} para a coordenação da catequese da paróquia.

Dados do mês:
- Total de catequistas ativos: ${dados.totalCatequistas}
- Encontros realizados: ${dados.encontros.length}
- Média geral de frequência: ${dados.mediaFrequencia}%
- Encontros e presenças:
${encontrosStr}
- Catequistas com baixa frequência (<70%):
${baixaFreqStr}

Escreva um relatório formal com:
1. Cabeçalho: "Relatório de Atividades — Catequese — ${dados.mes}/${dados.ano}"
2. Parágrafo introdutório (2-3 frases)
3. Seção "Encontros Realizados" (narrativa dos encontros)
4. Seção "Frequência e Participação" (análise dos números)
5. Seção "Atenção Pastoral" (catequistas com baixa frequência, se houver)
6. Parágrafo de encerramento com perspectivas

Use linguagem formal, pastoral e positiva. Responda APENAS com o relatório completo.`

  return await sendToAi(prompt, config, 0.7, 2)
}

export async function analisarFaltas(dados: {
  catequistas: { nome: string; faltas: number; total: number; percentualFalta: number; ultimasFaltas: string[] }[]
  periodo: string
}): Promise<string> {
  const config = await getAiConfig()
  if (!config.apiKey) throw new Error("Configure a chave da API de IA nas Configurações.")

  const top10 = dados.catequistas
    .sort((a, b) => b.percentualFalta - a.percentualFalta)
    .slice(0, 15)

  const resumo = top10
    .map((c) => `  - ${c.nome}: ${c.faltas} faltas de ${c.total} encontros (${c.percentualFalta}% de ausência). Últimas faltas: ${c.ultimasFaltas.join(", ") || "nenhuma registrada"}`)
    .join("\n")

  const prompt = `Você é um analista pastoral. Analise os padrões de faltas dos catequistas no período: ${dados.periodo}.

Dados de ausências:
${resumo}

Forneça uma análise concisa em markdown com:

## 🔍 Padrões Identificados
(Liste 3-5 padrões que você observou nos dados, como períodos de maior ausência, catequistas com faltas consecutivas, etc.)

## ⚠️ Atenção Prioritária
(Liste os 3-5 catequistas que merecem atenção pastoral urgente, com breve justificativa)

## 💡 Recomendações
(3-4 ações concretas que o coordenador pode tomar para melhorar a frequência)

Use linguagem pastoral e não punitiva. Responda APENAS com a análise em markdown.`

  return await sendToAi(prompt, config, 0.5)
}

export async function analisarTemas(dados: {
  encontros: { numeroEncontro: number | null; data: string; tema: string; resumo: string }[]
}): Promise<string> {
  const config = await getAiConfig()
  if (!config.apiKey) throw new Error("Configure a chave da API de IA nas Configurações.")

  const lista = dados.encontros
    .map((e) =>
      `- ${e.numeroEncontro ? `Encontro Nº ${e.numeroEncontro}` : "Encontro"} (${e.data}): "${e.tema}"\n  Resumo: ${e.resumo}`
    )
    .join("\n\n")

  const prompt = `Você é um coordenador de catequese experiente e analista pastoral. Analise os ${dados.encontros.length} encontros abaixo para identificar temas recorrentes.

ENCONTROS COM RESUMO:
${lista}

Forneça uma análise concisa em markdown com:

## 🔍 Temas Recorrentes
(Agrupe os temas que mais se repetem, citando os encontros relacionados)

## 📈 Evolução nos Encontros
(Como os temas evoluíram ao longo do tempo — sequência pedagógica, progressão, ciclos)

## 💡 Sugestões para os Próximos Encontros
(3-4 sugestões que complementam o que já foi trabalhado e evitam repetição excessiva)

Use linguagem pastoral e prática. Responda APENAS com a análise em markdown.`

  return await sendToAi(prompt, config, 0.5, 2, 2048)
}

export interface MensagemGrupoDados {
  tipo: "lembrete" | "agradecimento" | "convocacao" | "livre"
  tema?: string
  data?: string
  dataExtenso?: string
  local?: string
  turma?: string
  linkPresenca?: string
  resumo?: string
  instrucao?: string // para convocação: o que comunicar
  mensagemUsuario?: string // para livre: texto do usuário
  totalCatequistas?: number
  presentes?: number
  ausentes?: number
  proximoEncontro?: {
    tema: string
    data: string
    dataExtenso?: string
    local?: string | null
  }
}

export async function gerarMensagemGrupo(dados: MensagemGrupoDados): Promise<string> {
  const config = await getAiConfig()
  if (!config.apiKey) throw new Error("Configure a chave da API de IA nas Configurações.")

  const prompt = geraPromptMensagem(dados)
  return await sendToAi(prompt, config, 0.7)
}

function geraPromptMensagem(dados: MensagemGrupoDados): string {
  const base = `Você é um coordenador de catequese paroquial muito próximo, acolhedor e dedicado à comunidade.
Sua missão é redigir uma mensagem para enviar no grupo de WhatsApp dos catequistas.

DIRETRIZES DE ESTILO E LINGUAGEM:
- Tom: Verdadeiramente humano, fraterno, caloroso, pastoral e encorajador. Deve soar como uma pessoa de fé real falando com seus irmãos de ministério, e NUNCA como um texto frio, burocrático, corporativo ou gerado por robô.
- Formatação WhatsApp: Use *negrito* nos pontos de atenção e dados-chave (*Data:*, *Tema:*, *Local:*, etc.).
- Emojis: Use emojis acolhedores e pastorais com sensibilidade e bom gosto (ex: 🕊️, ✨, 🙏, 📖, 📅, 📍, ❤️) para dar leveza e vida à mensagem, sem excessos.
- Parágrafos: Separe ideias em parágrafos curtos com linha em branco para leitura fluida no celular.
- Datas: Utilize RIGOROSAMENTE as datas fornecidas nos dados. NUNCA altere ou invente dias da semana ou datas fictícias.`

  switch (dados.tipo) {
    case "lembrete":
      return `${base}

Tipo de Mensagem: LEMBRETE DE ENCONTRO

DADOS DO ENCONTRO:
- Data: ${dados.dataExtenso ? `${dados.dataExtenso} (${dados.data})` : dados.data || "[Data do encontro]"}
- Tema: ${dados.tema || "[Tema do encontro]"}
- Local: ${dados.local || "Salão Paroquial"}
${dados.turma ? `- Turma: ${dados.turma}` : ""}

ORIENTAÇÕES ESPECÍFICAS PARA O LEMBRETE:
1. Comece com uma saudação calorosa e fraterna (ex: "Queridos catequistas, paz e bem! 🕊️✨" ou "Irmãos e irmãs na catequese, a paz de Jesus!").
2. Lembre a todos do próximo encontro que está chegando, com palavras de ânimo, oração e amor pela missão com nossos catequizandos.
3. Destaque as informações de forma limpa e bonita com negrito do WhatsApp:
   📅 *Data:* ${dados.dataExtenso || dados.data || "[Data]"}
   📖 *Tema:* ${dados.tema || "[Tema]"}
   📍 *Local:* ${dados.local || "Salão Paroquial"}
4. IMPORTANTE: NÃO coloque link de presença nesta mensagem de lembrete! O lembrete é focado na motivação, acolhida e união da equipe.
5. Incentive a participação e a oração de todos uns pelos outros.
6. Encerre com uma bênção fraterna e afetuosa.

Responda APENAS com o texto final da mensagem, pronto para copiar e colar diretamente no WhatsApp.`

    case "agradecimento":
      return `${base}

Tipo de Mensagem: AGRADECIMENTO PÓS-ENCONTRO

DADOS DO ENCONTRO REALIZADO:
- Data realizada: ${dados.dataExtenso ? `${dados.dataExtenso} (${dados.data})` : dados.data || "[Data]"}
- Tema trabalhado: ${dados.tema || "[Tema]"}
- Local: ${dados.local || "[Local]"}
${dados.totalCatequistas ? `- Participação: ${dados.presentes ?? 0} de ${dados.totalCatequistas} catequistas presentes` : ""}
${dados.resumo ? `- Resumo dos pontos vivenciados: ${dados.resumo}` : ""}
${dados.linkPresenca ? `- Link de presença/confirmação: ${dados.linkPresenca}` : ""}

DADOS DO PRÓXIMO ENCONTRO:
${
  dados.proximoEncontro
    ? `- Próximo Encontro AGENDADO:
  * Data: ${dados.proximoEncontro.dataExtenso ? `${dados.proximoEncontro.dataExtenso} (${dados.proximoEncontro.data})` : dados.proximoEncontro.data}
  * Tema: ${dados.proximoEncontro.tema}
  * Local: ${dados.proximoEncontro.local || dados.local || "Salão Paroquial"}`
    : "- Próximo Encontro: AINDA NÃO HÁ DATA CADASTRADA NO SISTEMA. (Atenção: NÃO INVENTE NENHUMA DATA! Apenas diga com carinho que a data do próximo encontro será avisada em breve aqui no grupo)."
}

ORIENTAÇÕES ESPECÍFICAS PARA O AGRADECIMENTO:
1. Inicie com uma mensagem sincera de gratidão a Deus e a cada catequista que se fez presente com amor e dedicação.
2. Destaque brevemente a importância do tema trabalhado (${dados.tema || "trabalhado no encontro"}) na vida dos catequizandos.
3. Se houver ausentes, expresse acolhimento fraterno ("sentimos muita falta de quem não pôde estar conosco hoje!").
4. LINK DE PRESENÇA: Inclua o link de presença convidando quem faltou ou quem ainda não confirmou/justificou a conferir pelo link:
${dados.linkPresenca ? `   🔗 *Link de confirmação/registro de presença:* ${dados.linkPresenca}` : ""}
5. PRÓXIMO ENCONTRO:
${
  dados.proximoEncontro
    ? `   Anuncie claramente a data e o tema do próximo encontro exatamente como informado acima (${dados.proximoEncontro.dataExtenso || dados.proximoEncontro.data}). Motive a todos a já reservarem essa data na agenda.`
    : `   Diga que a data do próximo encontro será divulgada em breve. NÃO crie datas fictícias.`
}
6. Encerre com um abraço fraterno e bênção cristã acolhedora.

Responda APENAS com o texto final da mensagem, pronto para copiar e colar diretamente no WhatsApp.`

    case "convocacao":
      return `${base}

Tipo de Mensagem: COMUNICADO / AVISO IMPORTANTE

Instrução do Coordenador:
"""
${dados.instrucao || "[instrução]"}
"""
${dados.data ? `- Data relacionada: ${dados.dataExtenso || dados.data}` : ""}

ORIENTAÇÕES ESPECÍFICAS:
1. Abra com uma saudação calorosa e atenciosa aos catequistas.
2. Comunique as informações com clareza, afeto e respeito, mantendo o tom fraterno.
3. Destaque datas, horários e locais em *negrito* para facilitar a consulta rápida no celular.
4. Coloque-se à disposição para qualquer dúvida ou ajuda.
5. Finalize com votos de paz e bênçãos.

Responda APENAS com o texto final da mensagem, pronto para copiar e colar diretamente no WhatsApp.`

    case "livre":
      return `${base}

Tipo de Mensagem: MENSAGEM LIVRE (Aprimoramento Pastoral)

Rascunho original do coordenador:
"""
${dados.mensagemUsuario || "[mensagem do coordenador]"}
"""

ORIENTAÇÕES:
Reescreva a mensagem do coordenador tornando-a mais acolhedora, pastoral, calorosa e fluida para o WhatsApp dos catequistas.
- Corrija eventuais desvios gramaticais.
- Use *negrito* nos pontos que merecem destaque.
- Distribua emojis pastorais com bom gosto.
- Mantenha estritamente o sentido, os avisos e a essência da mensagem original, sem inventar fatos novos.

Responda APENAS com o texto aprimorado da mensagem, pronto para copiar e colar diretamente no WhatsApp.`

    default:
      return base
  }
}


export function getEndpointUrl(provider: AiProvider, customBaseUrl?: string): string {
  if (provider === "groq") return "https://api.groq.com/openai/v1/chat/completions"
  if (provider === "nvidia") return "https://integrate.api.nvidia.com/v1/chat/completions"
  if (provider === "openrouter") return "https://openrouter.ai/api/v1/chat/completions"

  const base = (customBaseUrl || "http://localhost:11434/v1").replace(/\/+$/, "").replace(/\/chat\/completions$/, "")
  return `${base}/chat/completions`
}

async function sendToAi(prompt: string, config: AiConfig, temperature = 0.7, maxRetries = 2, maxTokens = 1024): Promise<string> {
  const url = getEndpointUrl(config.provider, config.customBaseUrl)
  const model = config.model

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
          ...(config.provider === "openrouter" ? { "HTTP-Referer": "https://catequistas.housecloud.tec.br" } : {}),
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature,
          max_tokens: maxTokens,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`API ${config.provider.toUpperCase()} (${res.status}): ${text}`)
      }

      const data = await res.json()
      return data.choices?.[0]?.message?.content?.trim() || "Sem resposta."
    } catch (e) {
      if (i === maxRetries) throw e
    }
  }

  throw new Error("Falha na comunicação com a IA.")
}

export { MODELOS_SUGERIDOS }
