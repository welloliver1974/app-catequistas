import { prisma } from "@/lib/prisma"
import { FrequenciaClient } from "./client"

export const dynamic = "force-dynamic"

export default async function FrequenciaPage() {
  const [catequistas, turmas] = await Promise.all([
    prisma.catequista.findMany({
      where: { status: "ATIVO" },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    prisma.turma.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ])

  return <FrequenciaClient catequistas={catequistas} turmas={turmas} />
}
