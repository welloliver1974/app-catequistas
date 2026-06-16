import { prisma } from "@/lib/prisma"
import { DashboardClient } from "./client"

export const dynamic = "force-dynamic"

async function getDashboardData() {
  const agora = new Date()
  const hojeInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0)
  const hojeFim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59, 999)

  const [
    totalCatequistas,
    totalEncontros,
    totalPresencas,
    ultimasPresencas,
    proximosEncontros,
    encontrosRecentes,
    presencasHojeCount,
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
    prisma.encontro.findMany({
      take: 6,
      orderBy: { data: "desc" },
      include: {
        presencas: { select: { presente: true } },
      },
    }),
    prisma.registroPresenca.count({
      where: {
        presente: true,
        confirmadoEm: {
          gte: hojeInicio,
          lte: hojeFim,
        },
      },
    }),
  ])

  const totalRegistros = await prisma.registroPresenca.count()
  const frequenciaMedia =
    totalRegistros > 0
      ? Math.round((totalPresencas / totalRegistros) * 100)
      : 0

  const historicoFrequencia = encontrosRecentes
    .map((e) => {
      const total = e.presencas.length
      const presentes = e.presencas.filter((p) => p.presente).length
      const percentual = total > 0 ? Math.round((presentes / total) * 100) : 0
      return {
        data: e.data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        percentual,
        tema: e.tema,
      }
    })
    .reverse()

  return {
    stats: {
      catequistas: totalCatequistas,
      encontros: totalEncontros,
      presencasHoje: presencasHojeCount,
      frequenciaMedia,
    },
    historicoFrequencia,
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
