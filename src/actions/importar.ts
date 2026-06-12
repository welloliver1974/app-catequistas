"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

function parseSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

function nameToEmail(nome: string): string {
  const sanitized = nome
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/, "")
  return `${sanitized}@catequese.com`
}

async function fetchSheetData(spreadsheetId: string, range: string, apiKey: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Erro ao acessar a planilha (${res.status}): ${text}`)
  }
  const data = await res.json()
  return data.values as string[][] | undefined
}

export async function importarGoogleSheet(formData: FormData) {
  const sheetUrl = formData.get("sheetUrl") as string
  const apiKey = formData.get("apiKey") as string
  const importarCatequistas = formData.get("importarCatequistas") === "on"
  const importarEncontros = formData.get("importarEncontros") === "on"
  const importarPresencas = formData.get("importarPresencas") === "on"

  if (!sheetUrl || !apiKey) {
    return { error: "URL da planilha e chave da API são obrigatórios." }
  }

  const spreadsheetId = parseSheetId(sheetUrl)
  if (!spreadsheetId) {
    return { error: "URL inválida. Use o link da sua planilha do Google Sheets." }
  }

  const resultados: string[] = []
  let catequistasCriados = 0
  let encontrosCriados = 0
  let presencasCriadas = 0

  try {
    if (importarCatequistas) {
      const rows = await fetchSheetData(spreadsheetId, "ListaCatequistas!A:A", apiKey)
      if (rows && rows.length > 0) {
        for (const [nome] of rows) {
          if (!nome || nome.trim() === "Nomes" || nome.trim() === "") continue
          const nomeLimpo = nome.trim()
          const existing = await prisma.catequista.findFirst({
            where: { nome: nomeLimpo },
          })
          if (!existing) {
            await prisma.catequista.create({
              data: {
                nome: nomeLimpo,
                email: nameToEmail(nomeLimpo),
              },
            })
            catequistasCriados++
          }
        }
        resultados.push(`${catequistasCriados} catequistas importados`)
      }
    }

    if (importarEncontros) {
      const rows = await fetchSheetData(spreadsheetId, "Temas!A:D", apiKey)
      if (rows && rows.length > 1) {
        const turma = await prisma.turma.findFirst()
        if (!turma) {
          return { error: "Crie pelo menos uma turma antes de importar encontros." }
        }
        for (let i = 1; i < rows.length; i++) {
          const [dataRaw, tema, local, linkPdf] = rows[i]
          if (!dataRaw || !tema) continue
          const data = new Date(dataRaw)
          if (isNaN(data.getTime())) continue

          const existing = await prisma.encontro.findFirst({
            where: { tema: tema.trim(), data },
          })
          if (!existing) {
            await prisma.encontro.create({
              data: {
                turmaId: turma.id,
                data,
                tema: tema.trim(),
                local: local?.trim() || null,
                linkPdf: linkPdf?.trim() || null,
              },
            })
            encontrosCriados++
          }
        }
        resultados.push(`${encontrosCriados} encontros importados`)
      }
    }

    if (importarPresencas) {
      const rows = await fetchSheetData(spreadsheetId, "Presencas!A:C", apiKey)
      if (rows && rows.length > 1) {
        for (let i = 1; i < rows.length; i++) {
          const [, nomeRaw, temaRaw] = rows[i]
          if (!nomeRaw || !temaRaw) continue

          const nome = nomeRaw.trim()
          const tema = temaRaw.trim()

          const catequista = await prisma.catequista.findFirst({
            where: { nome: { contains: nome } },
          })
          if (!catequista) continue

          const encontro = await prisma.encontro.findFirst({
            where: { tema: { contains: tema } },
          })
          if (!encontro) continue

          const existing = await prisma.registroPresenca.findUnique({
            where: { encontroId_catequistaId: { encontroId: encontro.id, catequistaId: catequista.id } },
          })
          if (!existing) {
            await prisma.registroPresenca.create({
              data: {
                encontroId: encontro.id,
                catequistaId: catequista.id,
                presente: true,
              },
            })
            presencasCriadas++
          }
        }
        resultados.push(`${presencasCriadas} presenças importadas`)
      }
    }

    revalidatePath("/importar")
    revalidatePath("/dashboard")
    revalidatePath("/catequistas")
    revalidatePath("/encontros")
    revalidatePath("/presenca")

    return { success: `Importação concluída: ${resultados.join(", ")}.` }
  } catch (e) {
    return { error: `Erro na importação: ${e instanceof Error ? e.message : String(e)}` }
  }
}
