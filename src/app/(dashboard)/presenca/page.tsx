import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { PresencaClient } from "./client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function PresencaPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("session")?.value
  if (!userId) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      catequista: { select: { id: true, nome: true } },
    },
  })

  if (!user?.catequista) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          Seu usuário não está vinculado a um catequista. Solicite ao administrador.
        </p>
      </div>
    )
  }

  const catequista = user.catequista

  const proximoEncontro = await prisma.encontro.findFirst({
    where: { data: { gte: new Date() } },
    orderBy: { data: "asc" },
    include: { turma: { select: { nome: true } } },
  })

  const presencaAtual = proximoEncontro
    ? await prisma.registroPresenca.findUnique({
        where: {
          encontroId_catequistaId: {
            encontroId: proximoEncontro.id,
            catequistaId: catequista.id,
          },
        },
      })
    : null

  const historico = await prisma.registroPresenca.findMany({
    where: { catequistaId: catequista.id },
    orderBy: { confirmadoEm: "desc" },
    take: 10,
    include: {
      encontro: { select: { tema: true, data: true } },
    },
  })

  return (
    <PresencaClient
      catequista={{ id: catequista.id, nome: catequista.nome }}
      proximoEncontro={proximoEncontro ? {
        id: proximoEncontro.id,
        tema: proximoEncontro.tema,
        data: proximoEncontro.data.toISOString(),
        local: proximoEncontro.local ?? "",
        linkPdf: proximoEncontro.linkPdf ?? "",
        turma: proximoEncontro.turma.nome,
      } : null}
      jaConfirmado={!!presencaAtual}
      presencaAtual={presencaAtual ? { presente: presencaAtual.presente, justificativa: presencaAtual.justificativa } : null}
      historico={historico.map((h) => ({
        tema: h.encontro.tema,
        data: h.encontro.data.toISOString(),
        presente: h.presente,
        justificativa: h.justificativa,
      }))}
    />
  )
}
