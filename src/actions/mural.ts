"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function salvarMural(texto: string) {
  try {
    await prisma.configuracao.upsert({
      where: { chave: "mural_texto" },
      update: { valor: texto },
      create: { chave: "mural_texto", valor: texto },
    })
    revalidatePath("/configuracoes")
    return { success: "Mural atualizado!" }
  } catch {
    return { error: "Erro ao salvar mural." }
  }
}

export async function lerMural() {
  try {
    const config = await prisma.configuracao.findUnique({
      where: { chave: "mural_texto" },
    })
    return config?.valor || ""
  } catch {
    return ""
  }
}
