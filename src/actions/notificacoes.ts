"use server"

export async function enviarNotificacaoDiscord(webhookUrl: string, mensagem: string) {
  if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
    return { error: "URL de webhook inválida. Deve começar com https://discord.com/api/webhooks/" }
  }

  if (!mensagem.trim()) {
    return { error: "Mensagem não pode estar vazia." }
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: mensagem,
        username: "App Catequistas",
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return { error: `Erro ao enviar (${res.status}): ${text}` }
    }

    return { success: true }
  } catch (e) {
    return { error: `Erro de conexão: ${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function notificarProximoEncontro(webhookUrl: string) {
  const { prisma } = await import("@/lib/prisma")

  const proximo = await prisma.encontro.findFirst({
    where: { data: { gte: new Date() } },
    orderBy: { data: "asc" },
    include: { turma: { select: { nome: true } } },
  })

  if (!proximo) {
    return { error: "Nenhum encontro futuro agendado." }
  }

  const data = proximo.data.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const mensagem = [
    `📢 **Próximo Encontro: ${proximo.tema}**`,
    `📅 ${data}`,
    `📍 ${proximo.local || proximo.turma.nome}`,
    proximo.linkPdf ? `📎 Material: ${proximo.linkPdf}` : null,
    "",
    "🙏 Confirme sua presença no App Catequistas!",
  ]
    .filter(Boolean)
    .join("\n")

  return enviarNotificacaoDiscord(webhookUrl, mensagem)
}
