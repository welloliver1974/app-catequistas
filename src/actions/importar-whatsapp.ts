"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Extrai números de telefone BR de um texto
function extrairNumeros(texto: string): string[] {
  const regex = /\+?55\s*\(?\d{2}\)?\s*\d{4,5}-?\s*\d{4}/g
  const encontrados = texto.match(regex) || []
  // Limpa e remove duplicatas
  const numeros = [...new Set(encontrados.map((n) => n.replace(/\D/g, "")))]
  return numeros.filter((n) => n.length >= 12) // 55 + 2 DDD + 8/9 número
}

export async function parseWhatsAppExport(formData: FormData) {
  const file = formData.get("arquivo") as File
  if (!file) return { error: "Selecione um arquivo." }

  const texto = await file.text()
  const numeros = extrairNumeros(texto)

  if (numeros.length === 0) {
    return { error: "Nenhum número de telefone brasileiro encontrado no arquivo." }
  }

  // Busca catequistas sem telefone
  const semTelefone = await prisma.catequista.findMany({
    where: { status: "ATIVO", telefone: null },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, telefone: true },
  })

  // Busca catequistas com telefone pra ver se algum número já existe
  const comTelefone = await prisma.catequista.findMany({
    where: { status: "ATIVO", telefone: { not: null } },
    select: { id: true, nome: true, telefone: true },
  })

  // Verifica quais números já estão cadastrados
  const telefonesExistentes = new Set(comTelefone.map((c) => c.telefone))
  const numerosNovos = numeros.filter((n) => !telefonesExistentes.has(n))

  return {
    numerosEncontrados: numeros,
    numerosNovos,
    numerosJaCadastrados: numeros.filter((n) => telefonesExistentes.has(n)),
    catequistasSemTelefone: semTelefone,
  }
}

export async function salvarTelefonesImportados(dados: { catequistaId: string; telefone: string }[]) {
  let ok = 0
  let err = 0
  for (const { catequistaId, telefone } of dados) {
    try {
      const digits = telefone.replace(/\D/g, "")
      await prisma.catequista.update({
        where: { id: catequistaId },
        data: { telefone: digits },
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
