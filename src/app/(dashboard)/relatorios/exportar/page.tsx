import { prisma } from "@/lib/prisma"
import { ExportarClient } from "./client"

export const dynamic = "force-dynamic"

export default async function ExportarPage() {
  const turmas = await prisma.turma.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  })

  return <ExportarClient turmas={turmas} />
}
