"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { salvarUploadPdf } from "./upload"

/**
 * Converte uma string "YYYY-MM-DD" (vinda de um <input type="date">) em um
 * objeto Date sem deslocamento de fuso. Usar new Date("YYYY-MM-DD") diretamente
 * interpreta como UTC meia-noite, que no horário de Brasília (UTC-3) vira o
 * dia anterior — causando o bug de data salva com 1 dia a menos.
 *
 * Solução: forçar meio-dia UTC (T12:00:00Z) para que a data seja sempre
 * a mesma independente do fuso do servidor.
 */
function parseDateInput(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00Z`)
}

export async function criarEncontro(formData: FormData) {
  const data = formData.get("data") as string
  const tema = formData.get("tema") as string
  const local = formData.get("local") as string
  const linkPdf = formData.get("linkPdf") as string

  const pdfPath = await salvarUploadPdf(formData)

  await prisma.encontro.create({
    data: {
      data: parseDateInput(data),
      tema,
      local: local || null,
      linkPdf: pdfPath || linkPdf || null,
      turmaId: (await prisma.turma.findFirst())?.id ?? "",
    },
  })

  revalidatePath("/encontros")
}

export async function atualizarEncontro(id: string, formData: FormData) {
  const data = formData.get("data") as string
  const tema = formData.get("tema") as string
  const local = formData.get("local") as string
  const linkPdf = formData.get("linkPdf") as string

  const pdfPath = await salvarUploadPdf(formData)

  await prisma.encontro.update({
    where: { id },
    data: {
      data: parseDateInput(data),
      tema,
      local: local || null,
      linkPdf: pdfPath || linkPdf || null,
    },
  })

  revalidatePath("/encontros")
}

export async function excluirEncontro(id: string) {
  await prisma.encontro.delete({ where: { id } })
  revalidatePath("/encontros")
}
