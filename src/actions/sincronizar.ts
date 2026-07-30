"use server"

import { prisma } from "@/lib/prisma"
import { getConfig, setConfig } from "./config"

const TOKEN = "catequistas-sync-2026"
const MAX_ENCONTROS = 15

/**
 * Sincroniza os dados de presença do app com a planilha da Escola Diocesana.
 *
 * Fluxo:
 * 1. Lê a URL do webhook salva nas configurações
 * 2. Busca catequistas ativos e encontros (ordenados por data)
 * 3. Monta matriz de presença (catequista × encontro → "P" | "A" | "")
 * 4. Envia via POST para o Google Apps Script
 * 5. Salva timestamp da última sincronização
 */
export async function sincronizarPlanilhaDiocesana() {
  try {
    const webhookUrl = await getConfig("diocesan_webhook_url")
    if (!webhookUrl) {
      return { error: "Configure a URL do webhook nas Configurações." }
    }

    // ─── Busca dados ──────────────────────────────────────────────────────
    const catequistas = await prisma.catequista.findMany({
      where: { status: "ATIVO" },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    })

    const encontros = await prisma.encontro.findMany({
      orderBy: { data: "asc" },
      take: MAX_ENCONTROS,
      select: { id: true, tema: true, data: true },
    })

    if (encontros.length === 0) {
      return { error: "Nenhum encontro cadastrado para sincronizar." }
    }

    // ─── Monta lookup de presenças ────────────────────────────────────────
    // Chave: `${catequistaId}_${encontroId}` → Valor: true (presente) | false (ausente)
    const presencas = await prisma.registroPresenca.findMany({
      where: { encontroId: { in: encontros.map((e) => e.id) } },
      select: { catequistaId: true, encontroId: true, presente: true },
    })

    const presencaMap = new Map<string, boolean>()
    for (const p of presencas) {
      presencaMap.set(`${p.catequistaId}_${p.encontroId}`, p.presente)
    }

    // ─── Monta payload ────────────────────────────────────────────────────
    const payload = {
      token: TOKEN,
      encontros: encontros.map((e, i) => ({
        numero: i + 1,
        data: e.data.toLocaleDateString("pt-BR"),
        tema: e.tema,
      })),
      catequistas: catequistas.map((c) => ({
        nome: c.nome,
        presencas: encontros.map((e) => {
          const p = presencaMap.get(`${c.id}_${e.id}`)
          if (p === undefined) return ""
          return p ? "P" : "A"
        }),
      })),
    }

    // ─── Envia para o Google Apps Script ──────────────────────────────────
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Webhook retornou HTTP ${res.status}: ${text}`)
    }

    const resposta = await res.json()

    if (!resposta.success) {
      throw new Error(resposta.error || "Webhook retornou erro sem detalhes.")
    }

    // ─── Salva timestamp da última sincronização ──────────────────────────
    await setConfig("diocesan_last_sync", new Date().toISOString())

    return {
      success: `Planilha sincronizada com ${catequistas.length} catequistas e ${encontros.length} encontros!`,
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao sincronizar." }
  }
}

/**
 * Salva a URL do webhook do Google Apps Script nas configurações.
 */
export async function salvarWebhookUrl(url: string) {
  if (!url || !url.startsWith("https://")) {
    return { error: "URL inválida. Deve começar com https://" }
  }
  await setConfig("diocesan_webhook_url", url.trim())
  return { success: "URL do webhook salva com sucesso!" }
}

/**
 * Retorna as informações atuais da sincronização.
 */
export async function getInfoSincronizacao() {
  const [webhookUrl, lastSync] = await Promise.all([
    getConfig("diocesan_webhook_url"),
    getConfig("diocesan_last_sync"),
  ])
  return {
    webhookUrl: webhookUrl || "",
    lastSync: lastSync || null,
  }
}
