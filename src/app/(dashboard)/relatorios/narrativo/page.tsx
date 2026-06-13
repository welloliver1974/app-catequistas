import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { RelatorioNarrativoClient } from "./client"

export const dynamic = "force-dynamic"

export default async function RelatorioNarrativoPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("session")?.value
  if (!userId) redirect("/login")

  const turmas = await prisma.turma.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  })

  return <RelatorioNarrativoClient turmas={turmas} />
}
