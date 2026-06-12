"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { salvarUploadPdf } from "./upload"

export async function criarEncontro(formData: FormData) {
  const data = formData.get("data") as string
  const tema = formData.get("tema") as string
  const local = formData.get("local") as string
  const linkPdf = formData.get("linkPdf") as string

  const pdfPath = await salvarUploadPdf(formData)

  await prisma.encontro.create({
    data: {
      data: new Date(data),
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
      data: new Date(data),
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
