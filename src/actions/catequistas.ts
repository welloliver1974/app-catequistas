"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function criarCatequista(formData: FormData) {
  const nome = formData.get("nome") as string
  const email = formData.get("email") as string
  const telefone = formData.get("telefone") as string
  const observacoes = formData.get("observacoes") as string

  const turma = await prisma.turma.findFirst()

  await prisma.catequista.create({
    data: {
      nome,
      email,
      telefone: telefone || null,
      observacoes: observacoes || null,
      dataEntrada: new Date(),
      turmas: turma ? { create: [{ turmaId: turma.id }] } : undefined,
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

export async function salvarTelefones(dados: { id: string; telefone: string }[]) {
  let ok = 0
  let err = 0
  for (const { id, telefone } of dados) {
    try {
      const digits = telefone.replace(/\D/g, "")
      await prisma.catequista.update({
        where: { id },
        data: { telefone: digits || null },
      })
      ok++
    } catch {
      err++
    }
  }
  revalidatePath("/catequistas")
  revalidatePath("/catequistas/telefones")
  return { ok, err }
}
