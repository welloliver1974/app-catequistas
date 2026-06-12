import { prisma } from "@/lib/prisma"
import { PresencaPublicaClient } from "./client"

export const dynamic = "force-dynamic"

export default async function PresencaConfirmarPage() {
  const [catequistas, encontro] = await Promise.all([
    prisma.catequista.findMany({
      where: { status: "ATIVO" },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    prisma.encontro.findFirst({
      where: { data: { gte: new Date() } },
      orderBy: { data: "asc" },
      include: { turma: { select: { nome: true } } },
    }),
  ])

  return <PresencaPublicaClient catequistas={catequistas} encontro={encontro} />
}
