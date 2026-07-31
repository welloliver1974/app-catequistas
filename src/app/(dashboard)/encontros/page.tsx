import { prisma } from "@/lib/prisma"
import { EncontrosClient } from "./client"

export const dynamic = "force-dynamic"

export default async function EncontrosPage() {
  const encontros = await prisma.encontro.findMany({
    // Ordena pelo Nº do encontro (Encontro 1, 2, 3...) — as datas podem não
    // seguir a ordem dos números em lançamentos retroativos. Sem número vai pro fim.
    orderBy: [{ numeroEncontro: { sort: "asc", nulls: "last" } }, { data: "asc" }],
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
    numeroEncontro: e.numeroEncontro,
  }))

  return <EncontrosClient encontros={encontrosData} />
}
