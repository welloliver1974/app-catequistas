import { prisma } from "@/lib/prisma"
import { EncontrosClient } from "./client"

export const dynamic = "force-dynamic"

export default async function EncontrosPage() {
  const encontros = await prisma.encontro.findMany({
    orderBy: { data: "desc" },
    include: {
      turma: { select: { nome: true } },
      _count: { select: { presencas: true } },
    },
  })

  const encontrosData = encontros.map((e) => ({
    id: e.id,
    data: e.data.toISOString(),
    tema: e.tema,
    local: e.local ?? "",
    linkPdf: e.linkPdf ?? "",
    turma: e.turma.nome,
    totalPresencas: e._count.presencas,
    resumo: e.resumo,
  }))

  return <EncontrosClient encontros={encontrosData} />
}
