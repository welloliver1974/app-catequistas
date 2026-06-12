import { prisma } from "@/lib/prisma"
import { CatequistasClient } from "./client"

export const dynamic = "force-dynamic"

export default async function CatequistasPage() {
  const catequistas = await prisma.catequista.findMany({
    orderBy: { nome: "asc" },
    include: {
      turmas: {
        include: { turma: { select: { nome: true } } },
      },
      user: { select: { id: true } },
      _count: { select: { presencas: true } },
    },
  })

  const data = catequistas.map((c) => ({
    id: c.id,
    nome: c.nome,
    email: c.email,
    telefone: c.telefone ?? "",
    status: c.status,
    dataEntrada: c.dataEntrada.toISOString(),
    observacoes: c.observacoes ?? "",
    turmas: c.turmas.map((t) => t.turma.nome).join(", "),
    totalPresencas: c._count.presencas,
    userId: c.user?.id ?? null,
  }))

  return <CatequistasClient catequistas={data} />
}
