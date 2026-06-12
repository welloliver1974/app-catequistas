import { prisma } from "@/lib/prisma"
import { CalendarioClient } from "./client"

export const dynamic = "force-dynamic"

export default async function CalendarioPage() {
  const encontros = await prisma.encontro.findMany({
    orderBy: { data: "asc" },
    include: {
      turma: { select: { nome: true } },
      _count: { select: { presencas: true } },
    },
  })

  const data = encontros.map((e) => ({
    id: e.id,
    data: e.data.toISOString(),
    tema: e.tema,
    local: e.local ?? "",
    turma: e.turma.nome,
    confirmados: e._count.presencas,
  }))

  return <CalendarioClient encontros={data} />
}
