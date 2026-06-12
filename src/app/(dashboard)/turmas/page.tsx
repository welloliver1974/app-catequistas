import { prisma } from "@/lib/prisma"
import { TurmasClient } from "./client"

export const dynamic = "force-dynamic"

export default async function TurmasPage() {
  const turmas = await prisma.turma.findMany({
    orderBy: { nome: "asc" },
    include: {
      _count: { select: { catequistas: true, encontros: true } },
    },
  })

  const data = turmas.map((t) => ({
    id: t.id,
    nome: t.nome,
    descricao: t.descricao ?? "",
    totalCatequistas: t._count.catequistas,
    totalEncontros: t._count.encontros,
  }))

  return <TurmasClient turmas={data} />
}
