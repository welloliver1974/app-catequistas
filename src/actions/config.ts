"use server"

import { prisma } from "@/lib/prisma"

export async function getConfig(chave: string): Promise<string | null> {
  const config = await prisma.configuracao.findUnique({ where: { chave } })
  return config?.valor ?? null
}

export async function setConfig(chave: string, valor: string) {
  await prisma.configuracao.upsert({
    where: { chave },
    update: { valor },
    create: { chave, valor },
  })
  return { success: true }
}
