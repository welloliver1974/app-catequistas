import { prisma } from "@/lib/prisma"
import { DashboardClient } from "./client"

export const dynamic = "force-dynamic"

async function getDashboardData() {
  const [
    totalCatequistas,
    totalEncontros,
    totalPresencas,
    ultimasPresencas,
    proximosEncontros,
  ] = await Promise.all([
    prisma.catequista.count({ where: { status: "ATIVO" } }),
    prisma.encontro.count(),
    prisma.registroPresenca.count({ where: { presente: true } }),
    prisma.registroPresenca.findMany({
      take: 5,
      orderBy: { confirmadoEm: "desc" },
      include: {
        catequista: { select: { nome: true } },
        encontro: { select: { tema: true, data: true } },
      },
    }),
    prisma.encontro.findMany({
      take: 5,
      orderBy: { data: "asc" },
      where: { data: { gte: new Date() } },
      include: {
        turma: { select: { nome: true } },
        _count: { select: { presencas: true } },
      },
    }),
  ])

  const totalRegistros = await prisma.registroPresenca.count()
  const frequenciaMedia =
    totalRegistros > 0
      ? Math.round((totalPresencas / totalRegistros) * 100)
      : 0

  return {
    stats: {
      catequistas: totalCatequistas,
      encontros: totalEncontros,
      presencasHoje: ultimasPresencas.length,
      frequenciaMedia,
    },
    ultimasPresencas: ultimasPresencas.map((p) => ({
      nome: p.catequista.nome,
      tema: p.encontro.tema,
      data: p.encontro.data.toISOString(),
    })),
    proximosEncontros: proximosEncontros.map((e) => ({
      id: e.id,
      tema: e.tema,
      data: e.data.toISOString(),
      turma: e.turma.nome,
      confirmados: e._count.presencas,
    })),
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  return <DashboardClient data={data} />
}
