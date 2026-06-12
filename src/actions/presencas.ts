"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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

  revalidatePath("/presenca")
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

  revalidatePath("/presenca")
  return { success: true }
}
