"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function notificarDiscordPresenca(
  catequistaNome: string,
  encontroTema: string,
  presente: boolean,
  justificativa?: string
) {
  try {
    const webhook = await prisma.configuracao.findUnique({
      where: { chave: "discord_webhook_url" },
    })
    if (!webhook?.valor) return

    const emoji = presente ? "✅" : "❌"
    const texto = presente
      ? `${emoji} **${catequistaNome}** confirmou presença no encontro **${encontroTema}**`
      : `${emoji} **${catequistaNome}** justificou ausência no encontro **${encontroTema}**${justificativa ? `\n> *${justificativa}*` : ""}`

    await fetch(webhook.valor, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: texto,
        username: "App Catequistas",
      }),
    })
  } catch {
    // falha silenciosa — notificação é opcional
  }
}

export async function confirmarPresenca(encontroId: string, catequistaId: string) {
  const existente = await prisma.registroPresenca.findUnique({
    where: {
      encontroId_catequistaId: {
        encontroId,
        catequistaId,
      },
    },
  })

  if (existente) {
    return { error: "Você já respondeu para este encontro." }
  }

  await prisma.registroPresenca.create({
    data: {
      encontroId,
      catequistaId,
      presente: true,
    },
  })

  const [catequista, encontro] = await Promise.all([
    prisma.catequista.findUnique({ where: { id: catequistaId }, select: { nome: true } }),
    prisma.encontro.findUnique({ where: { id: encontroId }, select: { tema: true } }),
  ])

  if (catequista && encontro) {
    await notificarDiscordPresenca(catequista.nome, encontro.tema, true)
  }

  revalidatePath("/presenca")
  revalidatePath("/presenca/confirmar")
  return { success: true }
}

export async function justificarAusencia(encontroId: string, catequistaId: string, justificativa: string) {
  if (!justificativa.trim()) {
    return { error: "Informe o motivo da ausência." }
  }

  const existente = await prisma.registroPresenca.findUnique({
    where: {
      encontroId_catequistaId: {
        encontroId,
        catequistaId,
      },
    },
  })

  if (existente) {
    return { error: "Você já respondeu para este encontro." }
  }

  await prisma.registroPresenca.create({
    data: {
      encontroId,
      catequistaId,
      presente: false,
      justificativa: justificativa.trim(),
    },
  })

  const [catequista, encontro] = await Promise.all([
    prisma.catequista.findUnique({ where: { id: catequistaId }, select: { nome: true } }),
    prisma.encontro.findUnique({ where: { id: encontroId }, select: { tema: true } }),
  ])

  if (catequista && encontro) {
    await notificarDiscordPresenca(catequista.nome, encontro.tema, false, justificativa.trim())
  }

  revalidatePath("/presenca")
  revalidatePath("/presenca/confirmar")
  return { success: true }
}
