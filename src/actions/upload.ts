"use server"

import { writeFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import { randomUUID } from "node:crypto"

export async function salvarUploadPdf(formData: FormData): Promise<string | null> {
  const file = formData.get("pdfFile") as File | null
  if (!file || file.size === 0) return null

  const ext = file.name.endsWith(".pdf") ? ".pdf" : ".pdf"
  const filename = `${randomUUID()}${ext}`
  const dir = join(process.cwd(), "public", "uploads", "encontros")

  await mkdir(dir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(dir, filename), buffer)

  return `/uploads/encontros/${filename}`
}
