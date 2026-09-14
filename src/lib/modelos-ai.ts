export type AiProvider = "groq" | "nvidia" | "openrouter" | "custom"

export interface ProviderInfo {
  id: AiProvider
  name: string
  badge: string
  baseUrl: string
  placeholderKey: string
  helpUrl: string
  helpText: string
}

export const PROVIDERS_INFO: Record<AiProvider, ProviderInfo> = {
  groq: {
    id: "groq",
    name: "Groq",
    badge: "Grátis & Ultrarrápido",
    baseUrl: "https://api.groq.com/openai/v1",
    placeholderKey: "gsk_...",
    helpUrl: "https://console.groq.com/keys",
    helpText: "Obter chave grátis no console da Groq",
  },
  nvidia: {
    id: "nvidia",
    name: "NVIDIA (NIM)",
    badge: "Alta Performance & Modelos de Ponta",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    placeholderKey: "nvapi-...",
    helpUrl: "https://build.nvidia.com",
    helpText: "Obter chave de API no NVIDIA Build",
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    badge: "Agregador Universal",
    baseUrl: "https://openrouter.ai/api/v1",
    placeholderKey: "sk-or-...",
    helpUrl: "https://openrouter.ai/keys",
    helpText: "Obter chave no OpenRouter",
  },
  custom: {
    id: "custom",
    name: "Personalizado / Local",
    badge: "Ollama, DeepSeek ou Próprio",
    baseUrl: "http://localhost:11434/v1",
    placeholderKey: "Chave de API (ou 'ollama' se local)",
    helpUrl: "https://github.com/ollama/ollama",
    helpText: "Qualquer endpoint compatível com OpenAI (Ollama, LM Studio, etc.)",
  },
}

export interface ModeloItem {
  provider: AiProvider
  value: string
  label: string
  tag?: string
}

export const MODELOS_SUGERIDOS: ModeloItem[] = [
  // Groq (atuais e rápidos)
  { provider: "groq", value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile", tag: "Recomendado" },
  { provider: "groq", value: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant", tag: "Ultrarrápido" },
  { provider: "groq", value: "deepseek-r1-distill-llama-70b", label: "DeepSeek R1 Distill 70B", tag: "Raciocínio" },
  { provider: "groq", value: "gemma2-9b-it", label: "Gemma 2 9B IT", tag: "Leve" },

  // NVIDIA NIM (build.nvidia.com)
  { provider: "nvidia", value: "meta/llama-3.3-70b-instruct", label: "Llama 3.3 70B Instruct (Meta)", tag: "Recomendado" },
  { provider: "nvidia", value: "deepseek-ai/deepseek-r1", label: "DeepSeek R1 (NVIDIA)", tag: "Raciocínio Top" },
  { provider: "nvidia", value: "deepseek-ai/deepseek-v3", label: "DeepSeek V3 (NVIDIA)", tag: "Excelente em PT" },
  { provider: "nvidia", value: "nvidia/llama-3.1-nemotron-70b-instruct", label: "Llama 3.1 Nemotron 70B (NVIDIA)", tag: "Alta Precisão" },
  { provider: "nvidia", value: "mistralai/mistral-large-2-instruct", label: "Mistral Large 2 Instruct", tag: "Pastoral" },

  // OpenRouter (modelos populares e modernos)
  { provider: "openrouter", value: "openai/gpt-4o-mini", label: "GPT-4o Mini (OpenAI)", tag: "Rápido & Barato" },
  { provider: "openrouter", value: "anthropic/claude-3.5-haiku", label: "Claude 3.5 Haiku (Anthropic)", tag: "Ótima Redação" },
  { provider: "openrouter", value: "deepseek/deepseek-chat", label: "DeepSeek V3 (DeepSeek)", tag: "Custo-Benefício" },
  { provider: "openrouter", value: "deepseek/deepseek-r1", label: "DeepSeek R1 (DeepSeek)", tag: "Raciocínio" },
  { provider: "openrouter", value: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B Instruct", tag: "Versátil" },

  // Custom / Local
  { provider: "custom", value: "llama3.2:latest", label: "Llama 3.2 (Ollama Local)", tag: "Local" },
  { provider: "custom", value: "mistral:latest", label: "Mistral (Ollama Local)", tag: "Local" },
  { provider: "custom", value: "deepseek-r1:latest", label: "DeepSeek R1 (Ollama Local)", tag: "Local" },
]
