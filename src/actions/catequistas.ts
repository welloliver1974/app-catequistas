"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function criarCatequista(formData: FormData) {
  const nome = formData.get("nome") as string
  const email = formData.get("email") as string
  const telefone = formData.get("telefone") as string
  const observacoes = formData.get("observacoes") as string

  await prisma.catequista.create({
    data: {
      nome,
      email,
      telefone: telefone || null,
      observacoes: observacoes || null,
      dataEntrada: new Date(),
    },
  })

  revalidatePath("/catequistas")
}

export async function atualizarCatequista(id: string, formData: FormData) {
  const nome = formData.get("nome") as string
  const email = formData.get("email") as string
  const telefone = formData.get("telefone") as string
  const status = formData.get("status") as string
  const observacoes = formData.get("observacoes") as string

  await prisma.catequista.update({
    where: { id },
    data: {
      nome,
      email,
      telefone: telefone || null,
      status: status as "ATIVO" | "INATIVO",
      observacoes: observacoes || null,
    },
  })

  revalidatePath("/catequistas")
}

export async function excluirCatequista(id: string) {
  await prisma.catequista.delete({ where: { id } })
  revalidatePath("/catequistas")
}
