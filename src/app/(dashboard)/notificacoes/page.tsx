import { prisma } from "@/lib/prisma"
import { NotificacoesClient } from "./client"

export const dynamic = "force-dynamic"

export default async function NotificacoesPage() {
  const config = await prisma.configuracao.findUnique({
    where: { chave: "discord_webhook_url" },
  })
  return <NotificacoesClient webhookSalvo={config?.valor ?? ""} />
}
