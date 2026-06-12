"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function criarTurma(formData: FormData) {
  const nome = formData.get("nome") as string
  const descricao = formData.get("descricao") as string

  await prisma.turma.create({
    data: {
      nome,
      descricao: descricao || null,
    },
  })

  revalidatePath("/turmas")
}

export async function atualizarTurma(id: string, formData: FormData) {
  const nome = formData.get("nome") as string
  const descricao = formData.get("descricao") as string

  await prisma.turma.update({
    where: { id },
    data: {
      nome,
      descricao: descricao || null,
    },
  })

  revalidatePath("/turmas")
}

export async function excluirTurma(id: string) {
  await prisma.turma.delete({ where: { id } })
  revalidatePath("/turmas")
}
