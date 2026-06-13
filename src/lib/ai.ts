const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

interface AiConfig {
  provider: "groq" | "openrouter"
  apiKey: string
  model: string
}

export async function getAiConfig(): Promise<AiConfig> {
  const { prisma } = await import("@/lib/prisma")
  const getVal = async (chave: string) =>
    (await prisma.configuracao.findUnique({ where: { chave } }))?.valor ?? ""

  const provider = (await getVal("ai_provider")) || "groq"
  const apiKey = await getVal("ai_api_key")
  const model = (await getVal("ai_model")) || "llama-3.3-70b-versatile"

  return { provider: provider as "groq" | "openrouter", apiKey, model }
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

async function sendToAi(prompt: string, config: AiConfig, temperature = 0.7, maxRetries = 2): Promise<string> {
  const url = config.provider === "groq" ? GROQ_URL : OPENROUTER_URL
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
          max_tokens: 1024,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`API ${config.provider} (${res.status}): ${text}`)
      }

      const data = await res.json()
      return data.choices?.[0]?.message?.content?.trim() || "Sem resposta."
    } catch (e) {
      if (i === maxRetries) throw e
    }
  }

  throw new Error("Falha na comunicação com a IA.")
}

export const MODELOS_SUGERIDOS = [
  { provider: "groq", value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (Groq) — Grátis" },
  { provider: "groq", value: "llama-3.1-8b-instant", label: "Llama 3.1 8B (Groq) — Grátis, rápido" },
  { provider: "groq", value: "mixtral-8x7b-32768", label: "Mixtral 8x7B (Groq) — Grátis" },
  { provider: "openrouter", value: "openai/gpt-4o-mini", label: "GPT-4o mini (OpenRouter)" },
  { provider: "openrouter", value: "openai/gpt-4o", label: "GPT-4o (OpenRouter)" },
  { provider: "openrouter", value: "anthropic/claude-3.5-haiku", label: "Claude 3.5 Haiku (OpenRouter)" },
  { provider: "openrouter", value: "google/gemini-2.0-flash-001", label: "Gemini 2.0 Flash (OpenRouter)" },
  { provider: "openrouter", value: "deepseek/deepseek-chat", label: "DeepSeek V3 (OpenRouter)" },
]
